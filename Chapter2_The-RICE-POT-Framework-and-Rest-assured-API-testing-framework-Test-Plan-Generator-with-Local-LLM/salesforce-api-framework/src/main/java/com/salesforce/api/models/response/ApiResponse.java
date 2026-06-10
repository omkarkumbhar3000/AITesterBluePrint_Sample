package com.salesforce.api.models.response;

import lombok.Data;

@Data
public class ApiResponse {
    private String id;
    private Boolean success;
    private ErrorResponse[] errors;
}
