# Vòng 20 — Trạng thái tải dữ liệu

Ảnh cho thấy fieldset toàn màn hình bị khóa trong lúc chờ ready của đồng bộ. Kiểm tra đọc web thật: Supabase có 39 nhân viên, 248 dòng chấm công, 22 phiếu. Trong phiên kiểm tra sạch, các request hoàn tất và trạng thái chuyển sang Dữ liệu dùng chung; không tái hiện được treo vĩnh viễn ở phiên đó.

Thay đổi:
- Không khóa toàn bộ fieldset; các bộ lọc và lựa chọn vẫn sử dụng được lúc tải. Các hành động sửa/import/xóa/tạo/export chờ dữ liệu tải xong để tránh thao tác với cache chưa đồng bộ.
- Banner rõ trạng thái tải/lỗi và nút Thử kết nối lại, đặt ngoài phần thao tác.
- Request Supabase có giới hạn 15 giây, hủy request treo và thông báo lỗi. Retry tự động theo chu kỳ như trước; có retry chủ động.
- Giữ dữ liệu và chức năng hiện có; không chạy SQL hay xóa dữ liệu cloud.

46/46 bài kiểm tra đạt, gồm timeout và hủy request; build thành công. Chưa triển khai vòng 20 lên Vercel. Chưa kiểm tra trình duyệt bản mới với cấu hình cloud thực tế; kiểm tra web thật là phiên bản đang triển khai trước thay đổi.
