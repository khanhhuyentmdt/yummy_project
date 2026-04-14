import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  BarChart2, Settings, Search, Bell,
  DollarSign, ShoppingBag, CheckCircle,
  Plus, ChevronRight, ChevronLeft, ChevronDown,
  Menu, Activity, LogOut, CloudSync, Loader2,
} from 'lucide-react'
import api from '../api/axios'
import logoImg from '../assets/logo.jpg'
import ProductModal from './ProductModal'

// ─── Static fallback data ─────────────────────────────────────────────────────

const PRODUCTS_FALLBACK = [
  { id: 1,  code: 'HSP011', name: 'Trà hồ Khoai môn 3 vị',        group: 'Trà hồ Singapore', unit: 'Lý',   price: 28000, status: 'active' },
  { id: 2,  code: 'HSP022', name: 'Matcha trà hồ gạo rang đặc 49', group: 'Matcha Trà hồ',    unit: 'Lý',   price: 30000, status: 'inactive' },
  { id: 3,  code: 'HSP030', name: 'Trà hồ kem tầm Đường đêm',      group: 'Trà hồ Singapore', unit: 'Phần', price: 32000, status: 'active' },
  { id: 4,  code: 'HSP045', name: 'Trà hồ Đường trắng',            group: 'Trà hồ Singapore', unit: 'Phần', price: 22000, status: 'active' },
  { id: 5,  code: 'HSP056', name: 'Trà hồ sữa xuất',               group: 'Trà hồ Singapore', unit: 'Phần', price: 30000, status: 'inactive' },
  { id: 6,  code: 'HSP067', name: 'Trà xanh hoa nhài',             group: 'Trà hồ Singapore', unit: 'Lý',   price: 25000, status: 'active' },
  { id: 7,  code: 'HSP078', name: 'Trà ô long sữa tươi',           group: 'Trà hồ Singapore', unit: 'Lý',   price: 35000, status: 'active' },
  { id: 8,  code: 'HSP089', name: 'Matcha latte nóng',             group: 'Matcha Trà hồ',    unit: 'Lý',   price: 38000, status: 'active' },
  { id: 9,  code: 'HSP090', name: 'Trà đào cam sả',                group: 'Trà hồ Singapore', unit: 'Lý',   price: 29000, status: 'inactive' },
  { id: 10, code: 'HSP101', name: 'Trà vải thiều',                 group: 'Trà hồ Singapore', unit: 'Lý',   price: 27000, status: 'active' },
  { id: 11, code: 'HSP112', name: 'Cà phê muối',                   group: 'Cà phê',           unit: 'Lý',   price: 33000, status: 'active' },
]

const STATS_FALLBACK = {
  total_products: 47,
  active_products: 38,
  revenue_today: 12500000,
  orders_today: 23,
}

const ACTIVITIES = [
  { id: 1, time: '10:30', action: 'Thêm mới',     item: 'Trà hồ Khoai môn 3 vị',       type: 'create',   user: 'Thảo Vi' },
  { id: 2, time: '09:45', action: 'Cập nhật',     item: 'Matcha trà hồ gạo rang đặc',  type: 'update',   user: 'Minh Tuấn' },
  { id: 3, time: '09:12', action: 'Tạm ngưng',    item: 'Trà hồ sữa xuất',             type: 'inactive', user: 'Thảo Vi' },
  { id: 4, time: '08:55', action: 'Thêm mới',     item: 'Cà phê muối',                 type: 'create',   user: 'Huy Hoàng' },
  { id: 5, time: '08:20', action: 'Cập nhật giá', item: 'Trà ô long sữa tươi',         type: 'update',   user: 'Thảo Vi' },
]

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Trang chủ',  icon: LayoutDashboard },
  { id: 'products',  label: 'Thành phẩm', icon: Package },
  { id: 'orders',    label: 'Đơn hàng',   icon: ShoppingCart },
  { id: 'customers', label: 'Khách hàng', icon: Users },
  { id: 'reports',   label: 'Báo cáo',    icon: BarChart2 },
  { id: 'settings',  label: 'Cài đặt',    icon: Settings },
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
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [stats, setStats]                 = useState(STATS_FALLBACK)
  const [products, setProducts]           = useState(PRODUCTS_FALLBACK)
  const [headerSearch, setHeaderSearch]   = useState('')
  const [tableSearch, setTableSearch]     = useState('')
  const [currentPage, setCurrentPage]     = useState(1)
  const [apiConnected, setApiConnected]   = useState(null)
  const [modalProduct, setModalProduct]   = useState(undefined) // undefined = closed, null = create, obj = edit
  const [deleteTarget, setDeleteTarget]   = useState(null)      // product to confirm delete
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [syncModal, setSyncModal]         = useState(false)     // confirm sync dialog
  const [syncLoading, setSyncLoading]     = useState(false)
  const [syncResult, setSyncResult]       = useState(null)      // {message, updated, created}

  const ITEMS_PER_PAGE = 5

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

  const handleProductSaved = (savedProduct, action) => {
    if (action === 'create') {
      setProducts(prev => [...prev, savedProduct])
    } else {
      setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p))
    }
    setModalProduct(undefined)
    loadDashboard() // refresh stats
  }

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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
    p.code.toLowerCase().includes(tableSearch.toLowerCase())
  )
  const totalPages      = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const pagedProducts   = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`${sidebarOpen ? 'w-56' : 'w-16'} flex-shrink-0 flex flex-col bg-white border-r border-gray-200 transition-all duration-300`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100 px-2">
          <img
            src={logoImg}
            alt="Yummy"
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
          {sidebarOpen && (
            <span className="ml-2.5 font-bold text-gray-800 text-sm whitespace-nowrap overflow-hidden">
              ERP Yummy
            </span>
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="mx-auto mt-3 mb-1 p-1.5 rounded-md hover:bg-gray-100 text-gray-400"
          title={sidebarOpen ? 'Thu gọn' : 'Mở rộng'}
        >
          <Menu size={17} />
        </button>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm transition-colors ${
                activeView === id
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <Icon size={19} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </button>
          ))}
        </nav>

        {/* User footer */}
        {sidebarOpen && (
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-semibold text-xs">{avatarInitials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate">{displayPhone}</p>
              </div>
              <button
                onClick={onLogout}
                title="Đăng xuất"
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </aside>

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
            {/* API connection badge */}
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
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{displayName}</span>
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
        <main className="flex-1 overflow-auto p-6">
          {activeView === 'dashboard' && (
            <DashboardView stats={stats} activities={ACTIVITIES} />
          )}
          {activeView === 'products' && (
            <ProductsView
              products={pagedProducts}
              allCount={filteredProducts.length}
              tableSearch={tableSearch}
              setTableSearch={(v) => { setTableSearch(v); setCurrentPage(1) }}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              itemsPerPage={ITEMS_PER_PAGE}
              onCreateClick={() => setModalProduct(null)}
              onEditClick={(p) => setModalProduct(p)}
              onDeleteClick={(p) => setDeleteTarget(p)}
              onSyncClick={() => { setSyncResult(null); setSyncModal(true) }}
            />
          )}
          {!['dashboard', 'products'].includes(activeView) && (
            <ComingSoonView />
          )}
        </main>
      </div>

      {/* ── ProductModal ────────────────────────────────────────────── */}
      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSaved={handleProductSaved}
        />
      )}

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

      {/* Stat cards */}
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

      {/* Recent activity */}
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

function ProductsView({
  products, allCount, tableSearch, setTableSearch,
  currentPage, setCurrentPage, totalPages, itemsPerPage,
  onCreateClick, onEditClick, onDeleteClick, onSyncClick,
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null)

  useEffect(() => {
    if (!openDropdownId) return
    const handleClickOutside = () => setOpenDropdownId(null)
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdownId])

  const startIdx = allCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endIdx   = Math.min(currentPage * itemsPerPage, allCount)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-wide">THÀNH PHẨM</h1>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <span>Thành phẩm</span>
          <ChevronRight size={14} />
          <span className="text-orange-500 font-medium">Danh sách</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Toolbar */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100 flex-wrap">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Tìm tên hoặc mã sản phẩm..."
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onSyncClick}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <CloudSync size={15} />
              Đồng bộ từ file JSON
            </button>
            <button
              onClick={onCreateClick}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} />
              Tạo lô
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">STT</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã SP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên Sản Phẩm</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nhóm SP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ĐVT</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá Bán</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              ) : (
                products.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-600">{p.code}</td>
                    <td className="px-4 py-3.5 text-gray-800 font-medium">{p.name}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{p.group}</td>
                    <td className="px-4 py-3.5 text-gray-500">{p.unit}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-700">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          p.status === 'active'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-gray-100 text-gray-500'
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
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                        >
                          Hành động
                          <ChevronDown size={13} className="text-gray-500" />
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
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
            Hiển thị {startIdx}–{endIdx} trên tổng số {allCount}
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
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${
                  currentPage === page
                    ? 'bg-orange-500 text-white font-semibold'
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
