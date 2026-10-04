# Bật dữ liệu dùng chung

1. Trong project Supabase hiện có, chạy supabase.sql (nếu chưa có các bảng) rồi SHARED-PAYROLL-MIGRATION.sql. File migration bổ sung bảng chấm công/phiếu lương và giới hạn dữ liệu cho tài khoản đội ngũ đã đăng nhập.
2. Tạo tài khoản người dùng trong Supabase Authentication. Thêm UUID tài khoản được dùng web vào employee_document_members, như hướng dẫn hồ sơ dùng chung. Không mở bảng dữ liệu lương cho người chưa đăng nhập.
3. Vercel đặt VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY rồi deploy lại source. Không dùng service-role key trên web.
4. Trên thiết bị đang có dữ liệu cũ, đăng nhập và bấm Đưa dữ liệu máy này lên; xác nhận. App bổ sung các ID chưa có, giữ giá trị trên kho khi ID trùng. Bản sao trước đồng bộ vẫn giữ trong trình duyệt.
5. Trên thiết bị khác, mở cùng link và đăng nhập tài khoản đã được cấp quyền. Dữ liệu tải từ kho chung; các thay đổi từ máy khác cập nhật sau tối đa 15 giây khi trang đang hoạt động, hoặc khi quay lại cửa sổ.

Nếu chưa cấu hình Supabase, web tiếp tục chạy cục bộ. Nếu mất kết nối khi lưu, thay đổi chấm công/phiếu lương được giữ trong hàng đợi của trình duyệt và thử lại. Đừng xóa dữ liệu trình duyệt trước khi đồng bộ xong.

Hồ sơ đính kèm lưu cục bộ trước đây cần tải lên lại kho hồ sơ để máy khác tải xuống được; nút đưa dữ liệu lên chuyển thông tin nhân viên/chấm công/phiếu lương, không tự chuyển file trong IndexedDB.

Hai người sửa cùng một dòng: lần ghi sau cùng được giữ. Hai người thêm các dòng khác nhau: các dòng được giữ riêng; web không thay toàn bộ bảng bằng dữ liệu của một máy.
