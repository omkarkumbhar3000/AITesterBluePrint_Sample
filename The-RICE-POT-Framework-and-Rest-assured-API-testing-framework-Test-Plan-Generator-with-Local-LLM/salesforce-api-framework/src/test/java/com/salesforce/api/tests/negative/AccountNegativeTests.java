package com.salesforce.api.tests.negative;

import com.salesforce.api.base.BaseTest;
import com.salesforce.api.models.response.ApiResponse;
import com.salesforce.api.payloads.AccountPayloadBuilder;
import io.qameta.allure.*;
import org.testng.annotations.Test;

@Epic("Salesforce CRM")
@Feature("Account Object API - Error Handling")
public class AccountNegativeTests extends BaseTest {

    @Test(groups = {"negative", "regression"}, priority = 1)
    @Owner("QA Team")
    @Description("Verify that creating an Account without required Name field returns error")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Create Account Validation")
    public void testCreateAccountMissingRequiredField() {
        ApiResponse response = sObjectClient.createRecord("Account",
                AccountPayloadBuilder.accountWithMissingRequiredField());

        responseValidator.validateErrorResponse(response, "REQUIRED_FIELD_MISSING");
        log.warn("Account creation with missing Name returned errors: {}",
                response.getErrors());
    }

    @Test(groups = {"negative", "regression"}, priority = 2)
    @Owner("QA Team")
    @Description("Verify that creating an Account with empty Name returns error")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Create Account Validation")
    public void testCreateAccountWithEmptyName() {
        ApiResponse response = sObjectClient.createRecord("Account",
                AccountPayloadBuilder.accountWithEmptyName());

        responseValidator.validateErrorResponse(response, "REQUIRED_FIELD_MISSING");
    }

    @Test(groups = {"negative", "regression"}, priority = 3)
    @Owner("QA Team")
    @Description("Verify that getting a non-existent Account returns 404")
    @Severity(SeverityLevel.NORMAL)
    @Story("Get Account Validation")
    public void testGetNonExistentAccount() {
        var response = io.restassured.RestAssured.given()
                .header("Authorization", "Bearer " + accessToken)
                .baseUri(instanceUrl)
                .get("/services/data/v58.0/sobjects/Account/001NONEXISTENTXXXX");

        responseValidator.validateStatusCode(response, 404);
    }

    @Test(groups = {"negative", "regression"}, priority = 4)
    @Owner("QA Team")
    @Description("Verify that deleting a non-existent Account returns 404")
    @Severity(SeverityLevel.NORMAL)
    @Story("Delete Account Validation")
    public void testDeleteNonExistentAccount() {
        var response = io.restassured.RestAssured.given()
                .header("Authorization", "Bearer " + accessToken)
                .baseUri(instanceUrl)
                .delete("/services/data/v58.0/sobjects/Account/001NONEXISTENTXXXX");

        responseValidator.validateStatusCode(response, 404);
    }

    @Test(groups = {"negative", "regression"}, priority = 5)
    @Owner("QA Team")
    @Description("Verify that invalid object type returns 404")
    @Severity(SeverityLevel.NORMAL)
    @Story("Invalid Object Type")
    public void testInvalidObjectType() {
        var response = io.restassured.RestAssured.given()
                .header("Authorization", "Bearer " + accessToken)
                .baseUri(instanceUrl)
                .get("/services/data/v58.0/sobjects/InvalidObject__99x");

        responseValidator.validateStatusCode(response, 404);
    }
}
