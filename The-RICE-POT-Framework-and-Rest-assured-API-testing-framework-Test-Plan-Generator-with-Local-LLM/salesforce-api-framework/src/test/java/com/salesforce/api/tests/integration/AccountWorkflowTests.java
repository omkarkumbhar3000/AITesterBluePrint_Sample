package com.salesforce.api.tests.integration;

import com.salesforce.api.base.BaseTest;
import com.salesforce.api.models.request.AccountRequest;
import com.salesforce.api.models.request.ContactRequest;
import com.salesforce.api.models.response.ApiResponse;
import com.salesforce.api.payloads.AccountPayloadBuilder;
import com.salesforce.api.utils.DataGenerator;
import io.qameta.allure.*;
import org.testng.ITestContext;
import org.testng.annotations.Test;

import java.util.Map;

@Epic("Salesforce CRM")
@Feature("End-to-End Workflow")
public class AccountWorkflowTests extends BaseTest {

    @Test(groups = {"integration", "e2e"}, priority = 1)
    @Owner("QA Team")
    @Description("Complete CRUD workflow: Create Account -> Get Account -> Update Account -> Query Account -> Delete Account")
    @Severity(SeverityLevel.BLOCKER)
    @Story("Full Account Lifecycle")
    public void testFullAccountLifecycle(ITestContext context) {
        String accountId;

        // Step 1: Create Account
        Allure.step("Create a new Account");
        AccountRequest createPayload = AccountPayloadBuilder.validAccount();
        ApiResponse createResponse = sObjectClient.createRecord("Account", createPayload);
        responseValidator.validateSuccessResponse(createResponse);
        accountId = createResponse.getId();
        context.setAttribute("accountId", accountId);
        log.info("Step 1 - Account created: {}", accountId);

        // Step 2: Get Account by ID
        Allure.step("Retrieve Account by ID");
        Map<String, Object> getResponse = sObjectClient.getRecord("Account", accountId);
        responseValidator.validateRecordExists(getResponse, "Account");
        responseValidator.validateFieldValue(getResponse, "Id", accountId);
        log.info("Step 2 - Account retrieved: {}", getResponse.get("Name"));

        // Step 3: Update Account
        Allure.step("Update Account name");
        AccountRequest updatePayload = AccountPayloadBuilder.updateAccountPayload();
        ApiResponse updateResponse = sObjectClient.updateRecord("Account", accountId, updatePayload);
        responseValidator.validateSuccessResponse(updateResponse);
        log.info("Step 3 - Account updated");

        // Step 4: Verify Update
        Allure.step("Verify Account was updated");
        Map<String, Object> verifyResponse = sObjectClient.getRecord("Account", accountId);
        responseValidator.validateFieldValue(verifyResponse, "Name", updatePayload.getName());
        log.info("Step 4 - Update verified");

        // Step 5: Delete Account
        Allure.step("Delete Account");
        ApiResponse deleteResponse = sObjectClient.deleteRecord("Account", accountId);
        responseValidator.validateSuccessResponse(deleteResponse);
        log.info("Step 5 - Account deleted: {}", accountId);

        // Step 6: Verify Deletion
        Allure.step("Verify Account deletion");
        var getDeletedResponse = io.restassured.RestAssured.given()
                .header("Authorization", "Bearer " + accessToken)
                .baseUri(instanceUrl)
                .get("/services/data/v58.0/sobjects/Account/" + accountId);
        responseValidator.validateStatusCode(getDeletedResponse, 404);
        log.info("Step 6 - Deletion verified: Account not found");
    }

    @Test(groups = {"integration", "e2e"}, priority = 2)
    @Owner("QA Team")
    @Description("Create Account with Contact relationship and verify both")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Account-Contact Relationship")
    public void testAccountWithContactRelationship() {
        Allure.step("Create Account");
        ApiResponse accountResponse = sObjectClient.createRecord("Account",
                AccountPayloadBuilder.validAccount());
        responseValidator.validateSuccessResponse(accountResponse);
        String accountId = accountResponse.getId();

        Allure.step("Create Contact linked to Account");
        ContactRequest contact = ContactRequest.builder()
                .FirstName(DataGenerator.randomFirstName())
                .LastName(DataGenerator.randomLastName())
                .Email(DataGenerator.randomEmail())
                .Phone(DataGenerator.randomPhone())
                .AccountId(accountId)
                .Title("QA Engineer")
                .build();
        ApiResponse contactResponse = sObjectClient.createRecord("Contact", contact);
        responseValidator.validateSuccessResponse(contactResponse);

        Allure.step("Verify Contact links to Account");
        Map<String, Object> getContact = sObjectClient.getRecord("Contact",
                contactResponse.getId());
        responseValidator.validateRecordExists(getContact, "Contact");
        responseValidator.validateFieldValue(getContact, "AccountId", accountId);
        log.info("Contact {} linked to Account {}", contactResponse.getId(), accountId);
    }

    @Test(groups = {"integration", "e2e"}, priority = 3)
    @Owner("QA Team")
    @Description("Bulk create multiple Accounts using different payloads")
    @Severity(SeverityLevel.NORMAL)
    @Story("Bulk Operations")
    public void testBulkAccountCreation() {
        int count = 5;
        Allure.step("Create " + count + " Accounts in sequence");
        for (int i = 0; i < count; i++) {
            ApiResponse response = sObjectClient.createRecord("Account",
                    AccountPayloadBuilder.validAccount());
            responseValidator.validateSuccessResponse(response);
            log.info("Created Account {} of {}: {}", i + 1, count, response.getId());
        }
        Allure.step("All " + count + " Accounts created successfully");
    }
}
