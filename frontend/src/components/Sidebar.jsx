import { useState, useCallback } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import logoImg from '../assets/logo.jpg'
import SIDEBAR_CONFIG, { filterMenu } from '../config/sidebarConfig'

// ─── Helper: find path from root to a leaf item by id ────────────────────────

function findItemPath(items, targetId, path = []) {
  for (const item of items) {
    const current = [...path, item.id]
    if (item.id === targetId) return current
    if (item.children) {
      const found = findItemPath(item.children, targetId, current)
      if (found) return found
    }
  }
  return null
}

// ─── Recursive nav item ───────────────────────────────────────────────────────

function NavItem({ item, depth, activeMenuId, onNavigate, expandedItems, toggleItem, sidebarOpen }) {
  const isActive   = item.id === activeMenuId
  const isExpanded = expandedItems.has(item.id)
  const hasChildren = !!item.children?.length

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => toggleItem(item.id)}
          style={{ paddingLeft: sidebarOpen ? `${10 + depth * 10}px` : undefined }}
          className={`w-full flex items-center gap-2 py-2 pr-3 rounded-lg text-sm transition-colors ${
            depth === 0
              ? 'text-gray-700 font-semibold hover:bg-orange-50/60'
              : 'text-gray-500 font-medium hover:bg-gray-100'
          } ${!sidebarOpen ? 'justify-center px-2' : ''}`}
          title={!sidebarOpen && depth === 0 ? item.label : undefined}
        >
          {depth === 0 && item.icon && (
            <item.icon
              size={18}
              className={`flex-shrink-0 ${isExpanded ? 'text-orange-500' : 'text-gray-400'}`}
            />
          )}
          {sidebarOpen && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              <ChevronDown
                size={12}
                className={`flex-shrink-0 transition-transform duration-200 text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>

        {sidebarOpen && isExpanded && (
          <div className={depth === 0 ? 'ml-1' : ''}>
            {item.children.map(child => (
              <NavItem
                key={child.id}
                item={child}
                depth={depth + 1}
                activeMenuId={activeMenuId}
                onNavigate={onNavigate}
                expandedItems={expandedItems}
                toggleItem={toggleItem}
                sidebarOpen={sidebarOpen}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Leaf item ──
  return (
    <button
      onClick={() => onNavigate(item.view, item.id)}
      style={{ paddingLeft: sidebarOpen ? `${10 + depth * 10}px` : undefined }}
      className={`w-full text-left flex items-center gap-2 py-2 pr-3 rounded-lg text-sm transition-colors ${
        isActive
          ? 'bg-orange-50 text-orange-600 font-semibold'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      } ${!sidebarOpen ? 'justify-center px-2' : ''}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
          isActive ? 'bg-orange-500' : 'bg-gray-300'
        }`}
      />
      {sidebarOpen && <span className="truncate">{item.label}</span>}
    </button>
  )
}

// ─── Sidebar component ────────────────────────────────────────────────────────

export default function Sidebar({ user, onLogout, activeMenuId, onNavigate }) {
  const userRole = user?.role || null
  const visibleMenu = filterMenu(SIDEBAR_CONFIG, userRole)

  // Auto-expand the path to the current active item on first render
  const [sidebarOpen, setSidebarOpen]   = useState(true)
  const [expandedItems, setExpandedItems] = useState(() => {
    const path = findItemPath(SIDEBAR_CONFIG, activeMenuId)
    return new Set(path ? path.slice(0, -1) : ['tong-quan'])
  })

  const toggleItem = useCallback((id) => {
    setExpandedItems(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }, [])

  const handleSectionIconClick = (sectionId) => {
    setSidebarOpen(true)
    setExpandedItems(prev => new Set([...prev, sectionId]))
  }

  // ── Display info ──
  const displayName    = user?.name  || 'Admin'
  const displayPhone   = user?.phone || ''
  const displayRole    = user?.role  || 'Quản trị viên'
  const avatarInitials = displayName
    .split(' ').filter(Boolean).slice(0, 2)
    .map(w => w[0].toUpperCase()).join('')

  return (
    <aside
      className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden`}
    >
      {/* ── Logo ── */}
      <div className="h-16 flex items-center border-b border-gray-100 px-3 gap-2.5 flex-shrink-0">
        <img
          src={logoImg}
          alt="Yummy"
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        />
        {sidebarOpen && (
          <span className="font-bold text-gray-800 text-sm whitespace-nowrap font-nunito-sans">
            ERP Yummy
          </span>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5">
        {sidebarOpen ? (
          /* ── Expanded: full hierarchy ── */
          visibleMenu.map(section => (
            <div key={section.id} className="mb-1">
              {/* Section label */}
              <div className="px-2 pt-3 pb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {section.label}
                </span>
              </div>
              {/* Section children */}
              {section.children.map(child => (
                <NavItem
                  key={child.id}
                  item={child}
                  depth={0}
                  activeMenuId={activeMenuId}
                  onNavigate={onNavigate}
                  expandedItems={expandedItems}
                  toggleItem={toggleItem}
                  sidebarOpen={sidebarOpen}
                />
              ))}
            </div>
          ))
        ) : (
          /* ── Collapsed: section icons only ── */
          <div className="flex flex-col gap-1 items-center pt-2">
            {visibleMenu.map(section => {
              const Icon = section.icon
              const isSectionActive = findItemPath(section.children || [], activeMenuId)
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionIconClick(section.id)}
                  title={section.label}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                    isSectionActive
                      ? 'bg-orange-50 text-orange-500'
                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                >
                  {Icon && <Icon size={19} />}
                </button>
              )
            })}
          </div>
        )}
      </nav>

      {/* ── User footer ── */}
      <div className="flex-shrink-0 border-t border-gray-100">
        {sidebarOpen ? (
          <div className="p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-600 font-semibold text-xs">{avatarInitials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate">{displayName}</p>
              <p className="text-[10px] text-gray-400 truncate">{displayRole}</p>
            </div>
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-semibold text-xs">{avatarInitials}</span>
            </div>
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        {/* ── Toggle button ── */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          title={sidebarOpen ? 'Thu gọn' : 'Mở rộng'}
          className="w-full flex items-center justify-center py-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  )
}
