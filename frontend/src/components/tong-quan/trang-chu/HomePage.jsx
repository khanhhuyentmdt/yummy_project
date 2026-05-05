import { useState, useEffect, useMemo, useRef } from "react";
import {
  Package,
  Search,
  Bell,
  DollarSign,
  ShoppingBag,
  CheckCircle,
  Plus,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Activity,
  LogOut,
  CloudSync,
  Loader2,
  Filter,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  XCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "../../../api/axios";
import vnSvgRaw from "../../../assets/vn.svg?raw";
import CreateProductPage from "../../san-xuat/bep-trung-tam/quan-ly-danh-muc/thong-tin-san-pham/san-pham/CreateProductPage";
import EditProductPage from "../../san-xuat/bep-trung-tam/quan-ly-danh-muc/thong-tin-san-pham/san-pham/EditProductPage";
import MaterialsPage from "../../san-xuat/nguyen-vat-lieu/thong-tin-nguyen-vat-lieu/nguyen-vat-lieu/MaterialsPage";
import CreateMaterialPage from "../../san-xuat/nguyen-vat-lieu/thong-tin-nguyen-vat-lieu/nguyen-vat-lieu/CreateMaterialPage";
import EditMaterialPage from "../../san-xuat/nguyen-vat-lieu/thong-tin-nguyen-vat-lieu/nguyen-vat-lieu/EditMaterialPage";
import MaterialGroupsView from "../../san-xuat/nguyen-vat-lieu/thong-tin-nguyen-vat-lieu/nhom-nguyen-vat-lieu/MaterialGroupsView";
import MaterialGroupFormView from "../../san-xuat/nguyen-vat-lieu/thong-tin-nguyen-vat-lieu/nhom-nguyen-vat-lieu/MaterialGroupFormView";
import SuppliersPage from "../../san-xuat/nguyen-vat-lieu/nha-cung-cap/SuppliersPage";
import SupplierFormPage from "../../san-xuat/nguyen-vat-lieu/nha-cung-cap/SupplierFormPage";
import PurchaseOrdersPage from "../../san-xuat/nguyen-vat-lieu/kho-nguyen-vat-lieu/phieu-dat-hang/PurchaseOrdersPage";
import CreatePurchaseOrderPage from "../../san-xuat/nguyen-vat-lieu/kho-nguyen-vat-lieu/phieu-dat-hang/CreatePurchaseOrderPage";
import EditPurchaseOrderPage from "../../san-xuat/nguyen-vat-lieu/kho-nguyen-vat-lieu/phieu-dat-hang/EditPurchaseOrderPage";
import PurchaseOrderDetailPage from "../../san-xuat/nguyen-vat-lieu/kho-nguyen-vat-lieu/phieu-dat-hang/PurchaseOrderDetailPage";
import LocationsPage from "../../cai-dat/thiet-lap-dia-diem/LocationsPage";
import Sidebar from "../../common/Sidebar";
import ShippingUnitsPage from "../../cai-dat/thiet-lap-don-vi-van-chuyen/ShippingUnitsPage";
import EmployeesPage from "../../nhan-su/thiet-lap-nhan-vien/ho-so-nhan-vien/EmployeesPage";
import CreateEmployeePage from "../../nhan-su/thiet-lap-nhan-vien/ho-so-nhan-vien/CreateEmployeePage";
import EditEmployeePage from "../../nhan-su/thiet-lap-nhan-vien/ho-so-nhan-vien/EditEmployeePage";
import ProductsView from "../../san-xuat/bep-trung-tam/quan-ly-danh-muc/thong-tin-san-pham/san-pham/ProductsView";
import ProductGroupsView from "../../san-xuat/bep-trung-tam/quan-ly-danh-muc/thong-tin-san-pham/nhom-san-pham/ProductGroupsView";
import ProductGroupFormView from "../../san-xuat/bep-trung-tam/quan-ly-danh-muc/thong-tin-san-pham/nhom-san-pham/ProductGroupFormView";
import SemiFinishedProductsView from "../../san-xuat/bep-trung-tam/quan-ly-danh-muc/thong-tin-ban-thanh-pham/ban-thanh-pham/SemiFinishedProductsView";
import CreateSemiFinishedProductPage from "../../san-xuat/bep-trung-tam/quan-ly-danh-muc/thong-tin-ban-thanh-pham/ban-thanh-pham/CreateSemiFinishedProductPage";
import EditSemiFinishedProductPage from "../../san-xuat/bep-trung-tam/quan-ly-danh-muc/thong-tin-ban-thanh-pham/ban-thanh-pham/EditSemiFinishedProductPage";
import ProductionPlansPage from "../../san-xuat/bep-trung-tam/van-hanh-san-xuat/ke-hoach-san-xuat/ProductionPlansPage";
import ProductionPlanFormPage from "../../san-xuat/bep-trung-tam/van-hanh-san-xuat/ke-hoach-san-xuat/ProductionPlanFormPage";
import ProductionRequestsPage from "../../san-xuat/bep-trung-tam/van-hanh-san-xuat/yeu-cau-san-xuat/ProductionRequestsPage";
import ProductionRequestFormPage from "../../san-xuat/bep-trung-tam/van-hanh-san-xuat/yeu-cau-san-xuat/ProductionRequestFormPage";
import SuccessModal from "../../common/SuccessModal";

// ─── Static fallback data ─────────────────────────────────────────────────────

const PRODUCTS_FALLBACK = [
  {
    id: 1,
    code: "MSP010",
    name: "Matcha tàu hủ gạo rang đậu đỏ",
    group: "Matcha Tàu hủ",
    unit: "Ly",
    price: 35000,
    status: "inactive",
    image: "",
  },
  {
    id: 2,
    code: "MSP009",
    name: "Tàu hủ trân châu đường đen",
    group: "Tàu hủ Singapore",
    unit: "Phần",
    price: 18000,
    status: "active",
    image: "",
  },
  {
    id: 3,
    code: "MSP008",
    name: "Tàu hủ kem trứng",
    group: "Tàu hủ Singapore",
    unit: "Phần",
    price: 22000,
    status: "active",
    image: "",
  },
  {
    id: 4,
    code: "MSP007",
    name: "Tàu hủ sốt xoài",
    group: "Tàu hủ Singapore",
    unit: "Phần",
    price: 50000,
    status: "inactive",
    image: "",
  },
  {
    id: 5,
    code: "MSP006",
    name: "Lục trà tắc",
    group: "Trà trái cây",
    unit: "Ly",
    price: 18000,
    status: "inactive",
    image: "",
  },
  {
    id: 6,
    code: "MSP005",
    name: "Trà xanh hoa nhài",
    group: "Tàu hủ Singapore",
    unit: "Ly",
    price: 25000,
    status: "active",
    image: "",
  },
  {
    id: 7,
    code: "MSP004",
    name: "Trà ô long sữa tươi",
    group: "Tàu hủ Singapore",
    unit: "Ly",
    price: 35000,
    status: "active",
    image: "",
  },
  {
    id: 8,
    code: "MSP003",
    name: "Matcha latte nóng",
    group: "Matcha Tàu hủ",
    unit: "Ly",
    price: 38000,
    status: "active",
    image: "",
  },
  {
    id: 9,
    code: "MSP002",
    name: "Trà đào cam sả",
    group: "Tàu hủ Singapore",
    unit: "Ly",
    price: 29000,
    status: "inactive",
    image: "",
  },
  {
    id: 10,
    code: "MSP001",
    name: "Trà vải thiều",
    group: "Tàu hủ Singapore",
    unit: "Ly",
    price: 27000,
    status: "active",
    image: "",
  },
  {
    id: 11,
    code: "MSP011",
    name: "Cà phê muối",
    group: "Cà phê",
    unit: "Ly",
    price: 33000,
    status: "active",
    image: "",
  },
];

const STATS_FALLBACK = {
  total_products: 0,
  active_products: 0,
  revenue_today: 0,
  orders_today: 0,
  kpis: {
    new_orders: 0,
    new_orders_growth_pct: 0,
    revenue: 0,
    revenue_growth_pct: 0,
    peak_hour_from: null,
    peak_hour_to: null,
    work_status: null,
  },
  revenue_by_hour: [],
  top_customers: [],
  top_products: [],
  revenue_by_province: [],
  customer_flow: [],
  sales_channels: {
    direct: 0,
    grabfood: 0,
    shopeefood: 0,
  },
  revenue_ratio: {
    retail_pct: 0,
    wholesale_pct: 0,
  },
};

const ACTIVITIES = [
  {
    id: 1,
    time: "10:30",
    action: "Thêm mới",
    item: "Trà hủ Khoai môn 3 vị",
    type: "create",
    user: "Thảo Vi",
  },
  {
    id: 2,
    time: "09:45",
    action: "Cập nhật",
    item: "Matcha trà hủ gạo rang đặc",
    type: "update",
    user: "Minh Tuấn",
  },
  {
    id: 3,
    time: "09:12",
    action: "Tạm ngưng",
    item: "Trà hủ sữa xuất",
    type: "inactive",
    user: "Thảo Vi",
  },
  {
    id: 4,
    time: "08:55",
    action: "Thêm mới",
    item: "Cà phê muối",
    type: "create",
    user: "Huy Hoàng",
  },
  {
    id: 5,
    time: "08:20",
    action: "Cập nhật giá",
    item: "Trà ô long sữa tươi",
    type: "update",
    user: "Thảo Vi",
  },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN").format(amount) + "đ";

const parseVietnamSvg = (rawSvg) => {
  const viewBox = rawSvg.match(/viewBox="([^"]+)"/)?.[1] || "0 0 800 1611";
  const pathTags = rawSvg.match(/<path\b[^>]*\/>/g) || [];
  const paths = pathTags
    .map((tag) => {
      const id = Number(tag.match(/id="([^"]+)"/)?.[1]);
      const d = tag.match(/d="([^"]+)"/)?.[1];
      if (!Number.isFinite(id) || !d) return null;
      return { id, d };
    })
    .filter(Boolean)
    .sort((a, b) => a.id - b.id);
  return { viewBox, paths };
};

const getHeatColor = (value, maxValue) => {
  if (!value || maxValue <= 0) return "#FEEFDf";
  const ratio = Math.min(value / maxValue, 1);
  const from = { r: 253, g: 228, b: 210 };
  const to = { r: 234, g: 88, b: 12 };
  const r = Math.round(from.r + (to.r - from.r) * ratio);
  const g = Math.round(from.g + (to.g - from.g) * ratio);
  const b = Math.round(from.b + (to.b - from.b) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
};

const IMPORT_MAX_SIZE = 3 * 1024 * 1024;
const IMPORT_ACCEPT = ".xlsx,.xls,.csv,.json";

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const HEADER_ALIASES = {
  code: ["ma sp", "ma san pham", "code", "sku", "id san pham"],
  name: ["ten sp", "ten san pham", "san pham", "name"],
  group: ["nhom sp", "nhom san pham", "group", "danh muc"],
  unit: ["don vi tinh", "dvt", "unit"],
  price: ["gia ban", "gia", "price"],
  cost_price: ["gia von", "cost price", "cost_price"],
  compare_price: ["gia so sanh", "compare price", "compare_price"],
  quantity: ["so luong", "ton kho", "quantity", "stock"],
  status: ["trang thai", "status"],
  description: ["mo ta", "description"],
  production_notes: ["ghi chu san xuat", "production notes"],
  notes: ["ghi chu", "notes"],
};

const resolveFieldKey = (header) => {
  const normalized = normalizeText(header);
  const entry = Object.entries(HEADER_ALIASES).find(([, aliases]) =>
    aliases.includes(normalized),
  );
  return entry?.[0] || null;
};

const toNumberOrZero = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const cleaned = String(value)
    .replace(/[^\d.,-]/g, "")
    .replace(",", ".");
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
};

const toStatus = (value) => {
  const normalized = normalizeText(value);
  if (
    ["inactive", "tam ngung", "ngung", "stop", "off", "0", "false"].includes(
      normalized,
    )
  ) {
    return "inactive";
  }
  return "active";
};

const hasValue = (value) =>
  value !== null && value !== undefined && `${value}`.trim() !== "";

const normalizeProductName = (value) =>
  normalizeText(value).replace(/\s+/g, " ").trim();

const normalizeVietnameseText = (value) =>
  typeof value === "string" ? value.normalize("NFC") : value;

// ─── Main component ───────────────────────────────────────────────────────────

export default function HomePage({ user = {}, onLogout }) {
  const displayName = user.name || "Admin";
  const displayPhone = user.phone || "";
  const avatarInitials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const [activeView, setActiveView] = useState("dashboard");
  const [activeMenuId, setActiveMenuId] = useState("dashboard");
  const [editEmployeeId, setEditEmployeeId] = useState(null);
  const [stats, setStats] = useState(STATS_FALLBACK);
  const [products, setProducts] = useState(PRODUCTS_FALLBACK);
  const [semiFinishedProducts, setSemiFinishedProducts] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [headerSearch, setHeaderSearch] = useState("");
  const [apiConnected, setApiConnected] = useState(null);
  const [editProductId, setEditProductId] = useState(null);
  const [editSemiFinishedProductId, setEditSemiFinishedProductId] =
    useState(null);
  const [editProductionPlanId, setEditProductionPlanId] = useState(null);
  const [editProductionRequestId, setEditProductionRequestId] = useState(null);
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [editPurchaseOrderId, setEditPurchaseOrderId] = useState(null);
  const [detailPurchaseOrderId, setDetailPurchaseOrderId] = useState(null);
  const [editMaterialId, setEditMaterialId] = useState(null);
  const [editProductGroupId, setEditProductGroupId] = useState(null);
  const [materialGroups, setMaterialGroups] = useState([]);
  const [editMaterialGroupId, setEditMaterialGroupId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSemiFinishedTarget, setDeleteSemiFinishedTarget] =
    useState(null);
  const [deleteGroupTarget, setDeleteGroupTarget] = useState(null);
  const [deleteMaterialGroupTarget, setDeleteMaterialGroupTarget] =
    useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [syncModal, setSyncModal] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [importModal, setImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importUpdateExisting, setImportUpdateExisting] = useState(true);
  const [importApplyDefaultStock, setImportApplyDefaultStock] = useState(false);
  const [importDragOver, setImportDragOver] = useState(false);
  const [importOutcome, setImportOutcome] = useState(null);
  const [exportOutcome, setExportOutcome] = useState(null);
  const [exportLastOptions, setExportLastOptions] = useState(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");
  const importInputRef = useRef(null);

  const loadDashboard = () =>
    api
      .get("dashboard/")
      .then((res) => {
        setStats(res.data);
        setApiConnected(true);
      })
      .catch(() => {
        setStats(STATS_FALLBACK);
        setApiConnected(false);
      });

  const loadProducts = () =>
    api
      .get("products/")
      .then((res) => setProducts(res.data.products))
      .catch(() => setProducts(PRODUCTS_FALLBACK));

  const loadSemiFinishedProducts = () =>
    api
      .get("semi-finished-products/")
      .then((res) =>
        setSemiFinishedProducts(res.data.semi_finished_products || []),
      )
      .catch(() => setSemiFinishedProducts([]));

  const loadProductGroups = () =>
    api
      .get("product-groups/")
      .then((res) => setProductGroups(res.data.product_groups || []))
      .catch(() => setProductGroups([]));

  const loadMaterialGroups = () =>
    api
      .get("material-groups/")
      .then((res) => setMaterialGroups(res.data.material_groups || []))
      .catch(() => setMaterialGroups([]));

  useEffect(() => {
    loadDashboard();
    loadProducts();
    loadSemiFinishedProducts();
    loadProductGroups();
    loadMaterialGroups();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`products/${deleteTarget.id}/`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteSuccessMessage("Xóa sản phẩm thành công!");
      loadDashboard();
    } catch {
      // keep modal open on error
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteSemiFinishedConfirm = async () => {
    if (!deleteSemiFinishedTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(
        `semi-finished-products/${deleteSemiFinishedTarget.id}/`,
      );
      setSemiFinishedProducts((prev) =>
        prev.filter((p) => p.id !== deleteSemiFinishedTarget.id),
      );
      setDeleteSemiFinishedTarget(null);
      setDeleteSuccessMessage("Xóa bán thành phẩm thành công!");
    } catch {
      // keep modal open on error
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteGroupConfirm = async () => {
    if (!deleteGroupTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`product-groups/${deleteGroupTarget.id}/`);
      setProductGroups((prev) =>
        prev.filter((g) => g.id !== deleteGroupTarget.id),
      );
      setDeleteGroupTarget(null);
      setDeleteSuccessMessage("Xóa nhóm sản phẩm thành công!");
    } catch {
      // keep modal open on error
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteMaterialGroupConfirm = async () => {
    if (!deleteMaterialGroupTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`material-groups/${deleteMaterialGroupTarget.id}/`);
      setMaterialGroups((prev) =>
        prev.filter((g) => g.id !== deleteMaterialGroupTarget.id),
      );
      setDeleteMaterialGroupTarget(null);
      setDeleteSuccessMessage("Xóa nhóm nguyên vật liệu thành công!");
    } catch {
      // keep modal open on error
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSyncConfirm = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      const res = await api.post("products/sync/");
      setSyncResult({ ok: true, ...res.data });
      await loadProducts();
      await loadDashboard();
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        "Đồng bộ thất bại. Kiểm tra file JSON và server.";
      setSyncResult({ ok: false, message: detail });
    } finally {
      setSyncLoading(false);
    }
  };

  const parseImportFile = async (file) => {
    const ext = file.name.toLowerCase().split(".").pop();
    if (!["csv", "xlsx", "xls", "json"].includes(ext)) {
      throw new Error(
        "File không đúng định dạng hỗ trợ (.xlsx, .xls, .csv, .json).",
      );
    }
    let rows = [];
    if (ext === "json") {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("File JSON không hợp lệ.");
      }
      if (Array.isArray(parsed)) rows = parsed;
      else if (Array.isArray(parsed?.products)) rows = parsed.products;
      else {
        throw new Error('JSON phải là mảng hoặc có key "products" là mảng.');
      }
    } else {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error("File không có dữ liệu.");
      const sheet = workbook.Sheets[firstSheetName];
      rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    }

    if (!rows.length) throw new Error("File trống, không có dòng dữ liệu.");

    const parsedRows = [];
    const errors = [];

    rows.forEach((rawRow, index) => {
      const row = {};
      const provided = new Set();
      Object.entries(rawRow).forEach(([header, val]) => {
        const key = resolveFieldKey(header);
        if (key) {
          row[key] = val;
          if (hasValue(val)) provided.add(key);
        }
      });

      parsedRows.push({
        _line: index + 2,
        _provided: provided,
        code: String(row.code ?? "").trim(),
        name: String(row.name ?? "").trim(),
        group: String(row.group ?? "").trim(),
        unit: String(row.unit ?? "").trim(),
        quantity: importApplyDefaultStock ? 0 : toNumberOrZero(row.quantity),
        price: toNumberOrZero(row.price),
        cost_price: toNumberOrZero(row.cost_price),
        compare_price: toNumberOrZero(row.compare_price),
        description: String(row.description ?? "").trim(),
        production_notes: String(row.production_notes ?? "").trim(),
        notes: String(row.notes ?? "").trim(),
        status: toStatus(row.status),
        _normalizedName: normalizeProductName(row.name),
      });
    });

    return { parsedRows, parseErrors: errors };
  };

  const handleImportFileConfirm = async () => {
    if (!importFile || importLoading) return;
    setImportLoading(true);
    try {
      const { parsedRows, parseErrors } = await parseImportFile(importFile);
      if (!parsedRows.length) {
        throw new Error(
          parseErrors[0] || "Không có dữ liệu hợp lệ để nhập từ file.",
        );
      }

      const existingRes = await api.get("products/");
      const existingProducts = existingRes.data?.products || [];
      const byCode = new Map(
        existingProducts
          .filter((p) => p.code)
          .map((p) => [String(p.code).trim().toLowerCase(), p]),
      );
      const existingByName = new Map();
      existingProducts.forEach((p) => {
        const normalizedName = normalizeProductName(p.name);
        if (!normalizedName) return;
        if (!existingByName.has(normalizedName))
          existingByName.set(normalizedName, []);
        existingByName.get(normalizedName).push(p);
      });

      let created = 0;
      let updated = 0;
      let skipped = 0;
      const failedLines = [...parseErrors];

      // Pre-check duplicate product names before calling API
      const finalNameToLines = new Map();
      const precheckFailedLines = [];
      parsedRows.forEach((row, i) => {
        const lineNo = row._line || i + 2;
        const normalizedCode = row.code.toLowerCase();
        const matched = normalizedCode ? byCode.get(normalizedCode) : null;
        const finalName =
          matched && !row._provided.has("name")
            ? String(matched.name || "")
            : row.name;
        const normalizedFinalName = normalizeProductName(finalName);

        if (!normalizedFinalName) {
          if (!matched) {
            precheckFailedLines.push(
              `Dòng ${lineNo}: thiếu Tên sản phẩm để tạo mới.`,
            );
          }
          return;
        }

        if (!finalNameToLines.has(normalizedFinalName)) {
          finalNameToLines.set(normalizedFinalName, []);
        }
        finalNameToLines.get(normalizedFinalName).push(lineNo);

        const existingSameName = existingByName.get(normalizedFinalName) || [];
        const hasConflict = matched
          ? existingSameName.some((p) => p.id !== matched.id)
          : existingSameName.length > 0;

        if (hasConflict) {
          precheckFailedLines.push(
            `Dòng ${lineNo}: Tên sản phẩm "${finalName}" đã tồn tại trong hệ thống.`,
          );
        }
      });

      finalNameToLines.forEach((lineNos, normalizedName) => {
        if (lineNos.length > 1) {
          const sampleName = parsedRows.find(
            (r) => normalizeProductName(r.name) === normalizedName,
          )?.name;
          precheckFailedLines.push(
            `Dòng ${lineNos.join(", ")}: Tên sản phẩm "${sampleName || normalizedName}" bị trùng trong file nhập.`,
          );
        }
      });

      if (precheckFailedLines.length > 0) {
        setImportModal(false);
        setImportOutcome({
          ok: false,
          lineNos: [
            ...new Set(
              precheckFailedLines
                .flatMap((msg) =>
                  [...msg.matchAll(/Dòng\s+(\d+)/gi)].map((m) => Number(m[1])),
                )
                .filter((n) => Number.isFinite(n)),
            ),
          ],
          errors: precheckFailedLines.slice(0, 8),
          message:
            "Không thể nhập dữ liệu. Tên sản phẩm không được trùng (trong file hoặc trong hệ thống).",
        });
        return;
      }

      for (let i = 0; i < parsedRows.length; i += 1) {
        const row = parsedRows[i];
        const lineNo = row._line || i + 2;
        const normalizedCode = row.code.toLowerCase();
        const matched = normalizedCode ? byCode.get(normalizedCode) : null;
        const payload = {
          code: row.code,
          name: row.name,
          group: row.group,
          unit: row.unit,
          quantity: row.quantity,
          price: row.price,
          cost_price: row.cost_price,
          compare_price: row.compare_price,
          description: row.description,
          production_notes: row.production_notes,
          notes: row.notes,
          status: row.status,
        };

        try {
          if (matched) {
            if (!importUpdateExisting) {
              skipped += 1;
              continue;
            }
            const patchPayload = {};
            row._provided.forEach((key) => {
              if (key in payload) patchPayload[key] = payload[key];
            });
            if (Object.keys(patchPayload).length === 0) {
              skipped += 1;
              continue;
            }
            await api.patch(`products/${matched.id}/`, patchPayload);
            updated += 1;
            continue;
          }

          if (!payload.name || !payload.group || !payload.unit) {
            failedLines.push(
              `Dòng ${lineNo}: thiếu Tên sản phẩm / Nhóm sản phẩm / Đơn vị tính để tạo mới.`,
            );
            continue;
          }
          if (!payload.code) delete payload.code;
          await api.post("products/", payload);
          created += 1;
        } catch (err) {
          const detail =
            err.response?.data?.detail ||
            err.response?.data?.name?.[0] ||
            "Không thể nhập dòng này.";
          failedLines.push(`Dòng ${lineNo}: ${detail}`);
        }
      }

      await loadProducts();
      await loadDashboard();
      const errorLineNos = [
        ...new Set(
          failedLines
            .map((msg) => Number(msg.match(/Dòng\s+(\d+)/i)?.[1]))
            .filter((n) => Number.isFinite(n)),
        ),
      ];

      setImportModal(false);
      if (failedLines.length > 0) {
        setImportOutcome({
          ok: false,
          lineNos: errorLineNos,
          errors: failedLines.slice(0, 8),
        });
      } else {
        setImportOutcome({
          ok: true,
          created,
          updated,
          skipped,
        });
      }
    } catch (err) {
      setImportModal(false);
      setImportOutcome({
        ok: false,
        message: err.message || "Không thể nhập dữ liệu.",
        lineNos: [],
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handleExportProducts = async (options = {}) => {
    const {
      format = "xlsx",
      onlyFiltered = false,
      rows: sourceRows = null,
    } = options;
    try {
      setExportLastOptions({ format, onlyFiltered, rows: sourceRows });
      const list = Array.isArray(sourceRows) ? sourceRows : products;
      if (!list.length) {
        setExportOutcome({
          ok: false,
          message: onlyFiltered
            ? "Không có dòng nào trong bộ lọc để xuất."
            : "Không có dữ liệu sản phẩm để xuất.",
        });
        return;
      }

      const rows = list.map((p) => ({
        "Mã SP": normalizeVietnameseText(p.code || ""),
        "Tên sản phẩm": normalizeVietnameseText(p.name || ""),
        "Nhóm sản phẩm": normalizeVietnameseText(p.group || ""),
        "Đơn vị tính": normalizeVietnameseText(p.unit || ""),
        "Giá bán": p.price ?? 0,
        "Số lượng": p.quantity ?? 0,
        "Trạng thái": normalizeVietnameseText(
          p.status === "active" ? "Đang hoạt động" : "Tạm ngưng",
        ),
        "Mô tả": normalizeVietnameseText(p.description || ""),
        "Ghi chú sản xuất": normalizeVietnameseText(p.production_notes || ""),
        "Ghi chú": normalizeVietnameseText(p.notes || ""),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Danh sach san pham");
      const date = new Date();
      const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}_${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`;
      if (format === "csv") {
        XLSX.writeFile(wb, `danh_sach_san_pham_${stamp}.csv`, {
          bookType: "csv",
          codepage: 65001,
        });
      } else if (format === "pdf") {
        throw new Error(
          "Định dạng PDF chưa được hỗ trợ. Vui lòng chọn Excel hoặc CSV.",
        );
      } else {
        const xlsxBuffer = XLSX.write(wb, {
          bookType: "xlsx",
          type: "array",
          bookSST: true,
          compression: true,
        });
        const blob = new Blob([xlsxBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `danh_sach_san_pham_${stamp}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }

      setExportOutcome({ ok: true });
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        "Có lỗi xảy ra khi xuất danh sách sản phẩm.";
      setExportOutcome({
        ok: false,
        message: detail,
      });
    }
  };

  const handleExportSemiFinishedProducts = async (options = {}) => {
    const {
      format = "xlsx",
      onlyFiltered = false,
      rows: sourceRows = null,
    } = options;
    try {
      setExportLastOptions({ format, onlyFiltered, rows: sourceRows });
      const list = Array.isArray(sourceRows)
        ? sourceRows
        : semiFinishedProducts;
      if (!list.length) {
        setExportOutcome({
          ok: false,
          message: onlyFiltered
            ? "Không có dòng nào trong bộ lọc để xuất."
            : "Không có dữ liệu bán thành phẩm để xuất.",
        });
        return;
      }

      const rows = list.map((p) => ({
        "Mã BTP": normalizeVietnameseText(p.code || ""),
        "Tên bán thành phẩm": normalizeVietnameseText(p.name || ""),
        "Đơn vị tính": normalizeVietnameseText(p.unit || ""),
        "Giá điều chuyển": p.price ?? 0,
        "Số lượng": p.quantity ?? 0,
        "Trạng thái": normalizeVietnameseText(
          p.status === "active" ? "Đang hoạt động" : "Tạm ngưng",
        ),
        "Mô tả": normalizeVietnameseText(p.description || ""),
        "Ghi chú sản xuất": normalizeVietnameseText(p.production_notes || ""),
        "Ghi chú": normalizeVietnameseText(p.notes || ""),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Danh sach ban thanh pham");
      const date = new Date();
      const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}_${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`;
      if (format === "csv") {
        XLSX.writeFile(wb, `danh_sach_ban_thanh_pham_${stamp}.csv`, {
          bookType: "csv",
          codepage: 65001,
        });
      } else if (format === "pdf") {
        throw new Error(
          "Định dạng PDF chưa được hỗ trợ. Vui lòng chọn Excel hoặc CSV.",
        );
      } else {
        const xlsxBuffer = XLSX.write(wb, {
          bookType: "xlsx",
          type: "array",
          bookSST: true,
          compression: true,
        });
        const blob = new Blob([xlsxBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `danh_sach_ban_thanh_pham_${stamp}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }

      setExportOutcome({ ok: true });
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        "Có lỗi xảy ra khi xuất danh sách bán thành phẩm.";
      setExportOutcome({
        ok: false,
        message: detail,
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Sidebar
        user={user}
        onLogout={onLogout}
        activeMenuId={activeMenuId}
        onNavigate={(view, menuId) => {
          setActiveView(view);
          setActiveMenuId(menuId);
        }}
      />

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          <div className="relative w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {apiConnected !== null && (
              <span
                className={`hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                  apiConnected
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-red-50 text-red-500 border border-red-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${apiConnected ? "bg-green-500" : "bg-red-400"}`}
                />
                {apiConnected ? "API Connected" : "API Offline"}
              </span>
            )}

            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-semibold text-xs">
                  {avatarInitials}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {displayName}
                </p>
                <p className="text-xs text-gray-400 leading-tight">
                  {user.role || ""}
                </p>
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
          {activeView === "dashboard" && (
            <DashboardView stats={stats} activities={ACTIVITIES} />
          )}
          {activeView === "products" && (
            <ProductsView
              products={products}
              onCreateClick={() => setActiveView("create-product")}
              onEditClick={(p) => {
                setEditProductId(p.id);
                setActiveView("edit-product");
              }}
              onDeleteClick={(p) => setDeleteTarget(p)}
              onSyncClick={() => {
                setSyncResult(null);
                setSyncModal(true);
              }}
              onImportClick={() => {
                setImportOutcome(null);
                setImportFile(null);
                setImportModal(true);
              }}
              onExportClick={handleExportProducts}
              onBulkDeleted={(deletedIds) => {
                setProducts((prev) =>
                  prev.filter((p) => !deletedIds.includes(p.id)),
                );
                loadDashboard();
              }}
            />
          )}
          {activeView === "create-product" && (
            <CreateProductPage
              onCancel={() => setActiveView("products")}
              onSaved={(savedProduct) => {
                setProducts((prev) => [savedProduct, ...prev]);
                setActiveView("products");
                loadDashboard();
              }}
            />
          )}
          {activeView === "edit-product" && editProductId && (
            <EditProductPage
              productId={editProductId}
              onCancel={() => setActiveView("products")}
              onSaved={(savedProduct) => {
                setProducts((prev) =>
                  prev.map((p) =>
                    p.id === savedProduct.id ? savedProduct : p,
                  ),
                );
                setActiveView("products");
                loadDashboard();
              }}
            />
          )}
          {activeView === "semi-finished-products" && (
            <SemiFinishedProductsView
              semiFinishedProducts={semiFinishedProducts}
              onCreateClick={() =>
                setActiveView("create-semi-finished-product")
              }
              onEditClick={(p) => {
                setEditSemiFinishedProductId(p.id);
                setActiveView("edit-semi-finished-product");
              }}
              onDeleteClick={(p) => setDeleteSemiFinishedTarget(p)}
              onExportClick={handleExportSemiFinishedProducts}
              onBulkDeleted={(deletedIds) =>
                setSemiFinishedProducts((prev) =>
                  prev.filter((p) => !deletedIds.includes(p.id)),
                )
              }
            />
          )}
          {activeView === "create-semi-finished-product" && (
            <CreateSemiFinishedProductPage
              onCancel={() => setActiveView("semi-finished-products")}
              onSaved={(savedProduct) => {
                setSemiFinishedProducts((prev) => [savedProduct, ...prev]);
                setActiveView("semi-finished-products");
              }}
            />
          )}
          {activeView === "edit-semi-finished-product" &&
            editSemiFinishedProductId && (
              <EditSemiFinishedProductPage
                semiFinishedProductId={editSemiFinishedProductId}
                onCancel={() => setActiveView("semi-finished-products")}
                onSaved={(savedProduct) => {
                  setSemiFinishedProducts((prev) =>
                    prev.map((p) =>
                      p.id === savedProduct.id ? savedProduct : p,
                    ),
                  );
                  setActiveView("semi-finished-products");
                }}
              />
            )}
          {activeView === "production-plans" && (
            <ProductionPlansPage
              onCreateClick={() => setActiveView("create-production-plan")}
              onEditClick={(planId) => {
                setEditProductionPlanId(planId);
                setActiveView("edit-production-plan");
              }}
            />
          )}
          {activeView === "create-production-plan" && (
            <ProductionPlanFormPage
              mode="create"
              onCancel={() => setActiveView("production-plans")}
              onSaved={() => setActiveView("production-plans")}
            />
          )}
          {activeView === "edit-production-plan" && editProductionPlanId && (
            <ProductionPlanFormPage
              mode="edit"
              productionPlanId={editProductionPlanId}
              onCancel={() => setActiveView("production-plans")}
              onSaved={() => setActiveView("production-plans")}
            />
          )}
          {activeView === "production-requests" && (
            <ProductionRequestsPage
              onCreateClick={() => setActiveView("create-production-request")}
              onEditClick={(requestId) => {
                setEditProductionRequestId(requestId);
                setActiveView("edit-production-request");
              }}
            />
          )}
          {activeView === "create-production-request" && (
            <ProductionRequestFormPage
              mode="create"
              onCancel={() => setActiveView("production-requests")}
              onSaved={() => setActiveView("production-requests")}
            />
          )}
          {activeView === "edit-production-request" &&
            editProductionRequestId && (
              <ProductionRequestFormPage
                mode="edit"
                productionRequestId={editProductionRequestId}
                onCancel={() => setActiveView("production-requests")}
                onSaved={() => setActiveView("production-requests")}
              />
            )}
          {activeView === "materials" && (
            <MaterialsPage
              onCreateClick={() => {
                setActiveView("create-material");
                setActiveMenuId("nguyen-lieu-item");
              }}
              onEditClick={(material) => {
                setEditMaterialId(material.id);
                setActiveView("edit-material");
                setActiveMenuId("nguyen-lieu-item");
              }}
            />
          )}
          {activeView === "suppliers" && (
            <SuppliersPage
              onCreateClick={() => {
                setActiveView("create-supplier");
                setActiveMenuId("nha-cung-cap");
              }}
              onEditClick={(supplierId) => {
                setEditSupplierId(supplierId);
                setActiveView("edit-supplier");
                setActiveMenuId("nha-cung-cap");
              }}
            />
          )}
          {activeView === "create-supplier" && (
            <SupplierFormPage
              mode="create"
              onCancel={() => setActiveView("suppliers")}
              onSaved={() => setActiveView("suppliers")}
            />
          )}
          {activeView === "edit-supplier" && editSupplierId && (
            <SupplierFormPage
              mode="edit"
              supplierId={editSupplierId}
              onCancel={() => setActiveView("suppliers")}
              onSaved={() => setActiveView("suppliers")}
            />
          )}
          {activeView === "create-material" && (
            <CreateMaterialPage
              onCancel={() => setActiveView("materials")}
              onSaved={() => setActiveView("materials")}
            />
          )}
          {activeView === "edit-material" && editMaterialId && (
            <EditMaterialPage
              materialId={editMaterialId}
              onCancel={() => setActiveView("materials")}
              onSaved={() => setActiveView("materials")}
            />
          )}
          {activeView === "material-groups" && (
            <MaterialGroupsView
              materialGroups={materialGroups}
              onCreateClick={(newGroup) => {
                if (newGroup) setMaterialGroups((prev) => [newGroup, ...prev]);
              }}
              onEditClick={(g) => {
                setEditMaterialGroupId(g.id);
                setActiveMenuId("nhom-nvl");
              }}
              onDeleteClick={(g) => setDeleteMaterialGroupTarget(g)}
              onBulkDeleted={(ids) =>
                setMaterialGroups((prev) =>
                  prev.filter((g) => !ids.includes(g.id)),
                )
              }
            />
          )}
          {activeView === "create-material-group" && (
            <MaterialGroupFormView
              mode="create"
              onCancel={() => setActiveView("material-groups")}
              onSaved={(g) => {
                setMaterialGroups((prev) => [g, ...prev]);
              }}
            />
          )}
          {activeView === "product-groups" && (
            <ProductGroupsView
              productGroups={productGroups}
              onCreateClick={(newGroup) => {
                if (newGroup) setProductGroups((prev) => [newGroup, ...prev]);
              }}
              onEditClick={(g) => {
                setEditProductGroupId(g.id);
              }}
              onDeleteClick={(g) => setDeleteGroupTarget(g)}
              onBulkDeleted={(ids) =>
                setProductGroups((prev) =>
                  prev.filter((g) => !ids.includes(g.id)),
                )
              }
            />
          )}
          {activeView === "create-product-group" && (
            <ProductGroupFormView
              mode="create"
              onCancel={() => setActiveView("product-groups")}
              onSaved={(g) => {
                setProductGroups((prev) => [g, ...prev]);
                loadProducts();
                setActiveView("product-groups");
              }}
            />
          )}
          {activeView === "purchase-orders" && (
            <PurchaseOrdersPage
              onCreateClick={() => {
                setActiveView("create-purchase-order");
                setActiveMenuId("phieu-dat-hang");
              }}
              onViewClick={(purchaseOrderId) => {
                setDetailPurchaseOrderId(purchaseOrderId);
                setActiveView("purchase-order-detail");
                setActiveMenuId("phieu-dat-hang");
              }}
              onEditClick={(purchaseOrderId) => {
                setEditPurchaseOrderId(purchaseOrderId);
                setActiveView("edit-purchase-order");
                setActiveMenuId("phieu-dat-hang");
              }}
            />
          )}
          {activeView === "create-purchase-order" && (
            <CreatePurchaseOrderPage
              onCancel={() => setActiveView("purchase-orders")}
              onSaved={() => {
                setActiveView("purchase-orders");
              }}
            />
          )}
          {activeView === "edit-purchase-order" && editPurchaseOrderId && (
            <EditPurchaseOrderPage
              purchaseOrderId={editPurchaseOrderId}
              onCancel={() => setActiveView("purchase-orders")}
              onSaved={() => {
                setActiveView("purchase-orders");
              }}
            />
          )}
          {activeView === "purchase-order-detail" && detailPurchaseOrderId && (
            <PurchaseOrderDetailPage
              purchaseOrderId={detailPurchaseOrderId}
              onBack={() => setActiveView("purchase-orders")}
              onCancelled={() => {
                setActiveView("purchase-orders");
              }}
            />
          )}
          {activeView === "locations" && <LocationsPage />}
          {activeView === "shipping-units" && <ShippingUnitsPage />}
          {activeView === "employees" && (
            <EmployeesPage
              onCreateClick={() => setActiveView("create-employee")}
              onEditClick={(emp) => {
                setEditEmployeeId(emp.id);
                setActiveView("edit-employee");
              }}
            />
          )}
          {activeView === "create-employee" && (
            <CreateEmployeePage
              onCancel={() => setActiveView("employees")}
              onSaved={(emp) => {
                setEditEmployeeId(emp.id);
                setActiveView("edit-employee");
              }}
            />
          )}
          {activeView === "edit-employee" && editEmployeeId && (
            <EditEmployeePage
              employeeId={editEmployeeId}
              onCancel={() => setActiveView("employees")}
              onSaved={() => {}}
            />
          )}
          {![
            "dashboard",
            "products",
            "create-product",
            "edit-product",
            "semi-finished-products",
            "create-semi-finished-product",
            "edit-semi-finished-product",
            "production-plans",
            "create-production-plan",
            "edit-production-plan",
            "production-requests",
            "create-production-request",
            "edit-production-request",
            "product-groups",
            "create-product-group",
            "edit-product-group",
            "materials",
            "suppliers",
            "create-supplier",
            "edit-supplier",
            "create-material",
            "edit-material",
            "material-groups",
            "create-material-group",
            "edit-material-group",
            "purchase-orders",
            "create-purchase-order",
            "edit-purchase-order",
            "purchase-order-detail",
            "locations",
            "shipping-units",
            "employees",
            "create-employee",
            "edit-employee",
          ].includes(activeView) && <ComingSoonView />}
        </main>
      </div>

      {activeView === "product-groups" && editProductGroupId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setEditProductGroupId(null);
            }
          }}
        >
          <div className="w-full max-w-[760px] max-h-[90vh] overflow-y-auto">
            <ProductGroupFormView
              mode="edit"
              groupId={editProductGroupId}
              onCancel={() => setEditProductGroupId(null)}
              onSaved={(g) => {
                setProductGroups((prev) =>
                  prev.map((x) => (x.id === g.id ? g : x)),
                );
                loadProducts();
                setEditProductGroupId(null);
              }}
            />
          </div>
        </div>
      )}

      {activeView === "material-groups" && editMaterialGroupId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setEditMaterialGroupId(null);
            }
          }}
        >
          <div className="w-full max-w-[760px] max-h-[90vh] overflow-y-auto">
            <MaterialGroupFormView
              mode="edit"
              groupId={editMaterialGroupId}
              onCancel={() => setEditMaterialGroupId(null)}
              onSaved={(g) => {
                setMaterialGroups((prev) =>
                  prev.map((x) => (x.id === g.id ? g : x)),
                );
                setEditMaterialGroupId(null);
              }}
            />
          </div>
        </div>
      )}

      {/* ── Sync confirm dialog ─────────────────────────────────────── */}
      {syncModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !syncLoading) {
              setSyncModal(false);
              setSyncResult(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <CloudSync size={20} className="text-green-600" />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                Đồng bộ từ file JSON
              </h3>
            </div>

            {!syncResult ? (
              <>
                <p className="text-sm text-gray-600 mb-1">
                  Bạn có chắc chắn muốn ghi đè dữ liệu từ file JSON vào Database
                  không?
                </p>
                <p className="text-xs text-gray-400 mb-5">
                  File:{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    data_sync/san-pham/products.json
                  </code>
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
                    {syncLoading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <CloudSync size={15} />
                    )}
                    {syncLoading ? "Đang đồng bộ..." : "Xác nhận đồng bộ"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  className={`text-sm rounded-lg px-4 py-3 mb-4 ${
                    syncResult.ok
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-600"
                  }`}
                >
                  {syncResult.message}
                  {syncResult.ok && (
                    <p className="text-xs mt-1 text-green-600">
                      Cập nhật: {syncResult.updated} · Tạo mới:{" "}
                      {syncResult.created}
                    </p>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSyncModal(false);
                      setSyncResult(null);
                    }}
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
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleteLoading)
              setDeleteTarget(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              Bạn có chắc muốn xóa sản phẩm{" "}
              <span className="font-semibold text-gray-800">
                {deleteTarget.name}
              </span>
              ? Hành động này không thể hoàn tác.
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
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                )}
                Xóa sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteSemiFinishedTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleteLoading) {
              setDeleteSemiFinishedTarget(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              Bạn có chắc muốn xóa bán thành phẩm{" "}
              <span className="font-semibold text-gray-800">
                {deleteSemiFinishedTarget.name}
              </span>
              ? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteSemiFinishedTarget(null)}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleDeleteSemiFinishedConfirm}
                disabled={deleteLoading}
                className="flex items-center gap-1.5 px-5 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {deleteLoading && (
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                )}
                Xóa bán thành phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete group confirm dialog ─────────────────────────────── */}
      {deleteGroupTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleteLoading)
              setDeleteGroupTarget(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-[370px] max-w-[calc(100vw-2rem)] mx-4 px-5 pt-5 pb-5 text-center">
            <div className="w-[68px] h-[68px] mx-auto rounded-full border-[3px] border-yellow-400 flex items-center justify-center mb-4">
              <AlertTriangle size={42} className="text-yellow-400" />
            </div>
            <h3 className="text-[20px] leading-tight font-semibold italic text-gray-900 mb-6">
              Bạn có chắc muốn xóa nhóm sản phẩm này?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDeleteGroupConfirm}
                disabled={deleteLoading}
                className="h-10 rounded-lg bg-[#F58232] hover:bg-[#E6772B] disabled:opacity-60 text-white text-[14px] font-bold leading-none whitespace-nowrap px-3 transition-colors"
              >
                {deleteLoading ? "Đang xóa..." : "Vâng, xóa đi"}
              </button>
              <button
                onClick={() => setDeleteGroupTarget(null)}
                disabled={deleteLoading}
                className="h-10 rounded-lg bg-[#FDF0E6] hover:bg-[#FBE5D4] text-[#F58232] text-[14px] font-semibold leading-none whitespace-nowrap px-3 transition-colors"
              >
                Không, quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteMaterialGroupTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleteLoading)
              setDeleteMaterialGroupTarget(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-[370px] max-w-[calc(100vw-2rem)] mx-4 px-5 pt-5 pb-5 text-center">
            <div className="w-[68px] h-[68px] mx-auto rounded-full border-[3px] border-yellow-400 flex items-center justify-center mb-4">
              <AlertTriangle size={42} className="text-yellow-400" />
            </div>
            <h3 className="text-[20px] leading-tight font-semibold italic text-gray-900 mb-6">
              Bạn có chắc muốn xóa nhóm nguyên vật liệu này?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDeleteMaterialGroupConfirm}
                disabled={deleteLoading}
                className="h-10 rounded-lg bg-[#F58232] hover:bg-[#E6772B] disabled:opacity-60 text-white text-[14px] font-bold leading-none whitespace-nowrap px-3 transition-colors"
              >
                {deleteLoading ? "Đang xóa..." : "Vâng, xóa đi"}
              </button>
              <button
                onClick={() => setDeleteMaterialGroupTarget(null)}
                disabled={deleteLoading}
                className="h-10 rounded-lg bg-[#FDF0E6] hover:bg-[#FBE5D4] text-[#F58232] text-[14px] font-semibold leading-none whitespace-nowrap px-3 transition-colors"
              >
                Không, quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteSuccessMessage && (
        <SuccessModal
          message={deleteSuccessMessage}
          onClose={() => setDeleteSuccessMessage("")}
        />
      )}

      {/* ── Import file dialog ─────────────────────────────────────── */}
      {importModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !importLoading) {
              setImportModal(false);
            }
          }}
        >
          <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-2xl p-4">
            <h3 className="text-base leading-tight font-semibold text-[#13162D] mb-2">
              Nhập file danh sách sản phẩm
            </h3>
            <div className="h-px bg-gray-200 mb-3" />

            <p className="text-sm leading-tight font-semibold text-[#13162D] mb-2">
              Chọn tệp
            </p>
            {!importFile ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => importInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    importInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setImportDragOver(true);
                }}
                onDragLeave={() => setImportDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setImportDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) setImportFile(file);
                }}
                className={`rounded-xl border border-dashed px-4 py-5 text-center cursor-pointer transition-colors ${
                  importDragOver
                    ? "border-orange-300 bg-orange-50/70"
                    : "border-orange-200 bg-orange-50/30"
                }`}
              >
                <div className="w-14 h-14 rounded-full border-2 border-orange-500 mx-auto mb-3 flex items-center justify-center">
                  <Upload size={24} className="text-orange-500" />
                </div>
                <p className="text-[15px] leading-5 font-medium text-orange-500 whitespace-pre-line">
                  Kéo thả tệp vào đây{"\n"}hoặc bấm để chọn tệp từ thiết bị
                </p>
                <p className="mt-3 inline-block border border-orange-400 rounded-lg px-3 py-1 text-[12px] leading-tight text-orange-500">
                  Dung lượng tối đa 3MB. Định dạng hỗ trợ: .xlsx, .xls, .csv,
                  .json
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-2.5">
                <div className="w-8 h-8 rounded-md bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
                  <X size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] leading-tight font-medium text-[#13162D] truncate">
                    {importFile.name}
                  </p>
                  <p className="text-[12px] text-gray-500 leading-tight">
                    {(importFile.size / 1024 / 1024).toFixed(1)}MB -{" "}
                    {new Date(importFile.lastModified).toLocaleDateString(
                      "vi-VN",
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="h-8 px-3 rounded-lg border border-orange-400 text-orange-500 text-sm font-medium hover:bg-orange-50 transition-colors"
                >
                  Tải lại
                </button>
                <button
                  type="button"
                  onClick={() => setImportFile(null)}
                  className="h-8 px-3 rounded-lg border border-gray-300 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Xóa
                </button>
              </div>
            )}

            <input
              ref={importInputRef}
              type="file"
              accept={IMPORT_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImportFile(file);
                setImportOutcome(null);
              }}
            />

            <div className="mt-3 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setImportUpdateExisting((v) => !v)}
                  className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                    importUpdateExisting
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-gray-50 border-gray-200 text-transparent"
                  }`}
                >
                  <Check size={14} />
                </button>
                <span>
                  <span className="block text-[14px] leading-tight font-medium text-[#13162D]">
                    Cập nhật thông tin nếu sản phẩm đã tồn tại
                  </span>
                  <span className="block text-[12px] leading-tight text-[#13162D] mt-0.5">
                    So khớp theo Mã SP. Trường trống không làm thay đổi dữ liệu
                    hiện có
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setImportApplyDefaultStock((v) => !v)}
                  className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                    importApplyDefaultStock
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-gray-50 border-gray-200 text-transparent"
                  }`}
                >
                  <Check size={14} />
                </button>
                <span>
                  <span className="block text-[14px] leading-tight font-medium text-[#13162D]">
                    Áp dụng cấu hình tồn kho mặc định cho sản phẩm mới
                  </span>
                  <span className="block text-[12px] leading-tight text-[#13162D] mt-0.5">
                    (Đơn vị, quản lý lô - HSD, thiết lập tồn kho cơ bản)
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setImportModal(false);
                }}
                disabled={importLoading}
                className="h-9 min-w-[88px] rounded-lg bg-gray-100 hover:bg-gray-200 text-[#13162D] text-sm font-medium transition-colors disabled:opacity-60"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleImportFileConfirm}
                disabled={
                  importLoading ||
                  !importFile ||
                  importFile.size > IMPORT_MAX_SIZE
                }
                className="h-9 min-w-[98px] rounded-lg bg-[#E56A00] hover:bg-[#D45F00] text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {importLoading ? "Đang nhập..." : "Nhập file"}
              </button>
            </div>
            {importFile && importFile.size > IMPORT_MAX_SIZE && (
              <p className="mt-3 text-sm text-red-500 text-right">
                Tệp vượt quá dung lượng 3MB. Vui lòng chọn tệp khác.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Import result dialog ───────────────────────────────────── */}
      {importOutcome?.ok === false && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl px-5 pt-5 pb-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-rose-600 flex items-center justify-center mb-3">
              <XCircle size={20} className="text-rose-600" />
            </div>
            <p className="text-[20px] leading-tight font-semibold text-[#13162D] mb-2">
              Không thể nhập dữ liệu.
            </p>
            <p className="text-[13px] leading-tight text-gray-700 mb-2">
              Một số Nhóm sản phẩm trong file chưa tồn tại trong hệ thống.
            </p>
            {importOutcome.lineNos?.length > 0 && (
              <p className="text-[13px] leading-tight text-gray-700 mb-2">
                Các dòng lỗi:{" "}
                <span className="font-semibold">
                  {importOutcome.lineNos.join(", ")}
                </span>
                .
              </p>
            )}
            <p className="text-[13px] leading-tight text-gray-700 mb-4">
              Vui lòng kiểm tra lại file hoặc{" "}
              <span className="text-orange-500 font-semibold">
                tạo nhóm sản phẩm
              </span>{" "}
              trước khi tải lên.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setImportOutcome(null);
                  setImportFile(null);
                  setImportModal(true);
                }}
                className="h-10 rounded-lg bg-[#F58232] hover:bg-[#E6772B] text-white text-[14px] font-semibold transition-colors"
              >
                Tải lại
              </button>
              <button
                onClick={() => {
                  setImportOutcome(null);
                  setImportFile(null);
                }}
                className="h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#13162D] text-[14px] font-medium transition-colors"
              >
                Hủy tải lên
              </button>
            </div>
          </div>
        </div>
      )}

      {importOutcome?.ok === true && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl px-5 pt-5 pb-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-green-500 flex items-center justify-center mb-3">
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <p className="text-[20px] leading-tight font-semibold italic text-[#13162D] mb-2">
              Nhập danh sách sản phẩm thành công!
            </p>
            <p className="text-[12px] text-gray-500 mb-4">
              Tạo mới {importOutcome.created}, cập nhật {importOutcome.updated},
              bỏ qua {importOutcome.skipped}.
            </p>
            <button
              onClick={() => {
                setImportOutcome(null);
                setImportFile(null);
              }}
              className="h-10 min-w-[90px] rounded-lg bg-[#F58232] hover:bg-[#E6772B] text-white text-[14px] font-bold transition-colors"
            >
              Xong
            </button>
          </div>
        </div>
      )}

      {/* ── Export result dialog ───────────────────────────────────── */}
      {exportOutcome?.ok === false && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl px-5 pt-5 pb-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-rose-600 flex items-center justify-center mb-3">
              <XCircle size={20} className="text-rose-600" />
            </div>
            <p className="text-[20px] leading-tight font-semibold text-[#13162D] mb-2">
              Không thể xuất dữ liệu.
            </p>
            <p className="text-[13px] leading-tight text-gray-700 mb-4">
              {exportOutcome.message || "Vui lòng thử lại sau."}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleExportProducts(exportLastOptions || {})}
                className="h-10 rounded-lg bg-[#F58232] hover:bg-[#E6772B] text-white text-[14px] font-semibold transition-colors"
              >
                Tải lại
              </button>
              <button
                onClick={() => setExportOutcome(null)}
                className="h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#13162D] text-[14px] font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {exportOutcome?.ok === true && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl px-5 pt-5 pb-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-green-500 flex items-center justify-center mb-3">
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <p className="text-[20px] leading-tight font-semibold italic text-[#13162D] mb-4">
              Đã xuất danh sách sản phẩm thành công!
            </p>
            <button
              onClick={() => setExportOutcome(null)}
              className="h-10 min-w-[90px] rounded-lg bg-[#F58232] hover:bg-[#E6772B] text-white text-[14px] font-bold transition-colors"
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard view ───────────────────────────────────────────────────────────

function VietnamRevenueMap({ revenueByProvince = [], topProvinces = [] }) {
  const { viewBox, paths } = useMemo(() => parseVietnamSvg(vnSvgRaw), []);
  const provinceRevenueMap = useMemo(() => {
    const map = new Map();
    revenueByProvince.forEach((item) => {
      const provinceId = Number(item.province_id);
      if (!Number.isFinite(provinceId)) return;
      map.set(provinceId, {
        revenue: Number(item.revenue || 0),
        province_name: item.province_name || `Tỉnh #${provinceId}`,
      });
    });
    return map;
  }, [revenueByProvince]);
  const maxRevenue = useMemo(
    () =>
      Math.max(
        ...revenueByProvince.map((item) => Number(item.revenue || 0)),
        0,
      ),
    [revenueByProvince],
  );
  const hasRevenueData = maxRevenue > 0;
  const activeProvinceCount = useMemo(
    () => revenueByProvince.filter((item) => Number(item.revenue || 0) > 0).length,
    [revenueByProvince],
  );
  const displayTopProvinces = useMemo(() => {
    if (topProvinces.length > 0) return topProvinces.slice(0, 5);
    return [...revenueByProvince]
      .filter((item) => Number(item.revenue || 0) > 0)
      .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
      .slice(0, 5);
  }, [revenueByProvince, topProvinces]);

  return (
    <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-[#FFF9F4] via-white to-[#FFF4EA] p-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="lg:w-[68%]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-[#13162D]">
                Bản đồ phân bổ doanh thu
              </p>
              <p className="text-[12px] text-gray-500">
                {hasRevenueData
                  ? `${activeProvinceCount}/${revenueByProvince.length || 63} tỉnh đang có doanh thu`
                  : "Chưa có dữ liệu doanh thu theo tỉnh"}
              </p>
            </div>
            {hasRevenueData && (
              <div className="rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-medium text-gray-600 shadow-sm border border-orange-100">
                Cao nhất: {formatCurrency(maxRevenue)}
              </div>
            )}
          </div>

          <div className="relative rounded-2xl bg-[#FFF7F0] h-[320px] overflow-hidden">
            <div className="absolute inset-[10px] bottom-12">
              <svg viewBox={viewBox} className="h-full w-full" role="img">
                {paths.map((province) => {
                  const provinceData = provinceRevenueMap.get(province.id);
                  const revenue = provinceData?.revenue || 0;
                  const provinceName =
                    provinceData?.province_name || `Tỉnh #${province.id}`;
                  return (
                    <path
                      key={province.id}
                      d={province.d}
                      fill={getHeatColor(revenue, maxRevenue)}
                      stroke="#fff"
                      strokeWidth="1.5"
                      className="transition-all duration-200 hover:opacity-80 cursor-pointer"
                    >
                      <title>
                        {provinceName}: {formatCurrency(revenue)}
                      </title>
                    </path>
                  );
                })}
              </svg>
            </div>

            {hasRevenueData && (
              <div className="absolute left-4 right-4 bottom-4 rounded-xl bg-white/90 px-4 py-3 shadow-sm border border-orange-100">
                <div className="flex items-center gap-3">
                  <span className="w-10 text-[11px] font-medium text-gray-500">
                    Thấp
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-[#FDE4D2] via-[#F6A96C] to-[#EA580C]" />
                  <span className="w-10 text-right text-[11px] font-medium text-gray-500">
                    Cao
                  </span>
                </div>
              </div>
            )}

            {!hasRevenueData && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-gray-400">
                  Chưa có dữ liệu doanh thu theo tỉnh
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-[32%]">
          <div className="h-full rounded-2xl bg-white border border-orange-100 p-4">
            <div className="mb-4">
              <p className="text-[13px] font-semibold text-[#13162D]">
                Top tỉnh doanh thu
              </p>
              <p className="text-[12px] text-gray-500">
                Xếp hạng theo doanh thu hiện tại
              </p>
            </div>

            {displayTopProvinces.length > 0 ? (
              <div className="space-y-3">
                {displayTopProvinces.map((item, index) => {
                  const revenue = Number(item.revenue || 0);
                  const percent = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                  return (
                    <div
                      key={`${item.province_id}-${item.province_name}`}
                      className="rounded-xl bg-[#FFF9F4] border border-orange-50 p-3"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F58232] text-white text-[12px] font-bold">
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#13162D]">
                              {item.province_name}
                            </p>
                            <p className="text-[12px] text-gray-500">
                              {formatCurrency(revenue)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-orange-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#F6A96C] to-[#EA580C]"
                          style={{ width: `${Math.max(percent, 8)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-[240px] items-center justify-center rounded-xl bg-[#FFF9F4] text-sm text-gray-400">
                Chưa có dữ liệu xếp hạng tỉnh
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ stats }) {
  const kpis = stats?.kpis || {};
  const revenueByHour = stats?.revenue_by_hour || [];
  const topCustomers = stats?.top_customers || [];
  const topProducts = stats?.top_products || [];
  const revenueByProvince = stats?.revenue_by_province || [];
  const topProvinces = stats?.top_provinces || [];
  const customerFlow = stats?.customer_flow || [];
  const salesChannels = stats?.sales_channels || {
    direct: 0,
    grabfood: 0,
    shopeefood: 0,
  };
  const revenueRatio = stats?.revenue_ratio || {
    retail_pct: 0,
    wholesale_pct: 0,
  };
  const maxRevenue = Math.max(...revenueByHour.map((x) => x.revenue || 0), 1);
  const maxOrders = Math.max(...revenueByHour.map((x) => x.orders || 0), 1);
  const maxCustomers = Math.max(
    ...customerFlow.map((x) => x.customers || 0),
    1,
  );
  const hasRevenueRatioData =
    (revenueRatio.retail_pct || 0) + (revenueRatio.wholesale_pct || 0) > 0;
  const hasSalesChannelData =
    (salesChannels.direct || 0) +
      (salesChannels.grabfood || 0) +
      (salesChannels.shopeefood || 0) >
    0;

  const kpiCards = [
    {
      label: "Đơn hàng mới",
      value: kpis.new_orders ?? stats?.orders_today ?? 0,
      growth: kpis.new_orders_growth_pct ?? 0,
    },
    {
      label: "Doanh thu",
      value: `${new Intl.NumberFormat("vi-VN").format(kpis.revenue ?? stats?.revenue_today ?? 0)} VND`,
      growth: kpis.revenue_growth_pct ?? 0,
    },
    {
      label: "Giờ cao điểm",
      value:
        kpis.peak_hour_from && kpis.peak_hour_to
          ? `${kpis.peak_hour_from} - ${kpis.peak_hour_to}`
          : "Chưa có dữ liệu",
    },
    {
      label: "Tình trạng ca làm việc",
      value: kpis.work_status || "Chưa có dữ liệu",
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-[22px] font-bold text-gray-800">DASHBOARD</h1>
        <p className="text-xs text-gray-400 mt-1">Tổng quan / Dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold text-gray-700">
                {card.label}
              </p>
              {typeof card.growth === "number" && (
                <span className="text-[12px] font-bold text-green-600">
                  ↗ {card.growth >= 0 ? "+" : ""}
                  {card.growth}%
                </span>
              )}
            </div>
            <p className="mt-1 text-[30px] leading-tight font-bold text-[#13162D]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-4">
        <div className="xl:col-span-3 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#13162D]">
              Doanh thu theo thời gian
            </h3>
            <span className="text-xs text-gray-400">Theo giờ</span>
          </div>
          <div className="flex items-end gap-3 h-52">
            {revenueByHour.map((item) => (
              <div key={item.hour} className="flex-1 min-w-0">
                <div className="h-40 flex items-end justify-center gap-1">
                  <div
                    className="w-4 rounded-t-md bg-orange-500"
                    style={{
                      height:
                        item.revenue > 0
                          ? `${(item.revenue / maxRevenue) * 100}%`
                          : "0%",
                    }}
                  />
                  <div
                    className="w-4 rounded-t-md bg-orange-100"
                    style={{
                      height:
                        item.orders > 0
                          ? `${(item.orders / maxOrders) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
                <p className="text-[11px] text-center text-gray-400 mt-2">
                  {item.hour}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[#13162D] mb-3">
            Tỉ lệ doanh thu
          </h3>
          <div className="flex items-center justify-center">
            <div
              className="w-40 h-40 rounded-full"
              style={{
                background: hasRevenueRatioData
                  ? `conic-gradient(#F58232 0 ${revenueRatio.retail_pct}%, #FFE5D2 ${revenueRatio.retail_pct}% 100%)`
                  : "#F3F4F6",
              }}
            />
          </div>
          <div className="flex items-center justify-center gap-8 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#F58232]" />
              <span>Bán lẻ {revenueRatio.retail_pct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#FFE5D2]" />
              <span>Bán sỉ {revenueRatio.wholesale_pct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-[#13162D] mb-3">
              Top khách hàng
            </h3>
            <div className="space-y-2">
              {topCustomers.slice(0, 5).map((c, idx) => (
                <div
                  key={`${c.name}-${idx}`}
                  className="grid grid-cols-12 text-sm items-center"
                >
                  <p className="col-span-6 text-gray-700">
                    {idx + 1}. {c.name}
                  </p>
                  <p className="col-span-3 text-gray-500">{c.province}</p>
                  <p className="col-span-3 text-right font-semibold text-gray-700">
                    {new Intl.NumberFormat("vi-VN").format(c.revenue)}đ
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-[#13162D] mb-3">
              Top sản phẩm bán chạy
            </h3>
            <div className="space-y-2">
              {topProducts.slice(0, 5).map((p, idx) => (
                <div
                  key={`${p.name}-${idx}`}
                  className="grid grid-cols-12 items-center text-sm"
                >
                  <div className="col-span-9 flex items-center gap-2 min-w-0">
                    <span className="text-gray-400">{idx + 1}.</span>
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-8 h-8 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-orange-100" />
                    )}
                    <p className="truncate text-gray-700">{p.name}</p>
                  </div>
                  <p className="col-span-3 text-right font-semibold text-gray-700">
                    {p.sold}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-[#13162D] mb-3">
              Lượng khách hàng bán lẻ
            </h3>
            <div className="h-28 flex items-end gap-2">
              {customerFlow.map((item) => (
                <div key={item.hour} className="flex-1 min-w-0">
                  <div
                    className="w-full rounded-t-md bg-orange-200"
                    style={{
                      height:
                        item.customers > 0
                          ? `${(item.customers / maxCustomers) * 100}%`
                          : "0%",
                    }}
                  />
                  <p className="text-[10px] text-center text-gray-400 mt-1">
                    {item.hour.slice(0, 2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-h-[370px]">
            <h3 className="text-sm font-semibold text-[#13162D] mb-3">
              Doanh thu theo tỉnh
            </h3>
            <VietnamRevenueMap
              revenueByProvince={revenueByProvince}
              topProvinces={topProvinces}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-[#13162D] mb-3">
              Kênh bán hàng
            </h3>
            <div className="flex items-center justify-between">
              <div
                className="w-40 h-40 rounded-full"
                style={{
                  background: hasSalesChannelData
                    ? `conic-gradient(#E56A00 0 ${salesChannels.direct}%, #FFD1B0 ${salesChannels.direct}% ${salesChannels.direct + salesChannels.grabfood}%, #FFF1E6 ${salesChannels.direct + salesChannels.grabfood}% 100%)`
                    : "#F3F4F6",
                }}
              >
                <div className="w-24 h-24 rounded-full bg-white m-auto translate-y-8" />
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#E56A00]" />
                  Trực tiếp {salesChannels.direct}%
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FFD1B0]" />
                  Grabfood {salesChannels.grabfood}%
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FFF1E6] border border-orange-100" />
                  Shopeefood {salesChannels.shopeefood}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Coming-soon placeholder ──────────────────────────────────────────────────

function ComingSoonView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-24">
      <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
        <Package className="text-orange-400" size={30} />
      </div>
      <h2 className="text-lg font-bold text-gray-700 mb-2">
        Tính năng đang phát triển
      </h2>
      <p className="text-gray-400 text-sm">Chức năng này sẽ sớm được ra mắt.</p>
    </div>
  );
}
