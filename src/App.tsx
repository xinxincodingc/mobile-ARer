import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import CustomersPage from './pages/CustomersPage'
import CollectionPage from './pages/CollectionPage'
import AnalyticsPage from './pages/AnalyticsPage'
import JoulePage from './pages/JoulePage'

const TABS = [
  { path: '/', label: '开始', icon: '🏠' },
  { path: '/joule', label: 'Joule', icon: '💎', joule: true },
  { path: '/customers', label: '客户360', icon: '👥' },
  { path: '/collection', label: '催收', icon: '📋' },
  { path: '/analytics', label: '分析', icon: '📊' },
]

function Layout() {
  const nav = useNavigate()
  const loc = useLocation()

  const pageTitle: Record<string, string> = {
    '/': '开始',
    '/joule': 'Joule',
    '/customers': '客户360',
    '/collection': '催收工作台',
    '/analytics': '数据分析',
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__logo">SAP<span>▸</span></div>
        <div className="app-header__title">{pageTitle[loc.pathname] ?? ''}</div>
        <div className="app-header__avatar">YL</div>
      </header>

      <div className="page-body">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/joule" element={<JoulePage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </div>

      <nav className="tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.path}
            className={`tab-bar__item${tab.joule ? ' tab-bar__item--joule' : ''}${loc.pathname === tab.path ? ' active' : ''}`}
            onClick={() => nav(tab.path)}
          >
            {tab.joule
              ? <div className="tab-bar__joule-icon">💎</div>
              : <span className="tab-bar__icon">{tab.icon}</span>
            }
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  )
}
