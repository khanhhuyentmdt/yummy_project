# CẤU TRÚC THƯ MỤC DỰ ÁN YUMMY

## Tổng quan
Dự án Yummy là một hệ thống ERP quản lý sản xuất và bán hàng thực phẩm, được xây dựng với:
- **Backend**: Django REST Framework (Python)
- **Frontend**: React + Vite + TailwindCSS

---

## 1. CẤU TRÚC BACKEND (`backend/api/views/`)

Backend được tổ chức theo mô hình **phân cấp theo chức năng nghiệp vụ**, mỗi module nghiệp vụ có thư mục riêng.

### Cấu trúc tổng quan:
```
backend/api/views/
├── auth/                    # Xác thực & Đăng nhập
├── ban_hang/                # Module Bán hàng
├── cai_dat/                 # Module Cài đặt hệ thống
├── nhan_su/                 # Module Nhân sự
├── san_xuat/                # Module Sản xuất
├── tai_chinh/               # Module Tài chính
└── tong_quan/               # Module Tổng quan/Dashboard
```

### Chi tiết từng module:

#### 1.1. AUTH - Xác thực (`auth/`)
```
auth/
└── login_views.py           # API đăng nhập, đăng xuất, xác thực
```

#### 1.2. BÁN HÀNG (`ban_hang/`)
```
ban_hang/
├── khach_hang/              # Quản lý khách hàng
│   ├── nhom_khach_hang/
│   │   └── customer_group_views.py    # API nhóm khách hàng
│   └── thong_tin_khach_hang/
│       └── customer_views.py          # API thông tin khách hàng
└── order_views.py           # API đơn hàng
```

**Chức năng**:
- Quản lý thông tin khách hàng (CRUD)
- Phân loại khách hàng theo nhóm
- Quản lý đơn hàng bán

#### 1.3. CÀI ĐẶT (`cai_dat/`)
```
cai_dat/
└── settings_views.py        # API cài đặt hệ thống
```

**Chức năng**:
- Cấu hình hệ thống
- Thiết lập tham số

#### 1.4. NHÂN SỰ (`nhan_su/`)
```
nhan_su/
├── quan_ly_cham_cong/
│   └── attendance_views.py           # API chấm công
├── quan_ly_luong/
│   └── payroll_views.py              # API tính lương
└── thiet_lap_nhan_vien/
    └── employee_views.py             # API quản lý nhân viên
```

**Chức năng**:
- Quản lý hồ sơ nhân viên
- Chấm công, tính công
- Tính lương, phúc lợi

#### 1.5. SẢN XUẤT (`san_xuat/`) - **MODULE QUAN TRỌNG NHẤT**
```
san_xuat/
├── bep_trung_tam/           # Bếp trung tâm
│   └── thong_tin_san_pham/
│       ├── nhom_san_pham/
│       │   └── product_group_views.py    # API nhóm sản phẩm
│       └── san_pham/
│           └── product_views.py          # API sản phẩm
├── khu_vuc_btp/             # Khu vực bán thành phẩm
│   └── semi_finished_views.py            # API bán thành phẩm
└── nguyen_vat_lieu/         # Nguyên vật liệu
    ├── material_views.py                 # API nguyên vật liệu
    ├── purchase_views.py                 # API đơn mua hàng
    └── raw_material_views.py             # API nguyên liệu thô
```

**Chức năng**:
- **Bếp trung tâm**: Quản lý sản phẩm, công thức, BOM (Bill of Materials)
- **Khu vực BTP**: Quản lý bán thành phẩm, đóng gói
- **Nguyên vật liệu**: Quản lý kho NVL, nhà cung cấp, đơn mua hàng

#### 1.6. TÀI CHÍNH (`tai_chinh/`)
```
tai_chinh/
└── finance_views.py         # API quản lý tài chính
```

**Chức năng**:
- Quản lý công nợ
- Quản lý quỹ
- Báo cáo tài chính

#### 1.7. TỔNG QUAN (`tong_quan/`)
```
tong_quan/
└── dashboard_views.py       # API dashboard, báo cáo tổng hợp
```

**Chức năng**:
- Dashboard tổng quan
- Báo cáo thống kê

---

## 2. CẤU TRÚC FRONTEND (`frontend/src/components/`)

Frontend được tổ chức **song song với backend**, mỗi module backend có module frontend tương ứng.

### Cấu trúc tổng quan:
```
frontend/src/components/
├── common/                  # Components dùng chung
├── ban-hang/                # Module Bán hàng
├── cai-dat/                 # Module Cài đặt
├── nhan-su/                 # Module Nhân sự
├── san-xuat/                # Module Sản xuất
├── tai-chinh/               # Module Tài chính
└── tong-quan/               # Module Tổng quan
```

### Chi tiết từng module:

#### 2.1. COMMON - Components dùng chung
```
common/
├── ProductModal.jsx         # Modal hiển thị sản phẩm
├── Sidebar.jsx              # Thanh điều hướng
└── SuccessModal.jsx         # Modal thông báo thành công
```

#### 2.2. BÁN HÀNG (`ban-hang/`)
```
ban-hang/
├── don-hang/                # Quản lý đơn hàng
├── khach-hang/              # Quản lý khách hàng
│   ├── nhom-khach-hang/     # Nhóm khách hàng
│   └── thong-tin-khach-hang/ # Thông tin khách hàng
├── khuyen-mai/              # Quản lý khuyến mãi
├── san-pham/                # Quản lý sản phẩm bán
│   ├── khach-hang/
│   ├── phieu-kiem-kho/      # Kiểm kê kho
│   ├── phieu-nhap-kho/      # Nhập kho
│   ├── phieu-xuat-kho/      # Xuất kho
│   ├── ton-kho-ban-thanh-pham/  # Tồn kho BTP
│   ├── ton-kho-san-pham/    # Tồn kho sản phẩm
│   └── yeu-cau-dat-hang/    # Yêu cầu đặt hàng
└── van-chuyen/              # Quản lý vận chuyển
```

#### 2.3. CÀI ĐẶT (`cai-dat/`)
```
cai-dat/
├── thiet-lap-dia-diem/      # Thiết lập địa điểm
└── thiet-lap-don-vi-van-chuyen/  # Thiết lập đơn vị vận chuyển
```

#### 2.4. NHÂN SỰ (`nhan-su/`)
```
nhan-su/
├── quan-ly-cham-cong/       # Quản lý chấm công
│   ├── ca-lam-viec/         # Ca làm việc
│   ├── cham-cong/           # Chấm công
│   └── lich-lam-viec/       # Lịch làm việc
├── quan-ly-luong/           # Quản lý lương
│   ├── bang-luong/          # Bảng lương
│   ├── phuc-loi/            # Phúc lợi
│   └── thuong/              # Thưởng
└── thiet-lap-nhan-vien/     # Thiết lập nhân viên
    ├── ho-so-nhan-vien/     # Hồ sơ nhân viên
    ├── tai-khoan/           # Tài khoản
    └── vai-tro-nhan-vien/   # Vai trò nhân viên
```

#### 2.5. SẢN XUẤT (`san-xuat/`) - **MODULE QUAN TRỌNG NHẤT**
```
san-xuat/
├── bep-trung-tam/           # Bếp trung tâm
│   ├── kho-bep/             # Kho bếp
│   ├── quan-ly-danh-muc/    # Quản lý danh mục
│   └── van-hanh-san-xuat/   # Vận hành sản xuất
├── khu-vuc-btp/             # Khu vực bán thành phẩm
│   ├── phieu-ban-giao-dong-goi/  # Bàn giao đóng gói
│   ├── phieu-ghi-nhan-dong-goi/  # Ghi nhận đóng gói
│   ├── phieu-nhap-kho/      # Nhập kho BTP
│   ├── phieu-xuat-kho/      # Xuất kho BTP
│   └── ton-kho/             # Tồn kho BTP
└── nguyen-vat-lieu/         # Nguyên vật liệu
    ├── kho-nguyen-vat-lieu/ # Kho NVL
    ├── nha-cung-cap/        # Nhà cung cấp
    └── thong-tin-nguyen-vat-lieu/  # Thông tin NVL
```

#### 2.6. TÀI CHÍNH (`tai-chinh/`)
```
tai-chinh/
├── cong-no-khach-hang/      # Công nợ khách hàng
├── cong-no-nha-cung-cap/    # Công nợ nhà cung cấp
├── nguon-quy/               # Nguồn quỹ
└── so-quy/                  # Sổ quỹ
```

#### 2.7. TỔNG QUAN (`tong-quan/`)
```
tong-quan/
└── trang-chu/
    └── HomePage.jsx         # Trang chủ/Dashboard
```

---

## 3. QUY TẮC ĐẶT TÊN & TỔ CHỨC

### 3.1. Backend (Django)
- **Thư mục**: `snake_case` (ví dụ: `ban_hang`, `nhan_su`)
- **File views**: `*_views.py` (ví dụ: `product_views.py`)
- **Cấu trúc**: Phân cấp theo nghiệp vụ, mỗi file views xử lý một nhóm API liên quan

### 3.2. Frontend (React)
- **Thư mục**: `kebab-case` (ví dụ: `ban-hang`, `nhan-su`)
- **File component**: `PascalCase.jsx` (ví dụ: `ProductModal.jsx`)
- **Cấu trúc**: Song song với backend, mỗi thư mục chứa các component liên quan

### 3.3. Mapping Backend ↔ Frontend

| Backend Path | Frontend Path | Mô tả |
|-------------|---------------|-------|
| `backend/api/views/ban_hang/` | `frontend/src/components/ban-hang/` | Module Bán hàng |
| `backend/api/views/san_xuat/` | `frontend/src/components/san-xuat/` | Module Sản xuất |
| `backend/api/views/nhan_su/` | `frontend/src/components/nhan-su/` | Module Nhân sự |
| `backend/api/views/tai_chinh/` | `frontend/src/components/tai-chinh/` | Module Tài chính |

---

## 4. HƯỚNG DẪN SỬ DỤNG CHO GEMINI

### 4.1. Khi làm việc với Backend:
```
Ví dụ: Thêm API mới cho "Quản lý công thức sản phẩm"
→ Tạo file: backend/api/views/san_xuat/bep_trung_tam/recipe_views.py
→ Đặt tên class: RecipeViewSet, RecipeListView, etc.
```

### 4.2. Khi làm việc với Frontend:
```
Ví dụ: Thêm component "Danh sách công thức"
→ Tạo thư mục: frontend/src/components/san-xuat/bep-trung-tam/cong-thuc/
→ Tạo file: RecipeList.jsx, RecipeForm.jsx, RecipeDetail.jsx
```

### 4.3. Nguyên tắc quan trọng:
1. **Luôn giữ cấu trúc song song** giữa backend và frontend
2. **Đặt tên thư mục theo nghiệp vụ**, không theo kỹ thuật
3. **Mỗi file chỉ xử lý một nhóm chức năng** liên quan
4. **Sử dụng thư mục con** để phân cấp rõ ràng khi có nhiều chức năng

---

## 5. LƯU Ý ĐẶC BIỆT

### 5.1. Module Sản xuất (`san_xuat/`)
Đây là module **phức tạp nhất** với 3 khu vực chính:
- **Bếp trung tâm**: Nơi chế biến, quản lý công thức
- **Khu vực BTP**: Nơi đóng gói, hoàn thiện sản phẩm
- **Nguyên vật liệu**: Quản lý nguồn cung, kho NVL

### 5.2. Các thư mục trống
Một số thư mục hiện đang trống (chưa có file), đây là các chức năng **đang được phát triển** hoặc **dự kiến phát triển**.

### 5.3. File README.md
- `backend/api/views/README.md`: Mô tả cấu trúc backend
- `frontend/src/components/README.md`: Mô tả cấu trúc frontend

---

## 6. PROMPT MẪU CHO GEMINI

### Khi cần tạo chức năng mới:
```
Tôi cần tạo chức năng [TÊN CHỨC NĂNG] trong module [TÊN MODULE].

Cấu trúc hiện tại:
- Backend: backend/api/views/[module]/
- Frontend: frontend/src/components/[module]/

Hãy:
1. Tạo file views trong backend với đúng cấu trúc thư mục
2. Tạo component trong frontend tương ứng
3. Đảm bảo đặt tên theo quy tắc: backend (snake_case), frontend (kebab-case)
```

### Khi cần hiểu cấu trúc:
```
Tôi đang làm việc với module [TÊN MODULE].

Cấu trúc backend: backend/api/views/[module]/
Cấu trúc frontend: frontend/src/components/[module]/

Hãy giải thích cấu trúc chi tiết và các file liên quan.
```

---

**Tài liệu này được tạo để giúp Gemini hiểu rõ cấu trúc dự án và làm việc hiệu quả hơn.**
