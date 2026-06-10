package com.salesforce.api.factory;

import com.salesforce.api.client.AuthClient;
import com.salesforce.api.client.QueryClient;
import com.salesforce.api.client.SObjectClient;
import com.salesforce.api.models.response.AuthTokenResponse;

public class ClientFactory {
    private static volatile SObjectClient sObjectClient;
    private static volatile QueryClient queryClient;
    private static volatile String authToken;

    private ClientFactory() {}

    public static String getAuthToken() {
        if (authToken == null) {
            synchronized (ClientFactory.class) {
                if (authToken == null) {
                    AuthClient authClient = new AuthClient();
                    AuthTokenResponse response = authClient.authenticate();
                    authToken = response.getAccessToken();
                }
            }
        }
        return authToken;
    }

    public static SObjectClient getSObjectClient() {
        if (sObjectClient == null) {
            synchronized (ClientFactory.class) {
                if (sObjectClient == null) {
                    sObjectClient = new SObjectClient();
                    sObjectClient.setAuthToken(getAuthToken());
                }
            }
        }
        return sObjectClient;
    }

    public static QueryClient getQueryClient() {
        if (queryClient == null) {
            synchronized (ClientFactory.class) {
                if (queryClient == null) {
                    queryClient = new QueryClient();
                    queryClient.setAuthToken(getAuthToken());
                }
            }
        }
        return queryClient;
    }

    public static void reset() {
        authToken = null;
        sObjectClient = null;
        queryClient = null;
    }
}
