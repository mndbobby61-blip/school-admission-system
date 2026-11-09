import { useCallback, useEffect, useState } from 'react'
import { api } from '../api.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { effectiveStatus, mmss, remainingMs } from '../lib/format.js'
import { useNow } from '../lib/useNow.js'

export default function HoldStatus({ holdId, valid, onBack }) {
  const [hold, setHold] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const now = useNow()

  const load = useCallback(async () => {
    try {
      setHold(await api.getHold(holdId))
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }, [holdId])

  useEffect(() => {
    if (!valid || !holdId) return
    load()
    const t = setInterval(load, 3000)
    return () => clearInterval(t)
  }, [load, valid, holdId])

  async function act(fn, okMsg) {
    setBusy(true)
    setError('')
    setMsg('')
    try {
      await fn()
      setMsg(okMsg)
    } catch (err) {
      setError(err.message)
    } finally {
      await load()
      setBusy(false)
    }
  }

  if (!holdId) {
    return (
      <>
        <h2 className="page-title">আবেদনের অবস্থা</h2>
        <div className="card empty">
          কোনো আবেদন বাছাই করা নেই। "আমার আবেদন" থেকে একটা বেছে নিন।
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={onBack}>আমার আবেদন-এ যান</button>
          </div>
        </div>
      </>
    )
  }

  if (!valid) {
    return <div className="alert alert-info">উপরের ঘরে ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর লিখুন।</div>
  }

  const status = hold ? effectiveStatus(hold, now) : null
  const left = hold ? remainingMs(hold.expiresAt, now) : 0
  const active = status === 'HELD'

  return (
    <>
      <h2 className="page-title">আবেদনের অবস্থা</h2>
      <p className="page-sub">মেয়াদ শেষ হওয়ার আগে ভর্তি ফি দিন।</p>

      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-ok">{msg}</div>}

      {!hold && !error && <div className="empty">লোড হচ্ছে...</div>}

      {hold && (
        <div className="card hold-card">
          <div className="class-name">{hold.className}</div>
          <StatusBadge status={status} />

          {active && (
            <>
              <div className="timer">{mmss(left)}</div>
              <div className="timer-label">সময় বাকি আছে</div>
            </>
          )}
          {status === 'EXPIRED' && (
            <>
              <div className="timer done">00:00</div>
              <div className="timer-label">আবেদনের মেয়াদ শেষ। seat অন্যের জন্য খুলে গেছে।</div>
            </>
          )}
          {status === 'CONFIRMED' && (
            <div className="alert alert-ok" style={{ marginTop: 18 }}>ভর্তি নিশ্চিত হয়েছে। অভিনন্দন!</div>
          )}
          {status === 'CANCELLED' && (
            <div className="timer-label" style={{ marginTop: 18 }}>এই আবেদন বাতিল করা হয়েছে।</div>
          )}

          <div className="actions">
            <button
              className="btn btn-green"
              disabled={!active || busy}
              onClick={() => act(() => api.confirmHold(holdId), 'ভর্তি ফি জমা হয়েছে, ভর্তি নিশ্চিত।')}
            >
              ভর্তি ফি দিন
            </button>
            <button
              className="btn btn-danger"
              disabled={!active || busy}
              onClick={() => act(() => api.cancelHold(holdId), 'আবেদন বাতিল হয়েছে।')}
            >
              বাতিল
            </button>
            <button className="btn btn-ghost" onClick={onBack}>আমার সব আবেদন</button>
          </div>

          <div className="meta">আবেদন নম্বর: {hold.holdId}</div>
        </div>
      )}
    </>
  )
}