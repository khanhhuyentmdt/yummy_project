import { useState, useEffect, useRef } from 'react'
import { Search, Filter, Plus, Download, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import api from '../../../../api/axios'
import AddShiftModal from './AddShiftModal'
import EditShiftModal from './EditShiftModal'
import DeleteShiftModal from './DeleteShiftModal'
import SuccessModal from '../../../common/SuccessModal'

const STATUS_LABEL = {
  active:   'Đang hoạt động',
  inactive: 'Ngưng hoạt động',
}

const STATUS_STYLE = {
  active:   'bg-green-50 text-green-600',
  inactive: 'bg-red-50 text-red-500',
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

function fmtTime(t) {
  if (!t) return '--:--'
  return t.slice(0, 5)
}

const PAGE_SIZE = 10

export default function WorkShiftsPage() {
  const [shifts,      setShifts]      = useState([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(false)
  const [search,      setSearch]      = useState('')
  const [statusFilter,setStatusFilter]= useState('')
  const [ordering,    setOrdering]    = useState('-id')
  const [page,        setPage]        = useState(1)
  const [selected,    setSelected]    = useState(new Set())
  const [showFilter,  setShowFilter]  = useState(false)

  const [addOpen,        setAddOpen]        = useState(false)
  const [editShift,      setEditShift]      = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [successMsg,     setSuccessMsg]     = useState('')

  const filterRef = useRef(null)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchShifts() {
    setLoading(true)
    try {
      const params = { ordering }
      if (search)        params.search = search
      if (statusFilter)  params.status = statusFilter
      const res = await api.get('/shifts/', { params })
      const all = res.data.shifts || []
      setTotal(all.length)
      const start = (page - 1) * PAGE_SIZE
      setShifts(all.slice(start, start + PAGE_SIZE))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchShifts() }, [search, statusFilter, ordering, page])

  function toggleSort(field) {
    setOrdering(prev => (prev === field ? `-${field}` : field))
    setPage(1)
  }

  function toggleAll() {
    if (selected.size === shifts.length && shifts.length > 0) {
      setSelected(new Set())
    } else {
      setSelected(new Set(shifts.map(s => s.id)))
    }
  }

  function toggleOne(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleCreated(shift) {
    setAddOpen(false)
    setSuccessMsg(`Đã thêm ca làm việc "${shift.name}" thành công!`)
    // Sau khi hiện success modal, tự động mở EditModal
    setTimeout(() => {
      setSuccessMsg('')
      setEditShift(shift)
    }, 1500)
    fetchShifts()
  }

  function handleEdited(shift) {
    setEditShift(null)
    setSuccessMsg(`Đã cập nhật ca làm việc "${shift.name}" thành công!`)
    fetchShifts()
  }

  function handleDeleteDone(ids) {
    setShifts(prev => prev.filter(s => !ids.includes(s.id)))
    setSelected(new Set())
    setDeleteTarget(null)
    setBulkDeleteOpen(false)
    setSuccessMsg('Xóa ca làm việc thành công!')
    fetchShifts()
  }

  const allChecked = shifts.length > 0 && selected.size === shifts.length

  const cbClass = `w-4 h-4 rounded border border-gray-300 cursor-pointer
    checked:bg-[#E67E22] checked:border-[#E67E22]
    focus:ring-2 focus:ring-orange-300 focus:ring-offset-0`

  return (
    <div className="p-6 bg-[#FFF6F3] min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
            DANH SÁCH CA LÀM VIỆC
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý chấm công /{' '}
            <span className="text-orange-500 font-medium">Ca làm việc</span>
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 border border-orange-400 text-orange-500 rounded-[7px] text-sm hover:bg-orange-50 transition-colors">
          <Download size={15} />
          Xuất
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Tìm kiếm ca làm việc"
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-[7px] text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="flex-1" />

          {/* Filter */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(v => !v)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-[7px] text-sm text-gray-600 hover:bg-gray-50"
            >
              <Filter size={14} />
              Bộ lọc
              {statusFilter && <span className="w-2 h-2 rounded-full bg-orange-500 ml-0.5" />}
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-20 min-w-[160px]">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Trạng thái</p>
                {[['', 'Tất cả'], ['active', 'Đang hoạt động'], ['inactive', 'Ngưng hoạt động']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => { setStatusFilter(val); setPage(1); setShowFilter(false) }}
                    className={`block w-full text-left px-2 py-1.5 text-sm rounded-lg ${
                      statusFilter === val ? 'bg-orange-50 text-orange-600 font-medium' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bulk delete or Add */}
          {selected.size > 0 ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">{selected.size} được chọn</span>
              <button
                onClick={() => setBulkDeleteOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 size={14} />
                Xóa đã chọn
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#E67E22] hover:bg-orange-600 text-white rounded-[7px] text-sm font-medium transition-colors"
            >
              <Plus size={15} />
              Thêm ca làm
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pr-4 w-8">
                  <input type="checkbox" className={cbClass} checked={allChecked} onChange={toggleAll} />
                </th>
                {[
                  { key: 'code',       label: 'MÃ CLV' },
                  { key: 'name',       label: 'TÊN CA LÀM VIỆC' },
                  { key: 'start_time', label: 'THỜI GIAN LÀM VIỆC' },
                  { key: 'total',      label: 'TỔNG GIỜ LÀM VIỆC', noSort: true },
                  { key: 'status',     label: 'TRẠNG THÁI' },
                ].map(col => (
                  <th
                    key={col.key}
                    className={`pb-3 pr-4 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap ${
                      col.noSort ? '' : 'cursor-pointer select-none hover:text-gray-700'
                    }`}
                    onClick={col.noSort ? undefined : () => toggleSort(col.key)}
                  >
                    {col.label}
                    {!col.noSort && <SortIcon field={col.key} ordering={ordering} />}
                  </th>
                ))}
                <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">Đang tải...</td></tr>
              ) : shifts.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">Không có dữ liệu</td></tr>
              ) : shifts.map(shift => (
                <tr key={shift.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 pr-4">
                    <input
                      type="checkbox"
                      className={cbClass}
                      checked={selected.has(shift.id)}
                      onChange={() => toggleOne(shift.id)}
                    />
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-gray-600">{shift.code}</td>
                  <td className="py-3 pr-4 font-medium text-gray-800">{shift.name}</td>
                  <td className="py-3 pr-4 text-gray-600">
                    {fmtTime(shift.start_time)} - {fmtTime(shift.end_time)}
                  </td>
                  <td className="py-3 pr-4 text-gray-700 font-medium">
                    {shift.total_hours_display || `${shift.total_hours} giờ`}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${STATUS_STYLE[shift.status]}`}>
                      {STATUS_LABEL[shift.status] || shift.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <ActionMenu
                      shift={shift}
                      onEdit={() => setEditShift(shift)}
                      onDelete={() => setDeleteTarget(shift)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Hiển thị <span className="text-orange-500 font-semibold">{shifts.length}</span> trên tổng số{' '}
            <span className="text-orange-500 font-semibold">{total}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${
                  p === page
                    ? 'bg-orange-500 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {addOpen && (
        <AddShiftModal
          onClose={() => setAddOpen(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Edit Modal */}
      {editShift && (
        <EditShiftModal
          shift={editShift}
          onClose={() => setEditShift(null)}
          onSaved={handleEdited}
        />
      )}

      {/* Delete single */}
      {deleteTarget && !bulkDeleteOpen && (
        <DeleteShiftModal
          shift={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={(ids) => handleDeleteDone(ids)}
        />
      )}

      {/* Bulk delete */}
      {bulkDeleteOpen && (
        <DeleteShiftModal
          ids={[...selected]}
          onClose={() => setBulkDeleteOpen(false)}
          onDeleted={(ids) => handleDeleteDone(ids)}
        />
      )}

      {/* Success message */}
      {successMsg && (
        <SuccessModal message={successMsg} onClose={() => setSuccessMsg('')} />
      )}
    </div>
  )
}

function ActionMenu({ shift, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-[7px] hover:bg-gray-50 text-gray-700"
      >
        Hành động
        <ChevronDown size={13} />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[140px]"
          onMouseDown={e => e.stopPropagation()}
        >
          <button
            onClick={() => { setOpen(false); onEdit() }}
            className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-t-xl"
          >
            Chỉnh sửa
          </button>
          <button
            onClick={() => { setOpen(false); onDelete() }}
            className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-100 rounded-b-xl"
          >
            Xóa
          </button>
        </div>
      )}
    </div>
  )
}
