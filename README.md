# ブックマークを登録する拡張機能

アクティブなタブに表示されている web ページを、[ブックマークを管理する web アプリケーション](https://github.com/kubotama/linkpage)に登録します。

## インストール方法

### リポジトリのクローン

```bash
$ git clone https://github.com/kubotama/bookmark-extension.git
```

### プロジェクトディレクトリに移動

```bash
$ cd bookmark-extension
```

### パッケージのインストール

```bash
$ npm install
```

### ビルド

```bash
$ npm run build
```

## 使用方法

1. Chrome の拡張機能として登録します。
2. 拡張機能のオプションページを開きます。
3. ブックマークを管理する web アプリケーションの URL を指定します。

## 関連アプリケーション

[ブックマークを管理する web アプリケーション](https://github.com/kubotama/linkpage)

## 技術スタック

| ツール名                                      | バージョン |
| --------------------------------------------- | ---------- |
| [Node.js](https://nodejs.org/)                | 22.x       |
| [React](https://reactjs.org/)                 | 19.1.0     |
| [TypeScript](https://www.typescriptlang.org/) | 5.8.3      |
| [vite](https://ja.vite.dev/)                  | 6.3.5      |
| [vitest](https://vitest.dev)                  | 3.1.4      |

## ライセンス

このプロジェクトは[MIT ライセンス](LICENSE)の下で公開されています。
