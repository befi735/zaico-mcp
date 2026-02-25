import { NextRequest, NextResponse } from 'next/server';

const ZAICO_BASE_URL = 'https://web.zaico.co.jp/api/v1';

// ==================== ツール定義 ====================
const TOOLS = [
  // --- 在庫データ ---
  {
    name: 'list_inventories',
    description: '在庫データの一覧を取得します。タイトル・カテゴリ・場所・コードで絞り込み検索が可能です。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        title: { type: 'string', description: '在庫名で検索' },
        category: { type: 'string', description: 'カテゴリで検索' },
        place: { type: 'string', description: '保管場所で検索' },
        code: { type: 'string', description: 'コードで検索' },
        page: { type: 'number', description: 'ページ番号（100件ごと）' },
      },
      required: ['token'],
    },
  },
  {
    name: 'get_inventory',
    description: '指定IDの在庫データを1件取得します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: '在庫データID（必須）' },
      },
      required: ['token', 'id'],
    },
  },
  {
    name: 'create_inventory',
    description: '新しい在庫データを作成します。タイトルは必須です。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        title: { type: 'string', description: '在庫名（必須・最大200文字）' },
        quantity: { type: 'number', description: '数量' },
        unit: { type: 'string', description: '単位' },
        category: { type: 'string', description: 'カテゴリ' },
        place: { type: 'string', description: '保管場所' },
        code: { type: 'string', description: 'コード・バーコード' },
        price: { type: 'number', description: '価格' },
        cost_price: { type: 'number', description: '仕入単価' },
        memo: { type: 'string', description: 'メモ（最大250文字）' },
      },
      required: ['token', 'title'],
    },
  },
  {
    name: 'update_inventory',
    description: '指定IDの在庫データを更新します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: '在庫データID（必須）' },
        title: { type: 'string', description: '在庫名（最大200文字）' },
        quantity: { type: 'number', description: '数量' },
        unit: { type: 'string', description: '単位' },
        category: { type: 'string', description: 'カテゴリ' },
        place: { type: 'string', description: '保管場所' },
        code: { type: 'string', description: 'コード・バーコード' },
        price: { type: 'number', description: '価格' },
        cost_price: { type: 'number', description: '仕入単価' },
        memo: { type: 'string', description: 'メモ（最大250文字）' },
      },
      required: ['token', 'id'],
    },
  },
  {
    name: 'delete_inventory',
    description: '指定IDの在庫データを削除します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: '在庫データID（必須）' },
      },
      required: ['token', 'id'],
    },
  },
  // --- セット品データ ---
  {
    name: 'list_inventory_sets',
    description: 'セット品データの一覧を取得します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        page: { type: 'number', description: 'ページ番号' },
      },
      required: ['token'],
    },
  },
  {
    name: 'get_inventory_set',
    description: '指定IDのセット品データを1件取得します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: 'セット品ID（必須）' },
      },
      required: ['token', 'id'],
    },
  },
  {
    name: 'create_inventory_set',
    description: 'セット品データを作成します。タイトルと構成品目が必須です。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        title: { type: 'string', description: 'セット品名（必須・最大200文字）' },
        price: { type: 'number', description: '価格' },
        code: { type: 'string', description: 'コード（最大200文字）' },
        memo: { type: 'string', description: 'メモ（最大250文字）' },
        inventories_set_items_attributes: {
          type: 'array',
          description: '構成品目リスト',
          items: {
            type: 'object',
            properties: {
              inventory_id: { type: 'number', description: '在庫ID' },
              quantity: { type: 'number', description: '数量' },
            },
          },
        },
      },
      required: ['token', 'title'],
    },
  },
  {
    name: 'update_inventory_set',
    description: '指定IDのセット品データを更新します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: 'セット品ID（必須）' },
        title: { type: 'string', description: 'セット品名（最大200文字）' },
        price: { type: 'number', description: '価格' },
        code: { type: 'string', description: 'コード（最大200文字）' },
        memo: { type: 'string', description: 'メモ（最大250文字）' },
        inventories_set_items_attributes: {
          type: 'array',
          description: '構成品目リスト',
          items: {
            type: 'object',
            properties: {
              inventory_id: { type: 'number', description: '在庫ID' },
              quantity: { type: 'number', description: '数量' },
            },
          },
        },
      },
      required: ['token', 'id'],
    },
  },
  {
    name: 'delete_inventory_set',
    description: '指定IDのセット品データを削除します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: 'セット品ID（必須）' },
      },
      required: ['token', 'id'],
    },
  },
  // --- 出庫データ ---
  {
    name: 'list_packing_slips',
    description: '出庫データの一覧を取得します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        page: { type: 'number', description: 'ページ番号（100件ごと）' },
      },
      required: ['token'],
    },
  },
  {
    name: 'get_packing_slip',
    description: '指定IDの出庫データを1件取得します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: '出庫データID（必須）' },
      },
      required: ['token', 'id'],
    },
  },
  {
    name: 'create_packing_slip',
    description: '出庫データを作成します。statusとdeliveriesは必須です。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        status: {
          type: 'string',
          description: '状態: before_delivery(出庫前)/during_delivery(出庫中)/completed_delivery(出庫済)（必須）',
          enum: ['before_delivery', 'during_delivery', 'completed_delivery'],
        },
        num: { type: 'string', description: '出庫データ番号（最大250文字）' },
        customer_name: { type: 'string', description: '取引先名（最大255文字）' },
        delivery_date: { type: 'string', description: '出庫日（YYYY-MM-DD形式。completed_deliveryの場合は必須）' },
        memo: { type: 'string', description: '出庫メモ（最大250文字）' },
        note: { type: 'string', description: '納品書備考（最大250文字）' },
        deliveries: {
          type: 'array',
          description: '出庫物品リスト（必須）',
          items: {
            type: 'object',
            properties: {
              inventory_id: { type: 'number', description: '在庫データID' },
              quantity: { type: 'number', description: '出庫数量' },
              unit_price: { type: 'number', description: '納品単価' },
              estimated_delivery_date: { type: 'string', description: '出庫予定日（YYYY-MM-DD）' },
              etc: { type: 'string', description: '摘要・備考' },
            },
          },
        },
      },
      required: ['token', 'status', 'deliveries'],
    },
  },
  {
    name: 'update_packing_slip',
    description: '指定IDの出庫データを更新します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: '出庫データID（必須）' },
        num: { type: 'string', description: '出庫データ番号（最大250文字）' },
        customer_name: { type: 'string', description: '取引先名（最大255文字）' },
        memo: { type: 'string', description: '出庫メモ（最大250文字）' },
        note: { type: 'string', description: '納品書備考（最大250文字）' },
        deliveries: {
          type: 'array',
          description: '出庫物品リスト（必須）',
          items: {
            type: 'object',
            properties: {
              inventory_id: { type: 'number', description: '在庫データID' },
              quantity: { type: 'number', description: '出庫数量' },
              unit_price: { type: 'number', description: '納品単価' },
              status: { type: 'string', description: '状態（before_delivery/completed_delivery）' },
              delivery_date: { type: 'string', description: '出庫日（YYYY-MM-DD）' },
              estimated_delivery_date: { type: 'string', description: '出庫予定日（YYYY-MM-DD）' },
              etc: { type: 'string', description: '摘要・備考' },
            },
          },
        },
      },
      required: ['token', 'id', 'deliveries'],
    },
  },
  {
    name: 'delete_packing_slip',
    description: '指定IDの出庫データを削除します。出庫済の場合は在庫数量が戻ります。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: '出庫データID（必須）' },
      },
      required: ['token', 'id'],
    },
  },
  // --- 出庫物品データ ---
  {
    name: 'list_deliveries',
    description: '出庫物品データの一覧を取得します。ステータスや日付で絞り込み可能です。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        status: {
          type: 'string',
          description: 'ステータス: before_delivery/during_delivery/completed_delivery',
        },
        start_date: { type: 'string', description: '出庫日の開始日（YYYY-MM-DD）' },
        end_date: { type: 'string', description: '出庫日の終了日（YYYY-MM-DD）' },
        page: { type: 'number', description: 'ページ番号（1000件ごと）' },
      },
      required: ['token'],
    },
  },
  // --- 入庫データ ---
  {
    name: 'list_purchases',
    description: '入庫データの一覧を取得します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        page: { type: 'number', description: 'ページ番号（1000件ごと）' },
      },
      required: ['token'],
    },
  },
  {
    name: 'get_purchase',
    description: '指定IDの入庫データを1件取得します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: '入庫データID（必須）' },
      },
      required: ['token', 'id'],
    },
  },
  {
    name: 'create_purchase',
    description: '入庫データを作成します。statusとpurchase_itemsは必須です。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        status: {
          type: 'string',
          description: '状態: none/not_ordered/ordered/purchased/quotation_requested（必須）',
          enum: ['none', 'not_ordered', 'ordered', 'purchased', 'quotation_requested'],
        },
        num: { type: 'string', description: '入庫データ番号（最大250文字）' },
        customer_name: { type: 'string', description: '取引先名（最大255文字）' },
        purchase_date: { type: 'string', description: '入庫日（YYYY-MM-DD形式。purchased の場合は必須）' },
        memo: { type: 'string', description: '入庫メモ（最大250文字）' },
        purchase_items: {
          type: 'array',
          description: '入庫物品リスト（必須）',
          items: {
            type: 'object',
            properties: {
              inventory_id: { type: 'number', description: '在庫データID' },
              quantity: { type: 'number', description: '入庫数量' },
              unit_price: { type: 'number', description: '仕入単価' },
              estimated_purchase_date: { type: 'string', description: '入庫予定日（YYYY-MM-DD）' },
              etc: { type: 'string', description: '摘要・備考' },
            },
          },
        },
      },
      required: ['token', 'status', 'purchase_items'],
    },
  },
  {
    name: 'update_purchase',
    description: '指定IDの入庫データを更新します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: '入庫データID（必須）' },
        num: { type: 'string', description: '入庫データ番号（最大250文字）' },
        customer_name: { type: 'string', description: '取引先名（最大255文字）' },
        memo: { type: 'string', description: '入庫メモ（最大250文字）' },
        purchase_items: {
          type: 'array',
          description: '入庫物品リスト（必須）',
          items: {
            type: 'object',
            properties: {
              inventory_id: { type: 'number', description: '在庫データID' },
              quantity: { type: 'number', description: '入庫数量' },
              unit_price: { type: 'number', description: '仕入単価' },
              status: { type: 'string', description: '状態（none/not_ordered/ordered/purchased/quotation_requested）' },
              purchase_date: { type: 'string', description: '入庫日（YYYY-MM-DD）' },
              estimated_purchase_date: { type: 'string', description: '入庫予定日（YYYY-MM-DD）' },
              etc: { type: 'string', description: '摘要・備考' },
            },
          },
        },
      },
      required: ['token', 'id', 'purchase_items'],
    },
  },
  {
    name: 'delete_purchase',
    description: '指定IDの入庫データを削除します。入庫済の場合は在庫数量が戻ります。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: '入庫データID（必須）' },
      },
      required: ['token', 'id'],
    },
  },
  // --- 入庫物品データ ---
  {
    name: 'list_purchase_items',
    description: '入庫物品データの一覧を取得します。ステータスや日付で絞り込み可能です。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        status: {
          type: 'string',
          description: 'ステータス: none/not_ordered/ordered/purchased/quotation_requested',
        },
        start_date: { type: 'string', description: '入庫日の開始日（YYYY-MM-DD）' },
        end_date: { type: 'string', description: '入庫日の終了日（YYYY-MM-DD）' },
        page: { type: 'number', description: 'ページ番号（1000件ごと）' },
      },
      required: ['token'],
    },
  },
  // --- 取引先データ ---
  {
    name: 'list_customers',
    description: '取引先データの一覧を取得します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        page: { type: 'number', description: 'ページ番号（1000件ごと）' },
      },
      required: ['token'],
    },
  },
  {
    name: 'create_customer',
    description: '取引先データを作成します。名前は必須です。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        name: { type: 'string', description: '取引先名（必須・最大100文字）' },
        email: { type: 'string', description: 'メールアドレス（最大200文字）' },
        name_postfix: { type: 'string', description: '敬称（様/御中）' },
        zip: { type: 'string', description: '郵便番号（最大7文字）' },
        address: { type: 'string', description: '住所' },
        building_name: { type: 'string', description: '建物名・部屋番号' },
        phone_number: { type: 'string', description: '電話番号（最大11文字）' },
        etc: { type: 'string', description: '備考（最大500文字）' },
        fax_number: { type: 'string', description: 'FAX番号' },
        category: { type: 'string', description: 'カテゴリ' },
        customer_type: { type: 'string', description: '入出庫区分: packing_slip/purchase', enum: ['packing_slip', 'purchase'] },
        num: { type: 'string', description: '取引先No.（最大200文字）' },
      },
      required: ['token', 'name'],
    },
  },
  {
    name: 'update_customer',
    description: '指定IDの取引先データを更新します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: '取引先データID（必須）' },
        name: { type: 'string', description: '取引先名（最大100文字）' },
        email: { type: 'string', description: 'メールアドレス（最大200文字）' },
        name_postfix: { type: 'string', description: '敬称（様/御中）' },
        zip: { type: 'string', description: '郵便番号（最大7文字）' },
        address: { type: 'string', description: '住所' },
        building_name: { type: 'string', description: '建物名・部屋番号' },
        phone_number: { type: 'string', description: '電話番号（最大11文字）' },
        etc: { type: 'string', description: '備考（最大500文字）' },
        fax_number: { type: 'string', description: 'FAX番号' },
        category: { type: 'string', description: 'カテゴリ' },
        customer_type: { type: 'string', description: '入出庫区分: packing_slip/purchase' },
        num: { type: 'string', description: '取引先No.（最大200文字）' },
      },
      required: ['token', 'id'],
    },
  },
  {
    name: 'delete_customer',
    description: '指定IDの取引先データを削除します。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: '取引先データID（必須）' },
      },
      required: ['token', 'id'],
    },
  },
  // --- 在庫グループビューデータ ---
  {
    name: 'list_inventory_group_items',
    description: '在庫グループビューデータの一覧を取得します（フルプランのみ）。グループタグやタイトルで検索可能です。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        group_value: { type: 'string', description: 'グループタグで検索' },
        title: { type: 'string', description: 'タイトルで検索' },
        page: { type: 'number', description: 'ページ番号（1000件ごと）' },
      },
      required: ['token'],
    },
  },
  {
    name: 'get_inventory_group_item',
    description: '指定IDの在庫グループビューデータを1件取得します（フルプランのみ）。',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'ZAICO APIトークン（必須）' },
        id: { type: 'number', description: '在庫グループビューデータID（必須）' },
      },
      required: ['token', 'id'],
    },
  },
];

// ==================== ZAICO APIへのリクエスト ====================
async function zaicoRequest(
  token: string,
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<unknown> {
  const url = `${ZAICO_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return { status: res.status, ok: res.ok, data };
}

// クエリパラメータ付きのGET
async function zaicoGet(token: string, path: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && k !== 'token') {
      query.append(k, String(v));
    }
  }
  const qs = query.toString();
  return zaicoRequest(token, 'GET', qs ? `${path}?${qs}` : path);
}

// ==================== ツール実行 ====================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeTool(name: string, args: Record<string, any>) {
  const { token, id, ...rest } = args;

  try {
    let result: unknown;

    switch (name) {
      // 在庫データ
      case 'list_inventories':
        result = await zaicoGet(token, '/inventories', rest);
        break;
      case 'get_inventory':
        result = await zaicoRequest(token, 'GET', `/inventories/${id}`);
        break;
      case 'create_inventory':
        result = await zaicoRequest(token, 'POST', '/inventories', rest);
        break;
      case 'update_inventory':
        result = await zaicoRequest(token, 'PUT', `/inventories/${id}`, rest);
        break;
      case 'delete_inventory':
        result = await zaicoRequest(token, 'DELETE', `/inventories/${id}`);
        break;

      // セット品データ
      case 'list_inventory_sets':
        result = await zaicoGet(token, '/inventories_sets', rest);
        break;
      case 'get_inventory_set':
        result = await zaicoRequest(token, 'GET', `/inventories_sets/${id}`);
        break;
      case 'create_inventory_set':
        result = await zaicoRequest(token, 'POST', '/inventories_sets', rest);
        break;
      case 'update_inventory_set':
        result = await zaicoRequest(token, 'PUT', `/inventories_sets/${id}`, rest);
        break;
      case 'delete_inventory_set':
        result = await zaicoRequest(token, 'DELETE', `/inventories_sets/${id}`);
        break;

      // 出庫データ
      case 'list_packing_slips':
        result = await zaicoGet(token, '/packing_slips', rest);
        break;
      case 'get_packing_slip':
        result = await zaicoRequest(token, 'GET', `/packing_slips/${id}`);
        break;
      case 'create_packing_slip': {
        // 必須フィールドの事前バリデーション
        if (!rest.status) {
          return { content: [{ type: 'text', text: 'エラー: statusは必須です。before_delivery/during_delivery/completed_deliveryのいずれかを指定してください。' }], isError: true };
        }
        if (!rest.deliveries || !Array.isArray(rest.deliveries) || rest.deliveries.length === 0) {
          return { content: [{ type: 'text', text: 'エラー: deliveries（出庫物品リスト）は必須です。[{inventory_id, quantity, estimated_delivery_date}]の配列を指定してください。' }], isError: true };
        }
        result = await zaicoRequest(token, 'POST', '/packing_slips', rest);
        break;
      }
      case 'update_packing_slip':
        result = await zaicoRequest(token, 'PUT', `/packing_slips/${id}`, rest);
        break;
      case 'delete_packing_slip':
        result = await zaicoRequest(token, 'DELETE', `/packing_slips/${id}`);
        break;

      // 出庫物品データ
      case 'list_deliveries':
        result = await zaicoGet(token, '/deliveries', rest);
        break;

      // 入庫データ
      case 'list_purchases':
        result = await zaicoGet(token, '/purchases', rest);
        break;
      case 'get_purchase':
        result = await zaicoRequest(token, 'GET', `/purchases/${id}`);
        break;
      case 'create_purchase': {
        // 必須フィールドの事前バリデーション
        if (!rest.status) {
          return { content: [{ type: 'text', text: 'エラー: statusは必須です。none/not_ordered/ordered/purchased/quotation_requestedのいずれかを指定してください。' }], isError: true };
        }
        if (!rest.purchase_items || !Array.isArray(rest.purchase_items) || rest.purchase_items.length === 0) {
          return { content: [{ type: 'text', text: 'エラー: purchase_items（入庫物品リスト）は必須です。[{inventory_id, quantity, estimated_purchase_date}]の配列を指定してください。' }], isError: true };
        }
        result = await zaicoRequest(token, 'POST', '/purchases', rest);
        break;
      }
      case 'update_purchase':
        result = await zaicoRequest(token, 'PUT', `/purchases/${id}`, rest);
        break;
      case 'delete_purchase':
        result = await zaicoRequest(token, 'DELETE', `/purchases/${id}`);
        break;

      // 入庫物品データ
      case 'list_purchase_items':
        result = await zaicoGet(token, '/purchases/items', rest);
        break;

      // 取引先データ
      case 'list_customers':
        result = await zaicoGet(token, '/customers', rest);
        break;
      case 'create_customer':
        result = await zaicoRequest(token, 'POST', '/customers', rest);
        break;
      case 'update_customer':
        result = await zaicoRequest(token, 'PUT', `/customers/${id}`, rest);
        break;
      case 'delete_customer':
        result = await zaicoRequest(token, 'DELETE', `/customers/${id}`);
        break;

      // 在庫グループビューデータ
      case 'list_inventory_group_items':
        result = await zaicoGet(token, '/inventory_group_items', rest);
        break;
      case 'get_inventory_group_item':
        result = await zaicoRequest(token, 'GET', `/inventory_group_items/${id}`);
        break;

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (err) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
      isError: true,
    };
  }
}

// ==================== MCP JSON-RPC ハンドラ ====================
export async function POST(request: NextRequest) {
  let body: { jsonrpc: string; id: unknown; method: string; params?: Record<string, unknown> };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error' },
    });
  }

  const { method, id, params } = body;

  // initialize
  if (method === 'initialize') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'zaico-mcp',
          version: '1.0.2',
        },
      },
    });
  }

  // notifications/initialized (通知なので応答不要)
  if (method === 'notifications/initialized') {
    return new NextResponse(null, { status: 204 });
  }

  // ping
  if (method === 'ping') {
    return NextResponse.json({ jsonrpc: '2.0', id, result: {} });
  }

  // tools/list
  if (method === 'tools/list') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: { tools: TOOLS },
    });
  }

  // tools/call
  if (method === 'tools/call') {
    const toolName = (params?.name as string) || '';
    const toolArgs = (params?.arguments as Record<string, unknown>) || {};

    if (!toolName) {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: 'Invalid params: missing tool name' },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await executeTool(toolName, toolArgs as Record<string, any>);
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result,
    });
  }

  // 未知のメソッド
  return NextResponse.json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  });
}

// GETリクエスト (ヘルスチェック用)
export async function GET() {
  return NextResponse.json({
    name: 'zaico-mcp',
    version: '1.0.2',
    description: 'ZAICO在庫管理API の MCP Server',
    endpoint: '/api/mcp',
    tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
  });
}
