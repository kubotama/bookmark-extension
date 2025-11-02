import "@testing-library/jest-dom";
import { vi } from "vitest";

// Function to recursively merge objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const merge = (target: any, source: any) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], merge(target[key], source[key]));
    }
  }

  // Merge the objects
  Object.assign(target || {}, source);
  return target;
};

// Mock chrome API
global.chrome = merge(global.chrome || {}, {
  bookmarks: {
    search: vi.fn(),
  },
  action: {
    setIcon: vi.fn(),
  },
  tabs: {
    get: vi.fn(),
    onUpdated: {
      addListener: vi.fn(),
    },
    onActivated: {
      addListener: vi.fn(),
    },
    query: vi.fn(),
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
  },
});
