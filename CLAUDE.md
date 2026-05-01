# CLAUDE.md — ERP Yummy

Tài liệu định hướng cho Claude Code. Đọc file này trước khi bắt đầu bất kỳ phiên làm việc nào.

---

## Session Config

| Thuộc tính | Giá trị |
|---|---|
| Mode | Autonomous — tự thực hiện, không dừng hỏi lại |
| Venv | `./.venv/` (Conda) — Python tại `.venv/python.exe` |
| Dependency Check | Đọc `requirements.txt` trước khi chạy backend |
| Filter | Bỏ qua các path trong `.claudeignore` khi quét project |

---

## Tech Stack

| Layer | Tech | Port |
|---|---|---|
| Backend | Django 6.0.3 + DRF 3.17.1 + django-cors-headers 4.9.0 | **2344** |
| Frontend | React 19 + Vite 8 + TailwindCSS 3 + Axios + lucide-react | **2347** |
| Database | SQLite (`backend/db.sqlite3`) | — |

---

## Directory Structure

```
demo_app/
├── .venv/                        # Conda environment (python.exe ở root)
├── .claudeignore                 # Paths bị bỏ qua khi quét
├── .gitignore
├── requirements.txt              # Python deps
├── CLAUDE.md                     # ← File này
├── schema_manifest.json          # API schema + trạng thái module
├── homepage.png                  # Thiết kế tham chiếu giao diện
├── c.md                          # Terminal shortcuts & notes
├── prompt_4_claude_code.md       # Playbook các prompt theo thứ tự
│
├── backend/
│   ├── manage.py
│   ├── db.sqlite3
│   ├── backend/                  # Django project config
│   │   ├── settings.py           # INSTALLED_APPS, MIDDLEWARE, CORS
│   │   ├── urls.py               # Root URL → include api.urls
│   │   ├── asgi.py
│   │   └── wsgi.py
│   └── api/                      # Django app chính
│       ├── models.py             # [TODO] Product, Order, Customer models
│       ├── views.py              # dashboard_stats, product_list
│       ├── urls.py               # /api/dashboard/, /api/products/
│       ├── admin.py
│       ├── apps.py
│       ├── tests.py
│       └── migrations/
│
└── frontend/
    ├── index.html
    ├── package.json              # react, axios, lucide-react, tailwindcss
    ├── vite.config.js            # port: 2347
    ├── tailwind.config.js        # content: src/**/*.{js,jsx}
    ├── postcss.config.js
    └── src/
        ├── main.jsx              # Entry point
        ├── App.jsx               # → render <HomePage />
        ├── index.css             # @tailwind directives
        ├── App.css               # (cleared)
        ├── api/
        │   └── axios.js          # baseURL: http://127.0.0.1:2344/api/
        └── components/
            └── HomePage.jsx      # Layout ERP: Sidebar + Header + Dashboard + Products
```

---

## Start Commands

```bash
# Backend (terminal 1)
D: && cd D:\TheALAB_VibeCoding\demo_app\backend && conda activate ../.venv/ && python manage.py runserver 2344

# Frontend (terminal 2)
D: && cd D:\TheALAB_VibeCoding\demo_app\frontend && npm run dev

# Git
D: && cd D:\TheALAB_VibeCoding\demo_app

# Claude Code
D: && cd D:\TheALAB_VibeCoding\demo_app && claude
```

---

## API Endpoints (hiện tại)

| Method | URL | Auth | Mô tả | Status |
|---|---|---|---|---|
| POST | `/api/auth/login/` | Public | Đăng nhập bằng phone + password → JWT | ✅ Done |
| GET | `/api/dashboard/` | Bearer | Stats tổng quan (4 số liệu) | ✅ Done |
| GET | `/api/products/` | Bearer | Danh sách thành phẩm (11 items mock) | ✅ Done |

---

## Auth

- **JWT** via `djangorestframework-simplejwt 5.5.1`
- Access token lifetime: **8 giờ**; Refresh: **7 ngày**
- Token lưu tại `localStorage` keys: `access_token`, `refresh_token`, `user`
- Axios interceptor tự gắn `Authorization: Bearer <token>` vào mọi request
- 401 response → tự động clear token + reload về LoginPage

**Test account:** Phone `0987654321` / Password `yummy123`  
(Tạo bằng `python manage.py create_test_user`)

---

## Frontend Components

| Component | File | Mô tả | Status |
|---|---|---|---|
| LoginPage | `src/pages/LoginPage.jsx` | Split-screen login: food photo trái, form phải | ✅ Done |
| HomePage | `src/components/HomePage.jsx` | Layout chính: Sidebar + Header + 2 views | ✅ Done |
| DashboardView | (trong HomePage.jsx) | 4 stat cards + hoạt động gần đây | ✅ Done |
| ProductsView | (trong HomePage.jsx) | Bảng thành phẩm + search + pagination | ✅ Done |
| ComingSoonView | (trong HomePage.jsx) | Placeholder cho các view chưa làm | ✅ Done |

---

## Project Status

### ✅ Completed (Session 1 — 2026-04-13)

- [x] Cấu hình Django settings: `rest_framework`, `corsheaders`, `api` app
- [x] CORS cho phép `http://localhost:2347` và `http://127.0.0.1:2347`
- [x] API endpoints: `GET /api/dashboard/` và `GET /api/products/`
- [x] URL routing: `backend/urls.py` → `api/urls.py`
- [x] Install frontend packages: `tailwindcss@3`, `postcss`, `autoprefixer`, `axios`, `lucide-react`
- [x] Cấu hình Vite port 2347, Tailwind content paths, PostCSS
- [x] `src/api/axios.js` với `baseURL: http://127.0.0.1:2344/api/`
- [x] `HomePage.jsx`: Sidebar thu gọn/mở rộng, Header, Dashboard, Products table
- [x] Hiển thị badge trạng thái API (Connected/Offline) trực tiếp trên UI
- [x] Django system check: 0 issues

### ✅ Completed (Session 2 — 2026-04-13)

- [x] Cài `djangorestframework-simplejwt 5.5.1` + `PyJWT 2.12.1`
- [x] `settings.py`: `REST_FRAMEWORK` + `SIMPLE_JWT` config (access 8h, refresh 7 ngày)
- [x] `api/serializers.py`: `PhoneLoginSerializer` xác thực phone + password
- [x] `api/views.py`: `PhoneLoginView` trả về access + refresh + user info; dashboard & products yêu cầu `IsAuthenticated`
- [x] `api/urls.py`: `POST /api/auth/login/`
- [x] Django migrate: tạo bảng auth SQLite lần đầu
- [x] Management command `create_test_user` — tài khoản `0987654321 / yummy123`
- [x] `src/pages/LoginPage.jsx`: split-screen (food photo CSS crop trái, form phải)
- [x] Form: phone icon, password icon + eye toggle, loading spinner, error display
- [x] `src/api/axios.js`: request interceptor gắn Bearer token; 401 interceptor auto-logout
- [x] `src/App.jsx`: auth routing — `!user` → `<LoginPage>`, `user` → `<HomePage>`
- [x] `HomePage.jsx`: nhận `user` + `onLogout` props; avatar initials động; nút logout cả header lẫn sidebar

### ✅ Completed (Session 3 — 2026-04-13) — Custom User Model + Login Done

- [x] `api/models.py`: `User(AbstractUser)` — xóa `username`, thêm `phone_number` (USERNAME_FIELD) + `full_name`
- [x] `UserManager`: override `create_user` / `create_superuser` dùng `phone_number`
- [x] `settings.py`: `AUTH_USER_MODEL = 'api.User'` + `DEFAULT_AUTO_FIELD`
- [x] `api/admin.py`: `UserAdmin` custom — đăng ký model mới với Django Admin
- [x] `api/serializers.py`: field `phone_number` (thay `phone`)
- [x] `api/views.py`: dùng `get_user_model()`, response trả `user.phone_number`
- [x] DB reset: clear migration history, `makemigrations api` → `0001_initial.py`, `migrate` sạch
- [x] Management command cập nhật: seed `0915085900 / 12345`
- [x] `LoginPage.jsx`: payload API gửi `phone_number`, cập nhật credentials hint
- [x] **Login feature: DONE**
- [x] **Logo updated**: `screenshot/logo.jpg` → `frontend/src/assets/logo.jpg`; dùng `<img>` thật trong `LoginPage.jsx` (w-20 h-20) và `HomePage.jsx` sidebar (w-9 h-9)

### ✅ Completed (Session 4 — 2026-04-14) — CRUD Product + Real DB

- [x] `api/models.py`: Thêm `Product`, `Customer`, `Order` models
- [x] Migration `0002_customer_product_order.py` — tạo 3 bảng mới
- [x] `api/serializers.py`: `ProductSerializer`, `CustomerSerializer`, `OrderSerializer`
- [x] `api/views.py`: `product_list` (GET+POST), `product_detail` (GET+PUT+PATCH+DELETE), `customer_list`, `order_list`
- [x] `api/views.py`: `dashboard_stats` trả dữ liệu thật từ DB (count Product, Order aggregation)
- [x] `api/urls.py`: thêm route `/api/products/<pk>/`, `/api/customers/`, `/api/orders/`
- [x] Management command `seed_products` — seed 11 sản phẩm mẫu vào DB
- [x] `src/components/ProductModal.jsx` — modal thêm/sửa sản phẩm (validation + API calls)
- [x] `HomePage.jsx` — wire nút "Tạo lô" → modal create, Pencil → modal edit, Trash → confirm delete
- [x] Delete confirm dialog với loading state

### ✅ Completed (Session 5 — 2026-04-14) — JSON Data Sync cho Thành phẩm

- [x] `api/models.py`: Thêm field `quantity` (IntegerField, default=0) vào Product
- [x] Migration `0003_add_product_quantity.py` — apply thành công
- [x] `api/serializers.py`: ProductSerializer bao gồm `quantity`
- [x] Management command `export_products` — xuất Product ra `data_sync/products.json`
- [x] `data_sync/products.json` — file JSON mẫu được tạo (11 sản phẩm)
- [x] `api/views.py`: `product_sync` — POST /api/products/sync/ — đọc JSON, upsert theo id, trả {updated, created, message}
- [x] `api/urls.py`: route `products/sync/` (trước `products/<int:pk>/`)
- [x] `HomePage.jsx`: nút "Đồng bộ từ file JSON" (xanh lá, CloudSync icon)
- [x] Confirm dialog: cảnh báo ghi đè + hiện kết quả updated/created sau sync

**Quy trình sử dụng:**
1. Sửa `data_sync/products.json` theo ý muốn
2. Vào tab Thành phẩm → nhấn "Đồng bộ từ file JSON"
3. Xác nhận → DB được cập nhật tức thì

### ✅ Completed (Session 6 — 2026-04-14) — Dropdown Action Menu

- [x] `HomePage.jsx`: Thay 2 icon (Pencil/Trash2) trong cột Hành động bằng dropdown button "Hành động ∨"
- [x] Dropdown mở/đóng bằng `useState(openDropdownId)` — mỗi dòng độc lập
- [x] Click ngoài dropdown → tự đóng (document `mousedown` listener + `stopPropagation` trên container)
- [x] Menu items: "Chỉnh sửa" và "Xóa" — giữ nguyên logic `onEditClick` / `onDeleteClick`
- [x] Style: nền trắng, `rounded-xl`, `border-gray-200`, shadow-lg, `hover:bg-gray-100`, `z-10`

### ✅ Completed (Session 7 — 2026-04-14) — Rename + BG Color + Create Product Page

- [x] **Rename global**: 'Thành phẩm' → 'Sản phẩm' (Sidebar, Breadcrumb, Heading, trong danh sách)
- [x] **Rename button**: 'Tạo lô' → 'Thêm sản phẩm'
- [x] **Background**: `<main>` content area đổi thành `bg-[#FFF6F3]`
- [x] `api/models.py`: Product thêm `description`, `cost_price`, `compare_price`, `production_notes`, `notes`
- [x] `api/models.py`: Thêm model `RawMaterial` (code, name, unit) và `ProductBOM` (FK Product + RawMaterial, quantity, unit)
- [x] Migration `0004_product_extended_fields_rawmaterial_bom.py` — apply thành công
- [x] `api/serializers.py`: `RawMaterialSerializer`, `ProductBOMReadSerializer`, `ProductBOMWriteSerializer`, `ProductCreateSerializer` (auto-gen code, hỗ trợ bom_items)
- [x] `api/views.py`: `raw_material_list` — GET /api/raw-materials/; `product_list` POST dùng `ProductCreateSerializer`
- [x] `api/urls.py`: route `raw-materials/`
- [x] Management command `seed_raw_materials` — seed 12 nguyên liệu mẫu vào DB
- [x] `src/components/CreateProductPage.jsx`: trang thêm sản phẩm 2 cột — Thông tin chung + BOM + Giá (trái), Ảnh + Ghi chú (phải), Footer Hủy/Lưu
- [x] `HomePage.jsx`: `onCreateClick` → `setActiveView('create-product')` thay vì mở modal; import & render `CreateProductPage`

**Quy trình thêm sản phẩm:**
1. Vào tab Sản phẩm → nhấn "Thêm sản phẩm"
2. Điền Thông tin chung (tên, nhóm, đơn vị, mô tả)
3. Thêm Định mức BOM (chọn nguyên liệu, định lượng, đơn vị)
4. Nhập giá bán → hệ thống tự tính biên lợi nhuận
5. Nhấn "Lưu" → POST /api/products/ → quay về danh sách

### ✅ Completed (Session 8 — 2026-04-21) — Sidebar RBAC Implemented

- [x] Đọc `screenshot/sidebar.docx` → parse cấu trúc menu 6 nhóm + 3 cấp độ phân cấp
- [x] `src/config/sidebarConfig.js`: SIDEBAR_CONFIG (6 sections, ~40 menu items), `checkPermission()`, `filterMenu()` helpers
- [x] `src/components/Sidebar.jsx`: component độc lập với RBAC, multi-level accordion, smooth transition
- [x] Toggle button ChevronLeft/ChevronRight ở chân sidebar
- [x] Collapsed mode (w-16): chỉ hiển thị section icons; click icon → mở sidebar và expand section đó
- [x] Expanded mode (w-60): section headers (gray uppercase) + accordion sub-groups + leaf items có dot
- [x] RBAC: `userRole = user?.role || null`; null = admin mode (thấy tất cả); role cụ thể → ẩn items không được phép
- [x] Auto-expand path đến active menu item khi mount
- [x] `activeMenuId` state tách biệt với `activeView` — sidebar highlight đúng item ngay cả khi đang ở sub-view (create/edit product)
- [x] `HomePage.jsx`: remove old sidebar code, thêm `<Sidebar>` component với props user/onLogout/activeMenuId/onNavigate
- [x] **Sidebar RBAC Implemented**

### ✅ Completed (Session 9 — 2026-04-23) — Dropdown Arrow Fix + Product Sort

- [x] `CreateProductPage.jsx` + `EditProductPage.jsx`: Thêm `appearance-none` + `pr-8` + custom `ChevronDown` icon (`right-3`, `pointer-events-none`) cho tất cả `<select>` — icon mũi tên cách viền phải đúng bằng `px-3` (12px) giống text cách viền trái
- [x] `api/models.py`: `Product.Meta.ordering` đổi từ `['code']` → `['-id']` — sản phẩm mới nhất lên đầu danh sách
- [x] `HomePage.jsx`: `onSaved` callback dùng `[savedProduct, ...prev]` (unshift) thay vì `[...prev, savedProduct]`

### ✅ Completed (Session 10 — 2026-04-24) — Danh sách Nguyên vật liệu

- [x] `api/models.py`: Thêm `role` field vào `User`, thêm model `Material` (code, name, group, unit, image, status, ordering=[-id])
- [x] Migration `0007_add_user_role_material.py` — apply thành công
- [x] Management command `seed_materials` — seed 10 NVL mẫu vào DB
- [x] `api/serializers.py`: `MaterialSerializer` (read + image URL), `MaterialWriteSerializer` (auto-gen code NVL{6-digit})
- [x] `api/views.py`: `material_list` (GET+POST), `material_detail` (GET+PUT+PATCH+DELETE) — RBAC: chỉ `is_staff`, `is_superuser`, hoặc `role in {'Nhân viên thu mua', 'Admin'}`
- [x] `api/views.py`: `PhoneLoginView` response thêm `role` field
- [x] `api/urls.py`: `GET/POST /api/materials/`, `GET/PUT/PATCH/DELETE /api/materials/<pk>/`
- [x] `src/config/sidebarConfig.js`: `nguyen-lieu-item` view đổi từ `coming-soon` → `materials`
- [x] `src/components/MaterialsPage.jsx`: trang danh sách NVL — search, filter status, pagination, delete confirm, action dropdown, status badge (blue/red), thumbnail, breadcrumb, nút Xuất + Thêm NVL
- [x] `src/components/HomePage.jsx`: import + render `MaterialsPage` tại `activeView === 'materials'`
- [x] **Nguyên vật liệu list page: DONE**

**API endpoints mới:**
- `GET /api/materials/?search=` — danh sách NVL (filter theo tên/mã)
- `POST /api/materials/` — tạo NVL (FormData, hỗ trợ upload ảnh)
- `GET /api/materials/{pk}/` — chi tiết
- `PUT/PATCH /api/materials/{pk}/` — cập nhật (hỗ trợ ảnh)
- `DELETE /api/materials/{pk}/` — xóa

**Seed command:** `python manage.py seed_materials`

### ✅ Completed (Session 10b — 2026-04-24) — Sidebar Materials hierarchy updated

- [x] `src/config/sidebarConfig.js`: Tái cấu trúc `nguyen-vat-lieu` thành 3 cấp
  - `thong-tin-nvl-group` (Thông tin nguyên vật liệu, roles: `['Nhân viên thu mua']`) với 2 con: Nhóm NVL + Nguyên vật liệu
  - `nha-cung-cap` (leaf, roles: `['Nhân viên thu mua']`)
  - `kho-nvl` (Kho nguyên vật liệu) di chuyển từ top-level sang con của `nguyen-vat-lieu` với 5 phiếu
  - `nguyen-vat-lieu.roles` đổi thành `null` (cả Nhân viên thu mua lẫn Nhân viên kho đều thấy)
- [x] `src/components/Sidebar.jsx`: Thêm `isDescendantActive()` helper; cập nhật `NavItem`:
  - depth≥1 expandable items: hiển thị bullet dot (cam khi child active)
  - `isChildActive` flag: text + bullet chuyển cam khi có descendant đang active
  - depth=0 items: giữ nguyên behavior (icon cam khi expanded, text dark semibold)
- [x] Auto-expand path: khi `activeMenuId='nguyen-lieu-item'`, sidebar tự mở `san-xuat → nguyen-vat-lieu → thong-tin-nvl-group`

### ✅ Completed (Session 13 — 2026-04-26) — Purchase Order list page

- [x] `api/models.py`: Thêm `Supplier` (name, phone, address, status) và `PurchaseOrder` (code, supplier FK, total_value, status: draft/waiting/received/cancelled, notes)
- [x] Migration `0009_supplier_purchaseorder.py` — apply thành công
- [x] `api/serializers.py`: `SupplierSerializer`, `PurchaseOrderSerializer` (kèm supplier_name), `PurchaseOrderWriteSerializer` (auto-gen PDH{6-digit})
- [x] `api/views.py`: `supplier_list` (GET/POST), `purchase_order_list` (GET/POST), `purchase_order_detail` (GET/PUT/PATCH/DELETE) — RBAC: `Nhân viên thu mua` + `Admin`
- [x] `api/urls.py`: routes `/api/suppliers/`, `/api/purchase-orders/`, `/api/purchase-orders/<pk>/`
- [x] Management command `seed_purchase_orders` — seed 5 suppliers + 5 phiếu mẫu (PDH001–PDH005)
- [x] `src/components/PurchaseOrdersPage.jsx`: bảng danh sách — search, filter 4 trạng thái, pagination, action dropdown, delete confirm
- [x] Status badges 4 màu: Lưu nháp (xám), Chờ nhận (vàng), Đã nhận (xanh lá), Đã hủy (đỏ) — rounded-[7px] py-[9px] px-[20px]
- [x] `src/components/HomePage.jsx`: import + render `PurchaseOrdersPage` tại `activeView === 'purchase-orders'`
- [x] `src/config/sidebarConfig.js`: `phieu-dat-hang.view` đổi từ `'coming-soon'` → `'purchase-orders'`

**API endpoints mới:**
- `GET /api/suppliers/` — danh sách nhà cung cấp
- `POST /api/suppliers/` — tạo nhà cung cấp
- `GET /api/purchase-orders/?search=&status=` — danh sách phiếu đặt hàng
- `POST /api/purchase-orders/` — tạo phiếu (auto-gen code PDH{6-digit})
- `GET/PUT/PATCH/DELETE /api/purchase-orders/{pk}/`

### ✅ Completed (Session 12c — 2026-04-26) — Add Phiếu đặt hàng access for purchasing staff

- [x] `sidebarConfig.js`: `phieu-dat-hang` thêm `'Nhân viên thu mua'` vào roles → thu mua thấy 2 mục trong Kho NVL: Phiếu đặt hàng + Tồn kho NVL

### ✅ Completed (Session 12b — 2026-04-26) — Fixed dynamic user info in Header

- [x] `backend/api/views.py`: `PhoneLoginView` đổi `user.get_full_name()` → `user.full_name or user.phone_number` (get_full_name() trả về rỗng vì model dùng `full_name` không phải `first_name`/`last_name`)
- [x] `src/components/HomePage.jsx`: Header role đổi từ hardcode `'Trợ lý sản xuất'` → `{user.role || ''}` — hiển thị role thực tế từ localStorage/login response

### ✅ Completed (Session 12 — 2026-04-26) — Created Purchasing Staff account & refined RBAC

- [x] Management command `create_purchasing_staff` — tạo tài khoản `0982334556 / 12345`, role `Nhân viên thu mua`, full_name `Trần Minh Anh`
- [x] `sidebarConfig.js`: `phieu-dat-hang` đổi roles từ `['Nhân viên thu mua']` → `['Nhân viên kho']` (ẩn khỏi thu mua)
- [x] `sidebarConfig.js`: `ton-kho-nvl` đổi roles từ `['Nhân viên kho']` → `['Nhân viên kho', 'Nhân viên thu mua']` (cho phép thu mua thấy Tồn kho NVL)
- [x] Kết quả: `Nhân viên thu mua` chỉ thấy trong Kho NVL đúng 1 mục Tồn kho nguyên vật liệu; tất cả phiếu nhập/xuất/kiểm/đặt hàng bị ẩn

### ✅ Completed (Session 11 — 2026-04-24) — CreateMaterialPage + Footer UI fix

- [x] `src/components/CreateMaterialPage.jsx`: Trang thêm NVL — 2 cột, FormData upload ảnh, batch_management checkbox, SuccessModal
- [x] `backend/api/migrations/0008_material_notes_batch.py`: AddField `notes` + `batch_management` vào Material
- [x] `src/components/MaterialsPage.jsx`: Tách `onEditClick` prop riêng khỏi `onCreateClick`
- [x] `src/components/HomePage.jsx`: Wire `create-material` view, import `CreateMaterialPage`
- [x] Footer style fix: bỏ sticky white bar, tất cả nút (RotateCcw + Hủy + Lưu) group bên phải, nền `#FFF6F3`, `rounded-xl`, `font-nunito-sans`

### ✅ Completed (Session 14 — 2026-04-29) — Danh sách Cài đặt địa điểm

- [x] `api/models.py`: Thêm model `Location` (code, name, address, phone, status, ordering=[-id])
- [x] Migration `0010_add_location.py` — apply thành công
- [x] `api/serializers.py`: `LocationSerializer`, `LocationWriteSerializer` (auto-gen MDD{6-digit})
- [x] `api/views/cai_dat/location_views.py`: `location_list` (GET+POST), `location_detail` (GET+PUT+PATCH+DELETE) — RBAC: chỉ Admin
- [x] `api/views/cai_dat/settings_views.py`: Loại bỏ stub `location_list`, giữ `shipping_unit_list`
- [x] `api/views/cai_dat/__init__.py`: Export `location_list`, `location_detail` từ `location_views.py`
- [x] `api/urls.py`: Thêm `GET/POST /api/locations/` và `GET/PUT/PATCH/DELETE /api/locations/<pk>/`
- [x] Management command `seed_locations` — seed 5 địa điểm mẫu (MDD001–MDD005)
- [x] `src/components/cai-dat/thiet-lap-dia-diem/LocationsPage.jsx`: Danh sách địa điểm — search, filter status, pagination, action dropdown, delete confirm, status badge, breadcrumb, nút Nhập + Xuất + Thêm địa điểm
- [x] `src/config/sidebarConfig.js`: `thiet-lap-dd.view` đổi từ `'coming-soon'` → `'locations'`
- [x] `src/components/tong-quan/trang-chu/HomePage.jsx`: Import + render `LocationsPage` tại `activeView === 'locations'`

**API endpoints mới:**
- `GET /api/locations/?search=&status=` — danh sách địa điểm (chỉ Admin)
- `POST /api/locations/` — tạo địa điểm (auto-gen code MDD{6-digit})
- `GET/PUT/PATCH/DELETE /api/locations/{pk}/` — chi tiết/cập nhật/xóa

**Seed command:** `python manage.py seed_locations`

### ✅ Completed (Session 15 — 2026-04-29) — Pop-up Thêm mới địa điểm (v1 đơn giản)

- [x] `AddLocationModal.jsx` v1 — 4 fields cơ bản (Tên*, SĐT, Mã, Địa chỉ, Trạng thái)
- [x] `LocationsPage.jsx`: Tích hợp modal, SuccessModal, prepend list
- [x] `HomePage.jsx`: Bỏ prop onCreateClick

### ✅ Completed (Session 16 — 2026-04-29) — Pop-up Thêm mới địa điểm (đầy đủ theo design)

- [x] `api/models.py` Location: thêm 10 fields mới — email, manager (FK User), province, district, ward, location_types, manage_nvl, manage_btp, manage_thanh_pham, allow_delivery
- [x] Migration `0011_location_extended_fields.py` — apply thành công
- [x] `api/serializers.py`: Viết lại `LocationSerializer` (thêm manager_id, manager_name, location_types_list), `LocationWriteSerializer` (Serializer thuần — xử lý location_types list→csv, manager FK)
- [x] `api/views/cai_dat/location_views.py`: Thêm `staff_user_list` — GET /api/staff-users/ trả danh sách user active
- [x] `api/urls.py`: Thêm route `GET /api/staff-users/`
- [x] `AddLocationModal.jsx`: Viết lại hoàn toàn theo screenshot — Tên*, Nhân viên quản lý* (dropdown fetch từ API), SĐT* | Email, Địa chỉ | Tỉnh/Thành phố, Quận/Huyện | Phường/Xã, Loại địa điểm* (3 checkboxes), Thiết lập địa điểm (4 checkboxes 2 cột với viền cam), footer Reset/Hủy/Lưu

**Quy trình thêm địa điểm:**
1. Vào Cài đặt → Thiết lập địa điểm → nhấn "+ Thêm địa điểm"
2. Điền form (Tên*, Nhân viên quản lý*, SĐT* bắt buộc + Loại địa điểm*)
3. Nhấn "Lưu" → POST /api/locations/ → đóng modal → SuccessModal → danh sách cập nhật

**API mới:**
- `GET /api/staff-users/` — danh sách user active cho dropdown (tất cả role truy cập)

### ✅ Completed (Session 17 — 2026-04-29) — Audit Trail cho địa điểm + Stay-on-page sau lưu

- [x] `api/models.py`: Thêm model `LocationHistory` (location FK, timestamp, actor_name, action, ordering=['-timestamp'])
- [x] Migration `0013_location_history.py` — apply thành công
- [x] `api/serializers.py`: Thêm `LocationHistorySerializer`; thêm `history = LocationHistorySerializer(many=True, read_only=True)` vào `LocationSerializer`
- [x] `api/views/cai_dat/location_views.py`:
  - POST: tạo `LocationHistory` với action `'Thêm mới địa điểm {code}'`
  - PATCH/PUT: so sánh `old_status` vs `new_status` → action `'Thay đổi trạng thái thành ...'` hoặc `'Cập nhật thông tin'`
  - Thêm `prefetch_related('history')` vào tất cả queryset
  - Re-fetch sau save để trả về fresh data (bao gồm history mới)
- [x] `EditLocationModal.jsx`: Viết lại phần lịch sử — hiển thị toàn bộ history từ API, group by date, dấu cam •, code highlight màu cam
- [x] **UX Flow Stay-on-page**: Sau khi PATCH thành công → cập nhật `locData` + `originalForm` + gọi `onSaved` (list update) → hiển thị internal SuccessModal (z-[60]) → user nhấn Xong → SuccessModal đóng, EditModal ở lại
- [x] `LocationsPage.jsx`: `handleEditSaved` chỉ cập nhật list, không đóng modal, không hiện external SuccessModal

**API:** `GET /api/locations/` và `GET /api/locations/{pk}/` đều trả thêm trường `history: [{id, timestamp, actor_name, action}]`

### ✅ Completed (Session 18 — 2026-04-29) — Delete Location Modal redesign

- [x] `src/components/cai-dat/thiet-lap-dia-diem/DeleteLocationModal.jsx`: Component mới theo design `popup-canhbaoxoa.png`
  - Vòng tròn vàng + dấu chấm than `!` canh giữa phía trên
  - Text italic: `Bạn có chắc muốn xóa địa điểm "{code}" không?`
  - Nút "Vâng, xóa đi" `#E67E22` + nút "Không, quay lại" `#FFF0E6` — cùng chiều rộng, bo góc `7px`
  - Tự xử lý API DELETE, loading state, error inline
  - Overlay click → đóng (khi không loading)
- [x] `LocationsPage.jsx`: Thay inline delete dialog bằng `<DeleteLocationModal>`; xóa `deleteLoading` state; sau xóa thành công hiện `SuccessModal`

### ✅ Completed (Session 19 — 2026-04-29) — Unique name validation cho Location

- [x] `api/models.py`: Thêm `unique=True` vào `Location.name` — DB-level enforcement
- [x] Migration `0014_location_name_unique.py` — apply thành công
- [x] `api/serializers.py` `LocationWriteSerializer.validate_name()`: kiểm tra `name__iexact` trước khi lưu; trên update dùng `exclude(pk=self.instance.pk)`; trả về `ValidationError('Tên địa điểm này đã được sử dụng.')` nếu trùng
- [x] Frontend không cần thay đổi: `errors.name` đã được map từ response 400 → hiển thị dưới field qua `<Field error={errors.name}>` + viền đỏ qua `inputCls(errors.name)` + tự xóa khi user gõ qua `setField('name')`

### ✅ Completed (Session 20 — 2026-04-29) — Bulk Delete cho Location

- [x] `api/views/cai_dat/location_views.py`: Thêm `location_bulk_delete` — `POST /api/locations/bulk-delete/` nhận `{ids: [...]}`, xóa trong `transaction.atomic()`, trả `{deleted: N}`
- [x] `api/views/cai_dat/__init__.py`, `api/views/__init__.py`, `api/urls.py`: Export + route `locations/bulk-delete/` (đặt trước `locations/<int:pk>/`)
- [x] `DeleteLocationModal.jsx`: Mở rộng hỗ trợ dual-mode — `location` prop (single) hoặc `ids` prop (bulk); thông báo và API call khác nhau theo mode; `onDeleted` luôn nhận array
- [x] `LocationsPage.jsx`:
  - Thêm `bulkDeleteOpen` state + `Trash2` icon
  - Toolbar: khi `selected.size > 0` → ẩn "Thêm địa điểm", hiện `"{N} được chọn"` + nút "Xóa đã chọn" `#C00000`; khi không có selection → hiện "Thêm địa điểm" bình thường
  - `handleDeleteDone` nhận array ids → xóa khỏi list + `setSelected(new Set())` + SuccessModal

**API mới:** `POST /api/locations/bulk-delete/` body `{ids: [1,2,3]}` → `{deleted: 3}`

### ✅ Completed (Session 21 — 2026-04-29) — UI Refinement: Checkbox, Bulk Delete Button, Table Headers

- [x] `LocationsPage.jsx`: Checkbox style — thay `accent-orange-500` bằng `checked:bg-[#E67E22] checked:border-[#E67E22] focus:ring-2 focus:ring-orange-300 focus:ring-offset-0` cho cả checkbox header và row
- [x] `LocationsPage.jsx`: Nút "Xóa đã chọn" — thay style inline `#C00000` + `rounded-[7px]` bằng `bg-red-600 hover:bg-red-700 rounded-lg` (đồng bộ với HomePage)
- [x] `LocationsPage.jsx`: Table headers — uppercase tất cả label: `MÃ ĐỊA ĐIỂM`, `TÊN ĐỊA ĐIỂM`, `ĐỊA CHỈ`, `SĐT`, `TRẠNG THÁI`, `HÀNH ĐỘNG`
- [x] Checkbox khi checked: nền cam #E67E22, dấu tick trắng, bo góc nhẹ, ring cam khi focus
- [x] Font Nunito Sans được kế thừa từ body (không cần thêm class)

### ✅ Completed (Session 25 — 2026-05-01) — Module Quản lý Phúc lợi

- [x] `api/models/nhan_su/quan_ly_luong/welfare.py`: Model `Benefit` (code MPL auto-gen, name, benefit_type, scope, cycle, effective_from/to, value, value_unit, attachment FileField, notes, status, created_by_name) + `BenefitHistory` (audit trail)
- [x] Migration `0026_add_benefit_model.py` — apply thành công
- [x] Management command `seed_benefits` — seed 4 bản ghi mẫu (MPL001–MPL004)
- [x] `api/serializers/nhan_su/quan_ly_luong/__init__.py`: Thêm `BenefitSerializer`, `BenefitWriteSerializer` (auto-gen code, file upload), `BenefitHistorySerializer`
- [x] `api/views/nhan_su/quan_ly_luong/benefit_views.py`: `benefit_list` (GET+POST), `benefit_bulk_delete` (POST), `benefit_detail` (GET+PUT+PATCH+DELETE) — hỗ trợ multipart FormData cho file upload
- [x] `api/urls.py`: `GET/POST /api/benefits/`, `POST /api/benefits/bulk-delete/`, `GET/PUT/PATCH/DELETE /api/benefits/<pk>/`
- [x] `src/components/nhan-su/quan-ly-luong/phucloi/WelfarePage.jsx`: Orchestrator quản lý view state (list/create/edit)
- [x] `src/components/nhan-su/quan-ly-luong/phucloi/WelfareListPage.jsx`: Danh sách phúc lợi — search, filter status, sort 3 trạng thái (SortableTh), pagination, checkbox bulk-select, bulk delete, action dropdown, status badge, export CSV
- [x] `src/components/nhan-su/quan-ly-luong/phucloi/CreateWelfarePage.jsx`: Trang thêm mới — 2 cột (form trái + Tóm tắt/Ghi chú phải), drag-drop file attachment, validation, SuccessModal → mở Edit
- [x] `src/components/nhan-su/quan-ly-luong/phucloi/EditWelfarePage.jsx`: Trang chỉnh sửa — thêm field Trạng thái, audit trail (Lịch sử), drag-drop attachment, SuccessModal stay-on-page
- [x] `src/components/nhan-su/quan-ly-luong/phucloi/DeleteWelfareModal.jsx`: Delete confirm modal (single + bulk)
- [x] `src/config/sidebarConfig.js`: `phuc-loi.view` đổi từ `'coming-soon'` → `'phuc-loi'`
- [x] `src/components/tong-quan/trang-chu/HomePage.jsx`: Import + render `WelfarePage` tại `activeView === 'phuc-loi'`

**API endpoints mới:**
- `GET /api/benefits/?search=&status=` — danh sách phúc lợi
- `POST /api/benefits/` — tạo phúc lợi (auto-gen code MPL{3-digit}, hỗ trợ file upload)
- `POST /api/benefits/bulk-delete/` — xóa hàng loạt
- `GET/PUT/PATCH/DELETE /api/benefits/{pk}/` — chi tiết/cập nhật/xóa

**Seed command:** `python manage.py seed_benefits`

**Loại phúc lợi:** Phụ cấp | Chính sách | Văn hoá | Khác  
**Phạm vi:** Toàn công ty | Theo vai trò | Cá nhân  
**Chu kỳ:** Hàng ngày | Hàng tháng | Hàng quý | Hàng năm | Ngày lễ, tết | Sự kiện

### 🔜 Next Steps

- [ ] **EditMaterialPage**: Trang sửa NVL (tương tự EditProductPage)
- [ ] **React Router**: Thêm `react-router-dom` để routing giữa các page thực sự
- [ ] **OrdersPage**: Quản lý đơn hàng — list, create, update status
- [ ] **CustomersPage**: Quản lý khách hàng — list, create, edit
- [ ] **Token Refresh**: Interceptor tự động gọi `/api/token/refresh/` khi access token hết hạn
- [ ] **Search server-side**: ProductsView gọi `?search=` lên API thay vì filter ở client

---

## Code Style & Conventions

### Status Badges (Trạng thái)

Tất cả badge trạng thái (`Đang hoạt động`, `Tạm ngưng`, v.v.) trong hệ thống phải tuân thủ quy tắc sau:

```jsx
<span className={`inline-flex items-center rounded-[7px] py-[9px] px-[20px] text-xs font-semibold ${
  status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'
}`}>
  {status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}
</span>
```

| Thuộc tính | Giá trị |
|---|---|
| Border-radius | `rounded-[7px]` (7px chính xác — KHÔNG dùng `rounded-full`) |
| Padding | `py-[9px] px-[20px]` |
| Font weight | `font-semibold` |
| Font family | Kế thừa Nunito Sans từ `body` (không cần thêm class) |
| Active | `bg-blue-50 text-blue-600` |
| Inactive | `bg-red-50 text-red-500` |

> Quy tắc này áp dụng cho **mọi badge/tag trạng thái** trong toàn bộ frontend, bao gồm các trang sẽ được xây dựng sau này.

---

## Key Decisions & Notes

- `.venv/` là **Conda environment** — Python tại `.venv/python.exe`, không phải `.venv/Scripts/python.exe`
- TailwindCSS dùng **v3** (không phải v4) để tương thích với `tailwind.config.js` truyền thống
- `App.css` đã được **xóa nội dung** để tránh conflict với Tailwind
- Mock data trong `views.py` và `HomePage.jsx` sẽ được thay bằng dữ liệu thật ở bước tiếp theo
- API badge trên header cho biết trạng thái kết nối realtime (green = OK, red = Django chưa chạy)
- ~~Login dùng username field~~ → **Session 3**: Custom `User(AbstractUser)` với `phone_number` là `USERNAME_FIELD`
- Custom `UserManager` bắt buộc khi `username = None` — `create_user(phone_number, password)` và `create_superuser` phải override
- DB reset khi thay đổi `AUTH_USER_MODEL`: dùng Python `sqlite3.connect()` để xóa migration history thay vì xóa file (tránh lock trên Windows)
- `screenshot/login.png` được copy sang `frontend/public/login-bg.png`; crop bằng `background-size: 210% auto` để chỉ hiển thị phần ảnh đồ ăn bên trái
- Management command output phải dùng ASCII thuần (không dùng emoji/Vietnamese) vì Windows terminal dùng cp1252
- `AUTH_USER_MODEL` phải được set trong `settings.py` TRƯỚC khi chạy `makemigrations` lần đầu
