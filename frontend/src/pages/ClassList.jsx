import Faq from '../components/Faq.jsx'
import Rules from '../components/Rules.jsx'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'
import Hero from '../components/Hero.jsx'

export default function ClassList({ valid, onOpenHold }) {
  const [classes, setClasses] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name')

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

  const totals = useMemo(() => {
    const t = { classes: 0, seats: 0, held: 0, confirmed: 0, available: 0 }
    for (const c of classes || []) {
      t.classes += 1
      t.seats += c.totalSeats
      t.held += c.heldSeats
      t.confirmed += c.confirmedSeats
      t.available += Math.max(0, c.availableSeats)
    }
    return t
  }, [classes])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = (classes || []).filter((c) => c.name.toLowerCase().includes(q))
    if (sort === 'available') list.sort((a, b) => b.availableSeats - a.availableSeats)
    else list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [classes, query, sort])

  return (
    <>
      <Hero />

      <div className="overview">
        <div className="ov"><span>মোট class</span><b>{totals.classes}</b></div>
        <div className="ov"><span>মোট seat</span><b>{totals.seats}</b></div>
        <div className="ov amber"><span>Hold-এ আছে</span><b>{totals.held}</b></div>
        <div className="ov green"><span>ভর্তি নিশ্চিত</span><b>{totals.confirmed}</b></div>
        <div className="ov primary"><span>খালি seat</span><b>{totals.available}</b></div>
      </div>

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

      <div className="toolbar">
        <input
          className="input"
          placeholder="Class খুঁজুন (যেমন: Class 6)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">নাম অনুযায়ী</option>
          <option value="available">বেশি খালি seat আগে</option>
        </select>
      </div>

      {classes === null && !error && <div className="empty">লোড হচ্ছে...</div>}
      {classes && classes.length === 0 && (
        <div className="card empty">এখনো কোনো class নেই। "Class তৈরি" ট্যাব থেকে একটা বানান।</div>
      )}
      {classes && classes.length > 0 && visible.length === 0 && (
        <div className="card empty">এই নামে কোনো class পাওয়া যায়নি।</div>
      )}

      <div className="grid">
        {visible.map((c) => {
          const pctConfirmed = (c.confirmedSeats / c.totalSeats) * 100
          const pctHeld = (c.heldSeats / c.totalSeats) * 100
          const full = c.availableSeats <= 0
          const low = !full && c.availableSeats / c.totalSeats <= 0.1
          return (
            <div className="card" key={c.id}>
              <div className="chip-row">
                <div className="class-name">{c.name}</div>
                {full && <span className="chip chip-full">Seat শেষ</span>}
                {low && <span className="chip chip-warn">শেষ হয়ে আসছে</span>}
              </div>
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
      <Rules />
    <Faq />
    </>
  )
}