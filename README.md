# Zaico MCP Server

Zaico MCP（Model Context Protocol）サーバーは、Claude AIが[Zaico](https://www.zaico.co.jp/)の在庫管理システムに直接アクセスして、商品情報と在庫数を効率的に管理・検索するためのMCPサーバー実装です。

## 概要

このMCPサーバーを使用することで、Claude Desktopから以下の操作が可能になります：

- **商品検索**：商品名で在庫を検索
- **在庫確認**：特定商品の在庫数をリアルタイムで確認
- **一覧表示**：システム内のすべての商品情報を取得

## 機能

### Tools

#### 1. `search_inventory`
商品名でZaicoシステム内の在庫を検索します。

**パラメータ：**
- `product_name` (string, required): 検索対象の商品名（例：コシヒカリ）

**戻り値：**
```json
{
  "success": true,
  "message": "Found X product(s)",
  "results": [
    {
      "id": "product_id",
      "name": "商品名",
      "quantity": 100,
      "unit": "kg",
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 2. `list_all_products`
Zaicoシステム内のすべての商品とその在庫数を取得します。

**パラメータ：** なし

**戻り値：**
```json
{
  "success": true,
  "total": 150,
  "products": [
    {
      "id": "product_id",
      "name": "商品名",
      "quantity": 100,
      "unit": "kg",
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## インストール

### 前提条件

- Node.js 18.0以上
- npm または yarn
- Zaico APIトークン

### セットアップ手順

1. **リポジトリをクローン**
```bash
git clone https://github.com/befi735/zaico-mcp.git
cd zaico-mcp
```

2. **依存関係をインストール**
```bash
npm install
```

3. **TypeScriptをビルド**
```bash
npm run build
```

4. **生成確認**
```
dist/
├── index.js
├── index.d.ts
└── index.js.map
```

## 設定

### Claude Desktopへの統合

`C:\Users\[YourUsername]\AppData\Roaming\Claude\claude_desktop_config.json`に以下を追加：

```json
{
  "mcpServers": {
    "zaico": {
      "command": "node",
      "args": ["C:\\path\\to\\zaico-mcp\\dist\\index.js"],
      "env": {
        "ZAICO_API_TOKEN": "your_zaico_api_token_here"
      }
    }
  }
}
```

### 環境変数

- **ZAICO_API_TOKEN** (required): Zaico APIの認証トークン
  - [Zaico管理画面](https://app.zaico.co.jp)から取得可能

## 使用方法

### Claude Desktopでの使用

1. Claude Desktopアプリケーションを起動
2. MCPサーバーが自動的に接続されます
3. 以下のようなプロンプトを入力：

```
Zaicoの在庫システムから、コシヒカリの在庫数を確認してください。
```

### APIダイレクト使用

```typescript
import axios from 'axios';

const response = await axios.get('https://api.zaico.co.jp/v1/products', {
  headers: {
    'Authorization': `Bearer ${process.env.ZAICO_API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});
```

## プロジェクト構造

```
zaico-mcp/
├── src/
│   └── index.ts              # メインサーバー実装
├── dist/                     # コンパイル済みJavaScript
├── package.json              # 依存関係定義
├── tsconfig.json             # TypeScript設定
└── README.md                 # このファイル
```

## 開発

### ビルド

```bash
npm run build
```

### 開発モード（監視付きビルド + 実行）

```bash
npm run dev
```

## トラブルシューティング

### Q: "ZAICO_API_TOKEN is not set" エラーが出る

**A:** 環境変数が正しく設定されているか確認してください：
```bash
echo $env:ZAICO_API_TOKEN  # PowerShell
echo $ZAICO_API_TOKEN       # Bash
```

### Q: "Zaico API error: 401 Unauthorized"

**A:** APIトークンが正しいか、有効期限が切れていないか確認してください。

### Q: MCPサーバーが接続されない

**A:** 以下を確認：
1. `dist/index.js`ファイルが存在するか
2. `claude_desktop_config.json`のパスが正しいか
3. Claude Desktopを再起動してみる

## APIリファレンス

### Zaico API エンドポイント

- **GET /v1/products** - 全商品取得
- **GET /v1/products/{id}** - 商品詳細取得
- **POST /v1/products** - 商品作成
- **PUT /v1/products/{id}** - 商品更新
- **DELETE /v1/products/{id}** - 商品削除

詳細は[Zaico API ドキュメント](https://developer.zaico.co.jp/)を参照してください。

## ライセンス

MIT

## サポート

問題が発生した場合は、[Issues](https://github.com/befi735/zaico-mcp/issues)で報告してください。

## 関連リンク

- [Zaico 公式サイト](https://www.zaico.co.jp/)
- [Zaico API ドキュメント](https://developer.zaico.co.jp/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/download)

## 更新履歴

### v1.0.0 (2025-02-27)
- 初回リリース
- `search_inventory` ツール実装
- `list_all_products` ツール実装
- Claude Desktop統合対応

---

**作成日**: 2025年2月27日  
**メンテナー**: befi735
