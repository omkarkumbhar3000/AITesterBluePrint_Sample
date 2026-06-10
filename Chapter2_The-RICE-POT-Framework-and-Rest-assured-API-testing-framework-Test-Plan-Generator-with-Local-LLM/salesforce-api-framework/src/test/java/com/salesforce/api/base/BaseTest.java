package com.salesforce.api.base;

import com.salesforce.api.client.AuthClient;
import com.salesforce.api.client.QueryClient;
import com.salesforce.api.client.SObjectClient;
import com.salesforce.api.factory.ClientFactory;
import com.salesforce.api.models.response.AuthTokenResponse;
import com.salesforce.api.validators.ResponseValidator;
import com.salesforce.api.validators.SchemaValidator;
import com.salesforce.api.listeners.AllureListener;
import io.qameta.allure.Step;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.testng.ITestContext;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeSuite;

public class BaseTest {
    protected static final Logger log = LogManager.getLogger(BaseTest.class);

    protected SObjectClient sObjectClient;
    protected QueryClient queryClient;
    protected ResponseValidator responseValidator;
    protected SchemaValidator schemaValidator;
    protected String accessToken;
    protected String instanceUrl;

    @BeforeSuite(alwaysRun = true)
    @Step("Initialize test suite - authenticate and setup clients")
    public void setUp(ITestContext context) {
        log.info("=== Initializing Salesforce API Test Suite ===");

        AuthClient authClient = new AuthClient();
        AuthTokenResponse authResponse = authClient.authenticate();
        accessToken = authResponse.getAccessToken();
        instanceUrl = authResponse.getInstanceUrl();

        sObjectClient = ClientFactory.getSObjectClient();
        queryClient = ClientFactory.getQueryClient();
        responseValidator = new ResponseValidator();
        schemaValidator = new SchemaValidator();

        context.setAttribute("accessToken", accessToken);
        context.setAttribute("instanceUrl", instanceUrl);

        log.info("Test suite initialized. Instance: {}", instanceUrl);
    }

    @AfterSuite(alwaysRun = true)
    @Step("Tear down test suite")
    public void tearDown() {
        ClientFactory.reset();
        log.info("=== Test Suite Completed ===");
    }
}
