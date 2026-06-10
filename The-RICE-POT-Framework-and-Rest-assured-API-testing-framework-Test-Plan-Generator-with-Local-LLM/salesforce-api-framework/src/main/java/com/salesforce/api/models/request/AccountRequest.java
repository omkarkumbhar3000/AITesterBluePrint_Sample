package com.salesforce.api.models.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountRequest {
    private String Name;
    private String Phone;
    private String Industry;
    private String Type;
    private String Website;
    private String BillingCity;
    private String BillingState;
    private String BillingCountry;
    private String Description;
}
