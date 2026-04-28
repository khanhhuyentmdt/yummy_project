# Cấu trúc Components

Cấu trúc folder được tổ chức theo đúng menu sidebar của ứng dụng, giúp dễ dàng tìm kiếm và quản lý code.

## 📁 Cấu trúc chính

```
components/
├── common/                          # Components dùng chung
│   ├── Sidebar.jsx
│   ├── SuccessModal.jsx
│   └── ProductModal.jsx
│
├── tong-quan/                       # Module Tổng quan
│   └── trang-chu/
│       └── HomePage.jsx
│
├── san-xuat/                        # Module Sản xuất
│   ├── nguyen-vat-lieu/            # Nguyên vật liệu
│   │   ├── thong-tin-nguyen-vat-lieu/
│   │   │   ├── nhom-nguyen-vat-lieu/
│   │   │   └── nguyen-vat-lieu/
│   │   │       ├── MaterialsPage.jsx
│   │   │       └── CreateMaterialPage.jsx
│   │   ├── nha-cung-cap/
│   │   └── kho-nguyen-vat-lieu/
│   │       ├── phieu-dat-hang/
│   │       │   └── PurchaseOrdersPage.jsx
│   │       ├── phieu-nhap-kho/
│   │       ├── phieu-xuat-kho/
│   │       ├── phieu-kiem-kho/
│   │       └── ton-kho/
│   │
│   ├── bep-trung-tam/              # Bếp trung tâm
│   │   ├── quan-ly-danh-muc/
│   │   │   ├── thong-tin-ban-thanh-pham/
│   │   │   └── thong-tin-san-pham/
│   │   │       ├── CreateProductPage.jsx
│   │   │       └── EditProductPage.jsx
│   │   ├── van-hanh-san-xuat/
│   │   │   ├── thong-tin-yeu-cau-dat-hang/
│   │   │   ├── ke-hoach-san-xuat/
│   │   │   ├── lenh-san-xuat/
│   │   │   └── phieu-nghiem-thu/
│   │   └── kho-bep/
│   │       ├── phieu-nhap-kho/
│   │       ├── phieu-xuat-kho/
│   │       └── ton-kho/
│   │
│   └── khu-vuc-btp/                # Khu vực Bán thành phẩm (cùng cấp với Bếp trung tâm)
│       ├── phieu-nhap-kho/
│       ├── phieu-ban-giao-dong-goi/
│       ├── phieu-ghi-nhan-dong-goi/
│       ├── phieu-xuat-kho/
│       └── ton-kho/
│
├── ban-hang/                        # Module Bán hàng
│   ├── san-pham/
│   │   ├── ton-kho-ban-thanh-pham/
│   │   ├── ton-kho-san-pham/
│   │   ├── yeu-cau-dat-hang/
│   │   ├── phieu-nhap-kho/
│   │   ├── phieu-xuat-kho/
│   │   ├── phieu-kiem-kho/
│   │   └── khach-hang/
│   ├── nhom-khach-hang/
│   ├── thong-tin-khach-hang/
│   ├── don-hang/
│   ├── van-chuyen/
│   └── khuyen-mai/
│
├── nhan-su/                         # Module Nhân sự
│   ├── thiet-lap-nhan-vien/
│   │   ├── ho-so-nhan-vien/
│   │   ├── vai-tro-nhan-vien/
│   │   └── tai-khoan/
│   ├── quan-ly-cham-cong/
│   │   ├── ca-lam-viec/
│   │   ├── lich-lam-viec/
│   │   └── cham-cong/
│   └── quan-ly-luong/
│       ├── thuong/
│       ├── phuc-loi/
│       └── bang-luong/
│
├── tai-chinh/                       # Module Tài chính
│   ├── nguon-quy/
│   ├── so-quy/
│   ├── cong-no-nha-cung-cap/
│   └── cong-no-khach-hang/
│
└── cai-dat/                         # Module Cài đặt
    ├── thiet-lap-dia-diem/
    └── thiet-lap-don-vi-van-chuyen/
```

## 🎯 Nguyên tắc tổ chức

1. **Theo cấu trúc sidebar**: Mỗi folder tương ứng với một mục trong sidebar
2. **Phân cấp rõ ràng**: Folder con phản ánh đúng cấu trúc menu
3. **Common components**: Các component dùng chung đặt trong folder `common/`
4. **Đặt tên folder**: Sử dụng tiếng Việt không dấu, viết thường, ngăn cách bằng dấu gạch ngang

## 📝 Lưu ý quan trọng

- **Khu vực BTP** đã được chuyển lên cùng cấp với **Bếp trung tâm** và **Nguyên vật liệu** trong module Sản xuất
- Tất cả import paths đã được cập nhật tự động
- Các file component mới nên được đặt vào đúng folder theo chức năng

## 🔄 Cập nhật import paths

Khi tạo component mới, hãy chú ý đường dẫn import:
- API: `import api from '../../../api/axios'` (số lượng `../` tùy thuộc vào độ sâu folder)
- Common components: `import SuccessModal from '../../common/SuccessModal'`
- Assets: `import logo from '../../../assets/logo.jpg'`
