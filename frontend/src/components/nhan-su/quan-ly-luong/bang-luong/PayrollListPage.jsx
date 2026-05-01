import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Download, Trash2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../../../api/axios'
import DeletePayrollModal from './DeletePayrollModal'

const STATUS_LABEL = {
  draft: 'Lưu nháp',
  paying: 'Đang thanh toán',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy',
}
const STATUS_CLASS = {
  draft: 'bg-gray-100 text-gray-500',
  paying: 'bg-yellow-50 text-yellow-600',
  paid: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-500',
}

function fmt(n) {
  if (!n && n !== 0) return '0'
  return Number(n).toLocaleString('vi-VN')
}

const PAGE_SIZE = 10

export default function PayrollListPage({ onAdd, onEdit }) {
  const [payrolls, setPayrolls] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [openDropId, setOpenDropId] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [deleteTarget, setDeleteTarget] = useState(null) // {payroll} or {ids}
  const [showSuccess, setShowSuccess] = useState('')

  const fetchPayrolls = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const { data } = await api.get(`/payrolls/?${params}`)
      setPayrolls(data.payrolls || [])
      setTotal(data.total || 0)
    } catch {
      setPayrolls([])
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { fetchPayrolls() }, [fetchPayrolls])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  // close dropdown on outside click
  useEffect(() => {
    const handler = () => setOpenDropId(null)
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const paginated = payrolls.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(payrolls.length / PAGE_SIZE))

  function toggleAll(e) {
    if (e.target.checked) {
      setSelected(new Set(paginated.map(p => p.id)))
    } else {
      setSelected(new Set())
    }
  }
  function toggleOne(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleDeleteDone(ids) {
    setPayrolls(prev => prev.filter(p => !ids.includes(p.id)))
    setSelected(new Set())
    setDeleteTarget(null)
    setShowSuccess(ids.length > 1 ? `Đã xóa ${ids.length} bảng lương.` : 'Đã xóa bảng lương thành công.')
    setTimeout(() => setShowSuccess(''), 3000)
  }

  const allChecked = paginated.length > 0 && paginated.every(p => selected.has(p.id))

  return (
    <div className="p-6" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">DANH SÁCH BẢNG LƯƠNG</h1>
          <p className="text-sm text-gray-400 mt-1">
            Quản lý lương / <span className="text-orange-500 font-semibold">Danh sách bảng lương</span>
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-orange-400 text-orange-500 rounded-lg text-sm font-semibold hover:bg-orange-50">
          <Download size={15} /> Xuất
        </button>
      </div>

      {showSuccess && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {showSuccess}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-5">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm bảng lương"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 text-gray-600"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Lưu nháp</option>
              <option value="paying">Đang thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {selected.size > 0 ? (
              <>
                <span className="text-sm text-gray-600 font-semibold">{selected.size} được chọn</span>
                <button
                  onClick={() => setDeleteTarget({ ids: [...selected] })}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold"
                >
                  <Trash2 size={15} /> Xóa đã chọn
                </button>
              </>
            ) : (
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-bold"
                style={{ backgroundColor: '#E67E22' }}
              >
                <Plus size={16} /> Thêm bảng lương
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 pr-3 w-10">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 checked:bg-[#E67E22] checked:border-[#E67E22] focus:ring-2 focus:ring-orange-300 focus:ring-offset-0"
                />
              </th>
              {['MÃ BL', 'TÊN BẢNG LƯƠNG', 'KỲ TÍNH LƯƠNG', 'TỔNG LƯƠNG (đ)', 'ĐÃ TRẢ (đ)', 'TRẠNG THÁI', 'HÀNH ĐỘNG'].map(h => (
                <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4 last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">Đang tải...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">Không có dữ liệu</td></tr>
            ) : paginated.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-4 pr-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                    className="w-4 h-4 rounded border-gray-300 checked:bg-[#E67E22] checked:border-[#E67E22] focus:ring-2 focus:ring-orange-300 focus:ring-offset-0"
                  />
                </td>
                <td className="py-4 pr-4 text-sm font-medium text-gray-700">{p.code}</td>
                <td className="py-4 pr-4 text-sm text-gray-700 max-w-[240px]">{p.name}</td>
                <td className="py-4 pr-4 text-sm text-gray-700">{p.period}</td>
                <td className="py-4 pr-4 text-sm text-gray-700">{fmt(p.total_amount)}</td>
                <td className="py-4 pr-4 text-sm text-gray-700">{fmt(p.paid_amount)}</td>
                <td className="py-4 pr-4">
                  <span className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${STATUS_CLASS[p.status] || 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABEL[p.status] || p.status}
                  </span>
                </td>
                <td className="py-4">
                  <div className="relative" onMouseDown={e => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenDropId(openDropId === p.id ? null : p.id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Hành động <ChevronDown size={13} />
                    </button>
                    {openDropId === p.id && (
                      <div className="absolute right-0 top-9 z-20 bg-white rounded-xl border border-gray-200 shadow-lg min-w-[130px]">
                        <button
                          onClick={() => { setOpenDropId(null); onEdit(p) }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-t-xl"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => { setOpenDropId(null); setDeleteTarget({ payroll: p }) }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-100 rounded-b-xl"
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

        {/* Pagination */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            Hiển thị <span className="text-orange-500 font-semibold">{paginated.length}</span> trên tổng số <span className="text-orange-500 font-semibold">{payrolls.length}</span>
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold ${n === page ? 'text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                style={n === page ? { backgroundColor: '#E67E22' } : {}}
              >
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <DeletePayrollModal
          payroll={deleteTarget.payroll}
          ids={deleteTarget.ids}
          onDeleted={handleDeleteDone}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
