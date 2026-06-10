package com.salesforce.api.payloads;

import com.salesforce.api.models.request.AccountRequest;
import com.salesforce.api.utils.DataGenerator;

import java.util.HashMap;
import java.util.Map;

public class AccountPayloadBuilder {

    public static AccountRequest validAccount() {
        return AccountRequest.builder()
                .Name(DataGenerator.randomCompanyName())
                .Phone(DataGenerator.randomPhone())
                .Industry("Technology")
                .Type("Prospect")
                .Website("https://" + DataGenerator.randomString(10) + ".com")
                .BillingCity("San Francisco")
                .BillingState("California")
                .BillingCountry("USA")
                .Description("Created via API automation framework")
                .build();
    }

    public static AccountRequest accountWithName(String name) {
        AccountRequest base = validAccount();
        return AccountRequest.builder()
                .Name(name)
                .Phone(base.getPhone())
                .Industry(base.getIndustry())
                .Type(base.getType())
                .BillingCity(base.getBillingCity())
                .BillingState(base.getBillingState())
                .BillingCountry(base.getBillingCountry())
                .build();
    }

    public static Map<String, Object> accountWithMissingRequiredField() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("Phone", DataGenerator.randomPhone());
        payload.put("Industry", "Technology");
        return payload;
    }

    public static Map<String, Object> accountWithEmptyName() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("Name", "");
        payload.put("Phone", DataGenerator.randomPhone());
        return payload;
    }

    public static Map<String, Object> accountWithBoundaryDescription(int length) {
        AccountRequest base = validAccount();
        Map<String, Object> payload = new HashMap<>();
        payload.put("Name", base.getName());
        payload.put("Description", DataGenerator.randomString(length));
        return payload;
    }

    public static AccountRequest updateAccountPayload() {
        return AccountRequest.builder()
                .Name("Updated - " + DataGenerator.randomCompanyName())
                .Phone(DataGenerator.randomPhone())
                .Industry("Healthcare")
                .build();
    }
}
