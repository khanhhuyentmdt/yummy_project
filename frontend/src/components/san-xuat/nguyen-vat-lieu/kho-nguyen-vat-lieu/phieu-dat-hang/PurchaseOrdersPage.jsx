import { useState, useEffect, useRef } from 'react'
import {
  Search, ChevronRight, ChevronLeft, ChevronDown,
  Plus, Filter, Download,
} from 'lucide-react'
import api from '../../../../../api/axios'
import { useSort, SortableTh } from '../../../../../hooks/useSort'

const ITEMS_PER_PAGE = 10

const STATUS_CONFIG = {
  draft:     { label: 'Lưu nháp', cls: 'bg-gray-100 text-gray-600' },
  waiting:   { label: 'Chờ nhận', cls: 'bg-yellow-50 text-yellow-600' },
  received:  { label: 'Đã nhận',  cls: 'bg-green-50 text-green-600'  },
  cancelled: { label: 'Đã hủy',   cls: 'bg-red-50 text-red-500'      },
}

const FALLBACK = [
  { id: 5, code: 'PDH005', supplier_name: 'Tổng kho Bột Thực phẩm miền Trung',       total_value: '2500000', status: 'draft',     created_at: '2026-03-12T10:30:00' },
  { id: 4, code: 'PDH004', supplier_name: 'NPP Trà & Nguyên liệu pha chế Lộc Phát',  total_value: '1200000', status: 'waiting',   created_at: '2026-03-14T13:31:00' },
  { id: 3, code: 'PDH003', supplier_name: 'Công ty CP Sữa Việt Nam (Vinamilk)',       total_value: '5400000', status: 'received',  created_at: '2026-03-14T10:03:00' },
  { id: 2, code: 'PDH002', supplier_name: 'Thực phẩm Đông lạnh Hải Nam',             total_value: '3100000', status: 'draft',     created_at: '2026-03-01T10:03:00' },
  { id: 1, code: 'PDH001', supplier_name: 'Xưởng in & Sản xuất bao bì nhựa',         total_value:  '800000', status: 'cancelled', created_at: '2026-02-15T08:42:00' },
]

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN').format(Number(val)) + ' đ'

const formatDate = (iso) => {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all',      label: 'Tất cả' },
  { value: 'draft',    label: 'Lưu nháp' },
  { value: 'waiting',  label: 'Chờ nhận' },
  { value: 'received', label: 'Đã nhận'  },
  { value: 'cancelled',label: 'Đã hủy'   },
]

export default function PurchaseOrdersPage({ onCreateClick }) {
  const [orders, setOrders]               = useState(FALLBACK)
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

  const loadOrders = () => {
    setLoading(true)
    api.get('purchase-orders/')
      .then(res  => setOrders(res.data.purchase_orders))
      .catch(()  => setOrders(FALLBACK))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadOrders() }, [])

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

  const filtered = orders.filter(o => {
    const matchSearch = o.code.toLowerCase().includes(search.toLowerCase()) ||
                        o.supplier_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const sorted     = applySort(filtered)
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paged      = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleSearchChange = (v) => { setSearch(v); setCurrentPage(1) }
  const handleStatusFilter = (v) => { setStatusFilter(v); setCurrentPage(1); setFilterOpen(false) }

  const allPageChecked = paged.length > 0 && paged.every(o => selected.has(o.id))
  const toggleAll = () => {
    if (allPageChecked) {
      setSelected(prev => { const s = new Set(prev); paged.forEach(o => s.delete(o.id)); return s })
    } else {
      setSelected(prev => { const s = new Set(prev); paged.forEach(o => s.add(o.id)); return s })
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
      await api.delete(`purchase-orders/${deleteTarget.id}/`)
      setOrders(prev => prev.filter(o => o.id !== deleteTarget.id))
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
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">PHIẾU ĐẶT HÀNG</h1>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1 flex-wrap">
            <span>Nguyên vật liệu</span>
            <ChevronRight size={13} />
            <span>Kho nguyên vật liệu</span>
            <ChevronRight size={13} />
            <span className="text-orange-500 font-medium">Danh sách phiếu đặt hàng</span>
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
              placeholder="Tìm kiếm phiếu đặt hàng"
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
                  {STATUS_FILTER_OPTIONS.map(opt => (
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
              Thêm phiếu đặt hàng
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
                <SortableTh columnKey="code"          label="Mã Phiếu"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="created_at"    label="Ngày Tạo Phiếu" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="supplier_name" label="Nhà Cung Cấp"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="total_value"   label="Tổng Giá Trị"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right" />
                <SortableTh columnKey="status"        label="Trạng Thái"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                    {loading ? 'Đang tải...' : 'Không tìm thấy phiếu đặt hàng nào.'}
                  </td>
                </tr>
              ) : (
                paged.map(o => {
                  const st = STATUS_CONFIG[o.status] || STATUS_CONFIG.draft
                  return (
                    <tr
                      key={o.id}
                      className={`hover:bg-gray-50/60 transition-colors ${selected.has(o.id) ? 'bg-orange-50/40' : ''}`}
                    >
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected.has(o.id)}
                          onChange={() => toggleOne(o.id)}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-orange-500"
                        />
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-700 font-semibold">{o.code}</td>
                      <td className="px-4 py-3.5 text-gray-600 text-sm">{formatDate(o.created_at)}</td>
                      <td className="px-4 py-3.5 text-gray-800 font-medium">{o.supplier_name}</td>
                      <td className="px-4 py-3.5 text-right text-gray-800 font-semibold tabular-nums">
                        {formatCurrency(o.total_value)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div
                          className="relative inline-block"
                          onMouseDown={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === o.id ? null : o.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Hành động
                            <ChevronDown size={13} className="text-gray-400" />
                          </button>
                          {openDropdownId === o.id && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                              <button
                                onClick={() => setOpenDropdownId(null)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                Xem chi tiết
                              </button>
                              <button
                                onClick={() => setOpenDropdownId(null)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                Chỉnh sửa
                              </button>
                              <button
                                onClick={() => { setDeleteTarget(o); setOpenDropdownId(null) }}
                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
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

      {/* ── Delete confirm dialog ────────────────────────────────────────────── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !deleteLoading) setDeleteTarget(null) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-gray-600 mb-5">
              Bạn có chắc muốn xóa phiếu đặt hàng{' '}
              <span className="font-semibold text-gray-800">{deleteTarget.code}</span>?
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
