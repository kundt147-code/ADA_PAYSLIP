# V35 — Đợt chỉnh 3: nhân viên, chú thích và giao diện

## Phạm vi đã thực hiện

- Checkbox chọn từng dòng trong Thông tin nhân viên; chọn/bỏ chọn tất cả các dòng đang hiển thị (theo bộ lọc tìm kiếm). Checkbox không mở editor. Hiển thị số đã chọn và tô màu dòng.
- Xóa nhóm đã chọn có hộp xác nhận. Xóa từng hồ sơ qua cơ chế local/Supabase hiện có; nếu có lỗi chỉ loại bỏ các hồ sơ đã xóa thành công, giữ lại hồ sơ lỗi. Không sửa logic phiếu lương.
- Chi nhánh có TP, PN, Chi nhánh khác. Chức vụ có GV, VP, Chức vụ khác. Có thể tick nhiều lựa chọn; Khác có ô nhập. Giá trị vẫn được lưu trong branch/position dạng chữ, phân cách ;, không thay schema. Dữ liệu cũ như CN1/Giáo viên được giữ và hiển thị ở Khác. Import/export vẫn cùng các trường cũ.
- Notes ở từng ô tiêu đề Excel được làm thành tiêu đề đậm và nội dung nhiều dòng, Times New Roman. Hộp note lớn hơn, giữ cơ chế hover của notes Excel. Mẫu nhân viên và export danh sách dùng cùng helper notes. Tái tạo file mẫu static và đổi phiên bản URL tải để tránh dùng mẫu cũ từ cache.
- Logo mới dạng chứng từ và dấu kiểm, tông teal/xanh ADA, dùng đồng bộ trên topbar và favicon.
- Giao diện mới nền sáng, navigation nhẹ, nút và form đồng bộ. Responsive cho desktop/điện thoại: menu thu gọn, bấm chuyển trang tự đóng menu trên điện thoại, form một cột, nút dễ chạm, bảng và preview cuộn trong vùng riêng. Không loại bỏ chức năng khi dùng điện thoại.

## Các phần được bảo toàn

src/lib/exporter.js và các công thức tính lương không thay đổi so với round2. Attendance parser vẫn giữ cách xử lý trước; chỉ phần tạo notes mẫu Excel được chỉnh. Preview worker, mapping MS1–MS5, quy tắc bảo hiểm/chuyển khoản/tiền mặt, import append, persistence, export mỗi mẫu một file/value-only được giữ.

## Kiểm chứng

- npm test: 20/20 đạt. 17 nhóm trước vẫn đạt; thêm kiểm tra toggle selection, round-trip branch/position cũ và notes Times New Roman/multiline/VML.
- npm run build: thành công. Vẫn có cảnh báo bundle lớn như các bản trước.
- XML độc lập trên 9 XLSX: parse XML/VML/RELS, worksheet sequence và relationship targets đạt.
- Browser localhost: kiểm tra thêm và lưu hồ sơ thử với TP + Chức vụ khác/Điều phối; chọn tất cả rồi bỏ chọn; mở và hủy xác nhận xóa nhóm. Không thực hiện xóa dữ liệu thật/DB remote.
- Visual QA: desktop và viewport điện thoại 390x844; form nhân viên, checkbox, bảng cuộn và logo được kiểm tra bằng screenshot. Screenshot trong outputs chỉ có hồ sơ giả 'Kiểm thử ADA'.

## Giới hạn

Chưa xác nhận hover note trong Microsoft Excel native, chưa test trên thiết bị iOS/Android thật. File chứa notes tiêu đề, rich text TNR và VML hover với kích thước lớn; nếu Excel cấu hình ẩn cả indicators/notes thì hover phụ thuộc thiết lập Excel. Không thay đổi thiết lập Excel của người dùng.

Supabase remote chưa được truy cập. Chức năng xóa dùng API đang có; hộp xác nhận và xử lý lỗi được bổ sung, không có migration mới.

## Dùng bản mới

Giải nén payslip-web-v35-round3.zip, vào payslip-web-v35-round3, chạy npm install, npm test, npm run build hoặc npm run dev. Tải lại file mẫu nhân viên từ web mới. Không dùng lại mẫu đã tải trước đó. Source không chứa node_modules, dist hoặc credentials thật.
