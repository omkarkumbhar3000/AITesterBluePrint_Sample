import os
import sys
import glob
import time
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import chromadb
from sentence_transformers import SentenceTransformer
import fitz
from groq import Groq
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.normpath(os.path.join(BASE_DIR, '..', 'data', 'data'))
CHROMA_DIR = os.path.join(BASE_DIR, 'chroma_db')

app = Flask(__name__)
CORS(app)

model = None
collection = None
groq_client = None

pipeline_state = {
    "ingested": False,
    "pdf_name": None,
    "pages": 0,
    "chunk_count": 0,
    "last_ingested": None,
    "model_loaded": False,
    "error": None
}

def init_models():
    global model, collection, groq_client
    try:
        logger.info("Loading Nomic Embed model (nomic-ai/nomic-embed-text-v1.5)...")
        model = SentenceTransformer('nomic-ai/nomic-embed-text-v1.5', trust_remote_code=True)
        pipeline_state["model_loaded"] = True
        logger.info("Embedding model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load embedding model: {e}")
        pipeline_state["error"] = f"Model loading failed: {str(e)}"

    try:
        logger.info(f"Initializing ChromaDB at {CHROMA_DIR}...")
        os.makedirs(CHROMA_DIR, exist_ok=True)
        chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
        collection = chroma_client.get_or_create_collection(name="rag_docs")
        logger.info("ChromaDB initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize ChromaDB: {e}")
        pipeline_state["error"] = f"ChromaDB init failed: {str(e)}"

    groq_api_key = os.environ.get("GROQ_API_KEY")
    if groq_api_key:
        groq_client = Groq(api_key=groq_api_key)
        logger.info("Groq client initialized")
    else:
        logger.warning("GROQ_API_KEY environment variable not set")
        pipeline_state["error"] = "GROQ_API_KEY not set. Set it as an environment variable."

def extract_pdf_text(pdf_path):
    doc = fitz.open(pdf_path)
    pages_text = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        pages_text.append({
            "page_num": page_num + 1,
            "text": text
        })
    full_text = "\n\n".join([p["text"] for p in pages_text])
    return full_text, len(doc)

def chunk_text(text, chunk_size=500, chunk_overlap=100):
    chunks = []
    start = 0
    text_len = len(text)
    while start < text_len:
        end = min(start + chunk_size, text_len)
        if end < text_len:
            candidates = [
                text.rfind('\n\n', start, end),
                text.rfind('\n', start, end),
                text.rfind('. ', start, end),
            ]
            split_at = end
            for c in candidates:
                if start < c < split_at:
                    split_at = c + 1
                    break
            end = split_at
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - chunk_overlap
    return chunks

def generate_embeddings(texts):
    logger.info(f"Generating embeddings for {len(texts)} chunks...")
    embeddings = model.encode(texts, show_progress_bar=True, normalize_embeddings=True)
    return embeddings.tolist()

def clear_collection():
    try:
        existing = collection.get()
        if existing["ids"]:
            collection.delete(ids=existing["ids"])
            logger.info("Cleared existing collection")
    except Exception as e:
        logger.warning(f"Could not clear collection: {e}")

@app.route('/api/status', methods=['GET'])
def get_status():
    count = collection.count() if collection else 0
    return jsonify({
        "ingested": pipeline_state["ingested"],
        "chunk_count": count,
        "pdf_name": pipeline_state["pdf_name"],
        "pages": pipeline_state["pages"],
        "last_ingested": pipeline_state["last_ingested"],
        "model_loaded": pipeline_state["model_loaded"],
        "error": pipeline_state["error"],
        "data_dir": DATA_DIR,
        "pdfs_found": len(glob.glob(os.path.join(DATA_DIR, "*.pdf")))
    })

@app.route('/api/ingest', methods=['POST'])
def ingest():
    global pipeline_state

    if not model:
        return jsonify({"error": "Embedding model not loaded"}), 500

    os.makedirs(DATA_DIR, exist_ok=True)
    pdf_files = glob.glob(os.path.join(DATA_DIR, "*.pdf"))
    if not pdf_files:
        return jsonify({"error": f"No PDF files found in {DATA_DIR}"}), 404

    pdf_path = pdf_files[0]
    pdf_name = os.path.basename(pdf_path)
    logger.info(f"Starting ingestion of {pdf_name}...")

    try:
        text, pages = extract_pdf_text(pdf_path)
        if not text.strip():
            return jsonify({"error": "No text could be extracted from the PDF"}), 400

        chunks = chunk_text(text)
        if not chunks:
            return jsonify({"error": "No chunks generated from the PDF"}), 400

        embeddings = generate_embeddings(chunks)

        clear_collection()
        ids = [f"chunk_{i}" for i in range(len(chunks))]
        metadatas = [{
            "source": pdf_name,
            "chunk_index": i,
            "total_chunks": len(chunks),
            "char_length": len(chunks[i])
        } for i in range(len(chunks))]

        collection.add(
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )

        pipeline_state["ingested"] = True
        pipeline_state["pdf_name"] = pdf_name
        pipeline_state["chunk_count"] = len(chunks)
        pipeline_state["pages"] = pages
        pipeline_state["last_ingested"] = time.time()
        pipeline_state["error"] = None

        logger.info(f"Ingestion complete: {pages} pages -> {len(chunks)} chunks")
        return jsonify({
            "status": "success",
            "pdf_name": pdf_name,
            "pages": pages,
            "chunks": len(chunks),
            "message": f"Ingested '{pdf_name}': {pages} pages split into {len(chunks)} chunks"
        })
    except Exception as e:
        logger.error(f"Ingestion failed: {e}", exc_info=True)
        return jsonify({"error": f"Ingestion failed: {str(e)}"}), 500

@app.route('/api/query', methods=['POST'])
def query():
    if not collection:
        return jsonify({"error": "ChromaDB not initialized"}), 500
    if not groq_client:
        return jsonify({"error": "Groq client not initialized. Set GROQ_API_KEY."}), 500
    if not pipeline_state["ingested"]:
        return jsonify({"error": "No document ingested yet. Ingest a PDF first."}), 400

    data = request.json
    query_text = data.get("query", "").strip()
    if not query_text:
        return jsonify({"error": "Query is required"}), 400

    try:
        query_embedding = model.encode([query_text], normalize_embeddings=True).tolist()[0]

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=4,
            include=["documents", "distances", "metadatas"]
        )

        retrieved_chunks = results["documents"][0] if results["documents"] else []
        distances = results["distances"][0] if results["distances"] else []
        metadatas_list = results["metadatas"][0] if results["metadatas"] else []

        if not retrieved_chunks:
            return jsonify({"answer": "No relevant chunks found.", "chunks": []})

        context = "\n\n---\n\n".join([
            f"Chunk {i+1}:\n{chunk}"
            for i, chunk in enumerate(retrieved_chunks)
        ])

        prompt = f"""You are a precise document analyst. Answer the question using ONLY the context below. If the context lacks sufficient information, state what is missing.

=== CONTEXT ===
{context}

=== QUESTION ===
{query_text}

=== INSTRUCTIONS ===
- Answer concisely and directly.
- Cite which chunk(s) you used by number.
- Do NOT use external knowledge — only what is in the context."""

        completion = groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[
                {"role": "system", "content": "You are a precise RAG assistant that answers based only on provided context."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1024
        )

        answer = completion.choices[0].message.content

        chunks_result = []
        for i, (chunk, dist, meta) in enumerate(zip(retrieved_chunks, distances, metadatas_list)):
            score = round(max(0, 1.0 - (dist if dist else 0)) * 100, 1)
            chunks_result.append({
                "id": i + 1,
                "content": chunk,
                "relevance": score,
                "source": meta.get("source", "unknown") if meta else "unknown",
                "chunk_index": meta.get("chunk_index", i) if meta else i,
                "char_length": len(chunk)
            })

        return jsonify({
            "answer": answer,
            "chunks": chunks_result,
            "model": "mixtral-8x7b-32768",
            "total_chunks_in_db": collection.count()
        })
    except Exception as e:
        logger.error(f"Query failed: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_models()
    logger.info(f"Data directory: {DATA_DIR}")
    logger.info(f"Server starting on http://0.0.0.0:8080")
    app.run(host='0.0.0.0', port=8080, debug=False)
