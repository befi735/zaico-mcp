export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '2rem',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '700px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>ZAICO MCP Server</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
          ZAICO在庫管理API を Model Context Protocol (MCP) で操作できるサーバーです
        </p>
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'left',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>🔗 MCP エンドポイント</h2>
          <code style={{
            display: 'block',
            background: 'rgba(0,0,0,0.3)',
            padding: '0.75rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
            wordBreak: 'break-all',
          }}>
            POST /api/mcp
          </code>
        </div>
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'left',
        }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>🛠️ 利用可能なツール</h2>
          <div style={{ fontSize: '0.85rem', lineHeight: '1.8', opacity: 0.9 }}>
            <div>• 在庫データ: 一覧・取得・作成・更新・削除</div>
            <div>• セット品データ: 一覧・取得・作成・更新・削除</div>
            <div>• 出庫データ: 一覧・取得・作成・更新・削除</div>
            <div>• 入庫データ: 一覧・取得・作成・更新・削除</div>
            <div>• 取引先データ: 一覧・作成・更新・削除</div>
            <div>• 在庫グループビュー: 一覧・取得</div>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
          <p>各ツールの呼び出しには ZAICO API トークンが必要です</p>
          <p style={{ marginTop: '0.5rem' }}>Authorization: Bearer YOUR_TOKEN</p>
        </div>
      </div>
    </main>
  );
}
