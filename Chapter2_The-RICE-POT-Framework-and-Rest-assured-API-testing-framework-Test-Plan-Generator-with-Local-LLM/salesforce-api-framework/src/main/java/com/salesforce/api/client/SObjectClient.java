package com.salesforce.api.client;

import com.salesforce.api.constants.APIConstants;
import com.salesforce.api.models.response.ApiResponse;
import com.salesforce.api.utils.JsonUtils;
import io.restassured.response.Response;

import java.util.Map;

public class SObjectClient extends BaseApiClient {

    public ApiResponse createRecord(String objectType, Object requestBody) {
        String endpoint = APIConstants.SOBJECT_ENDPOINT + "/" + objectType;
        Response response = post(endpoint, requestBody);
        return JsonUtils.fromJson(response.asString(), ApiResponse.class);
    }

    public Map<String, Object> getRecord(String objectType, String recordId) {
        String endpoint = APIConstants.SOBJECT_ENDPOINT + "/" + objectType + "/" + recordId;
        Response response = get(endpoint);
        return JsonUtils.fromJson(response.asString(), Map.class);
    }

    public Map<String, Object> getRecord(String objectType, String recordId, String fields) {
        String endpoint = APIConstants.SOBJECT_ENDPOINT + "/" + objectType + "/" + recordId + "?fields=" + fields;
        Response response = get(endpoint);
        return JsonUtils.fromJson(response.asString(), Map.class);
    }

    public ApiResponse updateRecord(String objectType, String recordId, Object requestBody) {
        String endpoint = APIConstants.SOBJECT_ENDPOINT + "/" + objectType + "/" + recordId;
        Response response = patch(endpoint, requestBody);
        return JsonUtils.fromJson(response.asString(), ApiResponse.class);
    }

    public ApiResponse deleteRecord(String objectType, String recordId) {
        String endpoint = APIConstants.SOBJECT_ENDPOINT + "/" + objectType + "/" + recordId;
        Response response = delete(endpoint);
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setSuccess(response.getStatusCode() == 204);
        return apiResponse;
    }

    public Map<String, Object> describeObject(String objectType) {
        String endpoint = APIConstants.SOBJECT_ENDPOINT + "/" + objectType + "/describe";
        Response response = get(endpoint);
        return JsonUtils.fromJson(response.asString(), Map.class);
    }
}
