# 0. Setup Project
----------------------------------------------------------------------------
git add .
git commit -m "feat(root): initialize project with Django DRF backend and React Vite frontend"
============================================================================

# 1a1. Cấu hình phiên làm việc và quét sơ đồ cấu trúc file (File Tree)
Cấu hình phiên làm việc:
1. Mode: Autonomous (Tự thực hiện lệnh, không cần hỏi lại).
2. Environment: Luôn sử dụng môi trường ảo tại `./.venv`. 
3. Dependency Check: Trước khi chạy code, hãy đọc `requirements.txt` để đảm bảo môi trường đã sẵn sàng.
4. Filter: Luôn bỏ qua các folder trong `.claudeignore` khi quét project.
5. Task: Hãy liệt kê lại cấu trúc thư mục project này để xác nhận bạn đã hiểu.

# 1a2. Kết nối Backend Django DRF và Frontend React Vite, đồng thời thiết lập TailwindCSS
Claude, hãy thực hiện thiết lập ứng dụng erp_yummy tại thư mục D:\TheALAB_VibeCoding\demo_app\ với các thông số kỹ thuật sau:

1. Cấu hình Backend (Django tại port 2344):

Mở backend/backend/settings.py, thêm rest_framework, corsheaders, và api vào INSTALLED_APPS.

Thêm corsheaders.middleware.CorsMiddleware vào đầu danh sách MIDDLEWARE.

Cấu hình CORS_ALLOWED_ORIGINS = ["http://localhost:2347", "http://127.0.0.1:2347"] (đây là port của Vite).

2. Cấu hình Frontend (React Vite tại port 2347):

Di chuyển vào frontend, cài đặt: tailwindcss, postcss, autoprefixer, axios, lucide-react.

Khởi tạo tailwind và cấu hình content trong tailwind.config.js.

Tạo file frontend/src/api/axios.js để thiết lập baseURL: 'http://127.0.0.1:2344/api/'.

3. Xây dựng giao diện dựa trên hình ảnh:

Tham khảo file D:\TheALAB_VibeCoding\demo_app\homepage.png.

Tạo component HomePage.jsx sử dụng TailwindCSS để tái hiện giao diện trang chủ ERP chuyên nghiệp (Sidebar màu sáng/tối tùy ảnh, Dashboard với các thẻ thống kê, danh sách hoạt động).

Đảm bảo layout sử dụng Flexbox/Grid chuẩn để co giãn tốt.

4. Kết nối:

Viết một API đơn giản trong Django (api/views.py) và gọi thử từ React để đảm bảo không bị lỗi CORS.

Hãy thực hiện toàn bộ các bước trên mà không cần hỏi lại.

# 1a3a. Trước khi tắt máy (Lưu tiến trình) 
Claude, hãy cập nhật trạng thái mới nhất vào CLAUDE.md (mục Project Status) và schema_manifest.json. Sau đó, thực hiện Git Commit với thông điệp chi tiết về những gì đã làm và những gì cần làm tiếp theo.
# 1a3b. Khi bắt đầu lại (Tiếp tục)
Hãy đọc CLAUDE.md, schema_manifest.json và kiểm tra git log -1 để tóm tắt lại tiến trình hiện tại. Sau đó, hãy bắt đầu thực hiện bước tiếp theo trong danh sách next_steps.