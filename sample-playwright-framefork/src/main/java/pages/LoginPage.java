package pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

/**
 * Login Page Object Model
 * Following Playwright E2E Testing Skill guidelines
 */
public class LoginPage extends BasePage {
    // Locators using Playwright's recommended priority order
    private final Locator emailInput;
    private final Locator passwordInput;
    private final Locator submitButton;
    private final Locator errorMessage;
    private final Locator forgotPasswordLink;

    public LoginPage(Page page) {
        super(page);
        // Using getByLabel as primary selector (highest priority for form inputs)
        this.emailInput = page.getByLabel("Email");
        this.passwordInput = page.getByLabel("Password");
        // Using getByRole for buttons (high priority)
        this.submitButton = page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in"));
        // Using getByRole for alert/error messages
        this.errorMessage = page.getByRole(AriaRole.ALERT);
        // Using getByRole for links
        this.forgotPasswordLink = page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Forgot password?"));
    }

    /**
     * Navigate to login page
     */
    public void gotoLoginPage() {
        navigate("/login");
        waitForPageLoad();
    }

    /**
     * Perform login with email and password
     * @param email User email
     * @param password User password
     */
    public void login(String email, String password) {
        emailInput.fill(email);
        passwordInput.fill(password);
        submitButton.click();
    }

    /**
     * Check if error message is visible and contains expected text
     * @param expectedMessage Expected error message text
     */
    public void expectErrorMessage(String expectedMessage) {
        // Using soft assertions pattern from the skill
        if (!errorMessage.isVisible()) {
            throw new AssertionError("Error message is not visible");
        }
        String actualText = errorMessage.textContent();
        if (!actualText.contains(expectedMessage)) {
            throw new AssertionError("Error message text mismatch. Expected: " + expectedMessage + ", Actual: " + actualText);
        }
    }

    /**
     * Click forgot password link
     */
    public void clickForgotPassword() {
        forgotPasswordLink.click();
    }
}