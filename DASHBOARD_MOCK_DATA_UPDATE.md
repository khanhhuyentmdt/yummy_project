# Cập nhật Dữ liệu Mẫu Dashboard - ERP Yummy

## Tổng quan
Đã cập nhật dữ liệu mẫu (Mock Data) cho trang Dashboard (Tổng quan) của ứng dụng ERP Yummy dựa trên các screenshot dashboard-1, dashboard-2, và dashboard-3.

## Vị trí file
- **File chính**: `frontend/src/components/tong-quan/trang-chu/HomePage.jsx`
- **Component**: `STATS_FALLBACK` constant và `DashboardView` component

## Các thay đổi đã thực hiện

### 1. Dữ liệu KPI & Trạng thái (dashboard-1)
```javascript
kpis: {
  new_orders: 10,              // Đơn hàng mới
  new_orders_growth_pct: 12,   // Tăng trưởng +12%
  revenue: 362300000,          // Doanh thu: 362.300.000 VND
  revenue_growth_pct: 8,       // Tăng trưởng +8%
  peak_hour_from: "16:30",     // Giờ cao điểm bắt đầu
  peak_hour_to: "18:00",       // Giờ cao điểm kết thúc
  work_status: "Thiếu 2 ca",   // Tình trạng ca làm việc
}
```

### 2. Doanh thu theo thời gian (Biểu đồ cột)
Dữ liệu theo các mốc thời gian từ 08:00 đến 20:00:
```javascript
revenue_by_hour: [
  { hour: "08:00", revenue: 15000000, orders: 5 },
  { hour: "10:00", revenue: 25000000, orders: 8 },
  { hour: "12:00", revenue: 45000000, orders: 15 },
  { hour: "14:00", revenue: 35000000, orders: 12 },
  { hour: "16:00", revenue: 65000000, orders: 22 },
  { hour: "18:00", revenue: 95000000, orders: 32 },
  { hour: "20:00", revenue: 82300000, orders: 28 },
]
```

### 3. Tỉ lệ doanh thu (Biểu đồ tròn)
```javascript
revenue_ratio: {
  retail_pct: 80,      // Bán lẻ: 80%
  wholesale_pct: 20,   // Bán sỉ: 20%
}
```

### 4. Lượng khách hàng bán lẻ (Biểu đồ đường)
Tổng: **7.205 lượt khách** với xu hướng tăng mạnh vào buổi chiều:
```javascript
customer_flow: [
  { hour: "08:00", customers: 120 },
  { hour: "09:00", customers: 180 },
  { hour: "10:00", customers: 250 },
  { hour: "11:00", customers: 380 },
  { hour: "12:00", customers: 520 },
  { hour: "13:00", customers: 450 },
  { hour: "14:00", customers: 380 },
  { hour: "15:00", customers: 480 },
  { hour: "16:00", customers: 680 },
  { hour: "17:00", customers: 920 },
  { hour: "18:00", customers: 1150 },
  { hour: "19:00", customers: 980 },
  { hour: "20:00", customers: 750 },
  { hour: "21:00", customers: 497 },
]
```

### 5. Kênh bán hàng (Biểu đồ donut)
```javascript
sales_channels: {
  direct: 50,       // Trực tiếp: 50%
  grabfood: 30,     // Grabfood: 30%
  shopeefood: 20,   // Shopeefood: 20%
}
```

### 6. Top khách hàng (dashboard-2)
Top 5 khách hàng hàng đầu:
```javascript
top_customers: [
  { name: "Bếp Xanh", province: "TP.HCM", revenue: 125000000 },
  { name: "Minh Tâm", province: "Hà Nội", revenue: 98000000 },
  { name: "Thanh Xuân", province: "Đà Nẵng", revenue: 87000000 },
  { name: "Hương Giang", province: "Cần Thơ", revenue: 76000000 },
  { name: "Phương Nam", province: "Hải Phòng", revenue: 65000000 },
]
```

### 7. Top sản phẩm bán chạy (dashboard-2)
Top 5 sản phẩm:
```javascript
top_products: [
  { name: "Matcha tàu hủ", sold: 3500 },
  { name: "Trân châu đường đen", sold: 3400 },
  { name: "Kem trứng", sold: 3300 },
  { name: "Sốt xoài", sold: 3200 },
  { name: "Lục trà tắc", sold: 3100 },
]
```

### 8. Doanh thu theo tỉnh (Bản đồ Việt Nam)
Hiển thị doanh thu theo 10 tỉnh/thành phố chính và tổng theo 3 vùng miền:

**Dữ liệu theo tỉnh:**
```javascript
revenue_by_province: [
  { province_id: 79, province_name: "TP. Hồ Chí Minh", revenue: 2500000000 },
  { province_id: 1, province_name: "Hà Nội", revenue: 1049300000 },
  { province_id: 48, province_name: "Đà Nẵng", revenue: 1800000000 },
  { province_id: 92, province_name: "Cần Thơ", revenue: 1549300000 },
  { province_id: 31, province_name: "Hải Phòng", revenue: 500000000 },
  { province_id: 75, province_name: "Đồng Nai", revenue: 800000000 },
  { province_id: 77, province_name: "Bà Rịa - Vũng Tàu", revenue: 450000000 },
  { province_id: 74, province_name: "Bình Dương", revenue: 799300000 },
  { province_id: 49, province_name: "Quảng Nam", revenue: 729300000 },
  { province_id: 56, province_name: "Khánh Hòa", revenue: 800000000 },
]
```

**Nhãn hiển thị trên bản đồ:**
- **Miền Bắc**: 1.049.300.000đ
- **Miền Trung**: 3.329.300.000đ
- **Miền Nam**: 6.049.300.000đ

## Cải tiến UI/UX

### 1. Tiêu đề IN HOA
Tất cả các tiêu đề trong Dashboard đã được cập nhật theo quy chuẩn IN HOA:
- ĐỚN HÀNG MỚI
- DOANH THU
- GIỜ CAO ĐIỂM
- TÌNH TRẠNG CA LÀM VIỆC
- DOANH THU THEO THỜI GIAN
- TỈ LỆ DOANH THU
- TOP KHÁCH HÀNG
- TOP SẢN PHẨM BÁN CHẠY
- LƯỢNG KHÁCH HÀNG BÁN LẺ
- DOANH THU THEO TỈNH
- KÊNH BÁN HÀNG

### 2. Hiển thị tổng lượt khách
Thêm hiển thị tổng số lượt khách (7.205) ở góc phải của biểu đồ "Lượng khách hàng bán lẻ".

### 3. Nhãn vùng miền trên bản đồ
Thêm nhãn hiển thị doanh thu theo 3 vùng miền (Bắc, Trung, Nam) trực tiếp trên bản đồ Việt Nam với:
- Tên vùng miền (màu cam #E67E22)
- Số tiền doanh thu (màu xám #666)

### 4. Màu sắc & Font chữ
- Giữ nguyên font **Nunito Sans**
- Màu cam chủ đạo: **#E67E22** và **#F58232**
- Màu nền: **#FFF6F3** (nền trang)
- Màu trắng: **#FFFFFF** (các card)

## Kết quả
Trang Dashboard hiện đã có đầy đủ dữ liệu mẫu phong phú và sẵn sàng cho việc:
- ✅ Quay demo sản phẩm
- ✅ Trình bày cho khách hàng
- ✅ Test UI/UX
- ✅ Đào tạo người dùng

## Ghi chú
- Dữ liệu được lưu trong constant `STATS_FALLBACK` và sẽ được sử dụng khi API offline hoặc chưa có dữ liệu thực.
- Khi API backend hoạt động, dữ liệu thực sẽ được load từ endpoint `/dashboard/` và ghi đè lên dữ liệu mẫu này.
- Tất cả các biểu đồ đều responsive và tự động điều chỉnh theo kích thước màn hình.

---
**Ngày cập nhật**: 03/05/2026  
**Người thực hiện**: Claude (Kiro AI Assistant)
