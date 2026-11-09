import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function ClassList({ valid, onOpenHold }) {
  const [classes, setClasses] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  async function load() {
    try {
      setClasses(await api.listClasses())
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  // Page reload ছাড়াই কয়েক সেকেন্ড পরপর seat সংখ্যা নিজে থেকে হালনাগাদ হবে
  useEffect(() => {
    load()
    const t = setInterval(load, 3000)
    return () => clearInterval(t)
  }, [])

  async function apply(classId) {
    setError('')
    setBusyId(classId)
    try {
      const hold = await api.createHold(classId)
      onOpenHold(hold.holdId)
    } catch (err) {
      setError(err.message)
      load()
    } finally {
      setBusyId('')
    }
  }

  return (
    <>
      <div className="row-between">
        <div>
          <h2 className="page-title">Class তালিকা</h2>
          <p className="page-sub">যে আগে আবেদন করবে সে seat পাবে।</p>
        </div>
        <span className="live"><span className="dot" /> Live হালনাগাদ</span>
      </div>

      {!valid && (
        <div className="alert alert-info">
          আবেদন করতে উপরের ঘরে শিক্ষার্থীর ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর লিখুন।
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      {classes === null && !error && <div className="empty">লোড হচ্ছে...</div>}
      {classes && classes.length === 0 && (
        <div className="card empty">এখনো কোনো class নেই। "Class তৈরি" ট্যাব থেকে একটা বানান।</div>
      )}

      <div className="grid">
        {classes?.map((c) => {
          const pctConfirmed = (c.confirmedSeats / c.totalSeats) * 100
          const pctHeld = (c.heldSeats / c.totalSeats) * 100
          const full = c.availableSeats <= 0
          return (
            <div className="card" key={c.id}>
              <div className="class-name">{c.name}</div>
              <div className="bar">
                <div className="confirmed" style={{ width: pctConfirmed + '%' }} />
                <div className="held" style={{ width: pctHeld + '%' }} />
              </div>
              <div className="stats">
                <div className="stat"><b>{c.totalSeats}</b><span>মোট</span></div>
                <div className="stat"><b>{c.heldSeats}</b><span>Hold-এ</span></div>
                <div className="stat"><b>{c.confirmedSeats}</b><span>নিশ্চিত</span></div>
                <div className="stat avail"><b>{Math.max(0, c.availableSeats)}</b><span>খালি</span></div>
              </div>
              <button
                className="btn btn-block"
                disabled={!valid || full || busyId === c.id}
                onClick={() => apply(c.id)}
              >
                {busyId === c.id ? 'আবেদন হচ্ছে...' : full ? 'Seat নেই' : 'আবেদন করুন'}
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}