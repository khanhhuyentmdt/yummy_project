import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Plus,
  Search,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "../../../../../api/axios";
import { useSort, SortableTh } from "../../../../../hooks/useSort";
import ActionConfirmModal from "../../../../common/ActionConfirmModal";
import SuccessModal from "../../../../common/SuccessModal";

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG = {
  draft: { label: "Lưu nháp", cls: "bg-gray-100 text-gray-600" },
  waiting: { label: "Chờ nhận", cls: "bg-yellow-50 text-yellow-600" },
  received: { label: "Đã nhận", cls: "bg-green-50 text-green-600" },
  cancelled: { label: "Đã hủy", cls: "bg-red-50 text-red-500" },
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "draft", label: "Lưu nháp" },
  { value: "waiting", label: "Chờ nhận" },
  { value: "received", label: "Đã nhận" },
  { value: "cancelled", label: "Đã hủy" },
];

const formatCurrency = (val) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(val) || 0)} đ`;

const formatDate = (iso) => {
  if (!iso) return "--";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
};

export default function PurchaseOrdersPage({
  onCreateClick,
  onEditClick,
  onViewClick,
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("xlsx");
  const [exportScope, setExportScope] = useState("all");
  const filterRef = useRef(null);
  const { sortKey, sortDir, handleSort, applySort } = useSort();

  const loadOrders = () => {
    setLoading(true);
    api
      .get("purchase-orders/")
      .then((res) => setOrders(res.data.purchase_orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!filterOpen) return undefined;
    const handler = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  useEffect(() => {
    if (!openDropdownId) return undefined;
    const handler = () => setOpenDropdownId(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdownId]);

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const keyword = search.trim().toLowerCase();
        const matchSearch =
          !keyword ||
          String(order.code || "")
            .toLowerCase()
            .includes(keyword) ||
          String(order.supplier_name || "")
            .toLowerCase()
            .includes(keyword);
        const matchStatus =
          statusFilter === "all" || order.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [orders, search, statusFilter],
  );

  const sorted = applySort(filtered);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paged = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const allPageChecked =
    paged.length > 0 && paged.every((order) => selected.has(order.id));

  const toggleAll = () => {
    if (allPageChecked) {
      setSelected((prev) => {
        const next = new Set(prev);
        paged.forEach((order) => next.delete(order.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        paged.forEach((order) => next.add(order.id));
        return next;
      });
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`purchase-orders/${deleteTarget.id}/`);
      setOrders((prev) => prev.filter((order) => order.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSuccessMessage("Xóa phiếu đặt hàng thành công!");
    } catch {
      // Keep modal open on error.
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = () => {
    const list = exportScope === "filtered" ? sorted : orders;
    if (!list.length) {
      setExportModalOpen(false);
      return;
    }

    const rows = list.map((order) => ({
      "Mã phiếu": order.code || "",
      "Ngày tạo phiếu": formatDate(order.created_at),
      "Nhà cung cấp": order.supplier_name || "",
      "Tổng giá trị": Number(order.total_value) || 0,
      "Trạng thái": STATUS_CONFIG[order.status]?.label || "Lưu nháp",
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Phieu dat hang");
    const stamp = new Date()
      .toISOString()
      .slice(0, 16)
      .replaceAll("-", "")
      .replaceAll(":", "")
      .replace("T", "");

    if (exportFormat === "csv") {
      XLSX.writeFile(workbook, `phieu_dat_hang_${stamp}.csv`, {
        bookType: "csv",
        codepage: 65001,
      });
    } else {
      const buffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
        compression: true,
      });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `phieu_dat_hang_${stamp}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }

    setExportModalOpen(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
            PHIẾU ĐẶT HÀNG
          </h1>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1 flex-wrap">
            <span>Nguyên vật liệu</span>
            <ChevronRight size={13} />
            <span>Kho nguyên vật liệu</span>
            <ChevronRight size={13} />
            <span className="text-orange-500 font-medium">
              Danh sách phiếu đặt hàng
            </span>
          </div>
        </div>
        <button
          onClick={() => setExportModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-500 text-sm font-semibold rounded-lg hover:bg-orange-100 transition-colors"
        >
          <Download size={15} />
          Xuất
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100 flex-wrap">
          <div className="relative w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Tìm kiếm phiếu đặt hàng"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((prev) => !prev)}
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
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setCurrentPage(1);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        statusFilter === option.value
                          ? "bg-orange-50 text-orange-600 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors ${
                          statusFilter === option.value
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-300 bg-white"
                        }`}
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="ml-auto">
            <button
              onClick={onCreateClick}
              className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: "#E67E22" }}
            >
              <Plus size={15} />
              Thêm phiếu đặt hàng
            </button>
          </div>
        </div>

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
                <SortableTh
                  columnKey="code"
                  label="Mã Phiếu"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  className="text-left"
                />
                <SortableTh
                  columnKey="created_at"
                  label="Ngày Tạo Phiếu"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  className="text-left"
                />
                <SortableTh
                  columnKey="supplier_name"
                  label="Nhà Cung Cấp"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  className="text-left"
                />
                <SortableTh
                  columnKey="total_value"
                  label="Tổng Giá Trị"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  className="text-right"
                />
                <SortableTh
                  columnKey="status"
                  label="Trạng Thái"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  className="text-center"
                />
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-gray-400 text-sm"
                  >
                    {loading
                      ? "Đang tải..."
                      : "Không tìm thấy phiếu đặt hàng nào."}
                  </td>
                </tr>
              ) : (
                paged.map((order) => {
                  const status =
                    STATUS_CONFIG[order.status] || STATUS_CONFIG.draft;
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50/60 transition-colors ${
                        selected.has(order.id) ? "bg-orange-50/40" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected.has(order.id)}
                          onChange={() => toggleOne(order.id)}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-orange-500"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => onViewClick?.(order.id)}
                          className="font-mono text-xs text-[#13162D] font-semibold hover:text-orange-500 transition-colors"
                        >
                          {order.code}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 text-sm">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => onViewClick?.(order.id)}
                          className="text-gray-800 font-medium hover:text-orange-500 transition-colors disabled:pointer-events-none"
                          disabled={!onViewClick}
                        >
                          {order.supplier_name || "--"}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-800 font-semibold tabular-nums">
                        {formatCurrency(order.total_value)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${status.cls}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div
                          className="relative inline-block"
                          onMouseDown={(event) => event.stopPropagation()}
                        >
                          <button
                            onClick={() =>
                              setOpenDropdownId(
                                openDropdownId === order.id ? null : order.id,
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Hành động
                            <ChevronDown size={13} className="text-gray-400" />
                          </button>
                          {openDropdownId === order.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  onViewClick?.(order.id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                Xem chi tiết
                              </button>
                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  onEditClick?.(order.id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                Chỉnh sửa
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget(order);
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 flex items-center justify-between border-t border-gray-100 flex-wrap gap-3">
          <p className="text-xs text-gray-500">
            Hiển thị{" "}
            <span className="font-bold text-gray-700">{paged.length}</span> trên
            tổng số{" "}
            <span className="font-bold text-orange-500">{sorted.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
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
              ),
            )}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages || 1, prev + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {exportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setExportModalOpen(false);
          }}
        >
          <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-[#13162D]">
                Xuất danh sách phiếu đặt hàng
              </h3>
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="text-[14px] text-gray-500 mb-3">
                Vui lòng chọn định dạng file để xuất:
              </p>
              <div className="space-y-2 mb-5">
                {[
                  { value: "xlsx", label: "Excel (.xlsx)" },
                  { value: "csv", label: "CSV (.csv)" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setExportFormat(option.value)}
                    className="flex items-center gap-3 text-left"
                  >
                    <span
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        exportFormat === option.value
                          ? "border-orange-500"
                          : "border-orange-400"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${
                          exportFormat === option.value
                            ? "bg-orange-500"
                            : "bg-transparent"
                        }`}
                      />
                    </span>
                    <span className="text-[16px] font-medium text-[#13162D]">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="space-y-2 mb-5">
                {[
                  { value: "filtered", label: "Chỉ xuất các dòng đang lọc" },
                  { value: "all", label: "Xuất toàn bộ dữ liệu" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setExportScope(option.value)}
                    className="flex items-center gap-3 text-left"
                  >
                    <span
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                        exportScope === option.value
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-orange-400 bg-white text-transparent"
                      }`}
                    >
                      <Check size={14} />
                    </span>
                    <span className="text-[16px] font-medium text-[#13162D]">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setExportModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#E67E22" }}
                >
                  Xuất file
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ActionConfirmModal
          title="Bạn có chắc muốn xóa phiếu này?"
          message={`Phiếu ${deleteTarget.code} sẽ bị xóa khỏi hệ thống.`}
          note="Hành động này không thể hoàn tác."
          confirmLabel={deleteLoading ? "Đang xóa..." : "Vâng, xóa đi"}
          cancelLabel="Không, quay lại"
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
    </div>
  );
}
