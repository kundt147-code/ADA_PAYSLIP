# Thiết lập hồ sơ dùng chung

1. Dùng cùng một dự án Supabase cho tất cả bản web. Cấu hình VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY như .env.example, rồi build/deploy lại.
2. Quản trị viên chạy supabase.sql trong SQL Editor. Script giữ bảng employees hiện có, tạo private bucket employee-documents và bảng thành viên được phép truy cập file. Không đặt bucket public.
3. Trong Supabase Authentication, quản trị viên tạo/cấp tài khoản cho các thành viên. Lấy User UID của từng tài khoản, thêm vào bảng employee_document_members bằng Table Editor (cột user_id). Có thể chạy:
```sql
insert into public.employee_document_members(user_id)
values ('USER_UUID_DO_QUAN_TRI_VIEN_CAP')
on conflict do nothing;
```
4. Mỗi người bấm Đăng nhập hồ sơ dùng chung bằng tài khoản của mình. Người A thêm hồ sơ vào đúng nhân viên rồi bấm Lưu; người B tải lại trang hoặc bấm logo làm mới, mở cùng nhân viên rồi Tải xuống. Không cần chia sẻ tài khoản/mật khẩu.
5. Tất cả thành viên được cấp quyền trong bảng trên có thể tải lên và tải xuống hồ sơ trong kho này. Xóa UID khỏi bảng để thu hồi quyền file. Quyền bảng employees của baseline được giữ nguyên.

Các thông tin mới và danh sách file được lưu trong salary.employeeProfile để tương thích schema employees cũ; các khóa tiền lương không thay đổi. Nội dung file nằm trong Supabase Storage, không nhúng vào Excel hay localStorage.

Nếu chưa kết nối Supabase, ứng dụng chỉ lưu file trong IndexedDB của trình duyệt hiện tại và hiển thị rõ điều này. File cục bộ cũ không tự đồng bộ lên kho; cần tải xuống rồi tải lên lại khi có Supabase. File đã tải lên nhưng chưa bấm Lưu chưa xuất hiện trong hồ sơ dùng chung. Bỏ khỏi hồ sơ chỉ bỏ liên kết khi Lưu, không xóa vĩnh viễn file trong kho.

Kiểm tra thực tế sau cấu hình: A upload và Lưu, B tải lại trang rồi download; so sánh file gốc; tài khoản không có trong bảng thành viên không được tải file. Bản cập nhật chưa có thông tin dự án/tài khoản nên chưa chạy bài kiểm tra thực tế này.
