import os
import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    extension_path = os.path.abspath('dist')

    async with async_playwright() as p:
        browser_context = await p.chromium.launch_persistent_context(
            "",  # An empty user data directory for a clean session
            headless=False,
            args=[
                f"--disable-extensions-except={extension_path}",
                f"--load-extension={extension_path}",
            ],
        )

        # --- Get Extension ID ---
        # Navigate to the extensions page to find the dynamic ID
        extensions_page = await browser_context.new_page()
        await extensions_page.goto("chrome://extensions")

        # Enable developer mode to see the extension IDs
        await extensions_page.locator("extensions-manager").locator("#toolbar").locator("cr-toggle#devMode").click()

        # Find the extension by name and get its ID
        extension_item = extensions_page.locator(f"extensions-item:has-text('Bookmark Extension')")
        extension_id = await extension_item.get_attribute("id")
        await extensions_page.close()

        # --- Verify Options Page ---
        page = await browser_context.new_page()
        await page.goto(f"chrome-extension://{extension_id}/src/options.html")

        await page.screenshot(path="jules-scratch/verification/01_options_initial.png")

        url_input = page.locator("#url")
        await url_input.fill("https://www.google.com")
        await page.locator("#save").click()

        await page.goto(f"chrome-extension://{extension_id}/src/options.html")
        await expect(page.locator("#url")).to_have_value("https://www.google.com")
        await page.screenshot(path="jules-scratch/verification/02_options_saved.png")

        # --- Verify Popup Page ---
        await page.goto(f"chrome-extension://{extension_id}/src/popup.html")

        await expect(page.locator("text=アクセス")).to_be_visible()
        await page.screenshot(path="jules-scratch/verification/03_popup_with_url.png")

        # --- Verify Popup Page without URL ---
        await page.evaluate("chrome.storage.local.clear()")
        await page.goto(f"chrome-extension://{extension_id}/src/popup.html")

        await expect(page.locator("text=URLが設定されていません。")).to_be_visible()
        await page.screenshot(path="jules-scratch/verification/04_popup_no_url.png")

        await browser_context.close()

if __name__ == "__main__":
    asyncio.run(main())