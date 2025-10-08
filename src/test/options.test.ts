import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the DOM environment for options.ts
const setupDOM = () => {
  document.body.innerHTML = `
    <input type="text" id="url" />
    <button id="save">保存</button>
  `;
};

describe("options.ts", () => {
  beforeEach(() => {
    // Reset mocks and DOM before each test
    vi.resetModules();
    setupDOM();

    // Mock chrome.storage.local
    global.chrome = {
      storage: {
        local: {
          get: vi.fn((_keys, callback) => {
            callback({ bookmarkUrl: "https://example.com" });
          }),
          set: vi.fn((_data, callback) => {
            if (callback) {
              callback();
            }
          }),
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  });

  afterEach(() => {
    // Clean up the DOM
    document.body.innerHTML = "";
  });

  it("ページロード時に保存されたURLを読み込んで表示する", async () => {
    // Dynamically import the script to execute it in the mocked DOM
    await import("../options");

    // Dispatch the DOMContentLoaded event to trigger the script's logic
    document.dispatchEvent(new Event("DOMContentLoaded"));

    // Check if the input field is populated with the URL from storage
    const urlInput = document.getElementById("url") as HTMLInputElement;
    expect(urlInput.value).toBe("https://example.com");
    expect(global.chrome.storage.local.get).toHaveBeenCalledWith(
      "bookmarkUrl",
      expect.any(Function)
    );
  });

  it("保存ボタンをクリックするとURLが保存される", async () => {
    // Dynamically import the script to execute it
    await import("../options");

    // Dispatch DOMContentLoaded to ensure event listeners are attached
    document.dispatchEvent(new Event("DOMContentLoaded"));

    const urlInput = document.getElementById("url") as HTMLInputElement;
    const saveButton = document.getElementById("save") as HTMLButtonElement;

    // Simulate user typing a new URL
    const newUrl = "https://new-example.com";
    urlInput.value = newUrl;

    // Click the save button
    saveButton.click();

    // Verify that chrome.storage.local.set was called with the correct value
    expect(global.chrome.storage.local.set).toHaveBeenCalledWith(
      { bookmarkUrl: newUrl },
      expect.any(Function)
    );
  });
});