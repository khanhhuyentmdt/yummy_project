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

### 🔜 Next Steps (Session 7+)

- [ ] **React Router**: Thêm `react-router-dom` để routing giữa các page thực sự
- [ ] **OrdersPage**: Quản lý đơn hàng — list, create, update status
- [ ] **CustomersPage**: Quản lý khách hàng — list, create, edit
- [ ] **Token Refresh**: Interceptor tự động gọi `/api/token/refresh/` khi access token hết hạn
- [ ] **Search server-side**: ProductsView gọi `?search=` lên API thay vì filter ở client

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
