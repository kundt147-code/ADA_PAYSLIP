# Vòng 15 — Khởi tạo lại nhiều phiếu và dữ liệu dùng chung

## Thay đổi
- Nút Khởi tạo lại đã chọn dùng các ô chọn hiện có, vô hiệu khi chưa chọn.
- Cập nhật nhiều phiếu trong một lần cập nhật danh sách, giữ ID, ngày tạo, kỳ dữ liệu/kỳ hiển thị và các chỉnh sửa đơn giá/ngân hàng. Cập nhật dòng chấm công và loại phiếu từ dữ liệu hiện tại. Bỏ qua phiếu không còn nhân viên, có thông báo số lượng.
- Bổ sung Supabase cho chấm công và phiếu lương; nhân viên tiếp tục qua Supabase.
- Chỉ gửi các ID được sửa/xóa, không thay toàn bộ bảng. Đọc phân trang, cập nhật từ máy khác mỗi 15 giây và khi quay lại cửa sổ.
- Hàng đợi lưu chấm công/phiếu lương giữ trong trình duyệt, thử lại nếu lưu lỗi.
- Nút Đưa dữ liệu máy này lên chuyển nhân viên/chấm công/phiếu lương cũ, bổ sung ID chưa tồn tại; giữ dữ liệu kho chung khi trùng ID. Giữ bản sao trước đồng bộ.
- Đăng nhập và quyền đội ngũ dùng chung được kiểm soát bằng migration SQL. Chờ tải kho chung trước khi dùng các ô nhập liệu.
- Nếu chưa cấu hình Supabase, vẫn hoạt động cục bộ.

## Kiểm tra
- 40/40 bài kiểm tra tự động đạt.
- Test hai client thêm dòng riêng, xóa có chủ đích, lỗi lưu/thử lại, chuyển dữ liệu không ghi đè ID trùng, đọc trên 1.200 dòng.
- Kiểm tra Chrome production: chọn 2 trong 3 phiếu và khởi tạo lại; phiếu thứ 3 không đổi, ID/kỳ/ngày tạo/đơn giá/ngân hàng giữ nguyên; nút vô hiệu khi chưa chọn.
- Build thành công; cảnh báo bundle lớn vẫn còn.

## Trạng thái triển khai
Người dùng xác nhận chưa có project Supabase. Chưa chạy SQL trên dịch vụ thật, chưa kiểm tra hai thiết bị với backend thật, chưa triển khai vòng 15 lên Vercel. Source đã chuẩn bị; xem SHARED-PAYROLL-SETUP.md để bật. Hồ sơ file cũ trong IndexedDB cần tải lên lại kho hồ sơ; migration nút này không chuyển file cục bộ.
