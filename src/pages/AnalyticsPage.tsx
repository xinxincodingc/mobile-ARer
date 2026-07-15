import customersData from '../mock/customers.json'
import invoicesData from '../mock/invoices.json'
import trendsData from '../mock/trends.json'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'

const customers = customersData as any[]
const invoices = invoicesData as any[]
const trends = trendsData as any[]

// Risk distribution
const riskDist = [
  { name: '高风险', value: customers.filter(c => c.RiskLevel === 'HIGH').length, color: '#bb0000' },
  { name: '中风险', value: customers.filter(c => c.RiskLevel === 'MEDIUM').length, color: '#e76500' },
  { name: '低风险', value: customers.filter(c => c.RiskLevel === 'LOW').length, color: '#188918' },
]

// Aging buckets
const agingBuckets = [
  { name: '1-30天', value: invoices.filter(i => i.AgingBucket === 'CURRENT' || i.AgingBucket === '1_30').length },
  { name: '31-60天', value: invoices.filter(i => i.AgingBucket === '31_60').length },
  { name: '61-90天', value: invoices.filter(i => i.AgingBucket === '61_90').length },
  { name: '>90天', value: invoices.filter(i => i.AgingBucket === 'OVER_90').length },
]

// Top overdue customers
const topOverdue = customers
  .map(c => ({
    name: c.CompanyName_zh.slice(0, 4),
    amount: invoices.filter(i => i.CustomerID === c.CustomerID && i.Status === 'OVERDUE').reduce((s, i) => s + i.Amount, 0)
  }))
  .filter(c => c.amount > 0)
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5)

// Risk radar (mock scores)
const radarData = [
  { subject: '逾期率', A: 72 },
  { subject: '付款准时率', A: 58 },
  { subject: '信用评级', A: 65 },
  { subject: '回款效率', A: 80 },
  { subject: '客户稳定性', A: 55 },
]

const latestTrend = trends[trends.length - 1]

export default function AnalyticsPage() {
  return (
    <div className="page-pad">
      {/* Summary */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px' }}>
        <div style={{ flex: 1, background: 'var(--card)', borderRadius: 14, padding: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>最新逾期率</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#bb0000' }}>{latestTrend.OverdueRate}%</div>
        </div>
        <div style={{ flex: 1, background: 'var(--card)', borderRadius: 14, padding: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>最新 DSO</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0070f2' }}>{latestTrend.DSO}天</div>
        </div>
        <div style={{ flex: 1, background: 'var(--card)', borderRadius: 14, padding: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>客户总数</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#188918' }}>{customers.length}</div>
        </div>
      </div>

      {/* Pie - risk distribution */}
      <div className="card">
        <div className="card__header"><span className="card__title">风险等级分布</span></div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 16px' }}>
          <ResponsiveContainer width={150} height={150}>
            <PieChart>
              <Pie data={riskDist} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                {riskDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: any, name: any) => [v + ' 家', name]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {riskDist.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                <div style={{ fontSize: 13, flex: 1 }}>{d.name}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: d.color }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aging bucket bar */}
      <div className="card">
        <div className="card__header"><span className="card__title">账龄分析</span></div>
        <div className="card__body" style={{ paddingTop: 0 }}>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={agingBuckets} margin={{ top: 5, right: 8, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8a95a3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8a95a3' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="value" name="发票数" fill="#0070f2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar */}
      <div className="card">
        <div className="card__header"><span className="card__title">综合风险雷达</span></div>
        <div className="card__body" style={{ paddingTop: 0 }}>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e9ef" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#556070' }} />
              <Radar dataKey="A" stroke="#7847ea" fill="#7847ea" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top overdue */}
      <div className="card">
        <div className="card__header"><span className="card__title">逾期金额 TOP 5</span></div>
        <div className="card__body" style={{ paddingTop: 0 }}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={topOverdue} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#8a95a3' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1e4).toFixed(0)}万`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#556070' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip formatter={(v: any) => [`¥${(v/1e4).toFixed(0)}万`, '逾期金额']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="amount" fill="#bb0000" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
