package pages;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.LoadState;

/**
 * Base Page Class - Abstract class encapsulating common page actions
 * Following Playwright E2E Testing Skill guidelines
 */
public abstract class BasePage {
    protected final Page page;

    public BasePage(Page page) {
        this.page = page;
    }

    /**
     * Navigate to a specific path
     * @param path The path to navigate to
     */
    public void navigate(String path) {
        page.navigate(path);
    }

    /**
     * Wait for page to reach network idle state
     */
    public void waitForPageLoad() {
        page.waitForLoadState(LoadState.NETWORKIDLE);
    }

    /**
     * Get the page title
     * @return Page title
     */
    public String getTitle() {
        return page.title();
    }
}