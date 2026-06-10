package com.salesforce.api.models.response;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class QueryResult {
    private int totalSize;
    private boolean done;
    private List<Map<String, Object>> records;
    private String nextRecordsUrl;
}
