import { useState, useEffect, useRef } from 'react'
import {
  MapPin, Search, ChevronRight, ChevronLeft, ChevronDown,
  Plus, Filter, Download, Upload,
} from 'lucide-react'
import api from '../../../api/axios'
import AddLocationModal from './AddLocationModal'
import EditLocationModal from './EditLocationModal'
import SuccessModal from '../../common/SuccessModal'

const ITEMS_PER_PAGE = 5

const LOCATIONS_FALLBACK = [
  { id: 5, code: 'MDD005', name: 'Cua hang Van Don',         address: '88 Van Don, Son Tra, Da Nang',       phone: '0236 567 8901', status: 'active'   },
  { id: 4, code: 'MDD004', name: 'Khu vuc nguyen vat lieu',  address: '45 Le Duan, Hai Chau, Da Nang',      phone: '0236 456 7890', status: 'active'   },
  { id: 3, code: 'MDD003', name: 'Khu vuc bep',              address: '45 Le Duan, Hai Chau, Da Nang',      phone: '0236 345 6789', status: 'active'   },
  { id: 2, code: 'MDD002', name: 'Khu vuc ban thanh pham',   address: '45 Le Duan, Hai Chau, Da Nang',      phone: '0236 234 5678', status: 'active'   },
  { id: 1, code: 'MDD001', name: 'Cua hang Ngu Hanh Son',    address: '120 Nguyen Duy Hieu, Da Nang',       phone: '0236 123 4567', status: 'inactive' },
]

export default function LocationsPage() {
  const [locations, setLocations]           = useState(LOCATIONS_FALLBACK)
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [statusFilter, setStatusFilter]     = useState('all')
  const [currentPage, setCurrentPage]       = useState(1)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [filterOpen, setFilterOpen]         = useState(false)
  const [selected, setSelected]             = useState(new Set())
  const [deleteTarget, setDeleteTarget]     = useState(null)
  const [deleteLoading, setDeleteLoading]   = useState(false)
  const [addModalOpen, setAddModalOpen]     = useState(false)
  const [editTarget, setEditTarget]         = useState(null)
  const [pendingEdit, setPendingEdit]       = useState(null)
  const [successMsg, setSuccessMsg]         = useState(null)
  const filterRef = useRef(null)

  const loadLocations = () => {
    setLoading(true)
    api.get('locations/')
      .then(res  => setLocations(res.data.locations))
      .catch(()  => setLocations(LOCATIONS_FALLBACK))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadLocations() }, [])

  useEffect(() => {
    if (!filterOpen) return
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [filterOpen])

  useEffect(() => {
    if (!openDropdownId) return
    const handler = () => setOpenDropdownId(null)
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openDropdownId])

  const filtered = locations.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
                        l.code.toLowerCase().includes(search.toLowerCase()) ||
                        (l.address || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged      = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleSearchChange = (v) => { setSearch(v); setCurrentPage(1) }
  const handleStatusFilter = (v) => { setStatusFilter(v); setCurrentPage(1); setFilterOpen(false) }

  const allPageChecked = paged.length > 0 && paged.every(l => selected.has(l.id))
  const toggleAll = () => {
    if (allPageChecked) {
      setSelected(prev => { const s = new Set(prev); paged.forEach(l => s.delete(l.id)); return s })
    } else {
      setSelected(prev => { const s = new Set(prev); paged.forEach(l => s.add(l.id)); return s })
    }
  }
  const toggleOne = (id) => setSelected(prev => {
    const s = new Set(prev)
    s.has(id) ? s.delete(id) : s.add(id)
    return s
  })

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await api.delete(`locations/${deleteTarget.id}/`)
      setLocations(prev => prev.filter(l => l.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // keep modal open on error
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAddSaved = (newLocation) => {
    setLocations(prev => [newLocation, ...prev])
    setAddModalOpen(false)
    setPendingEdit(newLocation)
    setSuccessMsg(`Địa điểm "${newLocation.name}" đã được thêm thành công!`)
  }

  const handleSuccessClose = () => {
    setSuccessMsg(null)
    if (pendingEdit) {
      setEditTarget(pendingEdit)
      setPendingEdit(null)
    }
  }

  const handleEditSaved = (updatedLocation) => {
    setLocations(prev => prev.map(l => l.id === updatedLocation.id ? updatedLocation : l))
    setEditTarget(null)
    setSuccessMsg(`Địa điểm "${updatedLocation.name}" đã được cập nhật thành công!`)
  }

  return (
    <div>
      {/* ── Page header ─── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">DANH SÁCH ĐỊA ĐIỂM</h1>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1 flex-wrap">
            <span>Cài đặt</span>
            <ChevronRight size={13} />
            <span className="text-orange-500 font-medium">Danh sách địa điểm</span>
          </div>
        </div>
        <div className="flex-shrink-0 mt-1 flex gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-500 text-sm font-semibold rounded-lg hover:bg-orange-100 transition-colors">
            <Upload size={15} />
            Nhập
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-500 text-sm font-semibold rounded-lg hover:bg-orange-100 transition-colors">
            <Download size={15} />
            Xuất
          </button>
        </div>
      </div>

      {/* ── Table card ─── */}
      <div className="bg-white rounded-xl border border-gray-200">

        {/* Toolbar */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100 flex-wrap">
          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Tìm kiếm địa điểm"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
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
              {statusFilter !== 'all' && (
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              )}
            </button>

            {filterOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Trạng thái</p>
                <div className="space-y-1">
                  {[
                    { value: 'all',      label: 'Tất cả' },
                    { value: 'active',   label: 'Đang hoạt động' },
                    { value: 'inactive', label: 'Tạm ngưng' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusFilter(opt.value)}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        statusFilter === opt.value
                          ? 'bg-orange-50 text-orange-600 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors ${
                        statusFilter === opt.value
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300 bg-white'
                      }`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => handleStatusFilter('all')}
                    className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Đặt lại bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Add button */}
          <div className="ml-auto">
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: '#E67E22' }}
            >
              <Plus size={15} />
              Thêm địa điểm
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={allPageChecked}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-orange-500"
                  />
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã Địa Điểm</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tên Địa Điểm</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Địa Chỉ</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">SĐT</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                    {loading ? 'Đang tải...' : 'Không tìm thấy địa điểm nào.'}
                  </td>
                </tr>
              ) : (
                paged.map(l => (
                  <tr
                    key={l.id}
                    className={`hover:bg-gray-50/60 transition-colors ${selected.has(l.id) ? 'bg-orange-50/40' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.has(l.id)}
                        onChange={() => toggleOne(l.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-orange-500"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-600 font-semibold">{l.code}</td>
                    <td className="px-4 py-3.5 text-gray-800 font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <MapPin size={14} className="text-orange-400" />
                        </div>
                        {l.name}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm max-w-[220px] truncate">{l.address || '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm">{l.phone || '—'}</td>
                    {/* Status badge */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${
                          l.status === 'active'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-red-50 text-red-500'
                        }`}
                      >
                        {l.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>
                    {/* Action dropdown */}
                    <td className="px-4 py-3.5 text-center">
                      <div
                        className="relative inline-block"
                        onMouseDown={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === l.id ? null : l.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Hành động
                          <ChevronDown size={13} className="text-gray-400" />
                        </button>
                        {openDropdownId === l.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            <button
                              onClick={() => { setEditTarget(l); setOpenDropdownId(null) }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => { setDeleteTarget(l); setOpenDropdownId(null) }}
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
            Hiển thị{' '}
            <span className="font-bold text-gray-700">{paged.length}</span>{' '}
            trên tổng số{' '}
            <span className="font-bold text-orange-500">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Add Location Modal ─────────────────────────────────────────────── */}
      {addModalOpen && (
        <AddLocationModal
          onClose={() => setAddModalOpen(false)}
          onSaved={handleAddSaved}
        />
      )}

      {/* ── Edit Location Modal ────────────────────────────────────────────── */}
      {editTarget && (
        <EditLocationModal
          location={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleEditSaved}
        />
      )}

      {/* ── Success Modal ──────────────────────────────────────────────────── */}
      {successMsg && (
        <SuccessModal
          message={successMsg}
          onClose={handleSuccessClose}
        />
      )}

      {/* ── Delete confirm dialog ──────────────────────────────────────────── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !deleteLoading) setDeleteTarget(null) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-gray-600 mb-5">
              Bạn có chắc muốn xóa địa điểm{' '}
              <span className="font-semibold text-gray-800">{deleteTarget.name}</span>?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex items-center gap-1.5 px-5 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {deleteLoading && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
