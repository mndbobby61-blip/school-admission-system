import { useState } from 'react'
import { api } from '../api.js'

export default function CreateClass({ onCreated }) {
  const [name, setName] = useState('')
  const [seats, setSeats] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) return setError('Class-এর নাম লিখুন।')
    const n = Number(seats)
    if (!Number.isInteger(n) || n <= 0) return setError('Seat সংখ্যা ১ বা তার বেশি পূর্ণ সংখ্যা হতে হবে।')

    setLoading(true)
    try {
      await api.createClass(name.trim(), n)
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className="page-title">নতুন Class তৈরি</h2>
      <p className="page-sub">প্রতিটা shift আলাদা class। যেমন: Class 6 - Morning Shift</p>

      <div className="card form">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Class-এর নাম</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Class 6 - Morning Shift"
            />
          </div>
          <div className="field">
            <label>মোট Seat</label>
            <input
              className="input"
              type="number"
              min="1"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              placeholder="120"
            />
          </div>
          <button className="btn" disabled={loading}>
            {loading ? 'তৈরি হচ্ছে...' : 'Class তৈরি করুন'}
          </button>
        </form>
      </div>
    </>
  )
}