package com.salesforce.api.models.response;

import lombok.Data;

@Data
public class ErrorResponse {
    private String statusCode;
    private String message;
    private String[] fields;
}
