/// <reference types="chrome"/>

import { useEffect, useState } from "react";

export const useActiveTabInfo = () => {
  const [url, setUrl] = useState<string>("URLの取得中...");
  const [title, setTitle] = useState<string>("タイトルの取得中...");

  useEffect(() => {
    let isMounted = true;
    const fetchActiveTabInfo = async () => {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (isMounted && tabs[0]?.url) {
          setUrl(tabs[0].url);
          setTitle(tabs[0].title || "");
        } else {
          console.error("アクティブなタブまたはURLが見つかりませんでした。");
          setUrl("URLの取得に失敗しました。");
          setTitle("");
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
        setUrl("URLの取得に失敗しました。");
        setTitle("");
      }
    };

    fetchActiveTabInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  return { url, setUrl, title, setTitle };
};
