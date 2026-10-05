# Sửa vòng 23 — khởi tạo, preview và tìm phiếu

- Ngăn lượt tải kho dùng chung bắt đầu trước thay đổi cục bộ ghi đè phiếu/dòng chấm công vừa tạo, chỉnh hoặc xóa. Đăng ký thay đổi trong layout effect trước các tác vụ nền; đối chiếu revision khi tải xong. Lượt tải cũ không cập nhật baseline của dữ liệu mới.
- Khởi tạo xong chuyển bộ lọc kỳ sang kỳ vừa tạo và xóa tìm kiếm để phiếu mới xuất hiện.
- Thêm tìm phiếu lương theo tên, hỗ trợ không dấu, chữ hoa/thường và khoảng trắng. Chọn tất cả chỉ áp dụng danh sách đang hiển thị qua cả hai bộ lọc tên/kỳ.
- Cache preview theo nội dung dữ liệu thay vì tham chiếu đối tượng. Các lượt đồng bộ trả về cùng nội dung không xóa cache, không khởi động lại worker. Thay đổi dữ liệu hoặc chuyển mẫu vẫn cập nhật preview.
- Bao gồm các sửa timeout của vòng 22.

Kiểm tra: 55/55 bài kiểm tra đạt, trong đó có mô phỏng tải dữ liệu cũ kết thúc sau khi tạo và lưu phiếu mới. Build production thành công. Chrome kiểm tra phiếu xuất hiện sau một lần khởi tạo khi bộ lọc đang ở kỳ khác; tìm tên không dấu; preview không tạo thêm worker qua nhiều lượt tải lại nhân viên; preview hoạt động cả khi worker không khả dụng.

Chưa triển khai lên Vercel và chưa xác minh trực tiếp hiện tượng trên thiết bị người dùng. Không cần SQL mới. Giữ dữ liệu trên trình duyệt để tiếp tục hàng chờ đồng bộ của bản trước.
