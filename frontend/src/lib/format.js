export const isValidStudentId = (v) => /^\d{17}$/.test(v)

export function remainingMs(expiresAt, now) {
  return Math.max(0, new Date(expiresAt).getTime() - now)
}

export function mmss(ms) {
  const total = Math.ceil(ms / 1000)
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

// মেয়াদ পেরোলে page reload ছাড়াই EXPIRED দেখাবে
export function effectiveStatus(hold, now) {
  if (hold.status === 'HELD' && remainingMs(hold.expiresAt, now) <= 0) return 'EXPIRED'
  return hold.status
}

export const STATUS = {
  HELD: { label: 'Hold-এ আছে', cls: 'badge-amber' },
  CONFIRMED: { label: 'ভর্তি নিশ্চিত', cls: 'badge-green' },
  EXPIRED: { label: 'মেয়াদ শেষ', cls: 'badge-gray' },
  CANCELLED: { label: 'বাতিল', cls: 'badge-red' },
}