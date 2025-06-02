import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Popup from "./Popup";

describe("Popup", () => {
  beforeEach(() => {
    // Mock chrome.tabs.query
    global.chrome = {
      tabs: {
        query: vi.fn((_options, callback) => {
          // Simulate an active tab with a URL
          callback([
            { url: "https://example.com", title: "サンプルのページのタイトル" },
          ]);
        }),
      },
      // Mock other chrome APIs if needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  });

  it("renders correctly and displays the active tab URL", async () => {
    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "登録" })).toBeInTheDocument();
      expect(screen.getByLabelText("url")).toHaveValue("https://example.com");
      expect(screen.getByLabelText("title")).toHaveValue(
        "サンプルのページのタイトル"
      );
    });
  });

  it("アクティブなタブのURLの取得に失敗", async () => {
    global.chrome = {
      tabs: {
        query: vi.fn((_options, callback) => {
          // Simulate an active tab with a URL
          callback([]);
        }),
      },
      // Mock other chrome APIs if needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText("登録")).toBeInTheDocument();
      expect(screen.getByLabelText("url")).toHaveValue(
        "URLの取得に失敗しました。"
      );
    });
  });
});
