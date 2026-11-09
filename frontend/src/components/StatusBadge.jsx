import { STATUS } from '../lib/format.js'

export default function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, cls: 'badge-gray' }
  return <span className={'badge ' + s.cls}>{s.label}</span>
}