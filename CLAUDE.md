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

| Method | URL | Mô tả | Status |
|---|---|---|---|
| GET | `/api/dashboard/` | Stats tổng quan (4 số liệu) | ✅ Done |
| GET | `/api/products/` | Danh sách thành phẩm (11 items mock) | ✅ Done |

---

## Frontend Components

| Component | File | Mô tả | Status |
|---|---|---|---|
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

### 🔜 Next Steps (Session 2+)

- [ ] **Models**: Định nghĩa `Product`, `Order`, `Customer` trong `api/models.py`
- [ ] **Migrations**: `makemigrations` + `migrate` để tạo bảng SQLite
- [ ] **Serializers**: Tạo `api/serializers.py` cho từng model
- [ ] **CRUD API**: Endpoints đầy đủ (POST, PUT, DELETE) cho Product
- [ ] **React Pages**: Các view còn lại — Đơn hàng, Khách hàng, Báo cáo
- [ ] **React Router**: Thêm `react-router-dom` để routing giữa các page
- [ ] **Form Modal**: Modal thêm/sửa sản phẩm (kết nối vào nút "Tạo lô")
- [ ] **Authentication**: Django JWT (`djangorestframework-simplejwt`) + login page
- [ ] **Data thật**: Thay mock data bằng API calls thực từ SQLite
- [ ] **Export**: Xuất danh sách sản phẩm ra Excel/CSV

---

## Key Decisions & Notes

- `.venv/` là **Conda environment** — Python tại `.venv/python.exe`, không phải `.venv/Scripts/python.exe`
- TailwindCSS dùng **v3** (không phải v4) để tương thích với `tailwind.config.js` truyền thống
- `App.css` đã được **xóa nội dung** để tránh conflict với Tailwind
- Mock data trong `views.py` và `HomePage.jsx` sẽ được thay bằng dữ liệu thật ở bước tiếp theo
- API badge trên header cho biết trạng thái kết nối realtime (green = OK, red = Django chưa chạy)
