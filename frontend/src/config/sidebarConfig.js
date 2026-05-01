import {
  LayoutDashboard,
  BarChart2,
  Factory,
  ShoppingCart,
  Users,
  DollarSign,
  Settings,
} from "lucide-react";

// ─── Permission helpers ───────────────────────────────────────────────────────

export function checkPermission(itemRoles, userRole) {
  // Không phân biệt chữ hoa thường cho Admin
  if (userRole && userRole.toLowerCase() === "admin") return true;
  if (!itemRoles || itemRoles.length === 0) return true;
  if (!userRole) return true;
  return itemRoles.includes(userRole);
}

function filterChildren(children, userRole) {
  return children
    .filter((child) => checkPermission(child.roles, userRole))
    .map((child) => {
      if (!child.children) return child;
      const filtered = filterChildren(child.children, userRole);
      return { ...child, children: filtered };
    })
    .filter((child) => !child.children || child.children.length > 0);
}

export function filterMenu(config, userRole) {
  return config
    .filter((section) => checkPermission(section.roles, userRole))
    .map((section) => ({
      ...section,
      children: filterChildren(section.children || [], userRole),
    }))
    .filter((section) => section.children.length > 0);
}

// ─── Menu config ──────────────────────────────────────────────────────────────

const SIDEBAR_CONFIG = [
  {
    id: "tong-quan",
    label: "Tổng quan",
    icon: LayoutDashboard,
    roles: null,
    children: [
      { id: "dashboard", label: "Trang chủ", roles: null, view: "dashboard" },
    ],
  },
  {
    id: "san-xuat",
    label: "Sản xuất",
    icon: Factory,
    roles: null,
    children: [
      {
        id: "nguyen-vat-lieu",
        label: "Nguyên vật liệu",
        roles: null,
        children: [
          {
            id: "thong-tin-nvl-group",
            label: "Thông tin nguyên vật liệu",
            roles: ["Nhân viên thu mua"],
            children: [
              {
                id: "nhom-nvl",
                label: "Nhóm nguyên vật liệu",
                roles: null,
                view: "material-groups",
              },
              {
                id: "nguyen-lieu-item",
                label: "Nguyên vật liệu",
                roles: null,
                view: "materials",
              },
            ],
          },
          {
            id: "nha-cung-cap",
            label: "Nhà cung cấp",
            roles: ["Nhân viên thu mua"],
            view: "suppliers",
          },
          {
            id: "kho-nvl",
            label: "Kho nguyên vật liệu",
            roles: null,
            children: [
              {
                id: "phieu-dat-hang",
                label: "Phiếu đặt hàng",
                roles: ["Nhân viên kho", "Nhân viên thu mua"],
                view: "purchase-orders",
              },
              {
                id: "nhap-kho-nvl",
                label: "Phiếu nhập kho",
                roles: ["Nhân viên kho"],
                view: "coming-soon",
              },
              {
                id: "xuat-kho-nvl",
                label: "Phiếu xuất kho",
                roles: ["Nhân viên kho"],
                view: "coming-soon",
              },
              {
                id: "kiem-kho-nvl",
                label: "Phiếu kiểm kho",
                roles: ["Nhân viên kho"],
                view: "coming-soon",
              },
              {
                id: "ton-kho-nvl",
                label: "Tồn kho nguyên vật liệu",
                roles: ["Nhân viên kho", "Nhân viên thu mua"],
                view: "coming-soon",
              },
            ],
          },
        ],
      },
      {
        id: "bep-trung-tam",
        label: "Bếp trung tâm",
        roles: null,
        children: [
          {
            id: "quan-ly-danh-muc",
            label: "Quản lý danh mục",
            roles: null,
            children: [
              {
                id: "thong-tin-btp",
                label: "Thông tin bán thành phẩm",
                roles: ["Trợ lý sản xuất"],
                view: "semi-finished-products",
              },
              {
                id: "thong-tin-san-pham",
                label: "Thông tin sản phẩm",
                roles: ["Trợ lý sản xuất"],
                children: [
                  {
                    id: "nhom-san-pham",
                    label: "Nhóm sản phẩm",
                    roles: ["Trợ lý sản xuất"],
                    view: "product-groups",
                  },
                  {
                    id: "san-pham",
                    label: "Sản phẩm",
                    roles: ["Trợ lý sản xuất"],
                    view: "products",
                  },
                ],
              },
            ],
          },
          {
            id: "van-hanh-sx",
            label: "Vận hành sản xuất",
            roles: null,
            children: [
              {
                id: "yc-dat-hang-sx",
                label: "Thông tin YC đặt hàng",
                roles: ["Trợ lý sản xuất"],
                view: "production-requests",
              },
              {
                id: "ke-hoach-sx",
                label: "Kế hoạch sản xuất",
                roles: ["Trợ lý sản xuất"],
                view: "production-plans",
              },
              {
                id: "lenh-sx",
                label: "Lệnh sản xuất",
                roles: ["Trợ lý sản xuất"],
                view: "coming-soon",
              },
              {
                id: "nghiem-thu-sx",
                label: "Phiếu nghiệm thu sản xuất",
                roles: ["Bếp trưởng"],
                view: "coming-soon",
              },
            ],
          },
          {
            id: "kho-bep",
            label: "Kho bếp",
            roles: null,
            children: [
              {
                id: "nhap-kho-bep",
                label: "Phiếu nhập kho",
                roles: ["Bếp trưởng"],
                view: "coming-soon",
              },
              {
                id: "xuat-kho-bep",
                label: "Phiếu xuất kho",
                roles: ["Bếp trưởng"],
                view: "coming-soon",
              },
              {
                id: "ton-kho-bep",
                label: "Tồn kho",
                roles: ["Bếp trưởng"],
                view: "coming-soon",
              },
            ],
          },
        ],
      },
      {
        id: "khu-vuc-btp",
        label: "Khu vực BTP",
        roles: ["Nhân viên kho"],
        children: [
          {
            id: "nhap-kho-btp",
            label: "Phiếu nhập kho",
            roles: ["Nhân viên kho"],
            view: "coming-soon",
          },
          {
            id: "ban-giao-dong-goi",
            label: "Phiếu bàn giao đóng gói",
            roles: ["Nhân viên đóng gói", "Nhân viên kho"],
            view: "coming-soon",
          },
          {
            id: "ghi-nhan-dong-goi",
            label: "Phiếu ghi nhận đóng gói",
            roles: ["Nhân viên đóng gói", "Nhân viên kho"],
            view: "coming-soon",
          },
          {
            id: "xuat-kho-btp",
            label: "Phiếu xuất kho",
            roles: ["Nhân viên kho"],
            view: "coming-soon",
          },
          {
            id: "ton-kho-btp",
            label: "Tồn kho",
            roles: ["Nhân viên kho"],
            view: "coming-soon",
          },
        ],
      },
    ],
  },
  {
    id: "ban-hang",
    label: "Bán hàng",
    icon: ShoppingCart,
    roles: ["Nhân viên bán hàng"],
    children: [
      {
        id: "sp-ban-hang",
        label: "Sản phẩm",
        roles: null,
        children: [
          {
            id: "ton-kho-btp-bh",
            label: "Tồn kho bán thành phẩm",
            roles: ["Nhân viên bán hàng"],
            view: "coming-soon",
          },
          {
            id: "ton-kho-sp-bh",
            label: "Tồn kho sản phẩm",
            roles: ["Nhân viên bán hàng"],
            view: "coming-soon",
          },
          {
            id: "yc-dat-hang-bh",
            label: "Yêu cầu đặt hàng",
            roles: ["Quản lý cửa hàng"],
            view: "coming-soon",
          },
          {
            id: "nhap-kho-bh",
            label: "Phiếu nhập kho",
            roles: ["Nhân viên bán hàng"],
            view: "coming-soon",
          },
          {
            id: "xuat-kho-bh",
            label: "Phiếu xuất kho",
            roles: ["Nhân viên bán hàng"],
            view: "coming-soon",
          },
          {
            id: "kiem-kho-bh",
            label: "Phiếu kiểm kho",
            roles: ["Nhân viên bán hàng"],
            view: "coming-soon",
          },
          {
            id: "khach-hang-bh",
            label: "Khách hàng",
            roles: ["Nhân viên bán hàng"],
            view: "coming-soon",
          },
        ],
      },
      {
        id: "khach-hang",
        label: "Khách hàng",
        roles: null,
        children: [
          {
            id: "nhom-kh",
            label: "Nhóm khách hàng",
            roles: null,
            view: "coming-soon",
          },
          {
            id: "thong-tin-kh",
            label: "Thông tin khách hàng",
            roles: null,
            view: "coming-soon",
          },
        ],
      },
      {
        id: "don-hang",
        label: "Đơn hàng",
        roles: ["Nhân viên bán hàng"],
        view: "orders",
      },
      {
        id: "van-chuyen",
        label: "Vận chuyển",
        roles: ["Nhân viên bán hàng"],
        view: "coming-soon",
      },
      {
        id: "khuyen-mai",
        label: "Khuyến mãi",
        roles: ["Nhân viên bán hàng"],
        view: "coming-soon",
      },
    ],
  },
  {
    id: "nhan-su",
    label: "Nhân sự",
    icon: Users,
    roles: null,
    children: [
      {
        id: "thiet-lap-nv",
        label: "Thiết lập nhân viên",
        roles: null,
        children: [
          {
            id: "ho-so-nv",
            label: "Hồ sơ nhân viên",
            roles: ["Chuyên viên nhân sự", "Admin"],
            view: "employees",
          },
          {
            id: "vai-tro-nv",
            label: "Vai trò nhân viên",
            roles: ["Trợ lý nhân sự", "Admin"],
            view: "coming-soon",
          },
          {
            id: "tai-khoan",
            label: "Tài khoản",
            roles: ["Trợ lý nhân sự", "Admin"],
            view: "coming-soon",
          },
        ],
      },
      {
        id: "quan-ly-cham-cong",
        label: "Quản lý chấm công",
        roles: null,
        children: [
          {
            id: "ca-lam-viec",
            label: "Ca làm việc",
            roles: ["Trợ lý nhân sự", "Admin"],
            view: "work-shifts",
          },
          {
            id: "lich-lam-viec",
            label: "Lịch làm việc",
            roles: ["Chuyên viên nhân sự", "Admin"],
            view: "lich-lam-viec",
          },
          {
            id: "cham-cong",
            label: "Chấm công",
            roles: ["Chuyên viên nhân sự", "Admin"],
            view: "cham-cong",
          },
        ],
      },
      {
        id: "quan-ly-luong",
        label: "Quản lý lương",
        roles: null,
        children: [
          {
            id: "thuong",
            label: "Thưởng",
            roles: ["Chuyên viên nhân sự", "Admin"],
            view: "bonuses",
          },
          {
            id: "phuc-loi",
            label: "Phúc lợi",
            roles: ["Chuyên viên nhân sự", "Admin"],
            view: "phuc-loi",
          },
          {
            id: "bang-luong",
            label: "Bảng lương",
            roles: ["Chuyên viên nhân sự", "Admin"],
            view: "bang-luong",
          },
        ],
      },
    ],
  },
  {
    id: "tai-chinh",
    label: "Tài chính",
    icon: DollarSign,
    roles: ["Nhân viên tài chính"],
    children: [
      { id: "nguon-quy", label: "Nguồn quỹ", roles: null, view: "coming-soon" },
      { id: "so-quy", label: "Sổ quỹ", roles: null, view: "coming-soon" },
      {
        id: "cong-no-ncc",
        label: "Công nợ nhà cung cấp",
        roles: null,
        view: "coming-soon",
      },
      {
        id: "cong-no-kh",
        label: "Công nợ khách hàng",
        roles: null,
        view: "coming-soon",
      },
    ],
  },
  {
    id: "cai-dat",
    label: "Cài đặt",
    icon: Settings,
    roles: ["Admin"],
    children: [
      {
        id: "thiet-lap-dd",
        label: "Thiết lập địa điểm",
        roles: null,
        view: "locations",
      },
      {
        id: "thiet-lap-vchuyen",
        label: "Đối tác vận chuyển",
        roles: null,
        view: "shipping-units", // ← ĐÃ ĐỔI
      },
    ],
  },
];

export default SIDEBAR_CONFIG;
