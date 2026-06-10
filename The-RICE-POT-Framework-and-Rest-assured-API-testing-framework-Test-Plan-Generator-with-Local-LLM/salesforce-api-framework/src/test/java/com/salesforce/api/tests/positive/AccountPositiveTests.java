package com.salesforce.api.tests.positive;

import com.salesforce.api.base.BaseTest;
import com.salesforce.api.listeners.AllureListener;
import com.salesforce.api.models.request.AccountRequest;
import com.salesforce.api.models.response.ApiResponse;
import com.salesforce.api.payloads.AccountPayloadBuilder;
import io.qameta.allure.*;
import org.testng.annotations.Test;

import java.util.Map;

@Epic("Salesforce CRM")
@Feature("Account Object API")
public class AccountPositiveTests extends BaseTest {

    @Test(groups = {"positive", "smoke"}, priority = 1)
    @Owner("QA Team")
    @Description("Verify creation of a new Account with valid data")
    @Severity(SeverityLevel.BLOCKER)
    @Story("Create Account")
    public void testCreateAccountWithValidData() {
        AllureListener.attachRequest("Create Account Request", "POST",
                "/sobjects/Account", AccountPayloadBuilder.validAccount());

        ApiResponse response = sObjectClient.createRecord("Account",
                AccountPayloadBuilder.validAccount());

        AllureListener.attachResponse("Create Account Response",
                io.restassured.RestAssured.given().when().get().then().extract().response());

        responseValidator.validateSuccessResponse(response);
        log.info("Account created with ID: {}", response.getId());
    }

    @Test(groups = {"positive", "regression"}, priority = 2)
    @Owner("QA Team")
    @Description("Verify retrieval of an existing Account by ID")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get Account")
    public void testGetAccountById() {
        ApiResponse createResponse = sObjectClient.createRecord("Account",
                AccountPayloadBuilder.validAccount());

        Map<String, Object> account = sObjectClient.getRecord("Account",
                createResponse.getId());

        responseValidator.validateRecordExists(account, "Account");
        responseValidator.validateFieldValue(account, "Id", createResponse.getId());
    }

    @Test(groups = {"positive", "regression"}, priority = 3)
    @Owner("QA Team")
    @Description("Verify full update of an existing Account")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Update Account")
    public void testUpdateAccount() {
        ApiResponse createResponse = sObjectClient.createRecord("Account",
                AccountPayloadBuilder.validAccount());

        AccountRequest updatePayload = AccountPayloadBuilder.updateAccountPayload();
        ApiResponse updateResponse = sObjectClient.updateRecord("Account",
                createResponse.getId(), updatePayload);

        responseValidator.validateSuccessResponse(updateResponse);

        Map<String, Object> updatedRecord = sObjectClient.getRecord("Account",
                createResponse.getId());
        responseValidator.validateFieldValue(updatedRecord, "Name",
                updatePayload.getName());
    }

    @Test(groups = {"positive", "smoke"}, priority = 4)
    @Owner("QA Team")
    @Description("Verify soft deletion of an Account")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Delete Account")
    public void testDeleteAccount() {
        ApiResponse createResponse = sObjectClient.createRecord("Account",
                AccountPayloadBuilder.validAccount());

        ApiResponse deleteResponse = sObjectClient.deleteRecord("Account",
                createResponse.getId());

        responseValidator.validateSuccessResponse(deleteResponse);
        log.info("Account {} deleted successfully", createResponse.getId());
    }

    @Test(groups = {"positive", "regression"}, priority = 5)
    @Owner("QA Team")
    @Description("Verify SOQL query returns correct Account records")
    @Severity(SeverityLevel.NORMAL)
    @Story("Query Accounts")
    public void testQueryAccounts() {
        sObjectClient.createRecord("Account", AccountPayloadBuilder.validAccount());

        var result = queryClient.query(
                "SELECT Id, Name FROM Account LIMIT 10");

        responseValidator.validateListResponse(result.getRecords(), "Account query");
        log.info("Query returned {} records", result.getTotalSize());
    }
}
