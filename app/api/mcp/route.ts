import { NextRequest, NextResponse } from 'next/server';

const ZAICO_BASE_URL = 'https://web.zaico.co.jp/api/v1';

const TOOLS = [
  { name: 'list_inventories', description: '在庫データの一覧を取得します', inputSchema: { type: 'object', properties: { token: { type: 'string', description: 'ZAICO APIトークン（必須）' }, title: { type: 'string' }, category: { type: 'string' }, place: { type: 'string' }, code: { type: 'string' }, page: { type: 'number' } }, required: ['token'] } },
  { name: 'get_inventory', description: '指定IDの在庫データを取得します', inputSchema: { type: 'object', properties: { token: { type: 'string', description: 'ZAICO APIトークン（必須）' }, id: { type: 'number' } }, required: ['token', 'id'] } },
  { name: 'create_inventory', description: '在庫データを作成します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, title: { type: 'string' }, quantity: { type: 'number' }, unit: { type: 'string' }, category: { type: 'string' }, place: { type: 'string' }, code: { type: 'string' }, price: { type: 'number' }, cost_price: { type: 'number' }, memo: { type: 'string' } }, required: ['token', 'title'] } },
  { name: 'update_inventory', description: '在庫データを更新します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' }, title: { type: 'string' }, quantity: { type: 'number' }, unit: { type: 'string' }, category: { type: 'string' }, place: { type: 'string' }, code: { type: 'string' }, price: { type: 'number' }, memo: { type: 'string' } }, required: ['token', 'id'] } },
  { name: 'delete_inventory', description: '在庫データを削除します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' } }, required: ['token', 'id'] } },
  { name: 'list_inventory_sets', description: 'セット品データ一覧を取得します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, page: { type: 'number' } }, required: ['token'] } },
  { name: 'get_inventory_set', description: '指定IDのセット品データを取得します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' } }, required: ['token', 'id'] } },
  { name: 'create_inventory_set', description: 'セット品データを作成します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, title: { type: 'string' }, price: { type: 'number' }, code: { type: 'string' }, memo: { type: 'string' }, inventories_set_items_attributes: { type: 'array', items: { type: 'object', properties: { inventory_id: { type: 'number' }, quantity: { type: 'number' } } } } }, required: ['token', 'title'] } },
  { name: 'update_inventory_set', description: 'セット品データを更新します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' }, title: { type: 'string' }, price: { type: 'number' }, code: { type: 'string' }, memo: { type: 'string' }, inventories_set_items_attributes: { type: 'array' } }, required: ['token', 'id'] } },
  { name: 'delete_inventory_set', description: 'セット品データを削除します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' } }, required: ['token', 'id'] } },
  { name: 'list_packing_slips', description: '出庫データ一覧を取得します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, page: { type: 'number' } }, required: ['token'] } },
  { name: 'get_packing_slip', description: '指定IDの出庫データを取得します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' } }, required: ['token', 'id'] } },
  { name: 'create_packing_slip', description: '出庫データを作成します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, status: { type: 'string', enum: ['before_delivery', 'during_delivery', 'completed_delivery'] }, num: { type: 'string' }, customer_name: { type: 'string' }, delivery_date: { type: 'string' }, memo: { type: 'string' }, note: { type: 'string' }, deliveries: { type: 'array', items: { type: 'object', properties: { inventory_id: { type: 'number' }, quantity: { type: 'number' }, unit_price: { type: 'number' }, estimated_delivery_date: { type: 'string' }, etc: { type: 'string' } } } } }, required: ['token', 'status', 'deliveries'] } },
  { name: 'update_packing_slip', description: '出庫データを更新します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' }, num: { type: 'string' }, customer_name: { type: 'string' }, memo: { type: 'string' }, deliveries: { type: 'array' } }, required: ['token', 'id', 'deliveries'] } },
  { name: 'delete_packing_slip', description: '出庫データを削除します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' } }, required: ['token', 'id'] } },
  { name: 'list_deliveries', description: '出庫物品データ一覧を取得します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, status: { type: 'string' }, start_date: { type: 'string' }, end_date: { type: 'string' }, page: { type: 'number' } }, required: ['token'] } },
  { name: 'list_purchases', description: '入庫データ一覧を取得します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, page: { type: 'number' } }, required: ['token'] } },
  { name: 'get_purchase', description: '指定IDの入庫データを取得します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' } }, required: ['token', 'id'] } },
  { name: 'create_purchase', description: '入庫データを作成します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, status: { type: 'string', enum: ['none', 'not_ordered', 'ordered', 'purchased', 'quotation_requested'] }, num: { type: 'string' }, customer_name: { type: 'string' }, purchase_date: { type: 'string' }, memo: { type: 'string' }, purchase_items: { type: 'array', items: { type: 'object', properties: { inventory_id: { type: 'number' }, quantity: { type: 'number' }, unit_price: { type: 'number' }, estimated_purchase_date: { type: 'string' }, etc: { type: 'string' } } } } }, required: ['token', 'status', 'purchase_items'] } },
  { name: 'update_purchase', description: '入庫データを更新します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' }, num: { type: 'string' }, customer_name: { type: 'string' }, memo: { type: 'string' }, purchase_items: { type: 'array' } }, required: ['token', 'id', 'purchase_items'] } },
  { name: 'delete_purchase', description: '入庫データを削除します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' } }, required: ['token', 'id'] } },
  { name: 'list_purchase_items', description: '入庫物品データ一覧を取得します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, status: { type: 'string' }, start_date: { type: 'string' }, end_date: { type: 'string' }, page: { type: 'number' } }, required: ['token'] } },
  { name: 'list_customers', description: '取引先データ一覧を取得します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, page: { type: 'number' } }, required: ['token'] } },
  { name: 'create_customer', description: '取引先データを作成します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' }, name_postfix: { type: 'string' }, zip: { type: 'string' }, address: { type: 'string' }, building_name: { type: 'string' }, phone_number: { type: 'string' }, etc: { type: 'string' }, fax_number: { type: 'string' }, category: { type: 'string' }, customer_type: { type: 'string', enum: ['packing_slip', 'purchase'] }, num: { type: 'string' } }, required: ['token', 'name'] } },
  { name: 'update_customer', description: '取引先データを更新します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' }, name: { type: 'string' }, email: { type: 'string' }, name_postfix: { type: 'string' }, zip: { type: 'string' }, address: { type: 'string' }, phone_number: { type: 'string' }, etc: { type: 'string' }, customer_type: { type: 'string' } }, required: ['token', 'id'] } },
  { name: 'delete_customer', description: '取引先データを削除します', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' } }, required: ['token', 'id'] } },
  { name: 'list_inventory_group_items', description: '在庫グループビュー一覧を取得します（フルプランのみ）', inputSchema: { type: 'object', properties: { token: { type: 'string' }, group_value: { type: 'string' }, title: { type: 'string' }, page: { type: 'number' } }, required: ['token'] } },
  { name: 'get_inventory_group_item', description: '指定IDの在庫グループビューデータを取得します（フルプランのみ）', inputSchema: { type: 'object', properties: { token: { type: 'string' }, id: { type: 'number' } }, required: ['token', 'id'] } },
];

async function zaicoRequest(token: string, method: string, path: string, body?: Record<string, unknown>): Promise<unknown> {
  const url = `${ZAICO_BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, ok: res.ok, data };
}

async function zaicoGet(token: string, path: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && k !== 'token') query.append(k, String(v));
  }
  const qs = query.toString();
  return zaicoRequest(token, 'GET', qs ? `${path}?${qs}` : path);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeTool(name: string, args: Record<string, any>) {
  const { token, id, ...rest } = args;
  try {
    let result: unknown;
    switch (name) {
      case 'list_inventories': result = await zaicoGet(token, '/inventories', rest); break;
      case 'get_inventory': result = await zaicoRequest(token, 'GET', `/inventories/${id}`); break;
      case 'create_inventory': result = await zaicoRequest(token, 'POST', '/inventories', rest); break;
      case 'update_inventory': result = await zaicoRequest(token, 'PUT', `/inventories/${id}`, rest); break;
      case 'delete_inventory': result = await zaicoRequest(token, 'DELETE', `/inventories/${id}`); break;
      case 'list_inventory_sets': result = await zaicoGet(token, '/inventories_sets', rest); break;
      case 'get_inventory_set': result = await zaicoRequest(token, 'GET', `/inventories_sets/${id}`); break;
      case 'create_inventory_set': result = await zaicoRequest(token, 'POST', '/inventories_sets', rest); break;
      case 'update_inventory_set': result = await zaicoRequest(token, 'PUT', `/inventories_sets/${id}`, rest); break;
      case 'delete_inventory_set': result = await zaicoRequest(token, 'DELETE', `/inventories_sets/${id}`); break;
      case 'list_packing_slips': result = await zaicoGet(token, '/packing_slips', rest); break;
      case 'get_packing_slip': result = await zaicoRequest(token, 'GET', `/packing_slips/${id}`); break;
      case 'create_packing_slip': result = await zaicoRequest(token, 'POST', '/packing_slips', rest); break;
      case 'update_packing_slip': result = await zaicoRequest(token, 'PUT', `/packing_slips/${id}`, rest); break;
      case 'delete_packing_slip': result = await zaicoRequest(token, 'DELETE', `/packing_slips/${id}`); break;
      case 'list_deliveries': result = await zaicoGet(token, '/deliveries', rest); break;
      case 'list_purchases': result = await zaicoGet(token, '/purchases', rest); break;
      case 'get_purchase': result = await zaicoRequest(token, 'GET', `/purchases/${id}`); break;
      case 'create_purchase': result = await zaicoRequest(token, 'POST', '/purchases', rest); break;
      case 'update_purchase': result = await zaicoRequest(token, 'PUT', `/purchases/${id}`, rest); break;
      case 'delete_purchase': result = await zaicoRequest(token, 'DELETE', `/purchases/${id}`); break;
      case 'list_purchase_items': result = await zaicoGet(token, '/purchases/items', rest); break;
      case 'list_customers': result = await zaicoGet(token, '/customers', rest); break;
      case 'create_customer': result = await zaicoRequest(token, 'POST', '/customers', rest); break;
      case 'update_customer': result = await zaicoRequest(token, 'PUT', `/customers/${id}`, rest); break;
      case 'delete_customer': result = await zaicoRequest(token, 'DELETE', `/customers/${id}`); break;
      case 'list_inventory_group_items': result = await zaicoGet(token, '/inventory_group_items', rest); break;
      case 'get_inventory_group_item': result = await zaicoRequest(token, 'GET', `/inventory_group_items/${id}`); break;
      default: return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
  }
}

export async function POST(request: NextRequest) {
  let body: { jsonrpc: string; id: unknown; method: string; params?: Record<string, unknown> };
  try { body = await request.json(); } catch {
    return NextResponse.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
  }
  const { method, id, params } = body;
  if (method === 'initialize') {
    return NextResponse.json({ jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'zaico-mcp', version: '1.0.0' } } });
  }
  if (method === 'notifications/initialized') return new NextResponse(null, { status: 204 });
  if (method === 'ping') return NextResponse.json({ jsonrpc: '2.0', id, result: {} });
  if (method === 'tools/list') return NextResponse.json({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
  if (method === 'tools/call') {
    const toolName = (params?.name as string) || '';
    const toolArgs = (params?.arguments as Record<string, unknown>) || {};
    if (!toolName) return NextResponse.json({ jsonrpc: '2.0', id, error: { code: -32602, message: 'Invalid params: missing tool name' } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await executeTool(toolName, toolArgs as Record<string, any>);
    return NextResponse.json({ jsonrpc: '2.0', id, result });
  }
  return NextResponse.json({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
}

export async function GET() {
  return NextResponse.json({ name: 'zaico-mcp', version: '1.0.0', description: 'ZAICO在庫管理API の MCP Server', endpoint: '/api/mcp', toolCount: TOOLS.length, tools: TOOLS.map(t => ({ name: t.name, description: t.description })) });
}
