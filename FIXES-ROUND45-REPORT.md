# Web V50 — Kiểm soát hàng trong file Excel xuất
Bỏ cờ ẩn hàng trong mẫu gốc và kiểm soát tại bước ghi XLSX cuối: bỏ hidden/collapsed của hàng, bỏ zeroHeight ở cấp sheet, khôi phục ht=0 bằng chiều cao mặc định. Chỉ bật cho phiếu lương, giữ chiều cao dương và dữ liệu/công thức/merge khác.
103 kiểm tra đạt; build thành công. Kiểm tra trực tiếp XML và mở lại XLSX bằng thư viện, gồm tình huống cờ ẩn và chiều cao 0. Giữ toàn bộ 5 chỉnh sửa V49. Không sửa app, chưa triển khai web.
ZIP tháng 9 tại D:/Bin/JOB/THUCTAP/NHT/BANGLUONG/CARE EDU đã được đọc và không phát hiện cờ ẩn/ht=0; chưa xác nhận đó là đúng file người dùng đang gặp lỗi. Nếu còn lỗi sau khi triển khai V50 và xuất lại, cần đúng file mới để đối chiếu.
