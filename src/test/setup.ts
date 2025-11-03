import "@testing-library/jest-dom";
import { vi } from "vitest";

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
      get: vi.fn(),
      set: vi.fn(),
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
