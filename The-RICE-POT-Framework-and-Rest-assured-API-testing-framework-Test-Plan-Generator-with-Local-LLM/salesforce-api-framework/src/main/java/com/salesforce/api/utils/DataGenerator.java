package com.salesforce.api.utils;

import com.github.javafaker.Faker;

public class DataGenerator {
    private static final Faker faker = new Faker();

    public static String randomFirstName() {
        return faker.name().firstName();
    }

    public static String randomLastName() {
        return faker.name().lastName();
    }

    public static String randomEmail() {
        return faker.internet().emailAddress();
    }

    public static String randomPhone() {
        return faker.phoneNumber().phoneNumber();
    }

    public static String randomCompanyName() {
        return faker.company().name();
    }

    public static String randomString(int length) {
        return faker.lorem().characters(length);
    }

    public static int randomInt(int min, int max) {
        return faker.number().numberBetween(min, max);
    }
}
