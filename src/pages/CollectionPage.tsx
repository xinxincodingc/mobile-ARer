import { useState } from 'react'
import customersData from '../mock/customers.json'
import invoicesData from '../mock/invoices.json'

const customers = customersData as any[]
const invoices = invoicesData as any[]

const OVERDUE_CUSTOMERS = customers
  .map(c => {
    const overdueInvs = invoices.filter(i => i.CustomerID === c.CustomerID && i.Status === 'OVERDUE')
    const overdueAmt = overdueInvs.reduce((s, i) => s + i.Amount, 0)
    const maxDays = overdueInvs.reduce((m, i) => Math.max(m, i.OverdueDays), 0)
    return { ...c, overdueAmt, maxDays, overdueCount: overdueInvs.length }
  })
  .filter(c => c.overdueAmt > 0)
  .sort((a, b) => b.overdueAmt - a.overdueAmt)

const LEVEL_COLORS: Record<string, string> = {
  HIGH: '#bb0000', MEDIUM: '#e76500', LOW: '#188918'
}
const CHANNEL_ICONS: Record<string, string> = {
  phone: '📞', email: '📧', visit: '🤝', wechat: '💬'
}
type LogEntry = { id: string; customer: string; channel: string; note: string; time: string }

export default function CollectionPage() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', customer: '万华化学集团', channel: 'phone', note: '已承诺本月底还款', time: '今天 09:30' },
    { id: '2', customer: '荣盛石化股份', channel: 'email', note: '发送催款函，等待回复', time: '昨天 15:20' },
  ])
  const [showForm, setShowForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [channel, setChannel] = useState('phone')
  const [note, setNote] = useState('')

  function addLog() {
    if (!selectedCustomer || !note) return
    setLogs(prev => [{
      id: Date.now().toString(),
      customer: selectedCustomer,
      channel,
      note,
      time: '刚刚'
    }, ...prev])
    setNote(''); setSelectedCustomer(''); setShowForm(false)
  }

  return (
    <div className="page-pad">
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px', marginBottom: 4 }}>
        {[
          { label: '待跟进', value: OVERDUE_CUSTOMERS.length, color: '#bb0000' },
          { label: '今日完成', value: logs.filter(l => l.time.includes('今天') || l.time === '刚刚').length, color: '#0070f2' },
          { label: '高风险', value: OVERDUE_CUSTOMERS.filter(c => c.RiskLevel === 'HIGH').length, color: '#e76500' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'var(--card)', borderRadius: 14, padding: '12px 10px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add log btn */}
      <div style={{ padding: '8px 16px' }}>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            width: '100%', padding: '11px', borderRadius: 14,
            border: '1.5px dashed var(--sap-brand)', background: 'var(--sap-brand-light)',
            color: 'var(--sap-brand)', fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}
        >
          + 添加催收记录
        </button>
      </div>

      {/* Quick form */}
      {showForm && (
        <div className="card" style={{ margin: '0 16px' }}>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select
              value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13, fontFamily: 'inherit', background: 'var(--bg)', color: 'var(--text)' }}
            >
              <option value="">选择客户</option>
              {OVERDUE_CUSTOMERS.slice(0, 10).map(c => (
                <option key={c.CustomerID} value={c.CompanyName_zh}>{c.CompanyName_zh}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(CHANNEL_ICONS).map(([k, icon]) => (
                <button
                  key={k}
                  onClick={() => setChannel(k)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 10,
                    border: `1.5px solid ${channel === k ? 'var(--sap-brand)' : 'var(--border)'}`,
                    background: channel === k ? 'var(--sap-brand-light)' : 'var(--card)',
                    fontSize: 13, cursor: 'pointer'
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="记录跟进内容..."
              style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13, fontFamily: 'inherit', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}
            />
            <button
              onClick={addLog}
              style={{ padding: '11px', borderRadius: 12, border: 'none', background: 'var(--sap-brand)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              保存记录
            </button>
          </div>
        </div>
      )}

      {/* Overdue list */}
      <div className="section-header">逾期客户 · 按金额排序</div>
      <div className="card">
        {OVERDUE_CUSTOMERS.slice(0, 8).map(c => (
          <div key={c.CustomerID} className="list-item">
            <div style={{ width: 8, height: 40, borderRadius: 4, background: LEVEL_COLORS[c.RiskLevel], flexShrink: 0 }} />
            <div className="list-item__body">
              <div className="list-item__title">{c.CompanyName_zh}</div>
              <div className="list-item__sub">
                {c.overdueCount} 张发票 · 最长 {c.maxDays} 天
              </div>
            </div>
            <div className="list-item__right">
              <div style={{ fontSize: 14, fontWeight: 700, color: '#bb0000' }}>
                ¥{(c.overdueAmt / 1e4).toFixed(0)}万
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Logs */}
      <div className="section-header">催收日志</div>
      <div className="card">
        {logs.map(log => (
          <div key={log.id} className="list-item">
            <div style={{ fontSize: 22 }}>{CHANNEL_ICONS[log.channel]}</div>
            <div className="list-item__body">
              <div className="list-item__title">{log.customer}</div>
              <div className="list-item__sub">{log.note}</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{log.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
