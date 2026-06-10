package com.salesforce.api.constants;

import com.salesforce.api.config.ConfigManager;

public class APIConstants {
    public static final String BASE_URI = ConfigManager.getProperty("base.uri");
    public static final String API_VERSION = ConfigManager.getProperty("api.version", "v58.0");

    public static final String AUTH_ENDPOINT = "/services/oauth2/token";
    public static final String SOBJECT_ENDPOINT = "/services/data/" + API_VERSION + "/sobjects";
    public static final String QUERY_ENDPOINT = "/services/data/" + API_VERSION + "/query";
    public static final String COMPOSITE_ENDPOINT = "/services/data/" + API_VERSION + "/composite";
}
