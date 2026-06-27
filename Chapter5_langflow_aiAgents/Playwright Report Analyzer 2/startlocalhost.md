# Start Localhost — After PC Reboot

Run these steps in order after restarting your PC.

## 1. Start Langflow

Open a terminal and run:

```powershell
langflow run --host 0.0.0.0 --port 7860
```

Wait until you see the Langflow UI is ready (usually at `http://localhost:7860`).

## 2. Start the Analyzer App

Open a **second** terminal and run:

```powershell
cd "D:\Laptop_installed_Applications\VS Code\AITesterBluePrint_Sample\Chapter5_langflow_aiAgents\Playwright Report Analyzer 2"
npm run dev
```

## 3. Open in Browser

Go to `http://localhost:5173`

## 4. Use the App

1. Upload two Playwright `report.json` files
2. Click **Analyze Reports**
3. View results

## Troubleshooting

| Problem | Fix |
|---|---|
| Langflow doesn't start | Run `pip install langflow` or check Python installation |
| Port 7860 in use | Change port: `langflow run --port 7861` and update Vite proxy in `vite.config.js` |
| App can't reach Langflow | Make sure Langflow terminal is still running, check `http://localhost:7860/health` |
| Node_modules missing | Run `npm install` before `npm run dev` |
