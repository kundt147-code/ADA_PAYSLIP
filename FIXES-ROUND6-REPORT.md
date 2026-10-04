# PAYSLIP — vòng 6: thông tin và hồ sơ nhân viên

- Thêm email, ngày vào làm, ngày nghỉ làm, ô Đã nghỉ việc; validate email và thứ tự ngày.
- Danh sách có Đang làm việc / Đã nghỉ việc. Tích và Lưu sẽ chuyển nhóm; bỏ tích và Lưu chuyển lại. Hồ sơ nhân viên cũ, chấm công và phiếu lương được giữ. Không tự thay đổi quy tắc khởi tạo phiếu cho nhân viên nghỉ việc.
- Hồ sơ nhận việc / Hồ sơ nghỉ việc: chọn nhiều file, lưu trữ, tải xuống, bỏ liên kết khỏi hồ sơ. Hỗ trợ file chung qua private Supabase Storage khi có kết nối, đăng nhập và quyền thành viên; cục bộ dùng IndexedDB.
- Thêm màn hình đăng nhập; SQL tạo private bucket và danh sách tài khoản được phép. Tài khoản A upload, tài khoản B được cấp quyền có thể download sau khi A Lưu và B tải lại dữ liệu.
- Thông tin và metadata lưu trong salary.employeeProfile, tương thích employees schema cũ; không thay đổi số tiền lương. File Supabase không public, không cần bucket mới public.
- Mẫu Excel nhân viên 22 cột: nối thêm Email / Ngày vào làm / Ngày nghỉ làm / Đã nghỉ việc, giữ 18 cột cũ và ghi chú. Import mẫu cũ vẫn dùng được. Excel không chứa nội dung file hồ sơ.

Kiểm thử: 30/30 tests đạt (bao gồm mô phỏng hai tài khoản upload/download, profile roundtrip, nhóm nghỉ việc, Excel roundtrip và các tests lương trước đây). Build đạt, còn cảnh báo bundle lớn. Trình duyệt: cập nhật email, ngày, chuyển nhóm và persist sau reload; tải lên file hồ sơ kiểm thử cục bộ. Chưa xác nhận tải file cuối cùng qua công cụ trình duyệt do thao tác chờ download hết thời gian. Chưa kiểm tra Supabase thực tế vì workspace không có cấu hình kết nối/tài khoản. Không tuyên bố cloud đã được kích hoạt; làm theo SHARED-DOCUMENTS-SETUP.md để hoàn tất phần hạ tầng và kiểm thử hai máy.

Bỏ liên kết và hủy biểu mẫu không purge file đã upload. Quản trị viên có thể quản lý file không còn liên kết trong Storage. Không thay đổi quyền employees baseline.
