/// <reference types="chrome"/>

import { useEffect, useState } from "react";

import {
  POPUP_FAILED_TO_RETRIEVE_ACTIVE_TAB_INFO,
  POPUP_NO_ACTIVE_TAB_ERROR,
  POPUP_URL_FETCH_ERROR_MESSAGE,
} from "../constants/constants";

export const useActiveTabInfo = () => {
  const [url, setUrl] = useState<string>("URLの取得中...");
  const [title, setTitle] = useState<string>("タイトルの取得中...");

  useEffect(() => {
    let isMounted = true;
    const fetchActiveTabInfo = async () => {
      try {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (isMounted && tabs[0]?.url) {
          setUrl(tabs[0].url);
          setTitle(tabs[0].title || "");
        } else {
          console.error(POPUP_NO_ACTIVE_TAB_ERROR);
          setUrl(POPUP_URL_FETCH_ERROR_MESSAGE);
          setTitle("");
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(POPUP_FAILED_TO_RETRIEVE_ACTIVE_TAB_INFO, error);
        }
        setUrl(POPUP_URL_FETCH_ERROR_MESSAGE);
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
