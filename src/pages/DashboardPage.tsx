import customersData from '../mock/customers.json'
import invoicesData from '../mock/invoices.json'
import trendsData from '../mock/trends.json'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts'

const customers = customersData as any[]
const invoices = invoicesData as any[]
const trends = trendsData as any[]

const totalReceivable = invoices.filter(i => i.Status !== 'CLEARED').reduce((s, i) => s + i.Amount, 0)
const overdueAmount = invoices.filter(i => i.Status === 'OVERDUE').reduce((s, i) => s + i.Amount, 0)
const highRisk = customers.filter(c => c.RiskLevel === 'HIGH').length
const overdueCount = new Set(invoices.filter(i => i.Status === 'OVERDUE').map(i => i.CustomerID)).size
const avgDSO = Math.round(trends.slice(-3).reduce((s, t) => s + t.DSO, 0) / 3)

const recentTrends = trends.slice(-6).map(t => ({ ...t, month: t.Month.slice(5) }))

const COLORS = { brand: '#0070f2', critical: '#bb0000', warning: '#e76500', positive: '#188918' }

function fmt(n: number) {
  if (n >= 1e8) return `¥${(n / 1e8).toFixed(1)}亿`
  if (n >= 1e4) return `¥${(n / 1e4).toFixed(0)}万`
  return `¥${n.toLocaleString()}`
}

export default function DashboardPage() {
  return (
    <div className="page-pad">
      {/* Joule Banner */}
      <div className="joule-banner">
        <div className="joule-banner__icon">💎</div>
        <div className="joule-banner__text">
          <div className="joule-banner__greeting">您好 Yichen：</div>
          <div className="joule-banner__question">有什么可以帮您的吗？</div>
          <button className="joule-banner__cta" onClick={() => window.location.hash = '/joule'}>
            询问 Joule ➤
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-card--brand">
          <div className="kpi-card__label">应收总额</div>
          <div className="kpi-card__value">{fmt(totalReceivable)}</div>
          <div className="kpi-card__sub">未清发票合计</div>
        </div>
        <div className="kpi-card kpi-card--critical">
          <div className="kpi-card__label">逾期金额</div>
          <div className="kpi-card__value">{fmt(overdueAmount)}</div>
          <div className="kpi-card__sub">占比 {((overdueAmount / totalReceivable) * 100).toFixed(1)}%</div>
        </div>
        <div className="kpi-card kpi-card--warning">
          <div className="kpi-card__label">高风险客户</div>
          <div className="kpi-card__value">{highRisk} 家</div>
          <div className="kpi-card__sub">逾期客户 {overdueCount} 家</div>
        </div>
        <div className="kpi-card kpi-card--positive">
          <div className="kpi-card__label">平均 DSO</div>
          <div className="kpi-card__value">{avgDSO} 天</div>
          <div className="kpi-card__sub">近3月均值</div>
        </div>
      </div>

      {/* Overdue Rate Trend */}
      <div className="card">
        <div className="card__header">
          <span className="card__title">逾期率趋势</span>
          <span style={{ fontSize: 11, color: '#8a95a3' }}>近6个月</span>
        </div>
        <div className="card__body" style={{ paddingTop: 0 }}>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={recentTrends} margin={{ top: 5, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="overdueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.critical} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.critical} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a95a3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8a95a3' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v: any) => [`${v}%`, '逾期率']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="OverdueRate" stroke={COLORS.critical} strokeWidth={2.5} fill="url(#overdueGrad)" dot={{ r: 3, fill: COLORS.critical }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DSO Trend */}
      <div className="card">
        <div className="card__header">
          <span className="card__title">DSO 趋势</span>
          <span style={{ fontSize: 11, color: '#8a95a3' }}>销售天数</span>
        </div>
        <div className="card__body" style={{ paddingTop: 0 }}>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={recentTrends} margin={{ top: 5, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="dsoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.brand} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.brand} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a95a3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8a95a3' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}d`} />
              <Tooltip formatter={(v: any) => [`${v}天`, 'DSO']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="DSO" stroke={COLORS.brand} strokeWidth={2.5} fill="url(#dsoGrad)" dot={{ r: 3, fill: COLORS.brand }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Collection bar */}
      <div className="card">
        <div className="card__header">
          <span className="card__title">回款 vs 应收</span>
        </div>
        <div className="card__body" style={{ paddingTop: 0 }}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={recentTrends} margin={{ top: 5, right: 8, bottom: 0, left: -10 }} barGap={2}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a95a3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8a95a3' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1e6).toFixed(0)}M`} />
              <Tooltip formatter={(v: any) => [fmt(v)]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="TotalReceivable" name="应收" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
              <Bar dataKey="CollectedAmount" name="回款" fill={COLORS.brand} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
