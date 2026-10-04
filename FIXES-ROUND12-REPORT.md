# Cập nhật MS4 / MS5 — vòng 12

Ngày: 05/10/2026.

## Thay đổi
- Cập nhật format MS4 (GV_BH), MS5 (VP_BH) theo Bảng lương mẫu.xlsx mới được cung cấp.
- Thêm cột Lương tháng 13, mặc định bằng 0 theo yêu cầu; không thêm trường nhập trên giao diện.
- Lương chính tiếp tục lấy Lương CK trong thông tin nhân viên.
- Theo xác nhận cuối cùng: mức tính bảo hiểm lấy Mức đóng BH trong thông tin nhân viên, tại V5 của MS4 và S5 của MS5. Các khoản BH của bảng chuyển khoản tính từ mức này.
- Tính thu nhập, khấu trừ và thuế theo công thức mẫu mới; hỗ trợ MIN/MAX lồng nhau cho công thức thuế.
- Tiền mặt còn nhận trừ thực lĩnh chuyển khoản sau BH/thuế trong chính mẫu đó: Q7/Q8 của MS4 và N7/N8 của MS5.
- Mỗi file xuất vẫn chỉ có một mẫu, toàn bộ ô công thức được tính rồi chuyển thành giá trị.
- Phòng ban MS2/MS5 hiển thị VP, kể cả nhân viên có cả GV và VP; đã kiểm tra file xuất và dữ liệu preview.
- Giữ giao diện hiện tại và các chức năng đã chốt. Nội dung và kiểu ô MS1–MS3 trong workbook mới đã được đối chiếu với mẫu trước, không có khác biệt.

## Kiểm tra
- npm test: 35/35 đạt, không có bài thất bại.
- Kiểm tra riêng cả MS4/MS5 ở các mức lương 9, 20, 40, 80 và 150 triệu; mức đóng BH 6 triệu độc lập với Lương CK; tháng 13 bằng 0; đối chiếu thuế tính theo từng bậc.
- Kiểm tra chênh lệch tiền mặt, mapping, năm/tháng, nhiều dòng chấm công, file value-only, cấu trúc XML và tên/thư mục xuất.
- npm run build: thành công. Có cảnh báo kích thước bundle của Vite; không có lỗi build.
- Đây là kiểm tra tự động và build; chưa mở các file xuất bằng Microsoft Excel để kiểm tra trực quan.

## Source
Source chứa mẫu mới, mã đã sửa và bài kiểm tra. Không chứa node_modules hoặc thư mục build. Không có thay đổi triển khai lên máy chủ trong vòng này.

