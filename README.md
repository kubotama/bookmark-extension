# ブックマークを登録する拡張機能

## 注意事項

この拡張機能は単体では動作しません。この拡張機能を利用するためには[ブックマークを管理する web アプリケーション](https://github.com/kubotama/linkpage)が必要です。

## 機能

この拡張機能は、現在開いているタブの情報をワンクリックで[ブックマーク管理アプリケーション](https://github.com/kubotama/linkpage)に登録します。

- **自動情報取得**: アクティブなタブのURLとタイトルを自動的に取得します。
- **手動編集**: 取得したタイトルやURLは、登録前に手動で編集できます。
- **柔軟な登録**: ページのタイトルが自動で取得できない場合でも（例: `about:blank`ページなど）、手動でタイトルを入力して登録することが可能です。
- **カスタムAPIエンドポイント**: オプションページで、ブックマーク登録先のAPIエンドポイントを自由に設定できます。

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

1.  Chromeで `chrome://extensions` を開きます。
2.  右上の「デベロッパーモード」をオンにします。
3.  「パッケージ化されていない拡張機能を読み込む」ボタンをクリックします。
4.  ビルド時に作成された `dist` ディレクトリを選択して、拡張機能を登録します。
5.  拡張機能のアイコンを右クリックし、「オプション」を選択してオプションページを開きます。
6.  ブックマークを登録するためのAPIエンドポイントのURLを指定します。（デフォルト: `http://localhost:3000/api/bookmarks`）

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

## 開発

### テスト

```bash
$ npm test
```

### Lint

```bash
$ npm run lint
```

## ライセンス

このプロジェクトは[MIT ライセンス](LICENSE)の下で公開されています。
