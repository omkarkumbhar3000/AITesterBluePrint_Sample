package com.salesforce.api.client;

import com.salesforce.api.config.ConfigManager;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static io.restassured.RestAssured.given;

public class BaseApiClient {
    protected static final Logger log = LogManager.getLogger(BaseApiClient.class);
    protected String baseUri;
    protected String authToken;
    protected RequestSpecification spec;

    public BaseApiClient() {
        this.baseUri = ConfigManager.getProperty("base.uri");
        this.spec = new RequestSpecBuilder()
                .setBaseUri(baseUri)
                .setContentType(ContentType.JSON)
                .setAccept(ContentType.JSON)
                .build();
    }

    public void setAuthToken(String token) {
        this.authToken = token;
    }

    protected RequestSpecification getSpec() {
        RequestSpecification requestSpec = given().spec(spec);
        if (authToken != null) {
            requestSpec.header("Authorization", "Bearer " + authToken);
        }
        return requestSpec;
    }

    protected Response get(String endpoint) {
        log.debug("GET {}", endpoint);
        Response response = getSpec().get(endpoint);
        log.debug("Response: {} {}", response.getStatusCode(), response.asString());
        return response;
    }

    protected Response get(String endpoint, String queryParams) {
        log.debug("GET {}?{}", endpoint, queryParams);
        Response response = getSpec().queryParams(queryParams).get(endpoint);
        log.debug("Response: {} {}", response.getStatusCode(), response.asString());
        return response;
    }

    protected Response post(String endpoint, Object body) {
        log.debug("POST {} body: {}", endpoint, body);
        Response response = getSpec().body(body).post(endpoint);
        log.debug("Response: {} {}", response.getStatusCode(), response.asString());
        return response;
    }

    protected Response patch(String endpoint, Object body) {
        log.debug("PATCH {} body: {}", endpoint, body);
        Response response = getSpec().body(body).patch(endpoint);
        log.debug("Response: {} {}", response.getStatusCode(), response.asString());
        return response;
    }

    protected Response delete(String endpoint) {
        log.debug("DELETE {}", endpoint);
        Response response = getSpec().delete(endpoint);
        log.debug("Response: {} {}", response.getStatusCode(), response.asString());
        return response;
    }
}
