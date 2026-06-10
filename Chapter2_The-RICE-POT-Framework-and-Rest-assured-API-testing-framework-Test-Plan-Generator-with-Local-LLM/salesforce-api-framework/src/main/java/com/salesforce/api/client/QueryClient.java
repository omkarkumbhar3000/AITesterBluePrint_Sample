package com.salesforce.api.client;

import com.salesforce.api.constants.APIConstants;
import com.salesforce.api.models.response.QueryResult;
import com.salesforce.api.utils.JsonUtils;
import io.restassured.response.Response;

public class QueryClient extends BaseApiClient {

    public QueryResult query(String soqlQuery) {
        String endpoint = APIConstants.QUERY_ENDPOINT + "?q=" + soqlQuery;
        Response response = get(endpoint);
        return JsonUtils.fromJson(response.asString(), QueryResult.class);
    }

    public QueryResult queryNext(String nextRecordsUrl) {
        Response response = get(nextRecordsUrl);
        return JsonUtils.fromJson(response.asString(), QueryResult.class);
    }

    public QueryResult queryAll(String soqlQuery) {
        QueryResult result = query(soqlQuery);
        String nextUrl = result.getNextRecordsUrl();
        while (nextUrl != null) {
            QueryResult next = queryNext(nextUrl);
            result.getRecords().addAll(next.getRecords());
            result.setDone(next.isDone());
            nextUrl = next.getNextRecordsUrl();
        }
        return result;
    }
}
