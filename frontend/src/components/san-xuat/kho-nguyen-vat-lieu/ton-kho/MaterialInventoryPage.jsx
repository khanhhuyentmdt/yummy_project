import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Search,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "../../../../api/axios";
import { useSort, SortableTh } from "../../../../hooks/useSort";

const ITEMS_PER_PAGE = 10;

// ─── Status config ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  het_han:      { label: "Hết hạn",       cls: "bg-red-50 text-red-600" },
  can_date:     { label: "Cận date",       cls: "bg-orange-50 text-orange-500" },
  het_hang:     { label: "Hết hàng",       cls: "bg-pink-50 text-pink-600" },
  sap_het_hang: { label: "Sắp hết hàng",  cls: "bg-yellow-50 text-yellow-600" },
  con_hang:     { label: "Còn hàng",       cls: "bg-blue-50 text-blue-600" },
};

const STATUS_FILTER_OPTIONS = [
  { value: "all",          label: "Tất cả trạng thái" },
  { value: "het_han",      label: "Hết hạn" },
  { value: "can_date",     label: "Cận date" },
  { value: "het_hang",     label: "Hết hàng" },
  { value: "sap_het_hang", label: "Sắp hết hàng" },
  { value: "con_hang",     label: "Còn hàng" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatCurrency = (val) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(val) || 0)} đ`;

const formatDate = (iso) => {
  if (!iso) return "--";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const formatDateTime = (iso) => {
  if (!iso) return "--";
  const dt = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, colorCls, valueCls }) {
  return (
    <div className={`rounded-xl p-4 flex flex-col gap-1 ${colorCls}`}>
      <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</span>
      <span className={`text-2xl font-bold ${valueCls}`}>{value}</span>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ item, onClose }) {
  if (!item) return null;
  const cfg = STATUS_CONFIG[item.inventory_status] || STATUS_CONFIG.con_hang;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 font-medium">Chi tiết tồn kho</p>
            <h2 className="text-base font-bold text-gray-800">{item.material_code}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Material image + name */}
          <div className="flex items-center gap-4">
            {item.material_image ? (
              <img
                src={item.material_image}
                alt={item.material_name}
                className="w-16 h-16 rounded-xl object-cover border border-gray-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                Ảnh
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-800 text-sm">{item.material_name}</p>
              <p className="text-xs text-gray-500">{item.material_group}</p>
              <span className={`inline-flex items-center rounded-[7px] py-[5px] px-[14px] text-xs font-semibold mt-1 ${cfg.cls}`}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Field label="Số lượng tồn" value={`${item.quantity} ${item.material_unit}`} />
            <Field label="Mức tồn tối thiểu" value={`${item.min_quantity} ${item.material_unit}`} />
            <Field label="Đơn vị tính" value={item.material_unit} />
            <Field label="Đơn giá" value={formatCurrency(item.unit_cost)} />
            <Field label="Tổng giá trị" value={formatCurrency(item.total_value)} highlight />
            <Field label="Hạn sử dụng" value={formatDate(item.expiry_date)} />
            <Field label="Ngưỡng cận date" value={`${item.near_expiry_days} ngày`} />
            <Field label="Nhóm NVL" value={item.material_group} />
          </div>

          <div className="border-t border-gray-100 pt-3 text-xs text-gray-400">
            Cập nhật lần cuối: {formatDateTime(item.last_updated)}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, highlight }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`font-medium ${highlight ? "text-[#E67E22]" : "text-gray-800"}`}>{value || "--"}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MaterialInventoryPage() {
  const [items, setItems]               = useState([]);
  const [kpi, setKpi]                   = useState(null);
  const [groups, setGroups]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter]   = useState("all");
  const [currentPage, setCurrentPage]   = useState(1);
  const [filterOpen, setFilterOpen]     = useState(false);
  const [detailItem, setDetailItem]     = useState(null);
  const filterRef = useRef(null);
  const { sortKey, sortDir, handleSort, applySort } = useSort();

  const load = () => {
    setLoading(true);
    api
      .get("material-inventory/")
      .then((res) => {
        setItems(res.data.inventory || []);
        setKpi(res.data.kpi || null);
        setGroups(res.data.groups || []);
      })
      .catch(() => { setItems([]); setKpi(null); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!filterOpen) return undefined;
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  // ─── Client-side filtering + sorting ───────────────────────────────────────
  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (it) =>
          it.material_code?.toLowerCase().includes(q) ||
          it.material_name?.toLowerCase().includes(q) ||
          it.material_group?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") list = list.filter((it) => it.inventory_status === statusFilter);
    if (groupFilter !== "all")  list = list.filter((it) => it.material_group === groupFilter);

    const KEY_MAP = {
      material_code: "material_code",
      material_name: "material_name",
      quantity:      "quantity",
      material_unit: "material_unit",
      expiry_date:   "expiry_date",
      inventory_status: "inventory_status",
    };
    if (sortKey && KEY_MAP[sortKey]) {
      list = applySort(list, KEY_MAP[sortKey]);
    }
    return list;
  }, [items, search, statusFilter, groupFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageItems  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearchChange = (v) => { setSearch(v); setCurrentPage(1); };
  const handleStatusFilter = (v) => { setStatusFilter(v); setCurrentPage(1); };
  const handleGroupFilter  = (v) => { setGroupFilter(v);  setCurrentPage(1); };

  // ─── Export ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = filtered.map((it) => ({
      "Mã NVL":             it.material_code,
      "Tên nguyên vật liệu": it.material_name,
      "Nhóm NVL":           it.material_group,
      "Số lượng tồn":       it.quantity,
      "Đơn vị tính":        it.material_unit,
      "Hạn sử dụng":        formatDate(it.expiry_date),
      "Đơn giá":            it.unit_cost,
      "Tổng giá trị":       it.total_value,
      "Trạng thái":         STATUS_CONFIG[it.inventory_status]?.label || "",
    }));
    const ws  = XLSX.utils.json_to_sheet(rows);
    const wb  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TonKhoNVL");
    XLSX.writeFile(wb, "ton-kho-nguyen-vat-lieu.xlsx");
  };

  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (groupFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-400 flex items-center gap-1">
        <span>Sản xuất</span>
        <ChevronDown size={12} className="-rotate-90" />
        <span>Kho nguyên vật liệu</span>
        <ChevronDown size={12} className="-rotate-90" />
        <span className="text-gray-700 font-medium">Tồn kho nguyên vật liệu</span>
      </div>

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Tồn kho nguyên vật liệu</h1>
        <p className="text-sm text-gray-500 mt-0.5">Theo dõi số lượng tồn và trạng thái nguyên vật liệu</p>
      </div>

      {/* KPI Cards */}
      {kpi && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Tổng giá trị tồn kho"
            value={formatCurrency(kpi.total_value)}
            colorCls="bg-orange-50"
            valueCls="text-[#E67E22]"
          />
          <KpiCard
            label="Số lượng hết hạn"
            value={kpi.expired_count}
            colorCls="bg-red-50"
            valueCls="text-red-600"
          />
          <KpiCard
            label="Số lượng hết hàng"
            value={kpi.out_of_stock_count}
            colorCls="bg-pink-50"
            valueCls="text-pink-600"
          />
          <KpiCard
            label="Số lượng cận date"
            value={kpi.near_expiry_count}
            colorCls="bg-orange-50"
            valueCls="text-orange-500"
          />
          <KpiCard
            label="Số lượng sắp hết hàng"
            value={kpi.low_stock_count}
            colorCls="bg-yellow-50"
            valueCls="text-yellow-600"
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          {/* Left: search + filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm mã, tên NVL..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* Advanced filter */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  activeFilterCount > 0
                    ? "border-orange-300 bg-orange-50 text-orange-600"
                    : "border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                <Filter size={14} />
                Lọc
                {activeFilterCount > 0 && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown size={12} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
              </button>

              {filterOpen && (
                <div className="absolute top-full mt-1 left-0 z-30 bg-white rounded-xl shadow-lg border border-gray-100 p-4 w-64 space-y-4">
                  {/* Status filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Trạng thái
                    </label>
                    <div className="space-y-1">
                      {STATUS_FILTER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleStatusFilter(opt.value)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            statusFilter === opt.value
                              ? "bg-orange-50 text-orange-600 font-semibold"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group filter */}
                  {groups.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Nhóm nguyên vật liệu
                      </label>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        <button
                          onClick={() => handleGroupFilter("all")}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            groupFilter === "all"
                              ? "bg-orange-50 text-orange-600 font-semibold"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          Tất cả nhóm
                        </button>
                        {groups.map((g) => (
                          <button
                            key={g}
                            onClick={() => handleGroupFilter(g)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              groupFilter === g
                                ? "bg-orange-50 text-orange-600 font-semibold"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reset */}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => { handleStatusFilter("all"); handleGroupFilter("all"); }}
                      className="w-full text-center text-xs text-gray-500 hover:text-red-500 py-1"
                    >
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            <Download size={14} />
            Xuất Excel
          </button>
        </div>

        {/* Result count */}
        <p className="text-xs text-gray-400 mt-3">
          Hiển thị {pageItems.length} / {filtered.length} nguyên vật liệu
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Đang tải dữ liệu...
          </div>
        ) : pageItems.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Không tìm thấy dữ liệu phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <SortableTh sortKey="material_code"    currentKey={sortKey} dir={sortDir} onSort={handleSort} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">MÃ NVL</SortableTh>
                  <SortableTh sortKey="material_name"    currentKey={sortKey} dir={sortDir} onSort={handleSort} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">TÊN NGUYÊN VẬT LIỆU</SortableTh>
                  <SortableTh sortKey="quantity"         currentKey={sortKey} dir={sortDir} onSort={handleSort} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">SỐ LƯỢNG TỒN</SortableTh>
                  <SortableTh sortKey="material_unit"    currentKey={sortKey} dir={sortDir} onSort={handleSort} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ĐƠN VỊ TÍNH</SortableTh>
                  <SortableTh sortKey="expiry_date"      currentKey={sortKey} dir={sortDir} onSort={handleSort} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">HẠN SỬ DỤNG</SortableTh>
                  <SortableTh sortKey="inventory_status" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">TRẠNG THÁI</SortableTh>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageItems.map((item) => {
                  const cfg = STATUS_CONFIG[item.inventory_status] || STATUS_CONFIG.con_hang;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      {/* Mã NVL + ảnh */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.material_image ? (
                            <img
                              src={item.material_image}
                              alt={item.material_name}
                              className="w-8 h-8 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
                          )}
                          <span className="font-medium text-gray-800">{item.material_code}</span>
                        </div>
                      </td>
                      {/* Tên NVL */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{item.material_name}</p>
                        <p className="text-xs text-gray-400">{item.material_group}</p>
                      </td>
                      {/* Số lượng */}
                      <td className="px-4 py-3 font-semibold text-gray-800">{item.quantity}</td>
                      {/* Đơn vị */}
                      <td className="px-4 py-3 text-gray-600">{item.material_unit}</td>
                      {/* Hạn SD */}
                      <td className="px-4 py-3 text-gray-600">{formatDate(item.expiry_date)}</td>
                      {/* Trạng thái */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </td>
                      {/* Hành động */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDetailItem(item)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <Eye size={13} />
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                        currentPage === p
                          ? "bg-[#E67E22] text-white"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailItem && <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />}
    </div>
  );
}
