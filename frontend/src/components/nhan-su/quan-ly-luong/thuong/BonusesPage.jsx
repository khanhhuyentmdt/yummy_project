import { useState, useEffect, useRef } from 'react'
import {
  Search, Filter, Download, Trash2,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Plus,
} from 'lucide-react'
import api from '../../../../api/axios'
import EditBonusModal  from './EditBonusModal'
import DeleteBonusModal from './DeleteBonusModal'
import SuccessModal    from '../../../common/SuccessModal'

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_LABEL = {
  chua_thanh_toan: 'Chua thanh toan',
  da_thanh_toan:   'Da thanh toan',
  da_huy:          'Da huy',
}
const STATUS_STYLE = {
  chua_thanh_toan: 'bg-yellow-50 text-yellow-600',
  da_thanh_toan:   'bg-green-50 text-green-700',
  da_huy:          'bg-red-50 text-red-500',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold font-[Nunito_Sans] ${STATUS_STYLE[status] || 'bg-gray-50 text-gray-500'}`}>
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function SortIcon({ field, ordering }) {
  const asc  = ordering === field
  const desc = ordering === `-${field}`
  return (
    <span className="inline-flex flex-col ml-1 align-middle">
      <ChevronUp   size={10} className={asc  ? 'text-orange-500' : 'text-gray-300'} />
      <ChevronDown size={10} className={desc ? 'text-orange-500' : 'text-gray-300'} />
    </span>
  )
}

function fmtMoney(val) {
  if (val == null) return '0'
  return String(Number(val)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function fmtDate(d) {
  if (!d) return '--'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

const PAGE_SIZE = 10
const SORTABLE  = ['code', 'reason', 'employee_count', 'total_amount', 'bonus_date', 'status']

// ─── Component ────────────────────────────────────────────────────────────────

export default function BonusesPage({ onCreateClick, initialEditBonus, onClearInitialEdit }) {
  const [bonuses,      setBonuses]      = useState([])
  const [total,        setTotal]        = useState(0)
  const [loading,      setLoading]      = useState(false)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [ordering,     setOrdering]     = useState('-id')
  const [page,         setPage]         = useState(1)
  const [selected,     setSelected]     = useState(new Set())
  const [showFilter,   setShowFilter]   = useState(false)

  const [editBonus,      setEditBonus]      = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [successMsg,     setSuccessMsg]     = useState('')
  const [openDropId,     setOpenDropId]     = useState(null)

  const filterRef = useRef(null)
  const dropRef   = useRef(null)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // open edit modal if coming from AddBonusPage
  useEffect(() => {
    if (initialEditBonus) {
      setEditBonus(initialEditBonus)
      onClearInitialEdit && onClearInitialEdit()
    }
  }, [initialEditBonus]) // eslint-disable-line

  // close filter dropdown on outside click
  useEffect(() => {
    function outside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false)
      if (dropRef.current   && !dropRef.current.contains(e.target))   setOpenDropId(null)
    }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [])

  useEffect(() => { setPage(1) }, [search, statusFilter, ordering])

  useEffect(() => {
    fetchBonuses()
  }, [search, statusFilter, ordering, page]) // eslint-disable-line

  async function fetchBonuses() {
    setLoading(true)
    try {
      const params = { ordering }
      if (search)       params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await api.get('/bonuses/', { params })
      const all = res.data.bonuses || []
      setTotal(all.length)
      const start = (page - 1) * PAGE_SIZE
      setBonuses(all.slice(start, start + PAGE_SIZE))
    } catch {
      setBonuses([])
    } finally {
      setLoading(false)
    }
  }

  function toggleSort(field) {
    if (ordering === field)    setOrdering(`-${field}`)
    else if (ordering === `-${field}`) setOrdering('-id')
    else setOrdering(field)
  }

  // ── Selection ──
  const allPageIds   = bonuses.map(b => b.id)
  const allSelected  = allPageIds.length > 0 && allPageIds.every(id => selected.has(id))
  const someSelected = allPageIds.some(id => selected.has(id)) && !allSelected

  function toggleAll() {
    if (allSelected) {
      setSelected(prev => { const n = new Set(prev); allPageIds.forEach(id => n.delete(id)); return n })
    } else {
      setSelected(prev => { const n = new Set(prev); allPageIds.forEach(id => n.add(id)); return n })
    }
  }
  function toggleOne(id) {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  // ── Delete success ──
  function handleDeleteDone(deletedIds) {
    setBonuses(prev => prev.filter(b => !deletedIds.includes(b.id)))
    setTotal(prev => prev - deletedIds.length)
    setSelected(prev => { const n = new Set(prev); deletedIds.forEach(id => n.delete(id)); return n })
    setDeleteTarget(null)
    setBulkDeleteOpen(false)
    setSuccessMsg('Xoa thanh cong!')
  }

  // ── Edit save ──
  function handleEditSaved(updated) {
    setBonuses(prev => prev.map(b => b.id === updated.id ? updated : b))
  }

  // ── Export ──
  function handleExport() {
    const rows = bonuses.map(b => ({
      'Ma thuong':              b.code,
      'Ly do thuong':           b.reason,
      'So luong NV':            b.employee_count,
      'Tong tien':              b.total_amount,
      'Ngay thuong':            fmtDate(b.bonus_date),
      'Trang thai':             STATUS_LABEL[b.status] || b.status,
    }))
    const csv = [
      Object.keys(rows[0]).join(','),
      ...rows.map(r => Object.values(r).join(',')),
    ].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'danh-sach-thuong.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedCount = selected.size
  const selectedIds   = [...selected]

  // ── Checkbox style helper ──
  const cbCls = 'w-4 h-4 rounded border-gray-300 checked:bg-[#E67E22] checked:border-[#E67E22] focus:ring-2 focus:ring-orange-300 focus:ring-offset-0 cursor-pointer'

  return (
    <div className="px-8 py-6 font-[Nunito_Sans]" style={{ backgroundColor: '#FFF6F3', minHeight: '100vh' }}>
      {/* Modals */}
      {editBonus && (
        <EditBonusModal
          bonus={editBonus}
          onSaved={handleEditSaved}
          onClose={() => setEditBonus(null)}
        />
      )}
      {deleteTarget && (
        <DeleteBonusModal
          bonus={deleteTarget}
          onDeleted={handleDeleteDone}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {bulkDeleteOpen && (
        <DeleteBonusModal
          ids={selectedIds}
          onDeleted={handleDeleteDone}
          onClose={() => setBulkDeleteOpen(false)}
        />
      )}
      {successMsg && (
        <SuccessModal message={successMsg} onClose={() => setSuccessMsg('')} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">DANH SACH THUONG</h1>
          <p className="text-sm text-gray-400 mt-1">
            Quan ly luong / <span className="text-orange-500">Danh sach thuong</span>
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-[7px] border text-sm font-semibold"
          style={{ borderColor: '#E67E22', color: '#E67E22', backgroundColor: 'white' }}
        >
          <Download size={16} />
          Xuat
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tim kiem thuong"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-[7px] focus:outline-none focus:ring-2 focus:ring-orange-200 font-[Nunito_Sans]"
            />
          </div>

          {/* Filter */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(v => !v)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-[7px] text-sm text-gray-600 bg-white hover:border-orange-300"
            >
              <Filter size={15} />
              Bo loc
            </button>
            {showFilter && (
              <div className="absolute left-0 top-11 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-56">
                <p className="text-xs font-semibold text-gray-500 mb-2">Trang thai</p>
                {[
                  { value: '',                label: 'Tat ca' },
                  { value: 'chua_thanh_toan', label: 'Chua thanh toan' },
                  { value: 'da_thanh_toan',   label: 'Da thanh toan'   },
                  { value: 'da_huy',          label: 'Da huy'          },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setStatusFilter(opt.value); setShowFilter(false) }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm mb-1 ${
                      statusFilter === opt.value ? 'bg-orange-50 text-orange-600 font-semibold' : 'hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Bulk or Add */}
          {selectedCount > 0 ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-semibold">
                {selectedCount} duoc chon
              </span>
              <button
                onClick={() => setBulkDeleteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold bg-red-600 hover:bg-red-700"
              >
                <Trash2 size={15} />
                Xoa da chon
              </button>
            </div>
          ) : (
            <button
              onClick={onCreateClick}
              className="flex items-center gap-2 px-4 py-2 rounded-[7px] text-white text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: '#E67E22' }}
            >
              <Plus size={16} />
              Them thuong
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pr-4 text-left">
                  <input
                    type="checkbox"
                    className={cbCls}
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected }}
                    onChange={toggleAll}
                  />
                </th>
                {[
                  { field: 'code',           label: 'MA THUONG'                  },
                  { field: 'reason',         label: 'LY DO THUONG'               },
                  { field: 'employee_count', label: 'SO LUONG NV DUOC THUONG'    },
                  { field: 'total_amount',   label: 'TONG TIEN'                  },
                  { field: 'bonus_date',     label: 'NGAY THUONG'                },
                  { field: 'status',         label: 'TRANG THAI'                 },
                ].map(col => (
                  <th
                    key={col.field}
                    onClick={() => toggleSort(col.field)}
                    className="pb-3 pr-6 text-left text-xs font-bold text-gray-500 cursor-pointer select-none whitespace-nowrap hover:text-orange-500"
                  >
                    {col.label}
                    <SortIcon field={col.field} ordering={ordering} />
                  </th>
                ))}
                <th className="pb-3 text-left text-xs font-bold text-gray-500">HANH DONG</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">Dang tai...</td>
                </tr>
              ) : bonuses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">Khong co du lieu</td>
                </tr>
              ) : bonuses.map(b => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-orange-50/30">
                  <td className="py-3 pr-4">
                    <input
                      type="checkbox"
                      className={cbCls}
                      checked={selected.has(b.id)}
                      onChange={() => toggleOne(b.id)}
                    />
                  </td>
                  <td className="py-3 pr-6 font-semibold text-gray-800">{b.code}</td>
                  <td className="py-3 pr-6 text-gray-600 max-w-[220px] truncate">{b.reason}</td>
                  <td className="py-3 pr-6 text-center text-gray-700">{b.employee_count}</td>
                  <td className="py-3 pr-6 text-gray-700">{fmtMoney(b.total_amount)}</td>
                  <td className="py-3 pr-6 text-gray-600">{fmtDate(b.bonus_date)}</td>
                  <td className="py-3 pr-6">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="py-3 relative" ref={dropRef}>
                    <button
                      onClick={e => { e.stopPropagation(); setOpenDropId(id => id === b.id ? null : b.id) }}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-[7px] text-sm text-gray-600 bg-white hover:border-orange-300"
                    >
                      Hanh dong <ChevronDown size={13} />
                    </button>
                    {openDropId === b.id && (
                      <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-36 overflow-hidden">
                        <button
                          onClick={() => { setEditBonus(b); setOpenDropId(null) }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50"
                        >
                          Chinh sua
                        </button>
                        <button
                          onClick={() => { setDeleteTarget(b); setOpenDropId(null) }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                        >
                          Xoa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-5 text-sm text-gray-500 font-[Nunito_Sans]">
          <span>
            Hien thi <span className="text-orange-500 font-bold">{bonuses.length}</span> tren tong so{' '}
            <span className="text-orange-500 font-bold">{total}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold ${
                  page === p ? 'text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
                style={page === p ? { backgroundColor: '#E67E22' } : {}}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
