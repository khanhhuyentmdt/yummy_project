import { useState, useEffect, useRef } from 'react'
import {
  Package, Search, ChevronRight, ChevronLeft, ChevronDown,
  Plus, Filter, Download,
} from 'lucide-react'
import api from '../../../../../api/axios'
import { useSort, SortableTh } from '../../../../../hooks/useSort'

const ITEMS_PER_PAGE = 5

const MATERIALS_FALLBACK = [
  { id: 10, code: 'NVL010', name: 'Bot tau hu Singapore',   group: 'Do kho',   unit: 'kilogram', status: 'active',   image: '' },
  { id: 9,  code: 'NVL009', name: 'Sua tuoi khong duong',   group: 'Sua',      unit: 'lit',      status: 'active',   image: '' },
  { id: 8,  code: 'NVL008', name: 'Khoai lang tim',         group: 'Trai cay', unit: 'kilogram', status: 'inactive', image: '' },
  { id: 7,  code: 'NVL007', name: 'Ly nhua 700ml',          group: 'Bao bi',   unit: 'cai',      status: 'active',   image: '' },
  { id: 6,  code: 'NVL006', name: 'Bot Matcha nguyen chat', group: 'Do kho',   unit: 'gram',     status: 'inactive', image: '' },
]

export default function MaterialsPage({ onCreateClick, onEditClick }) {
  const [materials, setMaterials]         = useState(MATERIALS_FALLBACK)
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState('all')
  const [currentPage, setCurrentPage]     = useState(1)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [filterOpen, setFilterOpen]       = useState(false)
  const [selected, setSelected]           = useState(new Set())
  const [deleteTarget, setDeleteTarget]   = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const filterRef = useRef(null)
  const { sortKey, sortDir, handleSort, applySort } = useSort()

  const loadMaterials = () => {
    setLoading(true)
    api.get('materials/')
      .then(res  => setMaterials(res.data.materials))
      .catch(()  => setMaterials(MATERIALS_FALLBACK))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadMaterials() }, [])

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

  const filtered = materials.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.code.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || m.status === statusFilter
    return matchSearch && matchStatus
  })

  const sorted     = applySort(filtered)
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paged      = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleSearchChange = (v) => { setSearch(v); setCurrentPage(1) }
  const handleStatusFilter = (v) => { setStatusFilter(v); setCurrentPage(1); setFilterOpen(false) }

  const allPageChecked = paged.length > 0 && paged.every(m => selected.has(m.id))
  const toggleAll = () => {
    if (allPageChecked) {
      setSelected(prev => { const s = new Set(prev); paged.forEach(m => s.delete(m.id)); return s })
    } else {
      setSelected(prev => { const s = new Set(prev); paged.forEach(m => s.add(m.id)); return s })
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
      await api.delete(`materials/${deleteTarget.id}/`)
      setMaterials(prev => prev.filter(m => m.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // keep modal open on error
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      {/* ── Page header ─── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">NGUYÊN VẬT LIỆU</h1>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1 flex-wrap">
            <span>Nguyên vật liệu</span>
            <ChevronRight size={13} />
            <span>Thông tin nguyên vật liệu</span>
            <ChevronRight size={13} />
            <span className="text-orange-500 font-medium">Danh sách nguyên vật liệu</span>
          </div>
        </div>
        <div className="flex-shrink-0 mt-1">
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
              placeholder="Tìm kiếm nguyên vật liệu"
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
              onClick={onCreateClick}
              className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: '#E67E22' }}
            >
              <Plus size={15} />
              Thêm nguyên vật liệu
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
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
                <SortableTh columnKey="code"   label="Mã NVL"             sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="name"   label="Tên Nguyên Vật Liệu" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" colSpan={2} />
                <SortableTh columnKey="group"  label="Nhóm NVL"            sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="unit"   label="Đơn Vị Tính"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="status" label="Trạng Thái"          sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                    {loading ? 'Đang tải...' : 'Không tìm thấy nguyên vật liệu nào.'}
                  </td>
                </tr>
              ) : (
                paged.map(m => (
                  <tr
                    key={m.id}
                    className={`hover:bg-gray-50/60 transition-colors ${selected.has(m.id) ? 'bg-orange-50/40' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.has(m.id)}
                        onChange={() => toggleOne(m.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-orange-500"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-600 font-semibold">{m.code}</td>
                    {/* Thumbnail */}
                    <td className="px-2 py-2.5 w-14">
                      {m.image ? (
                        <img
                          src={m.image}
                          alt={m.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-100 flex items-center justify-center">
                          <Package size={18} className="text-gray-300" />
                        </div>
                      )}
                    </td>
                    {/* Name */}
                    <td className="px-4 py-3.5 text-gray-800 font-semibold">{m.name}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm">{m.group}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm">{m.unit}</td>
                    {/* Status badge */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${
                          m.status === 'active'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-red-50 text-red-500'
                        }`}
                      >
                        {m.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>
                    {/* Action dropdown */}
                    <td className="px-4 py-3.5 text-center">
                      <div
                        className="relative inline-block"
                        onMouseDown={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === m.id ? null : m.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Hành động
                          <ChevronDown size={13} className="text-gray-400" />
                        </button>
                        {openDropdownId === m.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            <button
                              onClick={() => { onEditClick && onEditClick(m); setOpenDropdownId(null) }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => { setDeleteTarget(m); setOpenDropdownId(null) }}
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
            <span className="font-bold text-orange-500">{sorted.length}</span>
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

      {/* ── Delete confirm dialog ──────────────────────────────────────────── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !deleteLoading) setDeleteTarget(null) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-gray-600 mb-5">
              Bạn có chắc muốn xóa nguyên vật liệu{' '}
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
