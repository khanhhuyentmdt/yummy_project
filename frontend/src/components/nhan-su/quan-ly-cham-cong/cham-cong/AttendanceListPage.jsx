import { useState, useEffect } from 'react'
import { Search, Plus, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import api from '../../../../api/axios'
import DeleteAttendanceModal from './DeleteAttendanceModal'
import SuccessModal from '../../../common/SuccessModal'

const STATUS_LABEL = {
  present:     'Có mặt',
  absent:      'Vắng mặt',
  late:        'Đi trễ',
  early_leave: 'Về sớm',
  leave:       'Nghỉ phép',
}
const STATUS_STYLE = {
  present:     'bg-green-50 text-green-600',
  absent:      'bg-red-50 text-red-500',
  late:        'bg-yellow-50 text-yellow-600',
  early_leave: 'bg-orange-50 text-orange-500',
  leave:       'bg-blue-50 text-blue-600',
}

function fmtDate(d) {
  if (!d) return '--'
  const [y, m, dd] = d.split('-')
  return `${dd}/${m}/${y}`
}

function fmtTime(t) {
  if (!t) return '--'
  return t.slice(0, 5)
}

function SortIcon({ field, ordering }) {
  return (
    <span className="inline-flex flex-col ml-1 align-middle">
      <ChevronUp   size={10} className={ordering === field       ? 'text-orange-500' : 'text-gray-300'} />
      <ChevronDown size={10} className={ordering === `-${field}` ? 'text-orange-500' : 'text-gray-300'} />
    </span>
  )
}

const PAGE_SIZE = 10

export default function AttendanceListPage({ onCreateClick, onEditClick }) {
  const [records,      setRecords]     = useState([])
  const [total,        setTotal]       = useState(0)
  const [loading,      setLoading]     = useState(false)
  const [search,       setSearch]      = useState('')
  const [statusFilter, setStatusFilter]= useState('')
  const [ordering,     setOrdering]    = useState('-id')
  const [page,         setPage]        = useState(1)
  const [selected,     setSelected]    = useState(new Set())
  const [openMenuId,   setOpenMenuId]  = useState(null)
  const [deleteTarget, setDeleteTarget]= useState(null)
  const [bulkDelOpen,  setBulkDelOpen] = useState(false)
  const [successMsg,   setSuccessMsg]  = useState('')

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  async function fetchAttendances() {
    setLoading(true)
    try {
      const params = { ordering }
      if (search)       params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await api.get('/attendances/', { params })
      const all  = res.data.attendances || []
      setTotal(all.length)
      const start = (page - 1) * PAGE_SIZE
      setRecords(all.slice(start, start + PAGE_SIZE))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAttendances() }, [search, statusFilter, ordering, page])

  function toggleSort(field) {
    setOrdering(o => o === field ? `-${field}` : field)
    setPage(1)
  }

  function toggleAll(e) {
    setSelected(e.target.checked ? new Set(records.map(r => r.id)) : new Set())
  }

  function toggleOne(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleDeleteDone(ids) {
    setRecords(prev => prev.filter(r => !ids.includes(r.id)))
    setTotal(prev => prev - ids.length)
    setSelected(new Set())
    setDeleteTarget(null)
    setBulkDelOpen(false)
    setSuccessMsg('Xóa bản ghi chấm công thành công!')
  }

  const statusOptions = [
    { value: '',            label: 'Tất cả trạng thái' },
    { value: 'present',     label: 'Có mặt' },
    { value: 'absent',      label: 'Vắng mặt' },
    { value: 'late',        label: 'Đi trễ' },
    { value: 'early_leave', label: 'Về sớm' },
    { value: 'leave',       label: 'Nghỉ phép' },
  ]

  const allChecked = records.length > 0 && records.every(r => selected.has(r.id))

  return (
    <div className="p-6 font-nunito-sans">
      <div className="text-sm text-gray-500 mb-1">
        Nhân sự &rsaquo; Quản lý chấm công &rsaquo; <span className="text-gray-800 font-semibold">Chấm công</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Chấm công</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="Tìm kiếm theo mã, nhân viên..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {selected.size > 0 ? (
          <>
            <span className="text-sm text-gray-600">{selected.size} được chọn</span>
            <button onClick={() => setBulkDelOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg">
              <Trash2 size={15} /> Xóa đã chọn
            </button>
          </>
        ) : (
          <button onClick={onCreateClick}
            className="flex items-center gap-2 px-4 py-2 bg-[#E67E22] hover:bg-orange-600 text-white text-sm font-semibold rounded-lg">
            <Plus size={15} /> Thêm chấm công
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allChecked} onChange={toggleAll}
                  className="rounded checked:bg-[#E67E22] checked:border-[#E67E22] focus:ring-2 focus:ring-orange-300 focus:ring-offset-0" />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs cursor-pointer"
                onClick={() => toggleSort('code')}>
                MÃ <SortIcon field="code" ordering={ordering} />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">NHÂN VIÊN</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs cursor-pointer"
                onClick={() => toggleSort('attendance_date')}>
                NGÀY <SortIcon field="attendance_date" ordering={ordering} />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">CA LÀM VIỆC</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">GIỜ VÀO</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">GIỜ RA</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">TRẠNG THÁI</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400">Đang tải...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400">Không có dữ liệu</td></tr>
            ) : records.map(r => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-orange-50/30">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)}
                    className="rounded checked:bg-[#E67E22] checked:border-[#E67E22] focus:ring-2 focus:ring-orange-300 focus:ring-offset-0" />
                </td>
                <td className="px-4 py-3 font-medium text-[#E67E22]">{r.code}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{r.employee_name}</div>
                  <div className="text-xs text-gray-400">{r.employee_code}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{fmtDate(r.attendance_date)}</td>
                <td className="px-4 py-3 text-gray-600">{r.shift_name || '--'}</td>
                <td className="px-4 py-3 text-gray-600">{fmtTime(r.check_in_time)}</td>
                <td className="px-4 py-3 text-gray-600">{fmtTime(r.check_out_time)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${STATUS_STYLE[r.status] || 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABEL[r.status] || r.status}
                  </span>
                </td>
                <td className="px-4 py-3 relative">
                  <button onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1">
                    Hành động <ChevronDown size={14} />
                  </button>
                  {openMenuId === r.id && (
                    <div className="absolute right-4 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[130px]"
                      onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setOpenMenuId(null); onEditClick(r) }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm rounded-t-xl">
                        Chỉnh sửa
                      </button>
                      <button onClick={() => { setOpenMenuId(null); setDeleteTarget(r) }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-500 rounded-b-xl">
                        Xóa
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
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <span>Tổng {total} bản ghi</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span>Trang {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      </div>

      {deleteTarget && (
        <DeleteAttendanceModal attendance={deleteTarget} onDeleted={handleDeleteDone} onClose={() => setDeleteTarget(null)} />
      )}
      {bulkDelOpen && (
        <DeleteAttendanceModal ids={[...selected]} onDeleted={handleDeleteDone} onClose={() => setBulkDelOpen(false)} />
      )}
      {successMsg && (
        <SuccessModal message={successMsg} onClose={() => setSuccessMsg('')} />
      )}
    </div>
  )
}
