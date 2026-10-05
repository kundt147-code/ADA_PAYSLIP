# Vòng 17 — Cơ chế lương số 4

- Thêm ô tích cơ chế 4: Lớp chung có dấu % trong tên dùng đơn giá 170.000đ/giờ.
- Ưu tiên theo xác nhận cuối: 4 → 3 → 2/1. Khi cả 4 và 3 khớp, dùng 170.000đ. Không giảm tiếp 20%.
- Chỉ áp dụng cho đứng lớp Lớp chung. Trợ giảng, phụ đạo, lớp kèm và phụ đạo kèm giữ quy tắc cũ. Tắt cơ chế 4 giữ cách tính cũ.
- Lưu trong salary.special4, tương thích dữ liệu nhân viên cũ và Supabase, không cần đổi schema hay chạy thêm SQL.
- Import/export nhân viên dùng số 4 trong cột Cơ chế lương đặc biệt, ví dụ 1; 3; 4. Parser cũng hỗ trợ cột riêng Cơ chế 4 (1/0). Mẫu Excel và chú thích được cập nhật.

Kiểm tra: 42/42 đạt; build thành công. Kiểm tra 1,5 giờ nhận 255.000đ; lớp không có %, trợ giảng, các loại chấm công khác, import/export và xung đột 4/3. Cảnh báo kích thước bundle Vite vẫn còn.

Cần deploy source mới lên Vercel, bật cơ chế 4 ở nhân viên cần áp dụng và Khởi tạo lại đã chọn cho các phiếu cũ. Chưa triển khai thay đổi lên web thật.
