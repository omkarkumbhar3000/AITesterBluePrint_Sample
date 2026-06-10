package com.salesforce.api.listeners;

import io.qameta.allure.Allure;
import io.restassured.response.Response;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

public class AllureListener implements ITestListener {

    @Override
    public void onTestStart(ITestResult result) {
        Allure.step("Starting test: " + result.getMethod().getMethodName());
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        Allure.step("Test passed: " + result.getMethod().getMethodName());
    }

    @Override
    public void onTestFailure(ITestResult result) {
        Allure.addAttachment("Failure Reason",
                "text/plain",
                result.getThrowable() != null ? result.getThrowable().getMessage() : "Unknown");
    }

    public static void attachResponse(String name, Response response) {
        String content = String.format("Status: %d\nHeaders: %s\nBody:\n%s",
                response.getStatusCode(),
                response.getHeaders().toString(),
                response.asString());
        Allure.addAttachment(name,
                "application/json",
                new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8)),
                ".json");
    }

    public static void attachRequest(String name, String method, String endpoint, Object body) {
        String content = String.format("%s %s\nBody:\n%s", method, endpoint, body);
        Allure.addAttachment(name,
                "application/json",
                new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8)),
                ".json");
    }

    @Override
    public void onFinish(ITestContext context) {
        Allure.step("Suite finished: " + context.getName());
    }
}
