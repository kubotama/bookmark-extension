import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Popup from "./Popup";

describe("Popup", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Mock chrome APIs
    global.chrome = {
      storage: {
        local: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          get: vi.fn((_keys, callback): any => {
            callback({});
          }),
        },
      },
      tabs: {
        create: vi.fn(),
      },
      runtime: {
        openOptionsPage: vi.fn(),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  });

  it("URLが設定されている場合、「アクセス」ボタンを表示する", async () => {
    const testUrl = "https://example.com";
    // Mock storage to return a URL
    global.chrome.storage.local.get = vi.fn((_keys, callback) => {
      callback({ bookmarkUrl: testUrl });
    });

    render(<Popup />);

    await waitFor(() => {
      const accessButton = screen.getByRole("button", { name: "アクセス" });
      expect(accessButton).toBeInTheDocument();
    });
  });

  it("「アクセス」ボタンをクリックすると、新しいタブでURLを開く", async () => {
    const testUrl = "https://example.com";
    // Mock storage to return a URL
    global.chrome.storage.local.get = vi.fn((_keys, callback) => {
      callback({ bookmarkUrl: testUrl });
    });

    render(<Popup />);

    await waitFor(() => {
      const accessButton = screen.getByRole("button", { name: "アクセス" });
      fireEvent.click(accessButton);
      expect(global.chrome.tabs.create).toHaveBeenCalledWith({ url: testUrl });
    });
  });

  it("URLが設定されていない場合、メッセージとオプションページへのボタンを表示する", async () => {
    // Storage mock is already set to return empty in beforeEach
    render(<Popup />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "URLが設定されていません。オプションページで設定してください。"
        )
      ).toBeInTheDocument();
      const optionsButton = screen.getByRole("button", {
        name: "オプションページへ",
      });
      expect(optionsButton).toBeInTheDocument();
    });
  });

  it("「オプションページへ」ボタンをクリックすると、オプションページを開く", async () => {
    // Storage mock is already set to return empty in beforeEach
    render(<Popup />);

    await waitFor(() => {
      const optionsButton = screen.getByRole("button", {
        name: "オプションページへ",
      });
      fireEvent.click(optionsButton);
      expect(global.chrome.runtime.openOptionsPage).toHaveBeenCalled();
    });
  });
});
