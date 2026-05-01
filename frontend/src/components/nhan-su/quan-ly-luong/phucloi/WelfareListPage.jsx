import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Plus, Download, Filter, ChevronDown, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react'
import api from '../../../../api/axios'
import { useSort, SortableTh } from '../../../../hooks/useSort'
import DeleteWelfareModal from './DeleteWelfareModal'
import SuccessModal from '../../../common/SuccessModal'

const BENEFIT_TYPE_LABEL = {
  phu_cap: 'Phụ cấp',
  chinh_sach: 'Chính sách',
  van_hoa: 'Văn hoá',
  khac: 'Khác',
}

const SCOPE_LABEL = {
  toan_cong_ty: 'Toàn công ty',
  theo_vai_tro: 'Theo vai trò',
  ca_nhan: 'Cá nhân',
}

const CYCLE_LABEL = {
  hang_ngay: 'Hàng ngày',
  hang_thang: 'Hàng tháng',
  hang_quy: 'Hàng quý',
  hang_nam: 'Hàng năm',
  ngay_le_tet: 'Ngày lễ, tết',
  su_kien: 'Sự kiện',
}

const ITEMS_PER_PAGE = 10

const CB = 'cursor-pointer w-4 h-4 rounded border border-gray-300 appearance-none checked:bg-[#E67E22] checked:border-[#E67E22] focus:ring-2 focus:ring-orange-300 focus:ring-offset-0'

export default function WelfareListPage({ onAdd, onEdit }) {
  const [benefits, setBenefits] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const filterRef = useRef(null)
  const { sortKey, sortDir, handleSort, applySort } = useSort()

  const fetchBenefits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('benefits/')
      setBenefits(res.data.benefits || [])
    } catch {
      setBenefits([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBenefits() }, [fetchBenefits])

  useEffect(() => {
    if (!filterOpen) return
    const handler = e => {
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

  const filtered = benefits.filter(b => {
    const matchSearch =
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const sorted = applySort(filtered)
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paged = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleSearchChange = v => { setSearch(v); setCurrentPage(1) }
  const handleStatusFilter = v => { setStatusFilter(v); setCurrentPage(1); setFilterOpen(false) }

  const allPageChecked = paged.length > 0 && paged.every(b => selected.has(b.id))
  const toggleAll = () => {
    if (allPageChecked) {
      setSelected(prev => { const s = new Set(prev); paged.forEach(b => s.delete(b.id)); return s })
    } else {
      setSelected(prev => { const s = new Set(prev); paged.forEach(b => s.add(b.id)); return s })
    }
  }
  const toggleOne = id => setSelected(prev => {
    const s = new Set(prev)
    s.has(id) ? s.delete(id) : s.add(id)
    return s
  })

  const handleDeleteDone = deletedIds => {
    const idSet = new Set(deletedIds)
    setBenefits(prev => prev.filter(b => !idSet.has(b.id)))
    setSelected(new Set())
    setDeleteTarget(null)
    setBulkDeleteOpen(false)
    const n = idSet.size
    setSuccessMsg(n === 1 ? 'Phúc lợi đã được xóa thành công!' : `${n} phúc lợi đã được xóa thành công!`)
  }

  const handleExport = () => {
    const headers = ['Mã PL', 'Tên phúc lợi', 'Phạm vi áp dụng', 'Loại phúc lợi', 'Chu kỳ áp dụng', 'Trạng thái']
    const rows = benefits.map(b => [
      b.code,
      b.name,
      SCOPE_LABEL[b.scope] || b.scope,
      BENEFIT_TYPE_LABEL[b.benefit_type] || b.benefit_type,
      CYCLE_LABEL[b.cycle] || b.cycle,
      b.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động',
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `danh-sach-phuc-loi-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">DANH SÁCH PHÚC LỢI</h1>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1 flex-wrap">
            <span>Quản lý lương</span>
            <ChevronRight size={13} />
            <span className="text-orange-500 font-medium">Phúc lợi</span>
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

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Toolbar */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100 flex-wrap">
          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Tìm kiếm phúc lợi"
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
              {statusFilter !== 'all' && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />}
            </button>

            {filterOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Trạng thái</p>
                <div className="space-y-1">
                  {[
                    { value: 'all', label: 'Tất cả' },
                    { value: 'active', label: 'Đang hoạt động' },
                    { value: 'inactive', label: 'Ngưng hoạt động' },
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
                        statusFilter === opt.value ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-white'
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
                onClick={onAdd}
                className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-[7px] transition-colors hover:opacity-90 active:opacity-80"
                style={{ backgroundColor: '#E67E22' }}
              >
                <Plus size={15} />
                Thêm phúc lợi
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
                  <input
                    type="checkbox"
                    checked={allPageChecked}
                    onChange={toggleAll}
                    className={CB}
                  />
                </th>
                <SortableTh columnKey="code"         label="MÃ PL"              sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="name"         label="TÊN PHÚC LỢI"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="scope"        label="PHẠM VI ÁP DỤNG"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="benefit_type" label="LOẠI PHÚC LỢI"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="cycle"        label="CHU KỲ ÁP DỤNG"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="status"       label="TRẠNG THÁI"          sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                      Đang tải...
                    </div>
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : paged.map(benefit => (
                <tr
                  key={benefit.id}
                  className={`hover:bg-gray-50/60 transition-colors ${selected.has(benefit.id) ? 'bg-orange-50/40' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <input
                      type="checkbox"
                      checked={selected.has(benefit.id)}
                      onChange={() => toggleOne(benefit.id)}
                      className={CB}
                    />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-gray-600 font-semibold">{benefit.code}</td>
                  <td className="px-4 py-3.5 text-gray-800 font-semibold max-w-[220px] truncate" title={benefit.name}>
                    {benefit.name}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">
                    {SCOPE_LABEL[benefit.scope] || benefit.scope}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">
                    {BENEFIT_TYPE_LABEL[benefit.benefit_type] || benefit.benefit_type}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">
                    {CYCLE_LABEL[benefit.cycle] || benefit.cycle}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${
                      benefit.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'
                    }`}>
                      {benefit.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="relative inline-block" onMouseDown={e => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenDropdownId(openDropdownId === benefit.id ? null : benefit.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Hành động
                        <ChevronDown size={13} className="text-gray-400" />
                      </button>
                      {openDropdownId === benefit.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                          <button
                            onClick={() => { onEdit && onEdit(benefit); setOpenDropdownId(null) }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={() => { setDeleteTarget(benefit); setOpenDropdownId(null) }}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
                  currentPage === page ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
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

      {successMsg && <SuccessModal message={successMsg} onClose={() => setSuccessMsg(null)} />}

      {deleteTarget && (
        <DeleteWelfareModal
          benefit={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleteDone}
        />
      )}
      {bulkDeleteOpen && (
        <DeleteWelfareModal
          ids={Array.from(selected)}
          onClose={() => setBulkDeleteOpen(false)}
          onDeleted={handleDeleteDone}
        />
      )}
    </div>
  )
}
