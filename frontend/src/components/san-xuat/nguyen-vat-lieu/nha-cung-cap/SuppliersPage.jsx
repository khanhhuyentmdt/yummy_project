import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "../../../../api/axios";
import SuccessModal from "../../../common/SuccessModal";

const ITEMS_PER_PAGE = 5;

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang hợp tác" },
  { value: "inactive", label: "Ngưng hợp tác" },
];

const STATUS_STYLES = {
  active: "bg-blue-50 text-blue-500",
  inactive: "bg-red-50 text-red-500",
};

const formatCurrency = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} đ`;

export default function SuppliersPage({ onCreateClick, onEditClick }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const filterRef = useRef(null);
  const importInputRef = useRef(null);

  const loadSuppliers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await api.get("suppliers/", { params });
      setSuppliers(res.data.suppliers || []);
    } catch {
      setSuppliers([]);
      setError("Không thể tải danh sách nhà cung cấp.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadSuppliers();
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  useEffect(() => {
    if (!openDropdownId) return;
    const handler = () => setOpenDropdownId(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdownId]);

  const filteredSuppliers = useMemo(() => suppliers, [suppliers]);

  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE);
  const pagedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`suppliers/${deleteTarget.id}/`);
      setDeleteTarget(null);
      setSuccessMessage("Xóa nhà cung cấp thành công!");
      loadSuppliers();
    } catch {
      setError("Không thể xóa nhà cung cấp.");
      setDeleteTarget(null);
    }
  };

  const handleExport = () => {
    try {
      const rows = filteredSuppliers.map((supplier) => ({
        "Mã NCC": supplier.code || "",
        "Tên nhà cung cấp": supplier.name || "",
        "Người liên hệ": supplier.contact_name || "",
        "Số điện thoại": supplier.phone || "",
        Email: supplier.email || "",
        "Tổng mua": supplier.total_purchase || 0,
        "Trạng thái":
          supplier.status === "active" ? "Đang hợp tác" : "Ngưng hợp tác",
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Nha cung cap");
      XLSX.writeFile(wb, "nha_cung_cap.xlsx");
    } catch {
      setError("Không thể xuất danh sách nhà cung cấp.");
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      await Promise.all(
        rows
          .filter((row) => row["Tên nhà cung cấp"] || row.name)
          .map((row) =>
            api.post("suppliers/", {
              name: row["Tên nhà cung cấp"] || row.name || "",
              contact_name: row["Người liên hệ"] || row.contact_name || "",
              phone: row["Số điện thoại"] || row.phone || "",
              email: row["Email"] || row.email || "",
              address: row["Địa chỉ"] || row.address || "",
              status: (row["Trạng thái"] || row.status || "")
                .toString()
                .toLowerCase()
                .includes("ngưng")
                ? "inactive"
                : "active",
            }),
          ),
      );

      loadSuppliers();
    } catch {
      setError("Không thể nhập file nhà cung cấp.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
            NHÀ CUNG CẤP
          </h1>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1 flex-wrap">
            <span>Nguyên vật liệu</span>
            <ChevronRight size={13} />
            <span className="text-orange-500 font-medium">
              Danh sách nhà cung cấp
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => importInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-500 text-sm font-semibold rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Upload size={15} />
            Nhập
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-500 text-sm font-semibold rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Download size={15} />
            Xuất
          </button>
        </div>
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
              placeholder="Tìm kiếm nhà cung cấp"
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
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setFilterOpen(false);
                        setCurrentPage(1);
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
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} />
              Thêm nhà cung cấp
            </button>
          </div>
        </div>

        {error && <div className="px-5 pt-4 text-sm text-red-500">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Mã NCC
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tên nhà cung cấp
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Người liên hệ
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="text-right px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tổng mua
                </th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-gray-400 text-sm"
                  >
                    Đang tải dữ liệu nhà cung cấp...
                  </td>
                </tr>
              ) : pagedSuppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-gray-400 text-sm"
                  >
                    Không tìm thấy nhà cung cấp nào.
                  </td>
                </tr>
              ) : (
                pagedSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-700 font-semibold">
                      {supplier.code}
                    </td>
                    <td className="px-4 py-3.5 text-gray-800 font-medium">
                      {supplier.name}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">
                      {supplier.contact_name || "--"}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">
                      {supplier.phone || "--"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-700">
                      {formatCurrency(supplier.total_purchase)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center rounded-[7px] py-[9px] px-[16px] text-xs font-semibold ${
                          STATUS_STYLES[supplier.status] || STATUS_STYLES.active
                        }`}
                      >
                        {supplier.status === "active"
                          ? "Đang hợp tác"
                          : "Ngưng hợp tác"}
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
                              openDropdownId === supplier.id
                                ? null
                                : supplier.id,
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Hành động
                          <ChevronDown size={13} className="text-gray-400" />
                        </button>
                        {openDropdownId === supplier.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            <button
                              onClick={() => {
                                onEditClick(supplier.id);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(supplier);
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

        <div className="px-5 py-3.5 flex items-center justify-between border-t border-gray-100 flex-wrap gap-3">
          <p className="text-xs text-gray-500">
            Hiển thị{" "}
            <span className="font-bold text-gray-700">
              {pagedSuppliers.length}
            </span>{" "}
            trên tổng số{" "}
            <span className="font-bold text-orange-500">
              {filteredSuppliers.length}
            </span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(
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
                setCurrentPage((page) => Math.min(totalPages || 1, page + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                Xác nhận xóa
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Bạn có chắc muốn xóa nhà cung cấp{" "}
              <span className="font-semibold text-gray-800">
                {deleteTarget.name}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
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
