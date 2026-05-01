import { useState, useEffect } from 'react'
import { Search, Plus, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import api from '../../../../api/axios'
import DeleteWorkScheduleModal from './DeleteWorkScheduleModal'
import SuccessModal from '../../../common/SuccessModal'

const STATUS_LABEL = { active: 'Đang hoạt động', inactive: 'Ngưng hoạt động' }
const STATUS_STYLE = { active: 'bg-blue-50 text-blue-600', inactive: 'bg-red-50 text-red-500' }

const REPEAT_LABEL = { once: 'Một lần', weekly: 'Hằng tuần', monthly: 'Hằng tháng' }

const DAY_NAMES = { '1': 'T2', '2': 'T3', '3': 'T4', '4': 'T5', '5': 'T6', '6': 'T7', '7': 'CN' }

function fmtDays(str) {
  if (!str) return '--'
  return str.split(',').map(d => DAY_NAMES[d] || d).join(', ')
}

function fmtDate(d) {
  if (!d) return '--'
  const [y, m, dd] = d.split('-')
  return `${dd}/${m}/${y}`
}

function SortIcon({ field, ordering }) {
  return (
    <span className="inline-flex flex-col ml-1 align-middle">
      <ChevronUp   size={10} className={ordering === field        ? 'text-orange-500' : 'text-gray-300'} />
      <ChevronDown size={10} className={ordering === `-${field}`  ? 'text-orange-500' : 'text-gray-300'} />
    </span>
  )
}

const PAGE_SIZE = 10

export default function WorkScheduleListPage({ onCreateClick, onEditClick }) {
  const [schedules,    setSchedules]    = useState([])
  const [total,        setTotal]        = useState(0)
  const [loading,      setLoading]      = useState(false)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [ordering,     setOrdering]     = useState('-id')
  const [page,         setPage]         = useState(1)
  const [selected,     setSelected]     = useState(new Set())
  const [openMenuId,   setOpenMenuId]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [bulkDelOpen,  setBulkDelOpen]  = useState(false)
  const [successMsg,   setSuccessMsg]   = useState('')

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  async function fetchSchedules() {
    setLoading(true)
    try {
      const params = { ordering }
      if (search)       params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await api.get('/schedules/', { params })
      const all  = res.data.schedules || []
      setTotal(all.length)
      const start = (page - 1) * PAGE_SIZE
      setSchedules(all.slice(start, start + PAGE_SIZE))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSchedules() }, [search, statusFilter, ordering, page])

  function toggleSort(field) {
    setOrdering(o => o === field ? `-${field}` : field)
    setPage(1)
  }

  function toggleAll(e) {
    setSelected(e.target.checked ? new Set(schedules.map(s => s.id)) : new Set())
  }

  function toggleOne(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleDeleteDone(ids) {
    setSchedules(prev => prev.filter(s => !ids.includes(s.id)))
    setTotal(prev => prev - ids.length)
    setSelected(new Set())
    setDeleteTarget(null)
    setBulkDelOpen(false)
    setSuccessMsg('Xóa lịch làm việc thành công!')
  }

  const statusOptions = [
    { value: '',         label: 'Tất cả trạng thái' },
    { value: 'active',   label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Ngưng hoạt động' },
  ]

  const allChecked = schedules.length > 0 && schedules.every(s => selected.has(s.id))

  return (
    <div className="p-6 font-nunito-sans">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-1">
        Nhân sự &rsaquo; Quản lý chấm công &rsaquo; <span className="text-gray-800 font-semibold">Lịch làm việc</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Lịch làm việc</h1>

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
            <button
              onClick={() => setBulkDelOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg">
              <Trash2 size={15} /> Xóa đã chọn
            </button>
          </>
        ) : (
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 px-4 py-2 bg-[#E67E22] hover:bg-orange-600 text-white text-sm font-semibold rounded-lg">
            <Plus size={15} /> Thêm lịch làm việc
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
                MÃ LỊCH <SortIcon field="code" ordering={ordering} />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">NHÂN VIÊN</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">CA LÀM VIỆC</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs cursor-pointer"
                onClick={() => toggleSort('start_date')}>
                NGÀY BẮT ĐẦU <SortIcon field="start_date" ordering={ordering} />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">KIỂU LẶP</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">TRẠNG THÁI</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">Đang tải...</td></tr>
            ) : schedules.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">Không có dữ liệu</td></tr>
            ) : schedules.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-orange-50/30">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleOne(s.id)}
                    className="rounded checked:bg-[#E67E22] checked:border-[#E67E22] focus:ring-2 focus:ring-orange-300 focus:ring-offset-0" />
                </td>
                <td className="px-4 py-3 font-medium text-[#E67E22]">{s.code}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{s.employee_name}</div>
                  <div className="text-xs text-gray-400">{s.employee_code}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{s.shift_name || '--'}</td>
                <td className="px-4 py-3 text-gray-600">{fmtDate(s.start_date)}</td>
                <td className="px-4 py-3 text-gray-600">
                  <div>{REPEAT_LABEL[s.repeat_type] || s.repeat_type}</div>
                  {s.repeat_type === 'weekly' && s.days_of_week && (
                    <div className="text-xs text-gray-400">{fmtDays(s.days_of_week)}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${STATUS_STYLE[s.status] || 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABEL[s.status] || s.status}
                  </span>
                </td>
                <td className="px-4 py-3 relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1">
                    Hành động <ChevronDown size={14} />
                  </button>
                  {openMenuId === s.id && (
                    <div className="absolute right-4 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[130px]"
                      onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setOpenMenuId(null); onEditClick(s) }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm rounded-t-xl">
                        Chỉnh sửa
                      </button>
                      <button onClick={() => { setOpenMenuId(null); setDeleteTarget(s) }}
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
        <span>Tổng {total} lịch làm việc</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span>Trang {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Modals */}
      {deleteTarget && (
        <DeleteWorkScheduleModal schedule={deleteTarget} onDeleted={handleDeleteDone} onClose={() => setDeleteTarget(null)} />
      )}
      {bulkDelOpen && (
        <DeleteWorkScheduleModal ids={[...selected]} onDeleted={handleDeleteDone} onClose={() => setBulkDelOpen(false)} />
      )}
      {successMsg && (
        <SuccessModal message={successMsg} onClose={() => setSuccessMsg('')} />
      )}
    </div>
  )
}
