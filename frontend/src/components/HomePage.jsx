import { useState, useEffect, useRef } from 'react'
import {
  Package, Search, Bell,
  DollarSign, ShoppingBag, CheckCircle,
  Plus, ChevronRight, ChevronLeft, ChevronDown,
  Activity, LogOut, CloudSync, Loader2,
  Filter, Upload, Download, RefreshCw,
} from 'lucide-react'
import api from '../api/axios'
import CreateProductPage from './CreateProductPage'
import EditProductPage from './EditProductPage'
import MaterialsPage from './MaterialsPage'
import CreateMaterialPage from './CreateMaterialPage'
import Sidebar from './Sidebar'

// ─── Static fallback data ─────────────────────────────────────────────────────

const PRODUCTS_FALLBACK = [
  { id: 1,  code: 'MSP010', name: 'Matcha tàu hủ gạo rang đậu đỏ', group: 'Matcha Tàu hủ',    unit: 'Ly',   price: 35000, status: 'inactive', image: '' },
  { id: 2,  code: 'MSP009', name: 'Tàu hủ trân châu đường đen',    group: 'Tàu hủ Singapore', unit: 'Phần', price: 18000, status: 'active',   image: '' },
  { id: 3,  code: 'MSP008', name: 'Tàu hủ kem trứng',              group: 'Tàu hủ Singapore', unit: 'Phần', price: 22000, status: 'active',   image: '' },
  { id: 4,  code: 'MSP007', name: 'Tàu hủ sốt xoài',               group: 'Tàu hủ Singapore', unit: 'Phần', price: 50000, status: 'inactive', image: '' },
  { id: 5,  code: 'MSP006', name: 'Lục trà tắc',                   group: 'Trà trái cây',     unit: 'Ly',   price: 18000, status: 'inactive', image: '' },
  { id: 6,  code: 'MSP005', name: 'Trà xanh hoa nhài',             group: 'Tàu hủ Singapore', unit: 'Ly',   price: 25000, status: 'active',   image: '' },
  { id: 7,  code: 'MSP004', name: 'Trà ô long sữa tươi',           group: 'Tàu hủ Singapore', unit: 'Ly',   price: 35000, status: 'active',   image: '' },
  { id: 8,  code: 'MSP003', name: 'Matcha latte nóng',             group: 'Matcha Tàu hủ',    unit: 'Ly',   price: 38000, status: 'active',   image: '' },
  { id: 9,  code: 'MSP002', name: 'Trà đào cam sả',                group: 'Tàu hủ Singapore', unit: 'Ly',   price: 29000, status: 'inactive', image: '' },
  { id: 10, code: 'MSP001', name: 'Trà vải thiều',                 group: 'Tàu hủ Singapore', unit: 'Ly',   price: 27000, status: 'active',   image: '' },
  { id: 11, code: 'MSP011', name: 'Cà phê muối',                   group: 'Cà phê',           unit: 'Ly',   price: 33000, status: 'active',   image: '' },
]

const STATS_FALLBACK = {
  total_products: 47,
  active_products: 38,
  revenue_today: 12500000,
  orders_today: 23,
}

const ACTIVITIES = [
  { id: 1, time: '10:30', action: 'Thêm mới',     item: 'Trà hủ Khoai môn 3 vị',       type: 'create',   user: 'Thảo Vi' },
  { id: 2, time: '09:45', action: 'Cập nhật',     item: 'Matcha trà hủ gạo rang đặc',  type: 'update',   user: 'Minh Tuấn' },
  { id: 3, time: '09:12', action: 'Tạm ngưng',    item: 'Trà hủ sữa xuất',             type: 'inactive', user: 'Thảo Vi' },
  { id: 4, time: '08:55', action: 'Thêm mới',     item: 'Cà phê muối',                 type: 'create',   user: 'Huy Hoàng' },
  { id: 5, time: '08:20', action: 'Cập nhật giá', item: 'Trà ô long sữa tươi',         type: 'update',   user: 'Thảo Vi' },
]

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN').format(amount) + 'đ'

// ─── Main component ───────────────────────────────────────────────────────────

export default function HomePage({ user = {}, onLogout }) {
  const displayName   = user.name  || 'Admin'
  const displayPhone  = user.phone || ''
  const avatarInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

  const [activeView, setActiveView]       = useState('dashboard')
  const [activeMenuId, setActiveMenuId]   = useState('dashboard')
  const [stats, setStats]                 = useState(STATS_FALLBACK)
  const [products, setProducts]           = useState(PRODUCTS_FALLBACK)
  const [headerSearch, setHeaderSearch]   = useState('')
  const [apiConnected, setApiConnected]   = useState(null)
  const [editProductId, setEditProductId] = useState(null)
  const [deleteTarget, setDeleteTarget]   = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [syncModal, setSyncModal]         = useState(false)
  const [syncLoading, setSyncLoading]     = useState(false)
  const [syncResult, setSyncResult]       = useState(null)

  const loadDashboard = () =>
    api.get('dashboard/')
      .then(res  => { setStats(res.data); setApiConnected(true) })
      .catch(()  => { setStats(STATS_FALLBACK); setApiConnected(false) })

  const loadProducts = () =>
    api.get('products/')
      .then(res  => setProducts(res.data.products))
      .catch(()  => setProducts(PRODUCTS_FALLBACK))

  useEffect(() => {
    loadDashboard()
    loadProducts()
  }, [])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await api.delete(`products/${deleteTarget.id}/`)
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
      loadDashboard()
    } catch {
      // keep modal open on error
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSyncConfirm = async () => {
    setSyncLoading(true)
    setSyncResult(null)
    try {
      const res = await api.post('products/sync/')
      setSyncResult({ ok: true, ...res.data })
      await loadProducts()
      await loadDashboard()
    } catch (err) {
      const detail = err.response?.data?.detail || 'Đồng bộ thất bại. Kiểm tra file JSON và server.'
      setSyncResult({ ok: false, message: detail })
    } finally {
      setSyncLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Sidebar
        user={user}
        onLogout={onLogout}
        activeMenuId={activeMenuId}
        onNavigate={(view, menuId) => {
          setActiveView(view)
          setActiveMenuId(menuId)
        }}
      />

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={headerSearch}
              onChange={e => setHeaderSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {apiConnected !== null && (
              <span
                className={`hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                  apiConnected
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'bg-red-50 text-red-500 border border-red-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${apiConnected ? 'bg-green-500' : 'bg-red-400'}`} />
                {apiConnected ? 'API Connected' : 'API Offline'}
              </span>
            )}

            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-semibold text-xs">{avatarInitials}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{displayName}</p>
                <p className="text-xs text-gray-400 leading-tight">Trợ lý sản xuất</p>
              </div>
              <button
                onClick={onLogout}
                title="Đăng xuất"
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-auto p-6 bg-[#FFF6F3]">
          {activeView === 'dashboard' && (
            <DashboardView stats={stats} activities={ACTIVITIES} />
          )}
          {activeView === 'products' && (
            <ProductsView
              products={products}
              onCreateClick={() => setActiveView('create-product')}
              onEditClick={(p) => { setEditProductId(p.id); setActiveView('edit-product') }}
              onDeleteClick={(p) => setDeleteTarget(p)}
              onSyncClick={() => { setSyncResult(null); setSyncModal(true) }}
            />
          )}
          {activeView === 'create-product' && (
            <CreateProductPage
              onCancel={() => setActiveView('products')}
              onSaved={(savedProduct) => {
                setProducts(prev => [savedProduct, ...prev])
                setActiveView('products')
                loadDashboard()
              }}
            />
          )}
          {activeView === 'edit-product' && editProductId && (
            <EditProductPage
              productId={editProductId}
              onCancel={() => setActiveView('products')}
              onSaved={(savedProduct) => {
                setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p))
                setActiveView('products')
                loadDashboard()
              }}
            />
          )}
          {activeView === 'materials' && (
            <MaterialsPage
              onCreateClick={() => { setActiveView('create-material'); setActiveMenuId('nguyen-lieu-item') }}
              onEditClick={() => {}}
            />
          )}
          {activeView === 'create-material' && (
            <CreateMaterialPage
              onCancel={() => setActiveView('materials')}
              onSaved={() => setActiveView('materials')}
            />
          )}
          {!['dashboard', 'products', 'create-product', 'edit-product', 'materials', 'create-material'].includes(activeView) && (
            <ComingSoonView />
          )}
        </main>
      </div>

      {/* ── Sync confirm dialog ─────────────────────────────────────── */}
      {syncModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !syncLoading) { setSyncModal(false); setSyncResult(null) } }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <CloudSync size={20} className="text-green-600" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Đồng bộ từ file JSON</h3>
            </div>

            {!syncResult ? (
              <>
                <p className="text-sm text-gray-600 mb-1">
                  Bạn có chắc chắn muốn ghi đè dữ liệu từ file JSON vào Database không?
                </p>
                <p className="text-xs text-gray-400 mb-5">
                  File: <code className="bg-gray-100 px-1 rounded">data_sync/products.json</code>
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSyncModal(false)}
                    disabled={syncLoading}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={handleSyncConfirm}
                    disabled={syncLoading}
                    className="flex items-center gap-1.5 px-5 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {syncLoading
                      ? <Loader2 size={15} className="animate-spin" />
                      : <CloudSync size={15} />}
                    {syncLoading ? 'Đang đồng bộ...' : 'Xác nhận đồng bộ'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={`text-sm rounded-lg px-4 py-3 mb-4 ${
                  syncResult.ok
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                  {syncResult.message}
                  {syncResult.ok && (
                    <p className="text-xs mt-1 text-green-600">
                      Cập nhật: {syncResult.updated} · Tạo mới: {syncResult.created}
                    </p>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setSyncModal(false); setSyncResult(null) }}
                    className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Delete confirm dialog ───────────────────────────────────── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !deleteLoading) setDeleteTarget(null) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-gray-600 mb-5">
              Bạn có chắc muốn xóa sản phẩm{' '}
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
                Xóa sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Dashboard view ───────────────────────────────────────────────────────────

function DashboardView({ stats, activities }) {
  const cards = [
    {
      label:  'Tổng sản phẩm',
      value:  stats?.total_products ?? '—',
      icon:   Package,
      iconBg: 'bg-blue-100',
      text:   'text-blue-600',
    },
    {
      label:  'Đang hoạt động',
      value:  stats?.active_products ?? '—',
      icon:   CheckCircle,
      iconBg: 'bg-green-100',
      text:   'text-green-600',
    },
    {
      label:  'Doanh thu hôm nay',
      value:  stats ? formatCurrency(stats.revenue_today) : '—',
      icon:   DollarSign,
      iconBg: 'bg-orange-100',
      text:   'text-orange-600',
    },
    {
      label:  'Đơn hàng hôm nay',
      value:  stats?.orders_today ?? '—',
      icon:   ShoppingBag,
      iconBg: 'bg-purple-100',
      text:   'text-purple-600',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-wide">TRANG CHỦ</h1>
        <p className="text-sm text-gray-500 mt-1">Tổng quan hệ thống ERP Yummy</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, iconBg, text }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-sm transition-shadow"
          >
            <div className={`${iconBg} p-3 rounded-xl flex-shrink-0`}>
              <Icon className={text} size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{label}</p>
              <p className={`text-xl font-bold ${text}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Activity size={17} className="text-orange-500" />
          <h2 className="font-semibold text-gray-700 text-sm">Hoạt động gần đây</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {activities.map(act => (
            <div key={act.id} className="px-6 py-3.5 flex items-center gap-4">
              <span className="text-xs text-gray-400 w-10 flex-shrink-0">{act.time}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  act.type === 'create'   ? 'bg-green-100 text-green-600' :
                  act.type === 'update'   ? 'bg-blue-100 text-blue-600'   :
                                            'bg-gray-100 text-gray-500'
                }`}
              >
                {act.action}
              </span>
              <span className="text-sm text-gray-700 flex-1 truncate">{act.item}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">{act.user}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Products view ────────────────────────────────────────────────────────────

function ProductsView({ products, onCreateClick, onEditClick, onDeleteClick, onSyncClick }) {
  const ITEMS_PER_PAGE = 5

  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState('all')
  const [currentPage, setCurrentPage]     = useState(1)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [filterOpen, setFilterOpen]       = useState(false)
  const [selected, setSelected]           = useState(new Set())
  const filterRef = useRef(null)

  // Close filter panel on outside click
  useEffect(() => {
    if (!filterOpen) return
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [filterOpen])

  // Close action dropdown on outside click
  useEffect(() => {
    if (!openDropdownId) return
    const handler = () => setOpenDropdownId(null)
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openDropdownId])

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.code.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged      = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleSearchChange = (v) => { setSearch(v); setCurrentPage(1) }
  const handleStatusFilter = (v) => { setStatusFilter(v); setCurrentPage(1); setFilterOpen(false) }

  const allPageChecked = paged.length > 0 && paged.every(p => selected.has(p.id))
  const toggleAll = () => {
    if (allPageChecked) {
      setSelected(prev => { const s = new Set(prev); paged.forEach(p => s.delete(p.id)); return s })
    } else {
      setSelected(prev => { const s = new Set(prev); paged.forEach(p => s.add(p.id)); return s })
    }
  }
  const toggleOne = (id) => setSelected(prev => {
    const s = new Set(prev)
    s.has(id) ? s.delete(id) : s.add(id)
    return s
  })

  return (
    <div>
      {/* ── Page header ─── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">SẢN PHẨM</h1>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1 flex-wrap">
            <span>Bếp trung tâm</span>
            <ChevronRight size={13} />
            <span>Quản lý danh mục</span>
            <ChevronRight size={13} />
            <span>Thông tin sản phẩm</span>
            <ChevronRight size={13} />
            <span className="text-orange-500 font-medium">Danh sách sản phẩm</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
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
              placeholder="Tìm kiếm thông tin sản phẩm"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Filter button + dropdown */}
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

          <div className="ml-auto flex items-center gap-2">
            {/* Sync icon-only button */}
            <button
              onClick={onSyncClick}
              title="Đồng bộ từ file JSON"
              className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              <RefreshCw size={15} />
            </button>
            {/* Add product */}
            <button
              onClick={onCreateClick}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} />
              Thêm sản phẩm
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
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã SP</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider" colSpan={2}>Tên Sản Phẩm</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Nhóm Sản Phẩm</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Đơn Vị Tính</th>
                <th className="text-right px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Giá Bán</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-gray-400 text-sm">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              ) : (
                paged.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-gray-50/60 transition-colors ${selected.has(p.id) ? 'bg-orange-50/40' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleOne(p.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-orange-500"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-600 font-semibold">{p.code}</td>
                    {/* Image thumbnail */}
                    <td className="px-2 py-2.5 w-14">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-100 flex items-center justify-center">
                          <Package size={18} className="text-gray-300" />
                        </div>
                      )}
                    </td>
                    {/* Product name */}
                    <td className="px-4 py-3.5 text-gray-800 font-semibold">{p.name}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm">{p.group}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm">{p.unit}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-gray-700">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${
                          p.status === 'active'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-red-50 text-red-500'
                        }`}
                      >
                        {p.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div
                        className="relative inline-block"
                        onMouseDown={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === p.id ? null : p.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Hành động
                          <ChevronDown size={13} className="text-gray-400" />
                        </button>
                        {openDropdownId === p.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            <button
                              onClick={() => { onEditClick(p); setOpenDropdownId(null) }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => { onDeleteClick(p); setOpenDropdownId(null) }}
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
    </div>
  )
}

// ─── Coming-soon placeholder ──────────────────────────────────────────────────

function ComingSoonView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-24">
      <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
        <Package className="text-orange-400" size={30} />
      </div>
      <h2 className="text-lg font-bold text-gray-700 mb-2">Tính năng đang phát triển</h2>
      <p className="text-gray-400 text-sm">Chức năng này sẽ sớm được ra mắt.</p>
    </div>
  )
}
