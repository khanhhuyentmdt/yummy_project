import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

/**
 * 3-state sort cycle per column: null → asc → desc → null
 * Uses a single state object to keep key/dir in sync.
 * Returns { sortKey, sortDir, handleSort, applySort }
 */
export function useSort() {
  const [sort, setSort] = useState({ key: null, dir: null })

  const handleSort = (key) => {
    setSort(prev => {
      if (prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc')  return { key, dir: 'desc' }
      return { key: null, dir: null }
    })
  }

  const applySort = (arr) => {
    const { key, dir } = sort
    if (!key || !dir) return arr
    return [...arr].sort((a, b) => {
      const aVal = a[key] ?? ''
      const bVal = b[key] ?? ''
      const aNum = Number(aVal)
      const bNum = Number(bVal)
      if (aVal !== '' && bVal !== '' && !isNaN(aNum) && !isNaN(bNum)) {
        return dir === 'asc' ? aNum - bNum : bNum - aNum
      }
      const cmp = String(aVal).localeCompare(String(bVal), 'vi', { sensitivity: 'base' })
      return dir === 'asc' ? cmp : -cmp
    })
  }

  return { sortKey: sort.key, sortDir: sort.dir, handleSort, applySort }
}

export function SortIcon({ columnKey, sortKey, sortDir }) {
  const active = columnKey === sortKey
  if (active && sortDir === 'asc')  return <ChevronUp   size={13} style={{ color: '#E67E22' }} />
  if (active && sortDir === 'desc') return <ChevronDown size={13} style={{ color: '#E67E22' }} />
  return <ChevronsUpDown size={13} className="text-gray-400" />
}

/**
 * Drop-in <th> with a built-in sort button.
 * Accepts any standard <th> props (colSpan, style, etc.)
 */
export function SortableTh({ columnKey, label, sortKey, sortDir, onSort, className = '', ...rest }) {
  const active = columnKey === sortKey
  return (
    <th className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider ${className}`} {...rest}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-gray-700 ${
          active ? 'text-orange-500' : 'text-gray-500'
        }`}
      >
        {label}
        <SortIcon columnKey={columnKey} sortKey={sortKey} sortDir={sortDir} />
      </button>
    </th>
  )
}
