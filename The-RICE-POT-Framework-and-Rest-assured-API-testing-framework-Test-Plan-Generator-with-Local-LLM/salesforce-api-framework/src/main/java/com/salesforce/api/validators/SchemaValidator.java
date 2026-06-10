package com.salesforce.api.validators;

import io.restassured.module.jsv.JsonSchemaValidator;
import io.restassured.response.Response;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.InputStream;

public class SchemaValidator {
    private static final Logger log = LogManager.getLogger(SchemaValidator.class);

    public void validateAgainstSchema(Response response, String schemaPath) {
        InputStream schema = getClass().getClassLoader().getResourceAsStream(schemaPath);
        if (schema == null) {
            throw new IllegalArgumentException("Schema file not found: " + schemaPath);
        }
        response.then().body(JsonSchemaValidator.matchesJsonSchema(schema));
        log.info("Response validated against schema: {}", schemaPath);
    }
}
