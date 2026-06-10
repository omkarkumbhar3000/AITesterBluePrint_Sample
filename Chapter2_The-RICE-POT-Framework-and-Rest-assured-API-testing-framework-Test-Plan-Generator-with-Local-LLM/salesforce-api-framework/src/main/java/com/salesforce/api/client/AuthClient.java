package com.salesforce.api.client;

import com.salesforce.api.config.ConfigManager;
import com.salesforce.api.constants.APIConstants;
import com.salesforce.api.models.response.AuthTokenResponse;
import com.salesforce.api.utils.JsonUtils;
import io.restassured.http.ContentType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;

public class AuthClient {
    private static final Logger log = LogManager.getLogger(AuthClient.class);

    public AuthTokenResponse authenticate() {
        String username = ConfigManager.getProperty("username");
        String password = ConfigManager.getProperty("password");
        String clientId = ConfigManager.getProperty("client.id");
        String clientSecret = ConfigManager.getProperty("client.secret");

        Map<String, String> formParams = new HashMap<>();
        formParams.put("grant_type", "password");
        formParams.put("client_id", clientId);
        formParams.put("client_secret", clientSecret);
        formParams.put("username", username);
        formParams.put("password", password);

        log.info("Authenticating user: {}", username);

        String response = given()
                .baseUri(APIConstants.BASE_URI)
                .contentType(ContentType.URLENC)
                .formParams(formParams)
                .post(APIConstants.AUTH_ENDPOINT)
                .then()
                .extract()
                .asString();

        AuthTokenResponse tokenResponse = JsonUtils.fromJson(response, AuthTokenResponse.class);
        log.info("Authentication successful, token obtained");
        return tokenResponse;
    }
}
