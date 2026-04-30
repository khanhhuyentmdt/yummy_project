import { useState, useEffect, useRef } from 'react'
import {
  Users, Search, ChevronRight, ChevronLeft, ChevronDown,
  Plus, Filter, Download, Trash2, UserCircle,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import api from '../../../../api/axios'
import { useSort, SortableTh } from '../../../../hooks/useSort'
import DeleteEmployeeModal from './DeleteEmployeeModal'
import SuccessModal from '../../../common/SuccessModal'

const ITEMS_PER_PAGE = 5

const CB = 'cursor-pointer w-4 h-4 rounded'
const cbStyle = { accentColor: '#E67E22' }

export default function EmployeesPage({ onCreateClick, onEditClick }) {
  const [employees, setEmployees]         = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState('all')
  const [currentPage, setCurrentPage]     = useState(1)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [filterOpen, setFilterOpen]       = useState(false)
  const [selected, setSelected]           = useState(new Set())
  const [deleteTarget, setDeleteTarget]   = useState(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [successMsg, setSuccessMsg]       = useState(null)
  const filterRef = useRef(null)
  const { sortKey, sortDir, handleSort, applySort } = useSort()

  const loadEmployees = () => {
    setLoading(true)
    api.get('employees/')
      .then(res  => setEmployees(res.data.employees || []))
      .catch(()  => setEmployees([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadEmployees() }, [])

  useEffect(() => {
    if (!filterOpen) return
    const h = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [filterOpen])

  useEffect(() => {
    if (!openDropdownId) return
    const h = () => setOpenDropdownId(null)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [openDropdownId])

  const filtered = employees.filter(e => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      e.full_name.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q) ||
      e.phone.toLowerCase().includes(q) ||
      (e.role || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    return matchSearch && matchStatus
  })

  const sorted     = applySort(filtered)
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paged      = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const allPageChecked = paged.length > 0 && paged.every(e => selected.has(e.id))
  const toggleAll = () => {
    if (allPageChecked) {
      setSelected(prev => { const s = new Set(prev); paged.forEach(e => s.delete(e.id)); return s })
    } else {
      setSelected(prev => { const s = new Set(prev); paged.forEach(e => s.add(e.id)); return s })
    }
  }
  const toggleOne = (id) => setSelected(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s
  })

  const handleDeleteDone = (deletedIds) => {
    const idSet = new Set(deletedIds)
    setEmployees(prev => prev.filter(e => !idSet.has(e.id)))
    setSelected(new Set())
    setDeleteTarget(null)
    setBulkDeleteOpen(false)
    const n = idSet.size
    setSuccessMsg(n === 1 ? 'Nhân viên đã được xóa thành công!' : `${n} nhân viên đã được xóa thành công!`)
  }

  const handleExport = () => {
    const rows = sorted.map(e => ({
      'Mã TK': e.code,
      'Họ và tên': e.full_name,
      'SĐT': e.phone,
      'Vai trò': e.role,
      'Khu vực làm việc': e.work_area_name,
      'Ngày vào làm': e.start_date || '',
      'Trạng thái': e.status === 'working' ? 'Đang làm việc' : 'Ngưng làm việc',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Nhan vien')
    XLSX.writeFile(wb, 'danh-sach-nhan-vien.xlsx')
  }

  const formatDate = (d) => {
    if (!d) return '—'
    const dt = new Date(d)
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()} ${String(dt.getHours()).padStart(2,'0')}:00`
  }

  return (
    <div>
      {/* ── Page header ─── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">DANH SÁCH HỒ SƠ NHÂN VIÊN</h1>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1 flex-wrap">
            <span>Thiết lập nhân viên</span>
            <ChevronRight size={13} />
            <span className="text-orange-500 font-medium">Danh sách hồ sơ nhân viên</span>
          </div>
        </div>
        <div className="flex-shrink-0 mt-1">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-500 text-sm font-semibold rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Download size={15} />
            Xuất
          </button>
        </div>
      </div>

      {/* ── Table card ─── */}
      <div className="bg-white rounded-xl border border-gray-200">

        {/* Toolbar */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100 flex-wrap">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Tìm kiếm hồ sơ nhân viên"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Filter */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(v => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 border text-sm font-semibold rounded-lg transition-colors ${
                statusFilter !== 'all'
                  ? 'bg-orange-50 border-orange-300 text-orange-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter size={14} />
              Bộ lọc
              {statusFilter !== 'all' && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />}
            </button>
            {filterOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Trạng thái</p>
                <div className="space-y-1">
                  {[
                    { value: 'all',     label: 'Tất cả' },
                    { value: 'working', label: 'Đang làm việc' },
                    { value: 'stopped', label: 'Ngưng làm việc' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setStatusFilter(opt.value); setCurrentPage(1); setFilterOpen(false) }}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        statusFilter === opt.value ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors ${
                        statusFilter === opt.value ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-white'
                      }`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action zone */}
          <div className="ml-auto flex items-center gap-3">
            {selected.size > 0 ? (
              <>
                <span className="text-sm text-gray-600 font-medium">{selected.size} được chọn</span>
                <button
                  onClick={() => setBulkDeleteOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={14} />
                  Xóa đã chọn
                </button>
              </>
            ) : (
              <button
                onClick={onCreateClick}
                className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-[7px] hover:opacity-90 active:opacity-80 transition-opacity"
                style={{ backgroundColor: '#E67E22' }}
              >
                <Plus size={15} />
                Thêm hồ sơ
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3.5 w-10">
                  <input type="checkbox" checked={allPageChecked} onChange={toggleAll} className={CB} style={cbStyle} />
                </th>
                <SortableTh columnKey="code"       label="MÃ TK"              sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="full_name"  label="HỌ VÀ TÊN"          sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="role"       label="VAI TRÒ"            sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="work_area_name" label="KHU VỰC LÀM VIỆC" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="start_date" label="NGÀY VÀO LÀM"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="status"     label="TRẠNG THÁI"          sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                    {loading ? 'Đang tải...' : 'Không tìm thấy nhân viên nào.'}
                  </td>
                </tr>
              ) : (
                paged.map(emp => (
                  <tr
                    key={emp.id}
                    className={`hover:bg-gray-50/60 transition-colors ${selected.has(emp.id) ? 'bg-orange-50/40' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <input type="checkbox" checked={selected.has(emp.id)} onChange={() => toggleOne(emp.id)} className={CB} style={cbStyle} />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-600 font-semibold">{emp.code}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {emp.avatar_url ? (
                          <img src={emp.avatar_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                            <UserCircle size={20} className="text-orange-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{emp.full_name}</p>
                          <p className="text-xs text-gray-400">{emp.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-sm">{emp.role || '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm">{emp.work_area_name || '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm">{emp.start_date ? formatDate(emp.start_date) : '—'}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${
                        emp.status === 'working' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {emp.status === 'working' ? 'Đang làm việc' : 'Ngưng làm việc'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="relative inline-block" onMouseDown={e => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === emp.id ? null : emp.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Hành động
                          <ChevronDown size={13} className="text-gray-400" />
                        </button>
                        {openDropdownId === emp.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            <button
                              onClick={() => { onEditClick(emp); setOpenDropdownId(null) }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => { setDeleteTarget(emp); setOpenDropdownId(null) }}
                              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 flex items-center justify-between border-t border-gray-100 flex-wrap gap-3">
          <p className="text-xs text-gray-500">
            Hiển thị <span className="font-bold text-gray-700">{paged.length}</span> trên tổng số <span className="font-bold text-orange-500">{sorted.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i+1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                  currentPage === page ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages||totalPages===0} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {successMsg && <SuccessModal message={successMsg} onClose={() => setSuccessMsg(null)} />}

      {deleteTarget && (
        <DeleteEmployeeModal employee={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleteDone} />
      )}
      {bulkDeleteOpen && (
        <DeleteEmployeeModal ids={Array.from(selected)} onClose={() => setBulkDeleteOpen(false)} onDeleted={handleDeleteDone} />
      )}
    </div>
  )
}
