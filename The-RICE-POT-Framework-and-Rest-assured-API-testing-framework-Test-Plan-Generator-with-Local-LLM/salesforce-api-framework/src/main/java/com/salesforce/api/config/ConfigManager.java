package com.salesforce.api.config;

import java.io.InputStream;
import java.util.Properties;

public class ConfigManager {
    private static final Properties properties = new Properties();
    private static final String DEFAULT_ENV = "qa";

    static {
        loadProperties();
    }

    private static void loadProperties() {
        String env = System.getProperty("env", DEFAULT_ENV);
        try (InputStream is = ConfigManager.class.getClassLoader()
                .getResourceAsStream("app.properties")) {
            if (is != null) properties.load(is);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load app.properties", e);
        }
        try (InputStream is = ConfigManager.class.getClassLoader()
                .getResourceAsStream("environments/" + env + ".properties")) {
            if (is != null) properties.load(is);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load " + env + ".properties", e);
        }
    }

    public static String getProperty(String key) {
        String val = System.getProperty(key);
        return val != null ? val : properties.getProperty(key);
    }

    public static String getProperty(String key, String defaultValue) {
        String val = getProperty(key);
        return val != null ? val : defaultValue;
    }
}
