import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("ブックマークを登録", async () => {
    global.fetch = vi.fn().mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            url: "https://www.google.com/",
            title: "Google",
            id: 1,
          }),
          { status: 200 }
        )
    );

    render(<Popup />);

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title");

    fireEvent.change(urlInput, {
      target: { value: "https://www.google.com/" },
    });
    fireEvent.change(titleInput, { target: { value: "Google" } });

    const registerButton = screen.getByRole("button", { name: "登録" });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(global.fetch).toBeCalledTimes(1);
      expect(global.fetch).toBeCalledWith(
        "http://localhost:3000/api/bookmark/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: '{"url":"https://www.google.com/","title":"Google"}',
        }
      );
      expect(
        screen.getByText("ブックマークが登録されました。")
      ).toBeInTheDocument();
    });
  });

  it("既に登録されているブックマークを登録しようとしてエラー", async () => {
    global.fetch = vi.fn().mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            error: "指定されたURLのブックマークは既に登録されています。",
            message: "指定されたURLのブックマークは既に登録されています。",
            url: "https://www.google.com/",
            title: "Google",
          }),
          {
            status: 409,
          }
        )
    );

    render(<Popup />);

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title");

    fireEvent.change(urlInput, {
      target: { value: "https://www.google.com/" },
    });
    fireEvent.change(titleInput, { target: { value: "Google" } });

    const registerButton = screen.getByRole("button", { name: "登録" });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(global.fetch).toBeCalledTimes(1);
      expect(global.fetch).toBeCalledWith(
        "http://localhost:3000/api/bookmark/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: '{"url":"https://www.google.com/","title":"Google"}',
        }
      );
      expect(
        screen.getByText("ブックマークの登録に失敗しました。")
      ).toBeInTheDocument();
    });
  });
});
