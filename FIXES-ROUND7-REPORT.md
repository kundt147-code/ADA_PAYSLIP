# PAYSLIP — vòng 7: làm gọn thông tin nhân viên

- Tách Email, Ngày vào làm, Ngày nghỉ làm thành 3 cột; ngày chưa có hiển thị dấu —.
- Ô Email/ngày đồng bộ nhãn trên ô, chiều cao, viền xanh nhẹ; bỏ kiểu viền đen và nhãn nằm ngang.
- Ô Đã nghỉ việc thành vùng trạng thái gọn; checkbox 14px, giảm chữ đậm và khoảng đệm của bảng, vùng chọn, biểu mẫu. Giữ vùng bấm và cỡ chữ nhập thuận tiện trên điện thoại.
- Hồ sơ nhận việc/nghỉ việc: icon folder, tiêu đề trái, nút thêm bên phải; ít khoảng trống và chữ nhẹ hơn. Không đổi chức năng lưu/tải hồ sơ.
- Quy ước cột import Đã nghỉ việc giữ 1 = tích, 0/trống = không tích. Mẫu hiện hành 22 cột vẫn có cột này và ghi chú.

Kiểm tra: build thành công; 30/30 tests hồi quy đạt. Rà soát trực quan desktop 1280×720 và viewport 390×844: biểu mẫu, checkbox, header 3 cột riêng và vùng hồ sơ. Không đổi quy tắc tính lương. Các giới hạn kích hoạt Supabase dùng chung của vòng 6 giữ nguyên; xem SHARED-DOCUMENTS-SETUP.md. Build vẫn có cảnh báo kích thước bundle Excel lớn.
