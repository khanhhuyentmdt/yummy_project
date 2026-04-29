import { useState, useEffect, useRef } from 'react'
import {
  Truck, Search, ChevronRight, ChevronLeft, ChevronDown,
  Plus, Filter, Download, Upload, Trash2,
} from 'lucide-react'
import api from '../../../api/axios'
import { useSort, SortableTh } from '../../../hooks/useSort'
import AddShippingUnitModal from './AddShippingUnitModal'
import EditShippingUnitModal from './EditShippingUnitModal'
import DeleteShippingUnitModal from './DeleteShippingUnitModal'
import SuccessModal from '../../common/SuccessModal'

const ITEMS_PER_PAGE = 5

const SHIPPING_UNITS_FALLBACK = [
  { id: 1, code: 'MDT001', name: 'Nguyễn Văn Hòa', phone: '090345681', city: 'Đà Nẵng', status: 'active' },
  { id: 2, code: 'MDT002', name: 'Trần Thị Bích Ngọc', phone: '0918234 69', city: 'Đà Nẵng', status: 'inactive' },
  { id: 3, code: 'MDT003', name: 'Lê Quang Thành', phone: '0932678415', city: 'Đà Nẵng', status: 'inactive' },
  { id: 4, code: 'MDT004', name: 'Phạm Minh Tuấn', phone: '0975341862', city: 'Đà Nẵng', status: 'active' },
]

export default function ShippingUnitsPage() {
  const [shippingUnits, setShippingUnits]   = useState(SHIPPING_UNITS_FALLBACK)
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [statusFilter, setStatusFilter]     = useState('all')
  const [currentPage, setCurrentPage]       = useState(1)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [filterOpen, setFilterOpen]         = useState(false)
  const [selected, setSelected]             = useState(new Set())
  const [deleteTarget, setDeleteTarget]     = useState(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [addModalOpen, setAddModalOpen]     = useState(false)
  const [editTarget, setEditTarget]         = useState(null)
  const [pendingEdit, setPendingEdit]       = useState(null)
  const [successMsg, setSuccessMsg]         = useState(null)
  const filterRef = useRef(null)
  const { sortKey, sortDir, handleSort, applySort } = useSort()

  const loadShippingUnits = () => {
    setLoading(true)
    api.get('shipping-units/')
      .then(res  => setShippingUnits(res.data.shipping_units))
      .catch(()  => setShippingUnits(SHIPPING_UNITS_FALLBACK))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadShippingUnits() }, [])

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

  const filtered = shippingUnits.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.code.toLowerCase().includes(search.toLowerCase()) ||
                        (s.phone || '').toLowerCase().includes(search.toLowerCase()) ||
                        (s.city || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const sorted     = applySort(filtered)
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paged      = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleSearchChange = (v) => { setSearch(v); setCurrentPage(1) }
  const handleStatusFilter = (v) => { setStatusFilter(v); setCurrentPage(1); setFilterOpen(false) }

  const allPageChecked = paged.length > 0 && paged.every(s => selected.has(s.id))
  const toggleAll = () => {
    if (allPageChecked) {
      setSelected(prev => { const s = new Set(prev); paged.forEach(item => s.delete(item.id)); return s })
    } else {
      setSelected(prev => { const s = new Set(prev); paged.forEach(item => s.add(item.id)); return s })
    }
  }
  const toggleOne = (id) => setSelected(prev => {
    const s = new Set(prev)
    s.has(id) ? s.delete(id) : s.add(id)
    return s
  })

  const handleDeleteDone = (deletedIds) => {
    const idSet = new Set(deletedIds)
    setShippingUnits(prev => prev.filter(s => !idSet.has(s.id)))
    setSelected(new Set())
    setDeleteTarget(null)
    setBulkDeleteOpen(false)
    const count = idSet.size
    setSuccessMsg(count === 1 ? 'Đối tác vận chuyển đã được xóa thành công!' : `${count} đối tác vận chuyển đã được xóa thành công!`)
  }

  const handleAddSaved = (newShippingUnit) => {
    setShippingUnits(prev => [newShippingUnit, ...prev])
    setAddModalOpen(false)
    setPendingEdit(newShippingUnit)
    setSuccessMsg(`Đối tác "${newShippingUnit.name}" đã được thêm thành công!`)
  }

  const handleSuccessClose = () => {
    setSuccessMsg(null)
    if (pendingEdit) {
      setEditTarget(pendingEdit)
      setPendingEdit(null)
    }
  }

  const handleEditSaved = (updatedShippingUnit) => {
    setShippingUnits(prev => prev.map(s => s.id === updatedShippingUnit.id ? updatedShippingUnit : s))
  }

  return (
    <div>
      {/* ── Page header ─── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">ĐỐI TÁC VẬN CHUYỂN</h1>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1 flex-wrap">
            <span>Cài đặt</span>
            <ChevronRight size={13} />
            <span className="text-orange-500 font-medium">Đối tác vận chuyển</span>
          </div>
        </div>
        <div className="flex-shrink-0 mt-1 flex gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
            Đối tác tích hợp
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: '#E67E22' }}>
            Đối tác tư liên hệ
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
              placeholder="Tìm kiếm đối tác vận chuyển"
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

          {/* Action zone */}
          <div className="ml-auto flex items-center gap-3">
            {selected.size > 0 ? (
              <>
                <span className="text-sm text-gray-600 font-medium">
                  {selected.size} được chọn
                </span>
                <button
                  onClick={() => setBulkDeleteOpen(true)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Xóa đã chọn
                </button>
              </>
            ) : (
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-[7px] hover:opacity-90 active:opacity-80 transition-opacity"
                style={{ backgroundColor: '#E67E22' }}
              >
                <Plus size={15} />
                Thêm đối tác
              </button>
            )}
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
                    className="cursor-pointer"
                  />
                </th>
                <SortableTh columnKey="code"   label="MÃ ĐỐI TÁC" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="name"   label="TÊN ĐỐI TÁC" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="phone"  label="SỐ ĐIỆN THOẠI" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="city"   label="TỈNH/THÀNH PHỐ" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="status" label="TRẠNG THÁI" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                    {loading ? 'Đang tải...' : 'Không tìm thấy đối tác vận chuyển nào.'}
                  </td>
                </tr>
              ) : (
                paged.map(s => (
                  <tr
                    key={s.id}
                    className={`hover:bg-gray-50/60 transition-colors ${selected.has(s.id) ? 'bg-orange-50/40' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={() => toggleOne(s.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-600 font-semibold">{s.code}</td>
                    <td className="px-4 py-3.5 text-gray-800 font-semibold">{s.name}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm">{s.phone || '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm">{s.city || '—'}</td>
                    {/* Status badge */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${
                          s.status === 'active'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-red-50 text-red-500'
                        }`}
                      >
                        {s.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                      </span>
                    </td>
                    {/* Action dropdown */}
                    <td className="px-4 py-3.5 text-center">
                      <div
                        className="relative inline-block"
                        onMouseDown={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === s.id ? null : s.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Hành động
                          <ChevronDown size={13} className="text-gray-400" />
                        </button>
                        {openDropdownId === s.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            <button
                              onClick={() => { setEditTarget(s); setOpenDropdownId(null) }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => { setDeleteTarget(s); setOpenDropdownId(null) }}
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

      {/* ── Modals ─── */}
      {addModalOpen && (
        <AddShippingUnitModal
          onClose={() => setAddModalOpen(false)}
          onSaved={handleAddSaved}
        />
      )}

      {editTarget && (
        <EditShippingUnitModal
          shippingUnit={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleEditSaved}
        />
      )}

      {successMsg && (
        <SuccessModal
          message={successMsg}
          onClose={handleSuccessClose}
        />
      )}

      {deleteTarget && (
        <DeleteShippingUnitModal
          shippingUnit={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleteDone}
        />
      )}

      {bulkDeleteOpen && (
        <DeleteShippingUnitModal
          ids={Array.from(selected)}
          onClose={() => setBulkDeleteOpen(false)}
          onDeleted={handleDeleteDone}
        />
      )}
    </div>
  )
}
