import { useState } from 'react'
import { getStudentId, setStudentId } from './api.js'
import { isValidStudentId } from './lib/format.js'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import ClassList from './pages/ClassList.jsx'
import CreateClass from './pages/CreateClass.jsx'
import HoldStatus from './pages/HoldStatus.jsx'
import MyHolds from './pages/MyHolds.jsx'

const TABS = [
  { id: 'classes', label: 'Class তালিকা' },
  { id: 'mine', label: 'আমার আবেদন' },
  { id: 'hold', label: 'আবেদনের অবস্থা' },
  { id: 'create', label: 'Class তৈরি (Admin)' },
]

export default function App() {
  const [tab, setTab] = useState('classes')
  const [sid, setSid] = useState(getStudentId())
  const [holdId, setHoldId] = useState(null)
  const valid = isValidStudentId(sid)

  function changeSid(value) {
    const clean = value.replace(/\D/g, '').slice(0, 17)
    setSid(clean)
    setStudentId(clean)
  }

  function openHold(id) {
    setHoldId(id)
    setTab('hold')
  }

  return (
    <div className="app-shell">
      <header className="header">
        <div className="container">
          <div className="header-top">
            <div className="brand">
              <div className="brand-logo">🎓</div>
              <div>
                <h1>School Admission System</h1>
                <p>Online ভর্তি ব্যবস্থাপনা</p>
              </div>
            </div>

            <div className="sid-box">
              <label>শিক্ষার্থীর জন্ম নিবন্ধন নম্বর (১৭ অঙ্ক)</label>
              <input
                className="sid-input"
                value={sid}
                onChange={(e) => changeSid(e.target.value)}
                placeholder="যেমন: 20152691234567890"
                inputMode="numeric"
              />
              <div className="sid-hint">
                {sid.length === 0 ? 'আবেদনের আগে নম্বর দিন' : valid ? '✓ ঠিক আছে' : `${sid.length}/১৭ অঙ্ক`}
              </div>
            </div>
          </div>

          <nav className="tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={'tab' + (tab === t.id ? ' active' : '')}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="container page">
        {tab === 'classes' && <ClassList valid={valid} onOpenHold={openHold} />}
        {tab === 'mine' && <MyHolds valid={valid} onOpenHold={openHold} />}
        {tab === 'hold' && <HoldStatus holdId={holdId} valid={valid} onBack={() => setTab('mine')} />}
        {tab === 'create' && <CreateClass onCreated={() => setTab('classes')} />}
      </main>
      
      <Contact />
      <Footer />
    </div>
  )
}