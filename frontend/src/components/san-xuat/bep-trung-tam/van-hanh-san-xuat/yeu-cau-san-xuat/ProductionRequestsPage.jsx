import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import api from "../../../../../api/axios";
import SuccessModal from "../../../../common/SuccessModal";

const ITEMS_PER_PAGE = 5;

const STATUS_OPTIONS = [
  { value: "draft", label: "Lưu nháp" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "approved", label: "Đã duyệt" },
  { value: "cancelled", label: "Đã hủy" },
];

const STATUS_STYLES = {
  draft: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-50 text-yellow-600",
  approved: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-500",
};

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
};

const getTotalQuantity = (request) =>
  (request.items || []).reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );

export default function ProductionRequestsPage({ onCreateClick, onEditClick }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const filterRef = useRef(null);

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("production-requests/");
      setRequests(res.data.production_requests || []);
    } catch {
      setRequests([]);
      setError("Không thể tải danh sách yêu cầu đặt hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

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

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const keyword = search.trim().toLowerCase();
      const matchSearch =
        !keyword ||
        String(request.code || "")
          .toLowerCase()
          .includes(keyword) ||
        String(request.name || "")
          .toLowerCase()
          .includes(keyword);
      const matchStatus =
        statusFilters.length === 0 || statusFilters.includes(request.status);
      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilters]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const pagedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const toggleStatusFilter = (value) => {
    setStatusFilters((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`production-requests/${deleteTarget.id}/`);
      setDeleteTarget(null);
      setSuccessMessage("Xóa yêu cầu đặt hàng thành công!");
      loadRequests();
    } catch {
      setError("Không thể xóa yêu cầu đặt hàng.");
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
            YÊU CẦU ĐẶT HÀNG
          </h1>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1 flex-wrap">
            <span>Bếp trung tâm</span>
            <ChevronRight size={13} />
            <span>Vận hành sản xuất</span>
            <ChevronRight size={13} />
            <span className="text-orange-500 font-medium">
              Yêu cầu sản xuất
            </span>
          </div>
        </div>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Thêm yêu cầu
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
              placeholder="Tìm kiếm yêu cầu đặt hàng"
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
                statusFilters.length > 0
                  ? "bg-orange-50 border-orange-300 text-orange-600"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter size={14} />
              Bộ lọc
              {statusFilters.length > 0 && (
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
                      onClick={() => toggleStatusFilter(option.value)}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        statusFilters.includes(option.value)
                          ? "bg-orange-50 text-orange-600 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors ${
                          statusFilters.includes(option.value)
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-300 bg-white"
                        }`}
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
                {statusFilters.length > 0 && (
                  <button
                    onClick={() => setStatusFilters([])}
                    className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Đặt lại bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {error && <div className="px-5 pt-4 text-sm text-red-500">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[920px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Mã yêu cầu
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tên yêu cầu
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ngày yêu cầu
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ngày mong muốn
                </th>
                <th className="text-right px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tổng sản phẩm
                </th>
                <th className="text-right px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tổng số lượng
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
                    colSpan={8}
                    className="px-5 py-10 text-center text-gray-400 text-sm"
                  >
                    Đang tải dữ liệu yêu cầu đặt hàng...
                  </td>
                </tr>
              ) : pagedRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-gray-400 text-sm"
                  >
                    Không tìm thấy yêu cầu đặt hàng nào.
                  </td>
                </tr>
              ) : (
                pagedRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-700 font-semibold">
                      {request.code}
                    </td>
                    <td className="px-4 py-3.5 text-gray-800 font-medium">
                      {request.name}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {formatDate(request.request_date)}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {formatDate(request.expected_date)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-700">
                      {(request.items || []).length}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-700">
                      {getTotalQuantity(request)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${
                          STATUS_STYLES[request.status] || STATUS_STYLES.draft
                        }`}
                      >
                        {STATUS_OPTIONS.find(
                          (item) => item.value === request.status,
                        )?.label || "Lưu nháp"}
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
                              openDropdownId === request.id ? null : request.id,
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Hành động
                          <ChevronDown size={13} className="text-gray-400" />
                        </button>
                        {openDropdownId === request.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            <button
                              onClick={() => {
                                onEditClick(request.id);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(request);
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
              {pagedRequests.length}
            </span>{" "}
            trên tổng số{" "}
            <span className="font-bold text-orange-500">
              {filteredRequests.length}
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
              Bạn có chắc muốn xóa yêu cầu{" "}
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
