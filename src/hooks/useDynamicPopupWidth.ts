import React, { useLayoutEffect, useState } from "react";

const DEFAULT_WIDTH_CONFIG = {
  labelWidth: 80, // "URL"ラベルの幅
  buttonWidth: 80, // "登録"ボタンの幅
  paddingAndGaps: 40, // コンテナのpaddingやgapの合計
};

type WidthConfig = {
  labelWidth: number;
  buttonWidth: number;
  paddingAndGaps: number;
};

export const useDynamicPopupWidth = (
  text: string | undefined,
  measurementRef: React.RefObject<HTMLElement | null>,
  config: WidthConfig = DEFAULT_WIDTH_CONFIG
) => {
  const [popupWidth, setPopupWidth] = useState<number | undefined>(undefined);

  // useEffectの代わりにuseLayoutEffectを使用することで、
  // DOMのペイント前に同期的に幅を計算し、ちらつきを防ぎます。
  useLayoutEffect(() => {
    if (measurementRef.current && text) {
      const urlTextWidth = measurementRef.current.offsetWidth;

      const newWidth = Math.max(
        config.labelWidth + urlTextWidth + config.paddingAndGaps,
        config.buttonWidth + config.paddingAndGaps
      );
      setPopupWidth(newWidth);
    }
    // configオブジェクト自体を依存配列に含めることで、よりシンプルになる
    // 呼び出し側でconfigオブジェクトをメモ化することが期待されます。
  }, [text, config, measurementRef]);

  return popupWidth;
};
