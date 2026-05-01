import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Filter,
  Download,
  RefreshCw,
  Check,
  X,
  XCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "../../../../../api/axios";
import { useSort, SortableTh } from "../../../../../hooks/useSort";
import SuccessModal from "../../../../common/SuccessModal";
import DeleteConfirmModal from "../../../../common/DeleteConfirmModal";

export default function MaterialGroupsView({
  materialGroups,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onBulkDeleted,
}) {
  const ITEMS_PER_PAGE = 5;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const { sortKey, sortDir, handleSort, applySort } = useSort();
  const filterRef = useRef(null);

  // Add modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("xlsx");
  const [exportScope, setExportScope] = useState("all");
  const [exportOutcome, setExportOutcome] = useState(null);

  useEffect(() => {
    setSelected((prev) => {
      const existingIds = new Set(materialGroups.map((g) => g.id));
      const next = new Set([...prev].filter((id) => existingIds.has(id)));
      return next;
    });
  }, [materialGroups]);

  // Close filter panel on outside click
  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  // Close action dropdown on outside click
  useEffect(() => {
    if (!openDropdownId) return;
    const handler = () => setOpenDropdownId(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdownId]);

  const filtered = materialGroups.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sorted = applySort(filtered);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paged = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearchChange = (v) => {
    setSearch(v);
    setCurrentPage(1);
  };
  const handleStatusFilter = (v) => {
    setStatusFilter(v);
    setCurrentPage(1);
    setFilterOpen(false);
  };
  const allPageChecked =
    paged.length > 0 && paged.every((g) => selected.has(g.id));
  const toggleAll = () => {
    if (allPageChecked) {
      setSelected((prev) => {
        const s = new Set(prev);
        paged.forEach((g) => s.delete(g.id));
        return s;
      });
    } else {
      setSelected((prev) => {
        const s = new Set(prev);
        paged.forEach((g) => s.add(g.id));
        return s;
      });
    }
  };
  const toggleOne = (id) =>
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const selectedCount = selected.size;

  const handleBulkDelete = async () => {
    const ids = [...selected];
    const results = await Promise.allSettled(
      ids.map((id) => api.delete(`material-groups/${id}/`)),
    );
    const successIds = results
      .map((res, idx) => (res.status === "fulfilled" ? ids[idx] : null))
      .filter(Boolean);

    if (successIds.length > 0) {
      onBulkDeleted?.(successIds);
    }

    setSelected((prev) => {
      const next = new Set(prev);
      successIds.forEach((id) => next.delete(id));
      return next;
    });
    setConfirmBulkOpen(false);
    
    const n = successIds.length;
    setSuccessMsg(n === 1 ? 'Nhóm nguyên vật liệu đã được xóa thành công!' : `${n} nhóm nguyên vật liệu đã được xóa thành công!`);
  };

  const handleAddSubmit = async () => {
    if (!addName.trim()) { setAddErrors({ name: "Tên nhóm nguyên vật liệu là bắt buộc" }); return; }
    setAddLoading(true);
    try {
      const res = await api.post("material-groups/", { name: addName.trim(), description: addDescription.trim() });
      onCreateClick?.(res.data);
      setAddModalOpen(false);
      setAddName(""); setAddDescription(""); setAddErrors({});
      setAddSuccess(true);
    } catch (err) {
      const data = err.response?.data || {};
      setAddErrors({ name: data.name?.[0] || data.non_field_errors?.[0] || data.detail || "" });
    } finally { setAddLoading(false); }
  };

  const handleExportGroups = async () => {
    try {
      const list = exportScope === "filtered" ? sorted : materialGroups;
      if (!list.length) { setExportOutcome({ ok: false, message: "Không có dữ liệu để xuất." }); setExportModalOpen(false); return; }
      const rows = list.map((g) => ({
        "Mã nhóm": g.code || "",
        "Tên nhóm nguyên vật liệu": g.name || "",
        "Mô tả": g.description || "",
        "Trạng thái": g.status === "active" ? "Đang hoạt động" : "Tạm ngưng",
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Nhom nguyen vat lieu");
      const date = new Date();
      const stamp = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}_${String(date.getHours()).padStart(2,"0")}${String(date.getMinutes()).padStart(2,"0")}`;
      if (exportFormat === "csv") {
        XLSX.writeFile(wb, `nhom_nguyen_vat_lieu_${stamp}.csv`, { bookType: "csv", codepage: 65001 });
      } else {
        const buf = XLSX.write(wb, { bookType: "xlsx", type: "array", compression: true });
        const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob); const a = document.createElement("a");
        a.href = url; a.download = `nhom_nguyen_vat_lieu_${stamp}.xlsx`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      }
      setExportModalOpen(false);
      setExportOutcome({ ok: true });
    } catch (err) { setExportOutcome({ ok: false, message: err.message || "Có lỗi xảy ra khi xuất." }); setExportModalOpen(false); }
  };

  return (
    <div>
      {/* ── Page header ─── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
            NHÓM NGUYÊN VẬT LIỆU
          </h1>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1 flex-wrap">
            <span>Nguyên vật liệu</span>
            <ChevronRight size={13} />
            <span>Thông tin nguyên vật liệu</span>
            <ChevronRight size={13} />
            <span>Nhóm nguyên vật liệu</span>
            <ChevronRight size={13} />
            <span className="text-orange-500 font-medium">
              Danh sách nhóm nguyên vật liệu
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-500 text-sm font-semibold rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Download size={15} />
            Xuất
          </button>
        </div>
      </div>

      {/* ── Export modal ─── */}
      {exportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setExportModalOpen(false); }}
        >
          <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center">
                  <Download size={14} />
                </div>
                <h3 className="text-[18px] leading-tight font-semibold text-[#13162D]">
                  Xuất danh sách nhóm nguyên vật liệu
                </h3>
              </div>
              <button type="button" onClick={() => setExportModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="text-[14px] text-gray-500 mb-3">Vui lòng chọn định dạng file để xuất:</p>
              <div className="space-y-2 mb-5">
                {[{ value: "xlsx", label: "Excel (.xlsx)" }, { value: "csv", label: "CSV (.csv)" }].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setExportFormat(opt.value)} className="flex items-center gap-3 text-left">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${exportFormat === opt.value ? "border-orange-500" : "border-orange-400"}`}>
                      <span className={`w-3 h-3 rounded-full ${exportFormat === opt.value ? "bg-orange-500" : "bg-transparent"}`} />
                    </span>
                    <span className="text-[16px] font-medium text-[#13162D]">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-2 mb-5">
                {[{ value: "filtered", label: "Chỉ xuất các dòng đang lọc" }, { value: "all", label: "Xuất toàn bộ dữ liệu" }].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setExportScope(opt.value)} className="flex items-center gap-3 text-left">
                    <span className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${exportScope === opt.value ? "border-orange-500 bg-orange-500 text-white" : "border-orange-400 bg-white text-transparent"}`}>
                      <Check size={14} />
                    </span>
                    <span className="text-[16px] font-medium text-[#13162D]">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setExportModalOpen(false)} className="h-10 min-w-[110px] rounded-xl bg-white shadow text-gray-500 px-4">
                  <span className="text-[16px] font-semibold">Hủy</span>
                </button>
                <button type="button" onClick={handleExportGroups} className="h-10 min-w-[130px] rounded-xl bg-[#F58232] hover:bg-[#E6772B] text-white text-[18px] font-semibold transition-colors">
                  Xuất file
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Export outcome ─── */}
      {exportOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-[380px] bg-white rounded-2xl shadow-2xl px-5 pt-5 pb-5 text-center">
            <div className={`w-12 h-12 mx-auto rounded-full border-4 flex items-center justify-center mb-3 ${exportOutcome.ok ? "border-green-500" : "border-rose-600"}`}>
              {exportOutcome.ok ? <CheckCircle size={20} className="text-green-500" /> : <XCircle size={20} className="text-rose-600" />}
            </div>
            <p className="text-[20px] leading-tight font-semibold italic text-[#13162D] mb-4">
              {exportOutcome.ok ? "Đã xuất danh sách nhóm nguyên vật liệu thành công!" : exportOutcome.message || "Có lỗi xảy ra khi xuất."}
            </p>
            <button onClick={() => setExportOutcome(null)} className="h-10 min-w-[90px] rounded-lg bg-[#F58232] hover:bg-[#E6772B] text-white text-[14px] font-bold transition-colors">
              Xong
            </button>
          </div>
        </div>
      )}

      {/* ── Table card ─── */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Toolbar */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100 flex-wrap">
          {/* Search */}
          <div className="relative w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Tìm kiếm thông tin nhóm nguyên vật liệu"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Filter button + dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 border text-sm font-semibold rounded-lg transition-colors ${
                statusFilter !== "all"
                  ? "bg-orange-50 border-orange-300 text-orange-600"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter size={14} />
              Bộ lọc
              {statusFilter !== "all" && (
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              )}
            </button>

            {filterOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Trạng thái
                </p>
                <div className="space-y-1">
                  {[
                    { value: "all", label: "Tất cả" },
                    { value: "active", label: "Đang hoạt động" },
                    { value: "inactive", label: "Tạm ngưng" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusFilter(opt.value)}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        statusFilter === opt.value
                          ? "bg-orange-50 text-orange-600 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors ${
                          statusFilter === opt.value
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-300 bg-white"
                        }`}
                      />
                      {opt.label}
                    </button>
                  ))}
                </div>
                {statusFilter !== "all" && (
                  <button
                    onClick={() => handleStatusFilter("all")}
                    className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Đặt lại bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {selectedCount > 0 && (
              <span className="text-sm font-semibold text-gray-600">
                {selectedCount} được chọn
              </span>
            )}
            {selectedCount > 0 && (
              <button
                onClick={() => setConfirmBulkOpen(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <AlertTriangle size={16} />
                Xóa đã chọn
              </button>
            )}
            {selectedCount === 0 && (
              <button
                onClick={() => { setAddName(""); setAddDescription(""); setAddErrors({}); setAddModalOpen(true); }}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={15} />
                Thêm nhóm nguyên vật liệu
              </button>
            )}
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
                    className="cursor-pointer"
                  />
                </th>
                <SortableTh columnKey="code"   label="Mã Nhóm"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="name"   label="Tên Nhóm Nguyên Vật Liệu"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="description" label="Mô Tả" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-left" />
                <SortableTh columnKey="status" label="Trạng Thái"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-400 text-sm"
                  >
                    Không tìm thấy nhóm nguyên vật liệu nào.
                  </td>
                </tr>
              ) : (
                paged.map((g) => (
                  <tr
                    key={g.id}
                    className={`hover:bg-gray-50/60 transition-colors ${selected.has(g.id) ? "bg-orange-50/40" : ""}`}
                  >
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.has(g.id)}
                        onChange={() => toggleOne(g.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-600 font-semibold">
                      {g.code}
                    </td>
                    <td className="px-4 py-3.5 text-gray-800 font-semibold">
                      {g.name}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm">
                      {g.description || '-'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${
                          g.status === "active"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {g.status === "active" ? "Đang hoạt động" : "Tạm ngưng"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div
                        className="relative inline-block"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === g.id ? null : g.id,
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Hành động
                          <ChevronDown size={13} className="text-gray-400" />
                        </button>
                        {openDropdownId === g.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            <button
                              onClick={() => {
                                onEditClick(g);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => {
                                onDeleteClick(g);
                                setOpenDropdownId(null);
                              }}
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
            Hiển thị{" "}
            <span className="font-bold text-gray-700">{paged.length}</span> trên
            tổng số{" "}
            <span className="font-bold text-orange-500">
              {sorted.length}
            </span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                  currentPage === page
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>


      {/* ── Add modal ─── */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !addLoading) setAddModalOpen(false); }}
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setAddModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-5 uppercase">Thêm mới nhóm nguyên vật liệu</h2>
            <div className="h-px bg-gray-200 mb-5" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tên nhóm nguyên vật liệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => { setAddName(e.target.value); setAddErrors({}); }}
                  placeholder="Nhập tên nhóm nguyên vật liệu"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${addErrors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"}`}
                />
                {addErrors.name && <p className="mt-1 text-sm text-red-500">{addErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả</label>
                <textarea
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  placeholder="Nhập mô tả"
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y"
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6">
              <button onClick={() => { setAddName(""); setAddDescription(""); setAddErrors({}); }} title="Đặt lại" className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors">
                <RefreshCw size={16} />
              </button>
              <button onClick={() => setAddModalOpen(false)} disabled={addLoading} className="h-10 min-w-[100px] px-6 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60">
                Hủy
              </button>
              <button onClick={handleAddSubmit} disabled={addLoading} className="h-10 min-w-[100px] px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors disabled:opacity-60">
                {addLoading ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add success ─── */}
      {addSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-80 mx-4 px-8 py-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <p className="text-xl font-semibold italic text-gray-900 mb-6 text-center">Thêm nhóm nguyên vật liệu thành công!</p>
            <button onClick={() => setAddSuccess(false)} className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-base font-bold transition-colors">
              Xong
            </button>
          </div>
        </div>
      )}
      {/* ── Delete confirmation modal ───────────────────────────────────── */}
      {confirmBulkOpen && (
        <DeleteConfirmModal
          title="nhóm nguyên vật liệu"
          count={selectedCount}
          onConfirm={handleBulkDelete}
          onClose={() => setConfirmBulkOpen(false)}
        />
      )}

      {/* ── Success notification ───────────────────────────────────── */}
      {successMsg && <SuccessModal message={successMsg} onClose={() => setSuccessMsg(null)} />}
    </div>
  );
}

// ─── Material Group Form (Create / Edit) ──────────────────────────────────────

