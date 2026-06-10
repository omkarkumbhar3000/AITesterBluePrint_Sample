package com.salesforce.api.models.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactRequest {
    private String FirstName;
    private String LastName;
    private String Email;
    private String Phone;
    private String AccountId;
    private String Title;
    private String MailingCity;
    private String MailingState;
    private String MailingCountry;
}
