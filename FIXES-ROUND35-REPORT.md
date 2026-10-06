# Web V39 — Round 35

- Lọc chấm công từ ngày đến ngày, bao gồm hai ngày biên, kết hợp kỳ/tên/chi nhánh. Tổng giờ, tiền test và số dòng tính theo kết quả lọc. Có nút bỏ lọc ngày.
- BH đặc biệt chỉ thay dòng trừ BH bảng lương phía dưới MS4/MS5. Bảng trắng phía trên dùng công thức gốc kể cả khi BH đặc biệt bằng 0. MS3 giữ quy tắc đã chốt ở Round 33.
- Hai folder gốc: CHUYỂN KHOẢN TỪ TK CÔNG TY và THANH TOÁN TIỀN MẶT. Giữ nguyên cơ chế folder nhân viên (câu hỏi chưa yêu cầu sửa).
- Hiển thị nhân viên đã lưu trên máy ngay; cập nhật cache sau lần tải thành công. Chấm công/phiếu tiếp tục dùng dữ liệu local hiện có trong khi tải.
- Tải nền mỗi 60 giây thay 15 giây; bỏ qua khi tab ẩn, không tải nhân viên chồng nhau, thử lại giãn dần tối đa 5 phút khi lỗi. Dữ liệu không đổi không thay state chấm công/phiếu, giảm dựng lại xem trước.
- Thanh trên có biểu tượng xoay và Đang tải dữ liệu/Đang lưu dữ liệu/Đã đồng bộ. Lỗi kết nối hiển thị Chưa đồng bộ và Thử lại, không lặp banner lỗi tải nền.

Kiểm tra: 83/83 tests đạt; Vite build đạt; Chrome kiểm tra khoảng ngày, tổng giờ, bỏ lọc, không lỗi JavaScript. Chưa đo tốc độ với dữ liệu Supabase thật; chưa triển khai website công khai. Không thay SQL, không làm lại app Desktop trong đợt này.
