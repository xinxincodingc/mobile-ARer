import { useState } from 'react'
import customersData from '../mock/customers.json'
import invoicesData from '../mock/invoices.json'
import trendsData from '../mock/trends.json'

const customers = customersData as any[]
const invoices = invoicesData as any[]
const trends = trendsData as any[]

const totalReceivable = invoices.filter(i => i.Status !== 'CLEARED').reduce((s, i) => s + i.Amount, 0)
const overdueAmount = invoices.filter(i => i.Status === 'OVERDUE').reduce((s, i) => s + i.Amount, 0)
const highRisk = customers.filter(c => c.RiskLevel === 'HIGH').length
const latestTrend = trends[trends.length - 1]
const prevTrend = trends[trends.length - 2]

const topOverdue = customers
  .map(c => ({
    name: c.CompanyName_zh,
    amount: invoices.filter(i => i.CustomerID === c.CustomerID && i.Status === 'OVERDUE').reduce((s, i) => s + i.Amount, 0),
    risk: c.RiskLevel,
    days: invoices.filter(i => i.CustomerID === c.CustomerID && i.Status === 'OVERDUE').reduce((m, i) => Math.max(m, i.OverdueDays), 0),
  }))
  .filter(c => c.amount > 0)
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5)

const RISK_COLOR: Record<string, string> = { HIGH: '#bb0000', MEDIUM: '#e76500', LOW: '#188918' }
const RISK_LABEL: Record<string, string> = { HIGH: '高风险', MEDIUM: '中风险', LOW: '低风险' }

const PERIOD_OPTIONS = ['本月', '上月', '本季度', '上季度']
const AUDIENCE_OPTIONS = ['财务总监', '总经理', '运营总监', '信用管理部']

type ReportSection = { key: string; label: string; checked: boolean }

export default function ReportPage() {
  const [period, setPeriod] = useState('本月')
  const [audience, setAudience] = useState('财务总监')
  const [sections, setSections] = useState<ReportSection[]>([
    { key: 'overview', label: '应收账款概览', checked: true },
    { key: 'overdue', label: '逾期情况分析', checked: true },
    { key: 'risk', label: '高风险客户清单', checked: true },
    { key: 'trend', label: 'DSO趋势分析', checked: true },
    { key: 'suggestion', label: '催收建议与行动计划', checked: true },
  ])
  const [generated, setGenerated] = useState(false)
  const [generating, setGenerating] = useState(false)

  function toggleSection(key: string) {
    setSections(prev => prev.map(s => s.key === key ? { ...s, checked: !s.checked } : s))
  }

  function generate() {
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setGenerated(true) }, 1800)
  }

  const dsoChange = latestTrend.DSO - prevTrend.DSO
  const overdueRateChange = (latestTrend.OverdueRate - prevTrend.OverdueRate).toFixed(1)

  return (
    <div className="page-pad">
      {!generated ? (
        <>
          {/* Joule hint */}
          <div style={{ margin: '0 16px', padding: '14px 16px', borderRadius: 16, background: 'linear-gradient(135deg, #f5f0ff, #ede8fd)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--joule-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💎</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--joule-purple)' }}>Joule 智能汇报</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>根据实时数据自动生成领导汇报材料，支持自定义内容和受众</div>
            </div>
          </div>

          {/* Period */}
          <div className="section-header">汇报周期</div>
          <div style={{ padding: '0 16px', display: 'flex', gap: 8 }}>
            {PERIOD_OPTIONS.map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                flex: 1, padding: '8px 0', borderRadius: 10, border: '1.5px solid',
                borderColor: period === p ? 'var(--sap-brand)' : 'var(--border)',
                background: period === p ? 'var(--sap-brand-light)' : 'var(--card)',
                color: period === p ? 'var(--sap-brand)' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}>{p}</button>
            ))}
          </div>

          {/* Audience */}
          <div className="section-header">汇报对象</div>
          <div style={{ padding: '0 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {AUDIENCE_OPTIONS.map(a => (
              <button key={a} onClick={() => setAudience(a)} style={{
                padding: '7px 14px', borderRadius: 20, border: '1.5px solid',
                borderColor: audience === a ? 'var(--joule-purple)' : 'var(--border)',
                background: audience === a ? 'var(--joule-purple-light)' : 'var(--card)',
                color: audience === a ? 'var(--joule-purple)' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}>{a}</button>
            ))}
          </div>

          {/* Sections */}
          <div className="section-header">报告内容</div>
          <div className="card" style={{ margin: '0 16px' }}>
            {sections.map(s => (
              <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, border: '2px solid',
                  borderColor: s.checked ? 'var(--sap-brand)' : 'var(--border)',
                  background: s.checked ? 'var(--sap-brand)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.15s'
                }}>
                  {s.checked && <span style={{ color: '#fff', fontSize: 13, lineHeight: 1 }}>✓</span>}
                </div>
                <input type="checkbox" checked={s.checked} onChange={() => toggleSection(s.key)} style={{ display: 'none' }} />
                <span style={{ fontSize: 14, color: 'var(--text)' }}>{s.label}</span>
              </label>
            ))}
          </div>

          {/* Generate btn */}
          <div style={{ padding: '20px 16px 8px' }}>
            <button onClick={generate} disabled={generating} style={{
              width: '100%', padding: '14px', borderRadius: 16, border: 'none',
              background: generating ? '#c0c8d0' : 'var(--joule-gradient)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: generating ? 'none' : '0 4px 16px rgba(120,71,234,0.35)',
              transition: 'all 0.2s'
            }}>
              {generating ? (
                <><span style={{ fontSize: 18 }}>⏳</span> 正在生成报告...</>
              ) : (
                <><span style={{ fontSize: 18 }}>💎</span> 用 Joule 生成汇报</>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Report header */}
          <div style={{ margin: '0 16px', padding: '18px', borderRadius: 16, background: 'linear-gradient(135deg, #0057c2, #0070f2)', color: '#fff' }}>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>应收账款管理 · {period}报告 · 致{audience}</div>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.3 }}>应收账款风险管控<br />汇报材料</div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 8 }}>由 Joule AI 生成 · {new Date().toLocaleDateString('zh-CN')}</div>
          </div>

          {/* Executive summary */}
          <div className="card">
            <div className="card__header"><span className="card__title">📋 执行摘要</span></div>
            <div style={{ padding: '0 16px 16px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <p>{period}，公司应收账款总额 <strong style={{ color: 'var(--text)' }}>¥{(totalReceivable / 1e4).toFixed(0)}万元</strong>，
              逾期金额 <strong style={{ color: '#bb0000' }}>¥{(overdueAmount / 1e4).toFixed(0)}万元</strong>（占比 {((overdueAmount / totalReceivable) * 100).toFixed(1)}%）。
              DSO 为 <strong style={{ color: 'var(--text)' }}>{latestTrend.DSO}天</strong>，
              较上期{dsoChange >= 0 ? <span style={{ color: '#bb0000' }}>上升 {dsoChange}天 ▲</span> : <span style={{ color: '#188918' }}>下降 {Math.abs(dsoChange)}天 ▼</span>}。
              高风险客户 <strong style={{ color: '#bb0000' }}>{highRisk}家</strong>，需重点关注。</p>
            </div>
          </div>

          {/* KPI row */}
          {sections.find(s => s.key === 'overview')?.checked && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px', marginTop: 12 }}>
              {[
                { label: '总应收账款', value: `¥${(totalReceivable / 1e4).toFixed(0)}万`, color: 'var(--sap-brand)', sub: '含逾期' },
                { label: '逾期金额', value: `¥${(overdueAmount / 1e4).toFixed(0)}万`, color: '#bb0000', sub: `占比 ${((overdueAmount / totalReceivable) * 100).toFixed(1)}%` },
                { label: '当前 DSO', value: `${latestTrend.DSO}天`, color: '#e76500', sub: dsoChange >= 0 ? `↑${dsoChange}天` : `↓${Math.abs(dsoChange)}天` },
                { label: '高风险客户', value: `${highRisk}家`, color: '#bb0000', sub: `共${customers.length}家客户` },
              ].map(k => (
                <div key={k.label} style={{ background: 'var(--card)', borderRadius: 14, padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${k.color}` }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{k.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: k.color, margin: '4px 0 2px' }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{k.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Overdue analysis */}
          {sections.find(s => s.key === 'overdue')?.checked && (
            <div className="card">
              <div className="card__header"><span className="card__title">⚠️ 逾期情况分析</span></div>
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.7 }}>
                  {period}逾期率 <strong style={{ color: '#bb0000' }}>{latestTrend.OverdueRate}%</strong>，较上期
                  {parseFloat(overdueRateChange) >= 0
                    ? <span style={{ color: '#bb0000' }}>上升 {overdueRateChange}% ▲</span>
                    : <span style={{ color: '#188918' }}>下降 {Math.abs(parseFloat(overdueRateChange))}% ▼</span>
                  }。逾期账款主要集中在 {'>'} 60天 账龄段，占逾期总额约 55%。
                </div>
                {[
                  { label: '1–30天逾期', pct: 22, color: '#e76500' },
                  { label: '31–60天逾期', pct: 23, color: '#e76500' },
                  { label: '61–90天逾期', pct: 28, color: '#bb0000' },
                  { label: '>90天逾期', pct: 27, color: '#bb0000' },
                ].map(row => (
                  <div key={row.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                      <span style={{ fontWeight: 700, color: row.color }}>{row.pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar__fill" style={{ width: `${row.pct}%`, background: row.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* High risk list */}
          {sections.find(s => s.key === 'risk')?.checked && (
            <div className="card">
              <div className="card__header"><span className="card__title">🔴 高风险客户清单</span></div>
              {topOverdue.map((c, i) => (
                <div key={c.name} className="list-item">
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: i < 3 ? '#bb0000' : '#e76500', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
                  <div className="list-item__body">
                    <div className="list-item__title">{c.name}</div>
                    <div className="list-item__sub">最长逾期 {c.days}天</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#bb0000' }}>¥{(c.amount / 1e4).toFixed(0)}万</div>
                    <span className="badge" style={{ background: '#fff0f0', color: RISK_COLOR[c.risk] }}>{RISK_LABEL[c.risk]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {sections.find(s => s.key === 'suggestion')?.checked && (
            <div className="card">
              <div className="card__header"><span className="card__title">💡 建议与行动计划</span></div>
              <div style={{ padding: '0 16px 16px' }}>
                {[
                  { icon: '📞', title: '立即电话催收', desc: `对逾期超90天的高金额客户（${topOverdue.slice(0, 3).map(c => c.name.slice(0, 4)).join('、')}等）本周内完成电话跟进`, tag: '本周', tagColor: '#bb0000' },
                  { icon: '📧', title: '发送正式催款函', desc: '对逾期31–60天的中风险客户发送书面催款通知，要求10个工作日内回款', tag: '两周内', tagColor: '#e76500' },
                  { icon: '🤝', title: '安排上门拜访', desc: '对逾期超90天且单笔金额超过50万的客户，安排客户经理上门洽谈还款方案', tag: '本月', tagColor: '#e76500' },
                  { icon: '📉', title: '信用额度管控', desc: '对高风险客户暂缓新增授信，防止应收账款规模进一步扩大', tag: '持续', tagColor: '#0070f2' },
                ].map(s => (
                  <div key={s.title} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.title}</span>
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: s.tagColor + '18', color: s.tagColor, fontWeight: 700 }}>{s.tag}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ margin: '16px 16px 4px', padding: '14px', borderRadius: 14, background: 'var(--card)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--joule-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>💎</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              本报告由 <strong style={{ color: 'var(--joule-purple)' }}>SAP Joule AI</strong> 根据系统实时数据自动生成，仅供参考，请结合实际情况判断。
            </div>
          </div>

          {/* Regenerate */}
          <div style={{ padding: '12px 16px 8px', display: 'flex', gap: 10 }}>
            <button onClick={() => setGenerated(false)} style={{
              flex: 1, padding: '12px', borderRadius: 14, border: '1.5px solid var(--border)',
              background: 'var(--card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}>重新配置</button>
            <button style={{
              flex: 2, padding: '12px', borderRadius: 14, border: 'none',
              background: 'var(--sap-brand)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}>📤 导出 / 分享</button>
          </div>
        </>
      )}
    </div>
  )
}
