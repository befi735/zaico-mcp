#!/usr/bin/env node

import axios from "axios";
import * as readline from "readline";

interface JSONRPCRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JSONRPCResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

// Zaicoプロダクト情報を取得
async function getZaicoProducts(): Promise<unknown[]> {
  const apiToken = process.env.ZAICO_API_TOKEN;
  if (!apiToken) {
    throw new Error("ZAICO_API_TOKEN is not set");
  }

  try {
    // 正しいエンドポイント: https://web.zaico.co.jp/api/v1/inventories
    const response = await axios.get("https://web.zaico.co.jp/api/v1/inventories", {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });
    
    // レスポンスデータの形式を確認
    if (!response.data) {
      throw new Error("Empty response from Zaico API");
    }
    
    // データ形式をチェック
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.products && Array.isArray(response.data.products)) {
      return response.data.products;
    } else {
      console.error("Unexpected Zaico API response format:", response.data);
      throw new Error(`Unexpected API response format. Got: ${JSON.stringify(response.data).substring(0, 200)}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? "No status";
      const statusText = error.response?.statusText ?? "No status text";
      const data = error.response?.data ?? "No response data";
      console.error("Zaico API Error Details:", {
        status,
        statusText,
        data,
        message: error.message,
      });
      throw new Error(
        `Zaico API error (${status} ${statusText}): ${JSON.stringify(data).substring(0, 200)}`
      );
    }
    console.error("Non-axios error:", error);
    throw error;
  }
}

// 商品名で在庫を検索
async function searchInventoryByName(productName: string): Promise<unknown> {
  const products = await getZaicoProducts();
  const filtered = products.filter(
    (p: any) =>
      p.title && p.title.toLowerCase().includes(productName.toLowerCase())
  );

  if (filtered.length === 0) {
    return {
      success: false,
      message: `Product "${productName}" not found`,
      results: [],
    };
  }

  return {
    success: true,
    message: `Found ${filtered.length} product(s)`,
    results: filtered.map((p: any) => ({
      id: p.id,
      title: p.title,
      quantity: p.quantity || 0,
      unit: p.unit,
      category: p.category,
      place: p.place,
      lastUpdated: p.updated_at,
    })),
  };
}

// すべての商品を取得
async function listAllProducts(): Promise<unknown> {
  const products = await getZaicoProducts();
  const formattedProducts = products.map((p: any) => ({
    id: p.id,
    title: p.title,
    quantity: p.quantity || 0,
    unit: p.unit,
    category: p.category,
    place: p.place,
    lastUpdated: p.updated_at,
  }));
  return {
    success: true,
    total: formattedProducts.length,
    products: formattedProducts,
  };
}

// MCPツール定義
const tools: Tool[] = [
  {
    name: "search_inventory",
    description:
      "Search for products in Zaico inventory by product name. Returns quantity and details.",
    inputSchema: {
      type: "object",
      properties: {
        product_name: {
          type: "string",
          description: "Name of the product to search for (e.g., コシヒカリ)",
        },
      },
      required: ["product_name"],
    },
  },
  {
    name: "list_all_products",
    description:
      "List all products in the Zaico inventory system with their quantities",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// ツール呼び出し処理
async function callTool(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<unknown> {
  if (toolName === "search_inventory") {
    return await searchInventoryByName(toolInput.product_name as string);
  } else if (toolName === "list_all_products") {
    return await listAllProducts();
  }
  throw new Error(`Unknown tool: ${toolName}`);
}

// JSONRPCレスポンスを送信
function sendResponse(response: JSONRPCResponse): void {
  console.log(JSON.stringify(response));
}

// MCPサーバーの初期化
let initialized = false;
const protocolVersion = "2024-11-05";
const serverVersion = "1.0.0";

// リクエスト処理
async function handleRequest(request: JSONRPCRequest): Promise<void> {
  try {
    if (request.method === "initialize") {
      initialized = true;
      sendResponse({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          protocolVersion,
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: "zaico-mcp",
            version: serverVersion,
          },
        },
      });
    } else if (request.method === "initialized") {
      // No response needed for notifications
    } else if (request.method === "tools/list") {
      sendResponse({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          tools: tools.map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema,
          })),
        },
      });
    } else if (request.method === "tools/call") {
      const toolName = request.params?.name as string;
      const toolInput = request.params?.arguments as Record<string, unknown>;

      if (!toolName) {
        sendResponse({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: -32602,
            message: "Invalid params: tool name is required",
          },
        });
        return;
      }

      try {
        const result = await callTool(toolName, toolInput || {});
        sendResponse({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        });
      } catch (error) {
        sendResponse({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    } else {
      sendResponse({
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32601,
          message: `Unknown method: ${request.method}`,
        },
      });
    }
  } catch (error) {
    sendResponse({
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : "Internal error",
      },
    });
  }
}

// メイン処理
async function main(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", async (line: string) => {
    if (!line.trim()) return;

    try {
      const request = JSON.parse(line) as JSONRPCRequest;
      await handleRequest(request);
    } catch (error) {
      console.error(
        JSON.stringify({
          jsonrpc: "2.0",
          error: {
            code: -32700,
            message: "Parse error",
          },
        })
      );
    }
  });

  rl.on("close", () => {
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
