const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const KEY = 'studentId'

export const getStudentId = () => localStorage.getItem(KEY) || ''
export const setStudentId = (v) => localStorage.setItem(KEY, v)

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const sid = getStudentId()
  if (sid) headers['X-Student-Id'] = sid

  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Server-এর সাথে সংযোগ হচ্ছে না। একটু পরে আবার চেষ্টা করুন।')
  }

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch {
    /* body নেই */
  }

  if (!res.ok) {
    const err = new Error((data && data.error) || 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  createClass: (name, totalSeats) => request('POST', '/classes', { name, totalSeats }),
  listClasses: () => request('GET', '/classes'),
  createHold: (classId) => request('POST', `/classes/${classId}/holds`),
  getHold: (holdId) => request('GET', `/holds/${holdId}`),
  confirmHold: (holdId) => request('POST', `/holds/${holdId}/confirm`),
  cancelHold: (holdId) => request('DELETE', `/holds/${holdId}`),
  myHolds: () => request('GET', '/me/holds'),
}