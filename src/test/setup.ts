import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";

export const chromeStorageLocalGet = vi.fn();
export const chromeStorageLocalSet = vi.fn();

// Mock chrome API
global.chrome = {
  bookmarks: {
    search: vi.fn(),
  },
  runtime: {
    lastError: undefined,
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
  },
  storage: {
    local: {
      get: chromeStorageLocalGet,
      set: chromeStorageLocalSet,
    },
  },
  tabs: {
    query: vi.fn(),
    onUpdated: {
      addListener: vi.fn(),
    },
    onActivated: {
      addListener: vi.fn(),
    },
    get: vi.fn(),
  },
  action: {
    setIcon: vi.fn(),
  },
} as unknown as typeof chrome;

afterEach(() => {
  chromeStorageLocalGet.mockClear();
  chromeStorageLocalSet.mockClear();
});
