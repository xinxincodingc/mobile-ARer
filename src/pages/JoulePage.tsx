import { useState, useRef, useEffect } from 'react'
import customersData from '../mock/customers.json'
import invoicesData from '../mock/invoices.json'

const customers = customersData as any[]
const invoices = invoicesData as any[]

const totalReceivable = invoices.filter(i => i.Status !== 'CLEARED').reduce((s, i) => s + i.Amount, 0)
const overdueAmount = invoices.filter(i => i.Status === 'OVERDUE').reduce((s, i) => s + i.Amount, 0)
const highRisk = customers.filter(c => c.RiskLevel === 'HIGH').length

type Msg = { id: number; role: 'bot' | 'user'; text: string; actions?: string[] }

const QUICK_ACTIONS = [
  '逾期情况概览',
  '高风险客户列表',
  '本周催收建议',
  '应收账款分析',
]

const BOT_REPLIES: Record<string, string> = {
  '逾期情况概览': `当前逾期应收账款共 **¥${(overdueAmount / 1e4).toFixed(0)}万元**，占总应收 ${((overdueAmount / totalReceivable) * 100).toFixed(1)}%。\n\n主要集中在 >90天账龄段，建议优先处理万华化学、荣盛石化等高金额客户。`,
  '高风险客户列表': `当前高风险客户共 **${highRisk} 家**：\n\n• 万华化学集团 — 逾期 ¥68万\n• 荣盛石化股份 — 逾期 ¥52万\n• 中国石化集团 — 逾期 ¥45万\n\n建议本周内优先电话跟进。`,
  '本周催收建议': `根据账龄和风险评分，本周建议：\n\n1. 📞 电话催收：3 家高风险客户\n2. 📧 邮件提醒：5 家中风险客户\n3. 🤝 上门拜访：1 家超过90天客户\n\n预计可回款约 ¥120万。`,
  '应收账款分析': `当前应收账款总额 **¥${(totalReceivable / 1e4).toFixed(0)}万**：\n\n• 正常（<30天）: 45%\n• 轻度逾期（30-60天）: 28%\n• 重度逾期（>60天）: 27%\n\nDSO 近3月均值约 52 天，高于行业基准。`,
  'default': '您好！我是 Joule AI 助手。我可以帮您分析应收账款、识别高风险客户、提供催收建议。请告诉我您需要什么帮助？'
}

let msgId = 10

export default function JoulePage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: 1,
      role: 'bot',
      text: `您好 Yichen！\n\n有什么可以帮您的吗？`,
      actions: QUICK_ACTIONS
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing])

  function sendMessage(text: string) {
    if (!text.trim()) return
    const userMsg: Msg = { id: ++msgId, role: 'user', text }
    setMsgs(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const reply = BOT_REPLIES[text] || BOT_REPLIES['default']
      const botMsg: Msg = {
        id: ++msgId,
        role: 'bot',
        text: reply,
        actions: QUICK_ACTIONS.filter(a => a !== text).slice(0, 2)
      }
      setMsgs(prev => [...prev, botMsg])
      setTyping(false)
    }, 900 + Math.random() * 400)
  }

  function renderText(text: string) {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      return (
        <span key={i}>
          {i > 0 && <br />}
          <span dangerouslySetInnerHTML={{ __html: bold }} />
        </span>
      )
    })
  }

  return (
    <div className="joule-page">
      <div className="joule-messages">
        {msgs.map(msg => (
          <div key={msg.id}>
            <div className={`msg msg--${msg.role}`}>
              {msg.role === 'bot' && <div className="msg__avatar">💎</div>}
              <div className="msg__bubble">
                {renderText(msg.text)}
              </div>
            </div>
            {msg.actions && msg.actions.length > 0 && (
              <div style={{ marginLeft: 40, marginTop: 8 }}>
                <div className="joule-actions">
                  {msg.actions.map(a => (
                    <button key={a} className="joule-action-btn" onClick={() => sendMessage(a)}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="msg msg--bot">
            <div className="msg__avatar">💎</div>
            <div className="msg__bubble" style={{ color: 'var(--text-muted)' }}>
              <span style={{ letterSpacing: 3, fontSize: 18 }}>···</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="joule-input-bar">
        <input
          className="joule-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Message Joule"
        />
        <button className="joule-send-btn" onClick={() => sendMessage(input)}>➤</button>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', padding: '4px 0 6px', background: 'var(--card)' }}>
        Joule uses AI. Verify results.
      </div>
    </div>
  )
}
