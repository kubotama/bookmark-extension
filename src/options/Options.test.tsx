import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";

import {
  OPTION_LABEL_API_URL,
  OPTION_SAVE_BUTTON_TEXT,
  OPTION_SUBTITLE_TEXT,
  PLACEHOLDER_URL,
  STORAGE_KEY_API_BASE_URL,
} from "../constants/constants";
import Options from "./Options";

describe("Options", () => {
  let user: UserEvent;

  // chrome.storage.localのモック
  const mockGet = vi.fn();
  const mockSet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: mockGet,
          set: mockSet,
        },
      },
    });
    mockGet.mockResolvedValue({
      [STORAGE_KEY_API_BASE_URL]: "https://example.com/saved",
    });
    mockSet.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("タイマーを使用しないテスト", () => {
    beforeEach(() => {
      user = userEvent.setup();
    });
    it("renders the options page", async () => {
      render(<Options />);

      expect(
        await screen.findByRole("heading", { name: OPTION_SUBTITLE_TEXT })
      ).toBeInTheDocument();
      expect(
        await screen.findByPlaceholderText(PLACEHOLDER_URL)
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("button", { name: OPTION_SAVE_BUTTON_TEXT })
      ).toBeInTheDocument();
      // LabeledInputFieldはlabel要素とinput要素を持つため、
      // labelテキストで取得するのが一般的です。
      // 定数を使用することで、将来のラベル変更に強くなります。
      expect(
        await screen.findByLabelText(OPTION_LABEL_API_URL)
      ).toBeInTheDocument();
    });

    it("loads and displays the saved URL on mount", async () => {
      const savedUrl = "https://example.com/saved";
      mockGet.mockResolvedValue({ [STORAGE_KEY_API_BASE_URL]: savedUrl });

      render(<Options />);

      expect(await screen.findByLabelText(OPTION_LABEL_API_URL)).toHaveValue(
        savedUrl
      );

      expect(mockGet).toHaveBeenCalledWith([STORAGE_KEY_API_BASE_URL]);
    });

    it("updates the input value on change", async () => {
      render(<Options />);

      const input = await screen.findByLabelText(OPTION_LABEL_API_URL);
      const newUrl = "https://example.com/new";

      await user.clear(input);
      await user.type(input, newUrl);

      expect(input).toHaveValue(newUrl);
    });

    it("saves the URL to storage when the save button is clicked", async () => {
      render(<Options />);

      const input = await screen.findByLabelText(OPTION_LABEL_API_URL);
      const button = await screen.findByRole("button", {
        name: OPTION_SAVE_BUTTON_TEXT,
      });
      const newUrl = "https://example.com/new";

      await user.clear(input);
      await user.type(input, newUrl);
      await user.click(button);

      expect(mockSet).toHaveBeenCalledWith({
        [STORAGE_KEY_API_BASE_URL]: newUrl,
      });
    });

    it("does not save if the URL is empty", async () => {
      mockGet.mockResolvedValue({});
      render(<Options />);
      const button = await screen.findByRole("button", {
        name: OPTION_SAVE_BUTTON_TEXT,
      });

      await user.click(button);

      expect(mockSet).not.toHaveBeenCalled();
    });
  });
});
