import { useState } from 'react'
import { api } from '../api.js'

const CLASSES = Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`)
const SHIFTS = [
  { value: 'Morning', label: 'Morning Shift (সকাল)' },
  { value: 'Day', label: 'Day Shift (দিন)' },
]

export default function CreateClass({ onCreated }) {
  const [className, setClassName] = useState('Class 6')
  const [shift, setShift] = useState('Morning')
  const [seats, setSeats] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fullName = `${className} - ${shift} Shift`

  async function submit(e) {
    e.preventDefault()
    setError('')

    const n = Number(seats)
    if (!Number.isInteger(n) || n <= 0) return setError('Seat সংখ্যা ১ বা তার বেশি পূর্ণ সংখ্যা হতে হবে।')

    setLoading(true)
    try {
      await api.createClass(fullName, n)
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
      <p className="page-sub">প্রতিটা shift আলাদা class, নিজের আলাদা seat সংখ্যা নিয়ে।</p>

      <div className="card form">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Class</label>
            <select className="input" value={className} onChange={(e) => setClassName(e.target.value)}>
              {CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Shift</label>
            <select className="input" value={shift} onChange={(e) => setShift(e.target.value)}>
              {SHIFTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
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

          <div className="alert alert-info">
            Class-এর নাম হবে: <b>{fullName}</b>
          </div>

          <button className="btn" disabled={loading}>
            {loading ? 'তৈরি হচ্ছে...' : 'Class তৈরি করুন'}
          </button>
        </form>
      </div>
    </>
  )
}