package com.salesforce.api.tests.security;

import com.salesforce.api.base.BaseTest;
import com.salesforce.api.models.request.AccountRequest;
import com.salesforce.api.utils.DataGenerator;
import io.qameta.allure.*;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

@Epic("Salesforce CRM Security")
@Feature("API Security Testing")
public class SecurityTests extends BaseTest {

    @Test(groups = {"security", "regression"}, priority = 1)
    @Owner("Security Team")
    @Description("Verify that API rejects requests with invalid token")
    @Severity(SeverityLevel.BLOCKER)
    @Story("Authentication")
    public void testRequestWithInvalidToken() {
        var response = given()
                .baseUri(instanceUrl)
                .header("Authorization", "Bearer invalid-token-12345")
                .contentType("application/json")
                .get("/services/data/v58.0/sobjects/Account");

        responseValidator.validateStatusCode(response, 401);
    }

    @Test(groups = {"security", "regression"}, priority = 2)
    @Owner("Security Team")
    @Description("Verify that API rejects requests with expired token")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Authentication")
    public void testRequestWithExpiredToken() {
        var response = given()
                .baseUri(instanceUrl)
                .header("Authorization", "Bearer expired_token_abc123")
                .contentType("application/json")
                .get("/services/data/v58.0/sobjects/Account");

        responseValidator.validateStatusCode(response, 401);
    }

    @Test(groups = {"security", "regression"}, priority = 3)
    @Owner("Security Team")
    @Description("Verify that API rejects requests without Authorization header")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Authentication")
    public void testRequestWithoutAuthHeader() {
        var response = given()
                .baseUri(instanceUrl)
                .contentType("application/json")
                .get("/services/data/v58.0/sobjects/Account");

        responseValidator.validateStatusCode(response, 401);
    }

    @Test(groups = {"security", "regression"}, priority = 4)
    @Owner("Security Team")
    @Description("Verify API is not vulnerable to SQL injection in SOQL query parameter")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Injection Prevention")
    public void testSQLInjectionInQuery() {
        String maliciousQuery = "SELECT Id FROM Account WHERE Name = 'test' OR 1=1";
        var response = given()
                .baseUri(instanceUrl)
                .header("Authorization", "Bearer " + accessToken)
                .get("/services/data/v58.0/query?q=" + maliciousQuery);

        responseValidator.validateStatusCode(response, 400);
    }

    @Test(groups = {"security", "regression"}, priority = 5)
    @Owner("Security Team")
    @Description("Verify API is not vulnerable to XSS injection in object fields")
    @Severity(SeverityLevel.HIGH)
    @Story("Injection Prevention")
    public void testXSSInjectionInField() {
        AccountRequest account = AccountRequest.builder()
                .Name("<script>alert('XSS')</script>")
                .Phone(DataGenerator.randomPhone())
                .Industry("Technology")
                .build();

        var response = given()
                .baseUri(instanceUrl)
                .header("Authorization", "Bearer " + accessToken)
                .contentType("application/json")
                .body(account)
                .post("/services/data/v58.0/sobjects/Account");

        responseValidator.validateStatusCode(response, 201);
    }

    @Test(groups = {"security", "regression"}, priority = 6)
    @Owner("Security Team")
    @Description("Verify API does not expose sensitive data in error responses")
    @Severity(SeverityLevel.HIGH)
    @Story("Data Exposure")
    public void testNoSensitiveDataInErrors() {
        var response = given()
                .baseUri(instanceUrl)
                .header("Authorization", "Bearer " + accessToken)
                .contentType("application/json")
                .body("{\"invalid\": \"payload\"}")
                .post("/services/data/v58.0/sobjects/Account");

        String body = response.asString().toLowerCase();
        assert !body.contains("stacktrace") : "Error response should not contain stacktrace";
        assert !body.contains("exception") : "Error response should not contain exception details";
    }
}
