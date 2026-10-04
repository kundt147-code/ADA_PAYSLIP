# PAYSLIP — cập nhật vòng 5

- Preview: giữ cố định độ rộng tổng của các cột, loại bỏ cột cuối chỉ có định dạng và không có dữ liệu; mô phỏng text tràn qua các ô trống ở phần đầu phiếu. Giảm lề nền, mở rộng cửa sổ; cuộn ngang khi màn hình hẹp. Không sửa mẫu Excel hay giá trị tính lương.
- Esc khởi tạo: ưu tiên kết thúc chọn ở select/checkbox, xóa tên tìm kiếm, sau đó mới đóng cửa sổ. Không bỏ các nhân viên đã tick. Hộp xác nhận/cảnh báo có ưu tiên trước.
- Import chấm công: so sánh loại công, kỳ, ngày, lớp, nhân viên/GV/TG, giờ bắt đầu/kết thúc và số giờ; kiểm tra dữ liệu hiện có và các dòng trước trong cùng file.
- Import nhân viên: cảnh báo tên giống sau khi bỏ dấu, chuẩn hóa khoảng trắng và hoa/thường; cùng STK; hoặc tên có ít nhất 2 từ chung và độ phủ từ >=75%. Đây là gợi ý đối chiếu, không tự hợp nhất nhân viên.
- Hộp import liệt kê dữ liệu sắp nhập và dữ liệu giống; có Hủy import, Vẫn nhập tất cả, Bỏ qua dòng cảnh báo. Bỏ qua áp dụng cả dòng gần giống. Nếu vẫn nhập nhân viên sẽ tạo hồ sơ riêng, không ghi đè hồ sơ cũ.
- Lưu nhân viên thủ công cũng hỏi xác nhận nếu tên/STK gần giống hồ sơ khác; loại trừ chính hồ sơ đang sửa.
- Tiếp tục tinh chỉnh giao diện xanh rừng: sidebar chuyển sắc nhẹ, menu đang chọn rõ hơn, bảng/nút và card đồng bộ; giữ kích thước nhỏ gọn và responsive sẵn có.

Kiểm tra: 27/27 tests đạt, build thành công. Kiểm tra trình duyệt: Esc xóa tìm tên rồi đóng ở lần sau; cảnh báo tên khác dấu trước khi lưu; preview CK với hồ sơ kiểm thử. Không có console error trong lần kiểm tra. Các tests hồi quy mapping MS1–MS5, insurance, XLSX và export chi nhánh tiếp tục đạt. Chưa chạy trên Excel desktop/điện thoại thật. Build vẫn có cảnh báo bundle Excel lớn.

Các giới hạn chú thích Excel và nhiều chi nhánh của vòng 4 giữ nguyên. Source không gồm node_modules/dist hay dữ liệu lưu trên trình duyệt. Dùng npm install, npm run dev hoặc npm run build.
