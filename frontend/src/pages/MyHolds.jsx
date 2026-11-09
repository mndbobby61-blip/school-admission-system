import { useEffect, useState } from 'react'
import { api } from '../api.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { effectiveStatus, mmss, remainingMs } from '../lib/format.js'
import { useNow } from '../lib/useNow.js'

export default function MyHolds({ valid, onOpenHold }) {
  const [holds, setHolds] = useState(null)
  const [error, setError] = useState('')
  const now = useNow()

  async function load() {
    try {
      setHolds(await api.myHolds())
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    if (!valid) return
    load()
    const t = setInterval(load, 4000)
    return () => clearInterval(t)
  }, [valid])

  return (
    <>
      <h2 className="page-title">আমার আবেদন</h2>
      <p className="page-sub">এই শিক্ষার্থীর সব আবেদন আর তাদের অবস্থা।</p>

      {!valid && (
        <div className="alert alert-info">উপরের ঘরে ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর লিখুন।</div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      {valid && holds === null && !error && <div className="empty">লোড হচ্ছে...</div>}
      {valid && holds && holds.length === 0 && (
        <div className="card empty">এখনো কোনো আবেদন করা হয়নি।</div>
      )}

      <div className="list">
        {holds?.map((h) => {
          const status = effectiveStatus(h, now)
          return (
            <div className="card item" key={h.holdId}>
              <div>
                <div className="item-title">{h.className}</div>
                <div className="item-sub">
                  {status === 'HELD'
                    ? `মেয়াদ শেষ হতে বাকি ${mmss(remainingMs(h.expiresAt, now))}`
                    : 'আবেদন'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <StatusBadge status={status} />
                <button className="btn btn-sm btn-ghost" onClick={() => onOpenHold(h.holdId)}>
                  দেখুন
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}