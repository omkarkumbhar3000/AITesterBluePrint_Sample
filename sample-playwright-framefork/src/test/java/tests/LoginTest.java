package tests;

import com.microsoft.playwright.*;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import com.microsoft.playwright.options.AriaRole;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;
import pages.LoginPage;

/**
 * Login test cases using Playwright with JUnit 5
 * Following Playwright E2E Testing Skill guidelines
 */
class LoginTest {

    private static Playwright playwright;
    private static Browser browser;
    private BrowserContext context;
    private Page page;
    private LoginPage loginPage;

    // Base URL for the application under test
    private static final String BASE_URL = "http://localhost:3000";

    @BeforeAll
    static void launchBrowser() {
        playwright = Playwright.create();
        browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(true));
    }

    @AfterAll
    static void closeBrowser() {
        browser.close();
        playwright.close();
    }

    @BeforeEach
    void createContext() {
        context = browser.newContext(
                new Browser.NewContextOptions()
                        .setBaseURL(BASE_URL)
        );
        page = context.newPage();
        loginPage = new LoginPage(page);
        loginPage.gotoLoginPage();
    }

    @AfterEach
    void closeContext() {
        context.close();
    }

    @Test
    void shouldLoginWithValidCredentials() {
        // Arrange
        String validEmail = "user@example.com";
        String validPassword = "SecurePass123!";

        // Act
        loginPage.login(validEmail, validPassword);

        // Assert
        Assertions.assertEquals(BASE_URL + "/dashboard", page.url());
        Assertions.assertTrue(
                page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Welcome"))
                        .isVisible()
        );
    }

    @Test
    void shouldShowErrorForInvalidCredentials() {
        // Arrange
        String validEmail = "user@example.com";
        String invalidPassword = "wrongpassword";

        // Act
        loginPage.login(validEmail, invalidPassword);

        // Assert
        loginPage.expectErrorMessage("Invalid email or password");
    }

    @Test
    void shouldNavigateToForgotPasswordPage() {
        // Act
        loginPage.clickForgotPassword();

        // Assert
        Assertions.assertEquals(BASE_URL + "/forgot-password", page.url());
    }
}