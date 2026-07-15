import { useState } from 'react'
import customersData from '../mock/customers.json'
import invoicesData from '../mock/invoices.json'

const customers = customersData as any[]
const invoices = invoicesData as any[]

const RISK_COLORS: Record<string, string> = {
  HIGH: '#bb0000', MEDIUM: '#e76500', LOW: '#188918'
}
const RISK_BG: Record<string, string> = {
  HIGH: '#fff0f0', MEDIUM: '#fff5ea', LOW: '#f0fff0'
}
const RISK_LABEL: Record<string, string> = {
  HIGH: '高风险', MEDIUM: '中风险', LOW: '低风险'
}

const AVATARS = ['#0070f2','#7847ea','#e76500','#188918','#bb0000','#0057c2']

function getOverdue(customerId: string) {
  return invoices.filter(i => i.CustomerID === customerId && i.Status === 'OVERDUE')
    .reduce((s, i) => s + i.Amount, 0)
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL'|'HIGH'|'MEDIUM'|'LOW'>('ALL')

  const filtered = customers.filter(c => {
    const matchSearch = !search || c.CompanyName_zh.includes(search) || c.CompanyName.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || c.RiskLevel === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="page-pad">
      {/* Search */}
      <div style={{ padding: '0 16px', marginBottom: 10 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  搜索客户"
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 24,
            border: '1.5px solid var(--border)', background: 'var(--card)',
            fontSize: 14, outline: 'none', color: 'var(--text)', fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px', marginBottom: 4, overflowX: 'auto' }}>
        {(['ALL','HIGH','MEDIUM','LOW'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, flexShrink: 0,
              background: filter === f ? 'var(--sap-brand)' : 'var(--card)',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}
          >
            {f === 'ALL' ? '全部' : RISK_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="section-header">共 {filtered.length} 家客户</div>

      <div className="card">
        {filtered.slice(0, 20).map((c, i) => {
          const overdue = getOverdue(c.CustomerID)
          const initial = c.CompanyName_zh.slice(0, 1)
          return (
            <div key={c.CustomerID} className="list-item">
              <div
                className="list-item__avatar"
                style={{ background: AVATARS[i % AVATARS.length] }}
              >
                {initial}
              </div>
              <div className="list-item__body">
                <div className="list-item__title">{c.CompanyName_zh}</div>
                <div className="list-item__sub">{c.Industry_zh} · {c.Region_zh}</div>
                <div style={{ marginTop: 4 }}>
                  <span className="badge" style={{ background: RISK_BG[c.RiskLevel], color: RISK_COLORS[c.RiskLevel] }}>
                    {RISK_LABEL[c.RiskLevel]}
                  </span>
                  {c.Tags_zh?.slice(0, 1).map((tag: string) => (
                    <span key={tag} className="badge" style={{ background: 'var(--sap-brand-light)', color: 'var(--sap-brand-dark)', marginLeft: 4 }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className="list-item__right">
                {overdue > 0 && (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#bb0000' }}>
                      ¥{(overdue / 1e4).toFixed(0)}万
                    </div>
                    <div style={{ fontSize: 11, color: '#8a95a3' }}>逾期</div>
                  </>
                )}
                <div style={{ fontSize: 18, color: '#c0c8d0', marginTop: 4 }}>›</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
