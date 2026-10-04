# PAYSLIP — vòng 8

Chỉ chỉnh các yêu cầu đã chốt, giữ hệ thống màu/font và giao diện hiện tại:
- Hàng 1: Họ và tên, Ngân hàng, STK.
- Hàng 2: Ngày vào làm, Ngày nghỉ làm, Email. Hai ngày cạnh nhau; Email giữ ở cuối hàng.
- Hàng 3: Chi nhánh, Chức vụ.
- Hàng 4: Đã nghỉ việc, Không cần chấm công. Dùng checkbox native kích thước cố định để dấu tick không tràn. Điện thoại xếp dọc.
- Phần 5: Cơ chế tính lương đặc biệt. Phần 6: Hồ sơ đi kèm.
- Các mẫu MS1–MS5: ô tháng/năm căn trái; định dạng số nguyên không phân cách hàng nghìn, năm 2026 thay vì 2.026. Áp dụng workbook dùng chung cho preview/export.

Kiểm chứng: 31/31 tests đạt; build thành công. Test mới kiểm tra căn trái và định dạng năm của cả 5 mẫu xuất, đồng thời kiểm tra giá trị năm trong preview. Rà soát form desktop và ô Không cần chấm công được tích. Không thay đổi quy tắc tính lương, dữ liệu hay cấu hình Supabase. Các giới hạn kết nối hồ sơ dùng chung của vòng 6 giữ nguyên.
