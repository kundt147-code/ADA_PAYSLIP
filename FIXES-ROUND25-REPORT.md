# Vòng 25 — Bổ sung ngày nghỉ trước khởi tạo

Thêm cửa sổ mỗi nhân viên một hàng: nghỉ bù, nghỉ phép, nghỉ không phép. Trống = 0; không nhận số âm. Tìm theo tên không dấu, giữ dữ liệu tất cả các hàng khi lọc. Chỉ tạo khi bấm Xác nhận & khởi tạo; Quay lại/Esc đóng bước ngày nghỉ trước.

Lưu số ngày theo từng phiếu tại overrides.leaveDays trong JSON hiện có; giữ qua chỉnh sửa/khởi tạo lại. MS2/MS5 mapping E14 nghỉ bù, E15 nghỉ không phép, E16 nghỉ phép. Công thức gốc E23 chỉ giảm lương cơ bản theo E15; E26 trừ bảo hiểm. Phiếu cũ thiếu trường này mặc định 0. Sửa xử lý phép trừ giá trị âm trong bộ tính công thức để MS5 không lỗi khi tiền CK thực lĩnh âm.

56/56 kiểm tra đạt; build thành công. Chrome kiểm tra nhập 2 ngày, tìm tên ẩn/hiện vẫn giữ 2, chưa xác nhận chưa tạo phiếu, xác nhận tạo một lần và lưu đúng số ngày. Không cần SQL mới. Chưa triển khai Vercel.
