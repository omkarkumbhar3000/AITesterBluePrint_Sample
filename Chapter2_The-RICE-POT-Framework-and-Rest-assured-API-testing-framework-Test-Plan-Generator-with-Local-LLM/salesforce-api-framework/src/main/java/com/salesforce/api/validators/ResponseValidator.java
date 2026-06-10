package com.salesforce.api.validators;

import com.salesforce.api.models.response.ApiResponse;
import com.salesforce.api.models.response.ErrorResponse;
import io.restassured.response.Response;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.testng.Assert.*;

public class ResponseValidator {
    private static final Logger log = LogManager.getLogger(ResponseValidator.class);

    public void validateStatusCode(Response response, int expectedStatusCode) {
        log.info("Validating status code: expected={}, actual={}", expectedStatusCode, response.getStatusCode());
        assertEquals(response.getStatusCode(), expectedStatusCode,
                "Expected status code " + expectedStatusCode + " but got " + response.getStatusCode());
    }

    public void validateSuccessResponse(ApiResponse apiResponse) {
        assertNotNull(apiResponse, "Response should not be null");
        assertTrue(apiResponse.getSuccess(), "Response success flag should be true");
        assertNotNull(apiResponse.getId(), "Response should contain an ID");
        log.info("Successfully validated create response with ID: {}", apiResponse.getId());
    }

    public void validateRecordExists(Map<String, Object> record, String objectType) {
        assertNotNull(record, "Record should not be null");
        assertNotNull(record.get("Id"), "Record should contain Id");
        assertNotNull(record.get("Name"), "Record should contain Name");
        assertFalse(record.isEmpty(), "Record should not be empty");
        log.info("Validated {} record: {}", objectType, record.get("Id"));
    }

    public void validateErrorResponse(ApiResponse apiResponse, String expectedErrorCode) {
        assertNotNull(apiResponse, "Error response should not be null");
        assertFalse(apiResponse.getSuccess(), "Response success flag should be false");
        assertNotNull(apiResponse.getErrors(), "Response should contain errors");
        ErrorResponse[] errors = apiResponse.getErrors();
        boolean matchesExpected = false;
        for (ErrorResponse error : errors) {
            if (error.getStatusCode().equals(expectedErrorCode)) {
                matchesExpected = true;
                break;
            }
        }
        assertTrue(matchesExpected, "Expected error code " + expectedErrorCode + " not found in response");
        log.info("Validated error response with code: {}", expectedErrorCode);
    }

    public void validateResponseTime(Response response, long maxMillis) {
        long responseTime = response.getTime();
        assertThat(responseTime).as("Response time should be less than " + maxMillis + "ms")
                .isLessThan(maxMillis);
        log.info("Response time: {}ms (threshold: {}ms)", responseTime, maxMillis);
    }

    public void validateContentType(Response response, String expectedContentType) {
        String actualContentType = response.getContentType();
        assertThat(actualContentType).as("Content-Type should contain " + expectedContentType)
                .contains(expectedContentType);
    }

    public void validateFieldValue(Map<String, Object> record, String field, Object expectedValue) {
        assertNotNull(record.get(field), "Field '" + field + "' should not be null");
        assertEquals(record.get(field), expectedValue,
                "Field '" + field + "' should match expected value");
    }

    public void validateHeaderExists(Response response, String headerName) {
        assertNotNull(response.getHeader(headerName),
                "Response should contain header: " + headerName);
    }

    public void validateListResponse(List<?> records, String context) {
        assertNotNull(records, context + " records list should not be null");
        log.info("Validated {}: {} records returned", context, records.size());
    }
}
