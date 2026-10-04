# Vòng 16 — Không yêu cầu đăng nhập

Theo yêu cầu, người mở link có toàn bộ quyền dùng ứng dụng: dữ liệu nhân viên/chấm công/phiếu lương, upload/download hồ sơ. Supabase sử dụng quyền anon/authenticated trong LINK-ACCESS-MIGRATION.sql. Bất kỳ ai biết URL/key công khai cũng có thể truy cập dữ liệu qua API; link không xác thực người được chia sẻ.

Cách bật trên project đã thiết lập: chạy LINK-ACCESS-MIGRATION.sql trong SQL Editor, deploy source vòng 16 với hai biến Supabase đã cấu hình. Không cần đăng nhập; trên máy cũ bấm Đưa dữ liệu máy này lên. Các hướng dẫn đăng nhập vòng 15 được thay bằng chế độ này. Phiên bản mới vẫn giữ hồ sơ trong bucket private, tải qua API được cấp quyền đọc cho anon; bỏ hồ sơ chỉ gỡ liên kết như trước.

40/40 kiểm tra đạt; build thành công. Test upload/download hồ sơ bằng hai client không có phiên đăng nhập; kiểm tra delta sync và các regression trước. Chưa áp dụng migration trên Supabase thật và chưa deploy Vercel vì không có phiên quản trị trong công cụ.
