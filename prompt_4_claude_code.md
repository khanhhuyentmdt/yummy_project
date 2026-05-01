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

# Màn hình Log in
Claude, hãy triển khai tính năng Đăng nhập (Login) cho dự án erp_yummy dựa trên hình ảnh tại screenshot/login.png với các yêu cầu sau:

1. Backend (Django DRF - Port 2344):

Sử dụng djangorestframework-simplejwt để xử lý xác thực (nếu chưa có hãy cài đặt vào .venv).

Tạo một Serializer và View cho phép đăng nhập bằng Số điện thoại và Mật khẩu.

Đảm bảo API trả về JWT Token (Access & Refresh).

2. Frontend (React + Tailwind - Port 2347):

Tạo component LoginPage.jsx tại frontend/src/pages/.

Layout: Sử dụng Flexbox để chia màn hình làm 2 phần:

Bên trái: Hiển thị ảnh món ăn lấy từ screenshot/login.png (hoặc dùng placeholder ảnh chất lượng cao tương tự).

Bên phải: Form đăng nhập trên nền màu kem nhạt (bg-[#F9F3F0]).

Form Details:

Thẻ trắng bo góc mạnh (rounded-3xl), đổ bóng nhẹ.

Logo Yummy hình tròn ở trên cùng.

Input "Số điện thoại": Có icon điện thoại bên trái.

Input "Mật khẩu": Có icon khóa bên trái và icon "con mắt" để ẩn/hiện mật khẩu bên phải.

Nút "ĐĂNG NHẬP": Màu cam đặc trưng (bg-[#E67E22]), bo góc, chữ trắng in hoa.

Logic: Sử dụng axios để gọi API tới port 2344 và lưu token vào localStorage.

3. Cập nhật tiến độ:

Sau khi hoàn thành, hãy cập nhật trạng thái vào CLAUDE.md và schema_manifest.json.

Thực hiện một Git commit với nội dung: 'feat: add login page with split-screen UI and JWT auth'.

Hãy thực hiện bước này một cách tự chủ.

# Tạo tài khoản
Context: > - Project: erp_yummy tại D:\TheALAB_VibeCoding\demo_app\

Backend: Django DRF (Port: 2344) | Frontend: React Vite + TailwindCSS (Port: 2347)

File tham chiếu UI: screenshot/login.png

Yêu cầu thực thi:

1. Backend (Django - Port 2344):

Custom User Model: Chỉnh sửa api/models.py, tạo class User(AbstractUser) xóa trường username, thay bằng phone_number làm định danh chính (USERNAME_FIELD).

Settings: Cấu hình AUTH_USER_MODEL = 'api.User'. Cài đặt djangorestframework-simplejwt.

Migrations: Thực hiện makemigrations và migrate. Nếu có xung đột DB cũ, hãy tự quyết định việc reset database.

Auth Logic: Tạo View/Serializer cho JWT Login nhận vào phone_number và password.

Data Seed: Tạo một management command để tự động khởi tạo tài khoản: User: 0915085900 / Pass: 12345.

2. Frontend (React - Port 2347):

UI (TailwindCSS): Tái hiện giao diện split-screen từ screenshot/login.png.

Bên trái: Ảnh trang trí.

Bên phải: Form màu kem #F9F3F0, card trắng rounded-3xl đổ bóng.

Sử dụng lucide-react cho icon điện thoại và ổ khóa trong input.

Nút đăng nhập màu cam đặc trưng #E67E22.

Integration: Thiết lập axios gọi API tới port 2344. Lưu JWT vào localStorage sau khi đăng nhập thành công và điều hướng về trang chủ.

3. Quản lý quy trình (Persistence):

Sau khi hoàn thành, hãy cập nhật trạng thái "Done" cho tính năng Login vào CLAUDE.md.

Cập nhật schema_manifest.json với mục tiêu kế tiếp là "Xây dựng Dashboard sau login".

Thực hiện git add . và git commit -m "feat: implement phone number auth with custom user model and split-screen login UI".

Hãy thực hiện toàn bộ các bước trên một cách tự chủ.

# đổi logo trang log in
Claude, hãy thực hiện cập nhật logo cho ứng dụng erp_yummy theo các bước sau:

1. Xử lý tệp tin: > - Sao chép (copy) file logo từ đường dẫn screenshot/logo.jpg vào thư mục frontend/src/assets/ để đảm bảo tính nhất quán trong quy trình build của Vite.

2. Cập nhật mã nguồn (Frontend - Port 2347):

Tìm tất cả các vị trí đang hiển thị logo (đặc biệt là trong LoginPage.jsx và HomePage.jsx).

Import file logo mới từ ../assets/logo.jpg và thay thế các placeholder hoặc logo cũ.

Sử dụng TailwindCSS để căn chỉnh lại kích thước logo cho phù hợp (ví dụ: w-20 h-20 rounded-full object-cover) sao cho khớp với giao diện trong bản thiết kế.

3. Lưu tiến độ:

Cập nhật trạng thái "Logo updated" vào CLAUDE.md.

Thực hiện git add . và git commit -m "chore: update project logo to logo.jpg".

Hãy tự động thực hiện các bước này.

# Đồng bộ qua Json
Claude, hãy triển khai tính năng Quản lý dữ liệu Thành phẩm qua file JSON với quy trình như sau:

1. Bước 1: Xuất dữ liệu (Export to JSON):

Viết một script (Management Command) trong Django để xuất toàn bộ dữ liệu từ model Product (Thành phẩm) ra file data_sync/products.json trong thư mục gốc.

File JSON phải có cấu trúc rõ ràng: id, name, quantity, price,...

2. Bước 2: API Đồng bộ (Backend - Port 2344):

Tạo một API endpoint POST /api/products/sync/.

Logic: Khi gọi API này, Django sẽ đọc nội dung file data_sync/products.json, đối chiếu theo id để cập nhật (update) các bản ghi cũ hoặc tạo mới (create) nếu chưa có trong Database.

Thêm log thông báo: 'Đã cập nhật X bản ghi, đã tạo mới Y bản ghi'.

3. Bước 3: Giao diện (Frontend - Port 2347):

Tại view 'Thành phẩm / Danh sách', thêm một nút bấm 'ĐỒNG BỘ TỪ FILE JSON' (màu xanh lá, icon CloudSync từ lucide-react).

Khi bấm nút, hiển thị thông báo xác nhận: 'Bạn có chắc chắn muốn ghi đè dữ liệu từ file JSON vào Database không?'.

Nếu xác nhận, gọi API /api/products/sync/ và reload lại danh sách.

4. Quản lý quy trình:

Cập nhật trạng thái vào CLAUDE.md và schema_manifest.json.

Thực hiện git add . và git commit -m "feat: add JSON-based data sync for products".

Hãy thực hiện ngay để tôi có thể bắt đầu sửa file JSON.

# Thay đổi Nút Hành động
Claude, hãy cập nhật giao diện cột 'Hành động' trong danh sách Thành phẩm tại Frontend theo các yêu cầu sau:

1. Tham chiếu giao diện:

Thay thế 2 icon (sửa/xóa) hiện tại bằng một nút bấm có nhãn 'Hành động' kèm icon mũi tên xuống, dựa trên hình ảnh screenshot/action-button.png.

Khi click vào nút này, một menu dropdown sẽ xổ xuống với 2 lựa chọn: 'Chỉnh sửa' và 'Xóa', dựa trên hình ảnh screenshot/action-button-2.png.

2. Yêu cầu kỹ thuật (Frontend):

Component: Sử dụng Tailwind CSS để tạo style cho nút: nền trắng, bo góc (rounded-lg hoặc rounded-xl), viền nhạt, chữ đen.

Dropdown Logic: Sử dụng React useState để quản lý việc đóng/mở menu cho từng dòng dữ liệu. Đảm bảo khi click ra ngoài menu hoặc click chọn một tác vụ thì menu sẽ tự đóng lại.

Z-index: Đảm bảo menu dropdown hiển thị đè lên trên các dòng dữ liệu phía dưới (sử dụng z-10 hoặc cao hơn).

Action: Giữ nguyên logic cũ của nút 'Chỉnh sửa' và 'Xóa' khi người dùng chọn từ menu.

3. Tinh chỉnh UI:

Menu đổ xuống phải có đổ bóng (shadow-lg), bo góc mềm mại, và hiệu ứng hover cho từng mục chọn (ví dụ: hover:bg-gray-100).

4. Quản lý quy trình:

Cập nhật trạng thái vào CLAUDE.md.

Thực hiện git add . và git commit -m "ui: refactor action column to dropdown menu".

Hãy thực hiện thay đổi này ngay lập tức.

# Trang them san pham
Claude, hãy thực hiện một đợt cập nhật lớn cho dự án erp_yummy với các yêu cầu sau:

1. Thay đổi định danh & Màu sắc (Global UI):

Đổi tên: Tìm và thay thế tất cả từ 'Thành phẩm' thành 'Sản phẩm' và nút 'Thêm lô' thành 'Thêm sản phẩm' trên toàn bộ giao diện (Sidebar, Breadcrumbs, Tiêu đề trang, Buttons).

Màu nền: Cập nhật màu nền của khu vực Content chính (trừ Sidebar và Header trắng) thành mã màu #FFF6F3. Hãy áp dụng vào file CSS chính hoặc class Tailwind tại layout tổng.

2. Xây dựng Trang 'Thêm sản phẩm' mới:
Khi click vào nút 'Thêm sản phẩm', hãy điều hướng đến trang (hoặc mở modal toàn màn hình) được thiết kế dựa trên 3 ảnh: screenshot/them-sanpham-1 of 3.png, 2 of 3.png, và 3 of 3.png.

Cấu trúc trang bao gồm các Section:

Thông tin chung: Tên sản phẩm, Nhóm sản phẩm (dropdown), Đơn vị tính (dropdown), Mô tả.

Hình ảnh sản phẩm: Khu vực kéo thả hoặc tải ảnh lên.

Thông tin sản xuất (Định mức BOM): >   - Cho phép thêm/xóa nhiều dòng Nguyên liệu.

Mỗi dòng gồm: Chọn nguyên liệu (dropdown), Định lượng (input số), Đơn vị (auto-fill theo nguyên liệu).

Ghi chú sản xuất.

Thông tin giá: Giá bán (có dấu sao đỏ), Giá vốn (readonly hoặc tính toán từ BOM), Giá so sánh. Tự động tính Biên lợi nhuận (%) và Lợi nhuận (đ).

Ghi chú: Ô nhập liệu văn bản lớn.

Footer Action: Nút 'Hủy' (viền xám), nút 'Lưu' (màu cam #E67E22).

3. Kỹ thuật & Logic:

Backend: Đảm bảo Model Product có đủ các trường trên. Tạo bảng trung gian cho ProductBOM để lưu định mức nguyên liệu.

Frontend: Sử dụng Tailwind CSS để tạo layout 2 cột (Cột chính bên trái cho thông tin, cột phụ bên phải cho Ảnh và Ghi chú) như trong ảnh.

4. Quản lý quy trình:

Cập nhật CLAUDE.md và schema_manifest.json (Trạng thái: Đã đổi tên sản phẩm & Hoàn thành trang Add Product).

Thực hiện git add . và git commit -m "feat: rename components to 'Sản phẩm', update background color and implement Create Product page with BOM".

Hãy thực hiện ngay một cách tự chủ.

# Prompt Nâng cấp Danh sách Sản phẩm (Giao diện & Tính năng)
Claude, hãy tiến hành nâng cấp trang Danh sách Sản phẩm dựa trên file thiết kế screenshot/ds-sanpham.png với các yêu cầu chi tiết sau:

1. Thay đổi Font chữ & Style hệ thống:

Cập nhật toàn bộ ứng dụng sang font chữ 'Nunito Sans' (Sử dụng Google Fonts import trong index.css).

Đổi màu nền trang thành #FFF6F3 (như đã yêu cầu ở bước trước).

2. Cấu hình bảng danh sách (Table Update):

Cột Hình ảnh: Thêm cột hiển thị ảnh sản phẩm nằm ngay trước 'Tên sản phẩm'. Ảnh hiển thị trong khung bo góc tròn nhẹ, kích thước nhỏ gọn (w-12 h-12 object-cover rounded-lg).

Cột Trạng thái (Status Badge): Tùy chỉnh padding của tag trạng thái chính xác theo thông số: trên-dưới 9px, trái-phải 20px. Sử dụng màu nền nhạt và chữ đậm theo từng trạng thái (ví dụ: Tạm ngưng - nền đỏ nhạt, Đang hoạt động - nền xanh nhạt).

3. Cập nhật Header & Thanh công cụ (Toolbar):

Góc phải trên cùng: Thêm 2 nút bấm 'Nhập' (màu cam nhạt) và 'Xuất' (màu cam nhạt) có icon tương ứng.

Khu vực tìm kiếm: >   - Thêm nút 'Bộ lọc' (màu cam nhạt, icon Filter) nằm cạnh thanh tìm kiếm.

Nút 'Đồng bộ JSON': Thu nhỏ nút này thành một biểu tượng (IconButton) với icon RefreshCw hoặc Database để tiết kiệm diện tích cho nút Bộ lọc.

Nút 'Thêm sản phẩm': Giữ nguyên màu cam đậm chủ đạo ở góc phải của thanh công cụ.

4. Logic Backend & Frontend:

Cập nhật Model Product để hỗ trợ lưu trữ đường dẫn ảnh.

Xây dựng component FilterDrawer hoặc một khu vực lọc nhanh khi bấm vào nút 'Bộ lọc'.

Đảm bảo phân trang (Pagination) hiển thị đúng như mẫu ở cuối bảng.

5. Quản lý tiến trình:

Cập nhật CLAUDE.md (Task: Refactor Product List UI with images and filters).

Thực hiện git add . và git commit -m "ui: refactor product list, add images, filters, and update font to Nunito Sans".

Hãy thực hiện thay đổi một cách tỉ mỉ để khớp với padding và layout trong ảnh thiết kế.
# Cấu hình Sidebar ERP Yummy & Phân quyền User
Claude, hãy thực hiện tái cấu trúc toàn diện Sidebar cho ứng dụng erp_yummy dựa trên file nội dung sidebar.docx (đường dẫn screenshot/sidebar.docx).

1. Cấu trúc Nội dung & Phân quyền (RBAC):

Dữ liệu: Hãy đọc file sidebar.docx và tạo một mảng (Array) hoặc JSON cấu trúc menu. Mỗi mục menu cần bao gồm: title, path, icon, và danh sách roles được phép truy cập (ví dụ: roles: ['Nhân viên kho', 'Bếp trưởng']).

Logic hiển thị: >   - Chỉ hiển thị các mục menu mà Role của người dùng hiện tại có trong danh sách được phép.

Nếu một Nhóm cha (ví dụ: Sản xuất, Nhân sự) không có bất kỳ mục con nào khả dụng cho Role đó, hãy ẩn luôn cả Nhóm cha đó.

Nếu mục menu không để Role trong ngoặc, mặc định là tất cả mọi người đều thấy.

2. Chỉnh sửa giao diện & Tính năng:

Nút Toggle: Thay thế cơ chế mở hiện tại bằng một nút mũi tên (Sử dụng ChevronLeft / ChevronRight từ lucide-react). Nút này nằm ở giữa cạnh phải của Sidebar hoặc ở chân Sidebar.

Hiệu ứng: Sidebar phải có hiệu ứng co giãn mượt mà (smooth transition). Khi co lại, chỉ hiển thị Icon; khi mở ra, hiển thị đầy đủ Icon và Chữ.

Font chữ: Đảm bảo sử dụng nhất quán font Nunito Sans.

3. Kỹ thuật (Frontend):

Sử dụng Context API hoặc Redux (tùy theo cấu trúc hiện tại) để lấy thông tin user.role.

Viết một hàm helper checkPermission(itemRoles, userRole) để lọc mảng menu trước khi render.

Đảm bảo các link điều hướng (react-router-dom) hoạt động chính xác với cấu trúc menu mới.

4. Quản lý quy trình:

Cập nhật trạng thái 'Sidebar RBAC Implemented' vào CLAUDE.md.

Thực hiện git add . và git commit -m "feat: refactor sidebar with RBAC based on sidebar.docx and add toggle arrow".

Hãy thực hiện một cách tự chủ và chính xác theo danh sách vai trò trong tài liệu.

# Prompt Tinh chỉnh UI Dropdown & Sắp xếp Danh sách
Claude, hãy thực hiện hai điều chỉnh nhỏ nhưng quan trọng sau cho ứng dụng erp_yummy:

1. Chỉnh sửa giao diện Dropdown (CSS/Tailwind):

Tham khảo hình ảnh image_e04c5b.png. Hiện tại icon mũi tên xổ xuống đang nằm quá sát lề phải.

Hãy điều chỉnh lại CSS/Tailwind cho các component Dropdown/Select (đặc biệt là phần 'Chọn nguyên liệu' và các ô tương tự).

Yêu cầu: Khoảng cách từ icon mũi tên đến viền phải phải bằng chính xác với khoảng cách từ chữ 'Chọn...' đến viền trái (padding-left = padding-right cho icon).

2. Cập nhật logic sắp xếp danh sách Sản phẩm:

Yêu cầu: Đảm bảo các sản phẩm mới được thêm vào sẽ luôn hiển thị ở vị trí đầu tiên trong trang Danh sách sản phẩm (thay vì ở cuối như hiện tại).

Thực hiện: >   - Backend: Cập nhật file api/models.py (thêm ordering = ['-id'] vào class Meta của model Product) hoặc cập nhật View để sắp xếp dữ liệu theo ID hoặc thời gian tạo giảm dần.

Frontend: Đảm bảo state danh sách sau khi thêm mới sẽ được đẩy vào đầu mảng (unshift) hoặc gọi lại API đã được sắp xếp.

3. Quản lý quy trình:

Cập nhật trạng thái vào CLAUDE.md.

Thực hiện git add . và git commit -m "style: fix dropdown arrow padding and sort product list by newest first".

Hãy thực hiện ngay để hoàn thiện trải nghiệm người dùng.
# Prompt Triển khai Danh sách Nguyên vật liệu (Copy & Paste)
Claude, hãy xây dựng trang Danh sách Nguyên vật liệu cho ứng dụng erp_yummy dựa trên thiết kế tại screenshot/ds-nguyenvatlieu.png với các yêu cầu sau:

1. Backend (Django - Port 2344):

Model: Tạo model Material (Nguyên vật liệu) với các trường: Mã NVL (unique), Tên, Nhóm NVL, Đơn vị tính, Hình ảnh, Trạng thái (Đang hoạt động/Tạm ngưng).

API: Xây dựng CRUD API đầy đủ. Đảm bảo hỗ trợ sắp xếp theo ID giảm dần (mới nhất lên đầu) và hỗ trợ upload hình ảnh qua FormData.

Phân quyền: Chỉ cho phép role 'Nhân viên thu mua' và 'Admin' truy cập vào các API này (dựa trên cấu trúc RBAC đã thiết lập).

2. Frontend (React - Port 2347):

Giao diện tổng thể: Kế thừa layout từ trang Sản phẩm: Font chữ Nunito Sans, màu nền chính #FFF6F3, Sidebar và Header màu trắng.

Cấu trúc Table: >   - Hiển thị cột: Checkbox chọn, Mã NVL, Tên NVL (kèm thumbnail bo góc), Nhóm NVL, Đơn vị tính, Trạng thái (Badge), và nút Dropdown 'Hành động'.

Thumbnail: Nếu không có ảnh, hiển thị icon placeholder hạt đậu hoặc hộp hàng như trong mẫu.

Trạng thái: Badge bo góc rộng (padding 9px/20px) với màu sắc tương ứng: Xanh dương nhạt cho 'Đang hoạt động', Đỏ nhạt cho 'Tạm ngưng'.

Thanh công cụ (Toolbar): >   - Breadcrumb chính xác: Nguyên vật liệu / Thông tin nguyên vật liệu / Danh sách nguyên vật liệu.

Nút 'Xuất' (màu cam nhạt) ở trên cùng bên phải.

Thanh tìm kiếm, nút 'Bộ lọc', và nút '+ Thêm nguyên vật liệu' (màu cam đậm #E67E22) được sắp xếp đúng vị trí như ảnh mẫu.

3. Tính năng bổ trợ:

Triển khai logic phân trang (Pagination) ở cuối bảng.

Đảm bảo Sidebar làm nổi bật mục 'Nguyên vật liệu' khi đang ở trang này.

4. Quản lý quy trình:

Cập nhật trạng thái vào CLAUDE.md và schema_manifest.json.

Thực hiện git add . và git commit -m "feat: implement Raw Materials list page based on ds-nguyenvatlieu.png".

Hãy thực hiện một cách tỉ mỉ để đảm bảo sự đồng bộ hoàn hảo với trang Sản phẩm.
# Prompt Cấu trúc lại Sidebar Nguyên vật liệu
Claude, hãy cập nhật cấu trúc Sidebar cho phân đoạn 'Nguyên vật liệu' dựa trên hình ảnh screenshot/sidebar-nvl và các yêu cầu sau:

1. Cấu trúc phân cấp Menu:
Hãy tổ chức lại menu 'Nguyên vật liệu' thành 3 cấp độ như sau:

Cấp 1: Nguyên vật liệu (Nhóm cha lớn).

Cấp 2 & 3:

Thông tin nguyên vật liệu (Có mũi tên xổ xuống):

Nhóm nguyên vật liệu

Nguyên vật liệu

Nhà cung cấp (Cùng cấp với 'Thông tin nguyên vật liệu').

Kho nguyên vật liệu (Có mũi tên xổ xuống):

Phiếu đặt hàng

Phiếu nhập kho

Phiếu xuất kho

Phiếu kiểm kho

Tồn kho nguyên vật liệu

2. Giao diện & Trải nghiệm (UI/UX):

Style: Tuân thủ thiết kế trong ảnh screenshot/sidebar-nvl. Khi một mục cha được chọn hoặc mở ra, chữ và icon chuyển sang màu cam đặc trưng, các mục con hiển thị thụt lề vào trong với dấu chấm (bullet point) phía trước.

Active State: Vì hiện tại chúng ta đang ở trang 'Danh sách nguyên vật liệu', hãy làm nổi bật mục 'Nguyên vật liệu' (con của 'Thông tin nguyên vật liệu') và tự động mở rộng (expand) nhóm cha của nó.

Mũi tên: Sử dụng icon mũi tên lên/xuống (ChevronUp / ChevronDown) ở bên phải các mục có menu con để người dùng đóng/mở thủ công.

3. Phân quyền (RBAC):

Tiếp tục áp dụng phân quyền từ sidebar.docx: Các mục này chủ yếu dành cho 'Nhân viên thu mua' và 'Nhân viên kho'. Đảm bảo các role không liên quan sẽ không nhìn thấy các phân mục này.

4. Quản lý quy trình:

Cập nhật trạng thái 'Sidebar Materials hierarchy updated' vào CLAUDE.md.

Thực hiện git add . và git commit -m "ui: refactor materials sidebar with nested navigation and active states".

Hãy thực hiện thay đổi này để đảm bảo Sidebar phản ánh đúng cấu trúc quản lý của hệ thống.
# Prompt Triển khai trang Thêm mới Nguyên vật liệu
Claude, hãy triển khai trang 'Thêm mới nguyên vật liệu' cho ứng dụng erp_yummy dựa trên hình ảnh tại screenshot/them-nvl.png với các yêu cầu chi tiết sau:

1. Giao diện (Frontend - Port 2347):

Layout: Sử dụng cấu trúc 2 cột trên nền màu #FFF6F3 với font chữ Nunito Sans.

Cột trái (Thông tin chung):

Tiêu đề section: 'Thông tin chung'.

Input 'Tên nguyên vật liệu' (Bắt buộc, có dấu * đỏ).

2 Dropdown nằm trên cùng một hàng: 'Nhóm nguyên vật liệu' và 'Đơn vị tính' (Cả hai đều bắt buộc).

Textarea 'Ghi chú'.

Checkbox: 'Quản lý sản phẩm theo lô - HSD'.

Cột phải (Hình ảnh):

Khu vực tải ảnh: Có khung bo góc, icon ảnh lớn ở giữa và dòng chữ hướng dẫn 'Kéo thả hoặc tải ảnh lên...'. Chỉ chấp nhận định dạng .png, .jpg, .jpeg.

Header & Footer:

Link 'Quay lại danh sách nguyên vật liệu' có icon mũi tên.

Thanh tác vụ bên dưới: Icon reset (quay lại), nút 'Hủy' (nền trắng viền xám), và nút 'Lưu' (màu cam #E67E22).

2. Logic & Kết nối (Fullstack):

Backend: Đảm bảo API POST /api/materials/ xử lý tốt dữ liệu FormData bao gồm cả file ảnh và trường checkbox quản lý theo lô.

Frontend: >   - Khi bấm 'Lưu', gọi API lưu dữ liệu. Nếu thành công, hiển thị SuccessModal (đã làm ở các bước trước) và điều hướng về trang danh sách.

Khi bấm 'Hủy' hoặc 'Quay lại', điều hướng về trang danh sách nguyên vật liệu.

3. Tinh chỉnh UI:

Khoảng cách padding và bo góc các ô Input/Dropdown phải đồng bộ với các trang trước đó.

Đảm bảo icon mũi tên trong các Dropdown cách lề phải một khoảng cân đối (như đã sửa ở trang Sản phẩm).

4. Quản lý quy trình:

Cập nhật trạng thái 'Add Raw Material page implemented' vào CLAUDE.md.

Thực hiện git add . và git commit -m "feat: implement Add Raw Material page with image upload and batch management option".

Hãy thực hiện ngay để hoàn thiện phân hệ Quản lý nguyên vật liệu.
# Tài khoản nhân viên thu mua
Claude, hãy thực hiện cấu hình tài khoản mới và cập nhật logic phân quyền cho Role 'Nhân viên thu mua' theo các yêu cầu sau:

1. Khởi tạo Tài khoản (Backend):

Tạo một script (Management Command) để khởi tạo User mới với thông tin:

Số điện thoại: 0982334556
Tên: Trần Minh Anh

Mật khẩu: 12345

Role: Nhân viên thu mua

Đảm bảo hệ thống lưu trữ đúng Role này vào Database để Frontend có thể nhận diện sau khi login.

2. Cấu hình Phân quyền Sidebar (Frontend):
- Dựa trên file sidebar.docx  và yêu cầu mới, hãy cập nhật lại danh sách quyền truy cập cho Role 'Nhân viên thu mua':

Được phép truy cập: >     - Toàn bộ mục Thông tin nguyên vật liệu (bao gồm Nhóm NVL và NVL).

Mục Nhà cung cấp.

Lưu ý đặc biệt: Trong phần Kho nguyên vật liệu, Role này chỉ được thấy và truy cập mục Tồn kho nguyên vật liệu. Các mục khác như Phiếu nhập/xuất/kiểm kho phải bị ẩn hoàn toàn đối với Role này.

Cập nhật hàm checkPermission để thực thi logic lọc menu con (Sub-menu) một cách nghiêm ngặt.

3. Kiểm tra:

Sau khi tạo xong, hãy kiểm tra lại file sidebar.js (hoặc file cấu hình menu) để chắc chắn Role 'Nhân viên thu mua' đã được gán vào đúng các mục trên.

4. Quản lý quy trình:

Cập nhật trạng thái 'Created Purchasing Staff account & refined RBAC' vào CLAUDE.md.

Thực hiện git add . và git commit -m "feat: create purchasing staff user and restrict warehouse access to inventory only".

Hãy thực hiện ngay để tôi có thể dùng tài khoản này kiểm tra hệ thống.

# Prompt Triển khai Danh sách Phiếu đặt hàng (Copy & Paste)
Claude, hãy xây dựng trang Danh sách Phiếu đặt hàng cho ứng dụng erp_yummy dựa trên thiết kế tại screenshot/ds-phieudathang.png (file image_aa118f.png) với các yêu cầu sau:

1. Backend (Django - Port 2344):

Model: Tạo model PurchaseOrder (Phiếu đặt hàng) với các trường: Mã phiếu (unique), Ngày tạo, Nhà cung cấp (ForeignKey tới Supplier), Tổng giá trị, Trạng thái (Lưu nháp, Chờ nhận, Đã nhận, Đã hủy).

API: Xây dựng đầy đủ API CRUD. Đảm bảo dữ liệu trả về được sắp xếp theo id giảm dần (mới nhất lên đầu).

Phân quyền: Cấu hình để Role 'Nhân viên thu mua' và 'Admin' có toàn quyền truy cập.

2. Frontend (React - Port 2347):

Giao diện tổng thể: Tiếp tục sử dụng font Nunito Sans, màu nền chính #FFF6F3, Sidebar và Header màu trắng.

Breadcrumb: Nguyên vật liệu / Kho nguyên vật liệu / Danh sách phiếu đặt hàng.

Cấu trúc Table:

Hiển thị các cột: Mã phiếu, Ngày tạo phiếu, Nhà cung cấp, Tổng giá trị, Trạng thái, Hành động.

Trạng thái (Status Badges): Sử dụng border-radius 7px, padding 9px/20px. Màu sắc theo mẫu:

Lưu nháp: Nền xám nhạt.

Chờ nhận: Nền vàng nhạt.

Đã nhận: Nền xanh lá nhạt.

Đã hủy: Nền đỏ nhạt.

Hành động: Sử dụng nút Dropdown 'Hành động' đã thiết kế ở các trang trước.

Thanh công cụ (Toolbar):

Nút 'Xuất' (màu cam nhạt) ở góc phải trên.

Ô tìm kiếm, nút 'Bộ lọc' (màu cam nhạt) và nút '+ Thêm phiếu đặt hàng' (màu cam đậm #E67E22) được bố trí chính xác như trong ảnh.

3. Logic bổ trợ:

Triển khai phân trang (Pagination) ở cuối bảng.

Đảm bảo Sidebar làm nổi bật đúng phân mục Phiếu đặt hàng trong nhóm Kho nguyên vật liệu.

4. Quản lý quy trình:

Cập nhật trạng thái vào CLAUDE.md và schema_manifest.json.

Thực hiện git add . và git commit -m "feat: implement Purchase Order list page based on ds-phieudathang.png".

Hãy thực hiện ngay để đồng bộ hóa quy trình quản lý kho cho hệ thống.

# Triển khai trang Thêm mới Phiếu đặt hàng
Claude, hãy triển khai trang 'Thêm mới phiếu đặt hàng' cho ứng dụng erp_yummy dựa trên hình ảnh tham chiếu tại screenshot/them-phieudathang-1 of 2.png và screenshot/them-phieudathang-2 of 2.png với các yêu cầu chi tiết sau:

1. Giao diện & Layout (Frontend - Port 2347):

Chủ đề: Sử dụng cấu trúc 2 cột trên nền màu #FFF6F3, font chữ Nunito Sans. Toàn bộ các ô nhập liệu, dropdown và nút bấm sử dụng border-radius: 7px.

Cột trái (Thông tin chính):

Khối Thông tin chung: Các ô 'Nhà cung cấp' (bắt buộc, có dấu * đỏ), 'Người phụ trách' (dropdown), 'Ngày đặt hàng' (datepicker), 'Ngày dự kiến nhập hàng' (datepicker).

Khối Nguyên vật liệu: Ô tìm kiếm nguyên vật liệu, khu vực hiển thị danh sách (hiện tại hiển thị trạng thái trống với icon placeholder và nút 'Nhập file danh sách' màu cam đậm).

Cột phải (Thông tin bổ trợ):

Khối Chi phí đặt hàng: Hiển thị danh sách các chỉ số: Số lượng đặt, Tổng tiền hàng, Chiết khấu đơn, Phí vận chuyển, VAT, Chi phí khác, Tiền cần trả NCC.

Khối Ghi chú: Ô nhập văn bản (textarea) lớn.

2. Cụm nút tác vụ cuối trang (Nằm trong nội dung trang):

Vị trí: Đặt ngay phía dưới các khối nội dung, không tách thành footer riêng biệt. Căn chỉnh lề của icon và các nút phải thẳng hàng với lề của các khối nội dung phía trên.

Phía bên trái: Icon tải lại/làm mới (Sử dụng icon RotateCcw từ lucide-react).

Phía bên phải (Cụm nút bấm):

Nút 'Hủy': Nền trắng, viền xám nhạt, chữ đen.

Nút 'Lưu nháp': Nền xám nhạt (bg-gray-200), chữ đen xám.

Nút 'Thêm': Màu cam đậm #E67E22, chữ trắng.

3. Logic & Kết nối (Fullstack):

Backend (Port 2344): Cập nhật API POST /api/purchase-orders/ để tiếp nhận dữ liệu phiếu đặt hàng cùng danh sách nguyên vật liệu đi kèm.

Frontend:

Thiết lập state để tính toán tự động 'Tiền cần trả NCC' dựa trên các biến số chi phí ở cột phải.

Thực hiện validation: Hiển thị dòng thông báo lỗi màu đỏ dưới các trường bắt buộc nếu để trống (như trong ảnh image_a8bc79.png).

Sau khi bấm 'Thêm' thành công, hiển thị SuccessModal và điều hướng về trang danh sách phiếu đặt hàng.

4. Quy chuẩn thiết kế:

Đảm bảo khoảng cách icon mũi tên trong các dropdown cách lề phải cân đối (giống các trang Sản phẩm/Nguyên vật liệu đã làm).

5. Quản lý quy trình:

Cập nhật trạng thái vào CLAUDE.md và schema_manifest.json.

Thực hiện git add . và git commit -m "feat: implement Add Purchase Order page with cost calculation and inline action buttons".

Hãy thực hiện ngay để hoàn thiện quy trình thu mua.

# Triển khai Danh sách Cài đặt địa điểm
Claude, hãy triển khai chức năng Danh sách cài đặt địa điểm cho ứng dụng erp_yummy. Bạn cần đọc kỹ file CẤU_TRÚC_THƯ_MỤC.md để đảm bảo lưu file đúng vị trí.

1. Yêu cầu về Vị trí thư mục (Theo CẤU_TRÚC_THƯ_MỤC.md):
- Backend: Làm việc duy nhất trong thư mục backend/api/views/cai_dat/. Tạo file location_views.py (nếu chưa có) để xử lý API địa điểm.   

Frontend: Làm việc duy nhất trong thư mục frontend/src/components/cai-dat/thiet-lap-dia-diem/. Tạo các component liên quan tại đây.   

2. Backend (Django - Port 2344):

Model: Tạo model Location với các trường: Mã địa điểm, Tên địa điểm, Địa chỉ, Số điện thoại, Trạng thái (Đang hoạt động/Tạm ngưng).

API: Xây dựng CRUD API đầy đủ, hỗ trợ sắp xếp theo ID giảm dần (mới nhất lên đầu).

Phân quyền: Chỉ cho phép role 'Admin' truy cập (dựa trên file sidebar.docx).

3. Frontend (React - Port 2347):

Giao diện: Tái hiện giao diện từ screenshot/ds-caidatdiadiem.png. Phong cách phải tương tự trang Danh sách sản phẩm và Danh sách nguyên vật liệu:

Màu nền: #FFF6F3, Font: Nunito Sans.

Table: Các cột Mã địa điểm, Tên địa điểm, Địa chỉ, SĐT, Trạng thái, Hành động (Dropdown).

Trạng thái: Badge có border-radius 7px, padding 9px/20px.

Thanh công cụ: Nút '+ Thêm địa điểm' màu cam đậm #E67E22, nút 'Bộ lọc', và ô tìm kiếm.

4. Quy chuẩn kỹ thuật:
- Luôn giữ cấu trúc song song giữa Backend và Frontend. - Đặt tên file/thư mục: Backend dùng snake_case, Frontend dùng kebab-case.   

Tích hợp SuccessModal khi thực hiện các tác vụ lưu/xóa thành công.

5. Quản lý quy trình:

Cập nhật trạng thái vào CLAUDE.md và schema_manifest.json.

Thực hiện git add . và git commit -m "feat: implement Location Settings list in module cai-dat per project structure".

Hãy thực hiện ngay một cách tự chủ và chính xác theo cấu trúc thư mục quy định.

# Triển khai Pop-up Thêm mới Địa điểm
Claude, hãy triển khai chức năng Pop-up Thêm mới địa điểm cho ứng dụng erp_yummy. Bạn cần tuân thủ nghiêm ngặt file CẤU_TRÚC_THƯ_MỤC.md để lưu file đúng vị trí nghiệp vụ.  1. Yêu cầu về Vị trí thư mục (Phân cấp theo nghiệp vụ):
* Backend: Làm việc trong thư mục backend/api/views/cai_dat/. Sử dụng hoặc cập nhật file location_views.py để xử lý logic lưu trữ dữ liệu.
* Frontend: Làm việc trong thư mục frontend/src/components/cai-dat/thiet-lap-dia-diem/. Tạo component AddLocationModal.jsx tại đây.  2. Backend (Django - Port 2344):
* API: Đảm bảo API POST /api/locations/ tiếp nhận các trường: Mã địa điểm, Tên địa điểm, Địa chỉ, Số điện thoại và Trạng thái.
* Xác thực: Chỉ cho phép role 'Admin' thực hiện thao tác này.  3. Frontend (React - Port 2347):Giao diện Pop-up: Dựa trên hình ảnh screenshot/them-diadiem-popup.png.Cấu trúc: Modal nằm giữa màn hình, có lớp phủ (overlay) mờ phía sau.Ô nhập liệu: Mã địa điểm, Tên địa điểm (bắt buộc), Địa chỉ, Số điện thoại. Sử dụng border-radius: 7px cho tất cả các input.Font chữ: Sử dụng Nunito Sans xuyên suốt.Nút tác vụ (Căn lề phải):Nút 'Hủy': Nền trắng, viền xám nhạt, chữ đen.Nút 'Thêm': Nền màu cam đậm #E67E22, chữ trắng, border-radius: 7px.4. Logic & Quy trình:Validation: Hiển thị cảnh báo màu đỏ nếu bỏ trống các trường bắt buộc.Kết nối: Sau khi bấm 'Thêm' thành công:Đóng Pop-up.
* Hiển thị SuccessModal thông báo thành công.  Tự động cập nhật lại danh sách địa điểm ở trang chính mà không cần tải lại trang.Hủy: Khi bấm 'Hủy' hoặc nhấn ra ngoài overlay, đóng Pop-up và xóa trắng dữ liệu đã nhập.5. Quản lý hệ thống:Cập nhật file CLAUDE.md và schema_manifest.json.Thực hiện git add . và git commit -m "feat: implement Add Location Pop-up in module cai-dat per project structure".Hãy thực hiện một cách tỉ mỉ để đảm bảo sự đồng bộ với các Modal khác trong hệ thống.

# Triển khai Pop-up Chỉnh sửa Địa điểm & Logic Chuyển tiếp UX
Claude, hãy triển khai chức năng Pop-up Chỉnh sửa địa điểm và cập nhật luồng trải nghiệm (UX Flow) cho ứng dụng erp_yummy. Bạn cần tuân thủ nghiêm ngặt file CẤU_TRÚC_THƯ_MỤC.md để lưu file đúng vị trí nghiệp vụ.

1. Vị trí tệp tin (Phân cấp theo nghiệp vụ):

Backend: Cập nhật backend/api/views/cai_dat/location_views.py để hỗ trợ API lấy chi tiết (GET) và cập nhật (PATCH/PUT) địa điểm.

Frontend: Tạo component EditLocationModal.jsx trong thư mục frontend/src/components/cai-dat/thiet-lap-dia-diem/.

2. Giao diện Pop-up Chỉnh sửa (Dựa trên ảnh screenshot/chinhsua-diadiem.png):

Cấu trúc: Giống hệt Pop-up thêm mới nhưng có các điểm khác biệt sau:

Tiêu đề: 'CHỈNH SỬA ĐỊA ĐIỂM {Mã_Địa_Điểm}' (Ví dụ: MDD006).

Trường Trạng thái (Bổ sung): Thêm Dropdown 'Trạng thái' (Đang hoạt động/Tạm ngưng) nằm bên cạnh trường 'Nhân viên quản lý'.

Khối Lịch sử (Phía dưới cùng): Hiển thị dòng nhật ký bao gồm: Ngày, Giờ, Tên người thực hiện và nội dung hành động (Ví dụ: '15/03/2026 - 16:15 - Trần Khánh Huyền - Thêm mới địa điểm MDD006').

Nút tác vụ: Giữ nguyên icon reset, nút 'Hủy' (trắng) và nút 'Lưu' (cam #E67E22).

3. Logic Chuyển tiếp UX (Quan trọng):

Luồng hành động:

Khi người dùng bấm 'Lưu' ở Pop-up Thêm mới thành công -> Hiển thị SuccessModal.

Khi người dùng bấm 'OK' trên SuccessModal -> Hệ thống tự động mở Pop-up Chỉnh sửa cho chính địa điểm vừa tạo đó để người dùng xem lại thông tin.

Nếu người dùng không cần sửa gì thêm, họ có thể bấm dấu 'X' (nhân) ở góc trên để thoát về trang danh sách.

4. Quy chuẩn kỹ thuật & Style:

Dữ liệu: Khi mở Modal chỉnh sửa, phải gọi API lấy dữ liệu theo ID và đổ đầy vào các trường (bao gồm các checkbox trong phần 'Thiết lập địa điểm').

Style: Font Nunito Sans, border-radius 7px cho tất cả input và button. Màu nền #FFF6F3.

5. Quản lý hệ thống:

Cập nhật file CLAUDE.md và schema_manifest.json.

Thực hiện git add . và git commit -m "feat: implement Edit Location Modal and auto-open edit flow after creation success".

Hãy thực hiện một cách tỉ mỉ để đảm bảo dữ liệu được đồng bộ hóa mượt mà giữa các bước.
# Cập nhật Giao diện Pop-up Xác nhận Xóa
Claude, hãy thực hiện cập nhật giao diện cho Pop-up Xác nhận xóa địa điểm trong ứng dụng erp_yummy dựa trên thiết kế tại screenshot/popup-canhbaoxoa.png. Hãy tuân thủ cấu trúc thư mục nghiệp vụ trong CẤU_TRÚC_THƯ_MỤC.md.

1. Vị trí tệp tin:

Frontend: Chỉnh sửa component xác nhận xóa tại thư mục frontend/src/components/cai-dat/thiet-lap-dia-diem/ (có thể là DeleteLocationModal.jsx hoặc một component dùng chung trong common/).

2. Giao diện & Thành phần (Dựa trên ảnh screenshot/popup-canhbaoxoa.png):

Icon cảnh báo: Một vòng tròn màu vàng bao quanh dấu chấm than (!) nằm chính giữa phía trên. Sử dụng icon từ lucide-react hoặc SVG tương đương với màu vàng tươi.

Nội dung thông báo:

Văn bản: 'Bạn có chắc muốn xóa địa điểm “{Mã_Địa_Điểm}” không?'

Kiểu chữ: Căn giữa, in nghiêng nhẹ, sử dụng font Nunito Sans.

Hệ thống Nút bấm (Nằm ngang, khoảng cách đều):

Nút bên trái ('Vâng, xóa đi'): Nền màu cam đậm #E67E22, chữ trắng, bo góc 7px.

Nút bên phải ('Không, quay lại'): Nền màu cam nhạt/kem (bg-[#FFF0E6] hoặc tương đương), chữ màu cam, bo góc 7px.

3. Logic & Hiệu ứng:

Nền: Thẻ (Card) màu trắng, bo góc lớn, có bóng đổ (shadow) mềm mại, hiển thị trên lớp phủ (overlay) tối mờ.

Hành động:

Khi bấm 'Vâng, xóa đi': Gọi API xóa, hiện SuccessModal, đóng pop-up và cập nhật lại danh sách.

Khi bấm 'Không, quay lại' hoặc click ra ngoài: Đóng pop-up mà không thực hiện thay đổi nào.

4. Quy chuẩn kỹ thuật:

Giữ nguyên các thông số padding và khoảng cách cân đối như trong hình ảnh tham chiếu.

Đảm bảo mã địa điểm trong thông báo được truyền vào động (dynamic).

5. Quản lý quy trình:

Cập nhật file CLAUDE.md.

Thực hiện git add . và git commit -m "style: refactor delete confirmation popup UI according to design".

Hãy thực hiện thay đổi này để đảm bảo sự đồng bộ và thẩm mỹ cho toàn bộ hệ thống.
# Triển khai tính năng Xóa hàng loạt (Bulk Delete)
Claude, hãy triển khai tính năng Xóa hàng loạt (Bulk Delete) cho trang Danh sách địa điểm trong ứng dụng erp_yummy. Hãy tuân thủ cấu trúc thư mục nghiệp vụ trong CẤU_TRÚC_THƯ_MỤC.md.

1. Vị trí tệp tin:

Backend: backend/api/views/cai_dat/location_views.py.

Frontend: frontend/src/components/cai-dat/thiet-lap-dia-diem/LocationList.jsx.

2. Logic Hiển thị linh hoạt (Frontend):

Trạng thái mặc định: Hiển thị nút '+ Thêm địa điểm' màu cam như hiện tại.

Trạng thái khi có mục được chọn (Dựa trên ảnh screenshot/xoahangloat.png):

Khi người dùng tích chọn ít nhất một ô checkbox ở đầu dòng trong danh sách, nút '+ Thêm địa điểm' sẽ biến mất.

Thay thế vào vị trí đó là một cụm thông tin gồm:

Văn bản: '{số_lượng} được chọn' (Ví dụ: 2 được chọn).

Nút bấm: 'Xóa đã chọn' (Màu đỏ đậm, chữ trắng, bo góc 7px).

Sử dụng hiệu ứng chuyển đổi mượt mà giữa hai trạng thái này.

3. Logic Xác nhận & Xóa (Fullstack):

Xác nhận: Khi bấm 'Xóa đã chọn', hãy hiển thị Pop-up cảnh báo xóa (đã làm ở bước trước) nhưng cập nhật nội dung thành: 'Bạn có chắc muốn xóa {số_lượng} địa điểm đã chọn không?'.

Backend (Django):

Xây dựng hoặc cập nhật API để tiếp nhận danh sách các ID cần xóa (ví dụ: POST hoặc DELETE kèm mảng ids).

Thực hiện xóa các bản ghi trong một transaction để đảm bảo an toàn dữ liệu.

Frontend:

Sau khi xóa thành công, hiển thị SuccessModal, tự động bỏ chọn tất cả các checkbox và cập nhật lại danh sách địa điểm.

4. Quy chuẩn kỹ thuật & Style:

Font chữ: Nunito Sans.

Nút 'Xóa đã chọn': Màu đỏ đặc trưng cho hành động xóa hàng loạt (ví dụ: #C00000 hoặc tương đương như trong ảnh).

Đảm bảo tính nhất quán về khoảng cách và căn lề với thanh tìm kiếm và nút bộ lọc.

5. Quản lý quy trình:

Cập nhật file CLAUDE.md.

Thực hiện git add . và git commit -m "feat: implement bulk delete functionality with dynamic action bar in location list".

Hãy thực hiện thay đổi này để người dùng có thể quản lý danh sách địa điểm một cách nhanh chóng và chuyên nghiệp nhất.

# Triển khai tính năng Sắp xếp (Sorting) 3 trạng thái
Claude, hãy triển khai tính năng Sắp xếp (Sorting) cho tất cả các bảng danh sách trong ứng dụng erp_yummy (Sản phẩm, Nguyên vật liệu, Địa điểm, Phiếu đặt hàng). Hãy tuân thủ cấu trúc thư mục trong CẤU_TRÚC_THƯ_MỤC.md.

1. Logic Sắp xếp (3 trạng thái):
Áp dụng cơ chế chuyển đổi khi người dùng click vào tiêu đề cột (ngoại trừ cột 'Hành động' và 'Checkbox'):

Click lần 1: Sắp xếp tăng dần (A-Z / Cũ đến mới).

Click lần 2: Sắp xếp giảm dần (Z-A / Mới đến cũ).

Click lần 3: Trả về trạng thái mặc định ban đầu (không sắp xếp/theo ID).

2. Giao diện (Frontend):

Icon chỉ báo: Hiển thị icon mũi tên lên/xuống nhỏ cạnh tiêu đề cột (Sử dụng ArrowUp, ArrowDown, hoặc ChevronsUpDown từ lucide-react).

Trạng thái Active: Khi một cột đang được sort, icon phải đổi sang màu cam đậm #E67E22 để người dùng dễ nhận biết.

Font chữ: Tiếp tục sử dụng Nunito Sans.

3. Xử lý Backend (Django):

Cập nhật các ViewSet/API tương ứng để nhận tham số sort từ URL (ví dụ: ?ordering=name, ?ordering=-name).

Đảm bảo Backend xử lý sắp xếp chính xác cho các kiểu dữ liệu khác nhau (Văn bản, Số, Ngày tháng).

4. Phạm vi áp dụng (Theo CẤU_TRÚC_THƯ_MỤC.md):

Sản xuất: san-pham, nguyen-vat-lieu, phieu-dat-hang.

Cài đặt: thiet-lap-dia-diem.

Hãy viết một Reusable Hook (ví dụ: useSort) hoặc component Table dùng chung để dễ dàng áp dụng cho các trang hiện tại và tương lai.

5. Quản lý quy trình:

Cập nhật file CLAUDE.md.

Thực hiện git add . và git commit -m "feat: implement 3-state sorting for all list tables across the system".

Hãy thực hiện thay đổi này để tối ưu hóa khả năng khai thác dữ liệu cho người dùng.

# Hồ sơ nhân viên
Claude, hãy triển khai module Hồ sơ nhân viên cho dự án erp_yummy dựa trên các hình ảnh tham chiếu image_28fe80.png, image_28fabe.png, và image_28fabc.png.

1. Vị trí tệp tin (Tuân thủ cấu trúc phân cấp mới):

Backend (Django):

Models: Tạo/Cập nhật tại backend/api/models/nhan_su/thiet_lap_nhan_vien/.  

Serializers: Tạo/Cập nhật tại backend/api/serializers/nhan_su/thiet_lap_nhan_vien/.  

Views: Thực hiện tại backend/api/views/nhan_su/thiet_lap_nhan_vien/employee_views.py.  

Frontend (React): frontend/src/components/nhan-su/thiet-lap-nhan-vien/ho-so-nhan-vien/.  

2. Trang Danh sách (Dựa trên image_28fe80.png):

Tiêu đề: 'DANH SÁCH HỒ SƠ NHÂN VIÊN' (In hoa toàn bộ).  

Bảng dữ liệu:

Các cột: MÃ TK, HỌ VÀ TÊN (kèm avatar và SĐT), VAI TRÒ, KHU VỰC LÀM VIỆC, NGÀY VÀO LÀM, TRẠNG THÁI, HÀNH ĐỘNG.

Tiêu đề cột in hoa. Checkbox nền cam #E67E22 dấu tick trắng.  

Sắp xếp 3 trạng thái (A-Z, Z-A, Mặc định) cho tất cả các cột trừ Hành động.

Tính năng: Tìm kiếm, Bộ lọc, Xuất file, và Xóa hàng loạt (hiện nút 'Xóa đã chọn' màu đỏ khi có checkbox được tích).

3. Trang Thêm mới (Dựa trên image_28fabe.png và image_28fabc.png):

Cấu trúc: Form 2 cột trên nền #FFF6F3.

Trường dữ liệu:

Thông tin khởi tạo (có upload ảnh), Thông tin công việc (Ngày vào làm, Vai trò, Ca làm việc), Thông tin cá nhân (Ngày sinh, CMND, Email, Địa chỉ hành chính 3 cấp).

Phần 'Lương thưởng' ở cuối trang.

Tác vụ: Nút 'Thêm' màu cam #E67E22, nút 'Hủy' trắng, icon tải lại.

4. Logic & Quy chuẩn dự án:

Style: Font Nunito Sans, border-radius 7px cho mọi input/button.  

Validation: Unique validation cho Email/SĐT, báo lỗi chữ đỏ dưới input.

UX Flow: Sau khi Thêm thành công -> Hiện SuccessModal -> Bấm OK tự động mở trang Chỉnh sửa của nhân viên đó.  

Audit Trail: Triển khai cơ chế lưu vết lịch sử chỉnh sửa tại Backend và hiển thị ở trang Chỉnh sửa.  

Hãy thực hiện đồng bộ cả Backend API và Frontend Component theo đúng sơ đồ thư mục đã nêu.
# Ca làm việc
Claude, hãy triển khai module Ca làm việc cho dự án erp_yummy dựa trên hình ảnh danh sách screenshot/ds-calamviec.png và pop-up thêm mới screenshot/them-calamviec.png.

1. Vị trí tệp tin (Theo cấu trúc nghiệp vụ):

Backend (Django):

Models: backend/api/models/nhan_su/quan_ly_cham_cong/.  

Serializers: backend/api/serializers/nhan_su/quan_ly_cham_cong/.  

Views: backend/api/views/nhan_su/quan_ly_cham_cong/shift_views.py.  

Frontend (React): frontend/src/components/nhan-su/quan-ly-cham-cong/ca-lam-viec/.  

2. Trang Danh sách (Dựa trên screenshot/ds-calamviec.png):

Tiêu đề: 'DANH SÁCH CA LÀM VIỆC' (In hoa toàn bộ).  

Bảng dữ liệu:

Các cột: MÃ CLV, TÊN CA LÀM VIỆC, THỜI GIAN LÀM VIỆC (Bắt đầu - Kết thúc), TỔNG GIỜ LÀM VIỆC, TRẠNG THÁI, HÀNH ĐỘNG.

Tiêu đề cột in hoa. Checkbox nền cam #E67E22 dấu tick trắng khi được chọn.  

Sắp xếp 3 trạng thái cho mọi cột trừ Hành động.  

Tính năng: Tìm kiếm, Bộ lọc, Xuất file, và Xóa hàng loạt (hiện nút 'Xóa đã chọn' màu đỏ khi có checkbox được tích).  

3. Pop-up Thêm mới (Dựa trên screenshot/them-calamviec.png):

Tiêu đề: 'THÊM MỚI CA LÀM VIỆC'.  

Các trường:

Tên ca làm việc (Bắt buộc, dấu * đỏ).

Giờ bắt đầu, Giờ kết thúc (Sử dụng TimePicker).

Khối 'Nghỉ giữa ca': Đóng khung nét đứt, có nút (+) màu cam để thêm khoảng nghỉ. Bao gồm Giờ bắt đầu nghỉ và Giờ kết thúc nghỉ.

Tác vụ: Nút 'Lưu' màu cam #E67E22, nút 'Hủy' trắng, icon tải lại.  

4. Quy chuẩn kỹ thuật:

Style: Font Nunito Sans, border-radius 7px cho mọi input/button.  

UX Flow: Thêm mới thành công -> Hiện SuccessModal -> Bấm OK mở ngay trang Chỉnh sửa của ca làm việc đó.  

Audit Trail: Model phải có cơ chế lưu vết lịch sử chỉnh sửa.  

Hãy thực hiện đồng bộ Backend API, Models, Serializers và Frontend Component để hoàn thiện chức năng quản lý ca làm việc.
# Thưởng
Claude, hãy triển khai module Quản lý thưởng cho dự án erp_yummy dựa trên hình ảnh danh sách screenshot/ds-thuong.png và giao diện thêm mới screenshot/them-thuong.png.

1. Vị trí tệp tin (Tuân thủ cấu trúc phân cấp):

Backend (Django):

Models: backend/api/models/nhan_su/quan_ly_luong/.  

Serializers: backend/api/serializers/nhan_su/quan_ly_luong/.  

Views: backend/api/views/nhan_su/quan_ly_luong/bonus_views.py.  

Frontend (React): frontend/src/components/nhan-su/quan-ly-luong/thuong/.  

2. Logic sinh mã tự động (Sequential ID):

Tại Backend, hãy viết logic tự động sinh mã MTH theo số thứ tự (ví dụ: MTH001, MTH002,...). Tuyệt đối không dùng số ngẫu nhiên.  

3. Trang Danh sách (Dựa trên screenshot/ds-thuong.png):

Tiêu đề: 'DANH SÁCH THƯỞNG' (In hoa toàn bộ).  

Bảng dữ liệu:

Các cột: MÃ THƯỞNG, LÝ DO THƯỞNG, SỐ LƯỢNG NV ĐƯỢC THƯỞNG, TỔNG TIỀN, NGÀY THƯỞNG, TRẠNG THÁI, HÀNH ĐỘNG.

Tiêu đề cột in hoa. Checkbox nền cam #E67E22 dấu tick trắng khi được chọn.  

Sắp xếp 3 trạng thái cho mọi cột trừ Hành động.  

Tính năng: Tìm kiếm, Bộ lọc, Xuất file, và Xóa hàng loạt (hiện cụm 'X được chọn' và nút 'Xóa đã chọn' màu đỏ khi có checkbox được tích).  

4. Giao diện Thêm mới (Dựa trên screenshot/them-thuong.png):

Cấu trúc: Form 2 cột trên nền #FFF6F3.

Thành phần:

Khối 'Thông tin chung': Lý do thưởng (bắt buộc), Ngày thưởng (datepicker), Mức thưởng tổng (input số kèm đơn vị đ).

Nhân viên được thưởng (Checkbox: Tất cả nhân viên / Tùy chọn).

Hình thức thưởng (Checkbox: Thưởng trực tiếp / Thưởng cộng vào lương).

Khối 'Ghi chú' ở bên phải.

Tác vụ: Nút 'Thêm' màu cam #E67E22, nút 'Hủy bỏ' trắng, icon tải lại.  

5. Quy chuẩn Kỹ thuật & UX:

Style: Font Nunito Sans, border-radius 7px cho mọi input/button.  

UX Flow: Thêm mới thành công -> SuccessModal -> Bấm OK mở ngay Pop-up Chỉnh sửa của bản ghi đó.  

Chỉnh sửa: Phải sử dụng Pop-up (Modal). Trang chỉnh sửa bổ sung trường 'Trạng thái' và khối 'Lịch sử' (Audit Trail) ở cuối.  

Hãy thực hiện đồng bộ Backend API và Frontend Component để hoàn thiện chức năng quản lý thưởng.

# Phúc lợi
Claude, hãy triển khai module Quản lý phúc lợi cho dự án erp_yummy dựa trên hình ảnh danh sách screenshot/ds-phucloi.png và giao diện thêm mới screenshot/them-phucloi.png.

1. Quy định về Ngôn ngữ & Vị trí:

Ngôn ngữ: Sử dụng Tiếng Việt có dấu chuẩn cho toàn bộ UI và thông báo.  

Backend (Django):

Models: backend/api/models/nhan_su/quan_ly_luong/.  

Serializers: backend/api/serializers/nhan_su/quan_ly_luong/.  

Views: backend/api/views/nhan_su/quan_ly_luong/benefit_views.py.  

Frontend (React): frontend/src/components/nhan-su/quan-ly-luong/phucloi/.  

2. Đồng bộ giao diện Thêm/Sửa (Trang riêng biệt):

Dựa trên screenshot/them-phucloi.png, trang Thêm mới là một trang riêng. Hãy làm trang Chỉnh sửa cũng là một trang riêng biệt để đảm bảo tính đồng nhất.  

3. Trang Danh sách (Dựa trên screenshot/ds-phucloi.png):

Tiêu đề bảng: 'DANH SÁCH PHÚC LỢI' và tất cả tiêu đề cột (MÃ PL, TÊN PHÚC LỢI, PHẠM VI...) phải IN HOA toàn bộ.  

Checkbox: Khi chọn, nền màu cam #E67E22 kèm dấu tick trắng.  

Tính năng: Sắp xếp 3 trạng thái cho mọi cột (trừ Hành động), Tìm kiếm, Bộ lọc, và Xóa hàng loạt (hiện cụm 'X được chọn' và nút 'Xóa đã chọn' màu đỏ).  

4. Trang Thêm mới & Chỉnh sửa (Dựa trên screenshot/them-phucloi.png):

Logic Mã số: Tự động sinh mã MPL theo số thứ tự (ví dụ: MPL001, MPL002,...) dựa trên bản ghi gần nhất.  

Giao diện: Form 2 cột trên nền #FFF6F3, font Nunito Sans, border-radius 7px.  

Thành phần: Khối nhập liệu trái, khung 'Tóm tắt thông tin' và 'Ghi chú' ở bên phải. Phần đính kèm quyết định hỗ trợ kéo thả file.

UX Flow: Thêm mới thành công -> Hiện SuccessModal -> Bấm OK mở ngay trang Chỉnh sửa của bản ghi đó.  

5. Audit Trail & Trạng thái:

Trang Chỉnh sửa bổ sung trường 'Trạng thái' và khối 'Lịch sử' (Audit Trail) lưu vết chi tiết (Thời gian, Người dùng, Hành động) ở cuối trang.  

Sử dụng các thông báo (toast/alert) giống hệt module Sản phẩm.  

Hãy thực hiện đồng bộ Backend API và Frontend Component. Đảm bảo mọi văn bản có dấu và giao diện chuẩn xác theo yêu cầu.

# Bảng lương
Claude, hãy triển khai module Quản lý bảng lương cho dự án erp_yummy dựa trên các hình ảnh tham chiếu: danh sách (ds-bangluong.png), thêm mới (them-bangluong-1 of 3.png, them-bangluong-2 of 3.png, them-bangluong-3 of 3.png) và chỉnh sửa (chinhsua-bangluong.png).

1. Quy định về Ngôn ngữ & Vị trí:

Ngôn ngữ: Sử dụng Tiếng Việt có dấu chuẩn 100% cho toàn bộ UI và thông báo.

Backend (Django):

Models: backend/api/models/nhan_su/quan_ly_luong/.

Serializers: backend/api/serializers/nhan_su/quan_ly_luong/.

Views: backend/api/views/nhan_su/quan_ly_luong/payroll_views.py.

Frontend (React): frontend/src/components/nhan-su/quan-ly-luong/bang-luong/.

2. Trang Danh sách (Dựa trên ds-bangluong.png):

Tiêu đề bảng: 'DANH SÁCH BẢNG LƯƠNG' và các cột (MÃ BL, TÊN BẢNG LƯƠNG, KỲ TÍNH LƯƠNG, TỔNG LƯƠNG (đ), ĐÃ TRẢ (đ), TRẠNG THÁI, HÀNH ĐỘNG) phải IN HOA.

Checkbox: Nền cam #E67E22 kèm dấu tick trắng khi chọn.

Tính năng: Sắp xếp 3 trạng thái, Tìm kiếm, Bộ lọc, và Xóa hàng loạt (hiển thị nút màu đỏ khi có chọn).

3. Trang Thêm mới & Chỉnh sửa (Dựa trên các ảnh them-bangluong-x và chinhsua-bangluong.png):

Stepper: Triển khai thanh trạng thái 2 bước: 1. Thông tin chung -> 2. Kiểm tra và lưu.

Giao diện: Form 2 cột trên nền #FFF6F3. Khối nhập liệu bên trái, khung 'Ghi chú' bên phải.

Logic Mã số: Tự động sinh mã MBL theo số thứ tự (ví dụ: MBL006) dựa trên bản ghi lớn nhất.

Phạm vi áp dụng:

Nếu 'Tất cả nhân viên': Tự động lấy danh sách nhân viên đang làm việc.

Nếu 'Tùy chọn': Hiển thị thanh tìm kiếm nhân viên và bảng danh sách có nút xóa (X) ở cuối mỗi dòng.

Xác nhận hủy: Nếu đang nhập mà nhấn 'Hủy bỏ', hiện Pop-up xác nhận kèm icon dấu chấm than vàng chuẩn dự án.

4. Logic & Kỹ thuật nâng cao:

Tính toán: Tự động tính toán 'TỔNG CỘNG' lương thực nhận từ danh sách nhân viên hiển thị.

Unique Validation: Tên bảng lương không được trùng lặp. Nếu trùng, báo lỗi chữ đỏ dưới input.

UX Flow: Thêm thành công -> SuccessModal -> Bấm OK mở ngay trang Chỉnh sửa của bảng lương đó.

Audit Trail: Trang Chỉnh sửa (trang riêng) phải có trường 'Trạng thái' và khối 'Lịch sử' lưu vết ở cuối trang.

Hãy thực hiện đồng bộ Backend và Frontend. Đảm bảo giao diện giống hệt ảnh mẫu về khoảng cách, màu sắc và font Nunito Sans.