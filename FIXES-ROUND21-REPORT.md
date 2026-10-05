# Báo cáo sửa vòng 21 — 05/10/2026

## Thay đổi
- Đọc lại Bảng lương mẫu.xlsx mới nhất, cập nhật cả 5 mẫu lương. SHA-256: e4155997a3e05a76a078412f2302ed9a64c563d87bc708b7a8226af35db8c7ed.
- Mapping GV/GV_BH theo vị trí mới; tổng thực nhận gồm đủ lương lớp chung, phụ đạo, lớp kèm, phụ đạo kèm, Placement Test, văn phòng và trừ bảo hiểm tại dòng dưới. Công thức nguồn mới H64 có cộng H46 (lớp kèm).
- Thêm tab Placement Test sau Phụ đạo kèm, trước Văn phòng. Giữ tên học viên, tên bài test và giáo viên. Lương mặc định 20.000đ/lần; có ô tiền riêng để điều chỉnh, giữ được giá trị 0. Nhân viên chỉ có Placement Test vẫn được tạo mẫu GV/GV_BH tương ứng.
- Placement Test xuất vào phần Placement test của mẫu GV/GV_BH; mở rộng số dòng khi cần, không mất chi tiết hoặc sai tổng.
- Ưu tiên cơ chế 4/3 → 2/1. Cơ chế 3 và 4 chọn một trong hai; import bật cả hai sẽ báo lỗi. Dữ liệu cũ đã bật cả hai được đọc theo cơ chế 4, tắt cơ chế 3 để tương thích kết quả trước đây.
- Mẫu import nhân viên và chấm công tải về dùng file người dùng cung cấp; giữ nguyên font, cỡ chữ, style, độ rộng cột, chiều cao dòng và thứ tự cột/sheet. Chỉ giữ tối đa hai dòng dữ liệu ví dụ mỗi sheet, loại các chuỗi dữ liệu thừa khỏi sharedStrings.
- Import chấm công hỗ trợ 6 sheet; file cũ 5 sheet tiếp tục dùng được. Import nhân viên và export danh sách theo thứ tự 22 cột của mẫu mới.
- Không thay đổi schema Supabase; dữ liệu Placement Test nằm trong JSON hiện có.

## Kiểm tra
- 51/51 bài kiểm tra đạt, bao gồm hồi quy MS1–MS5, export chỉ giá trị, mapping bảo hiểm, tràn dòng chi tiết, parser, đồng bộ và lỗi mạng.
- Build production thành công. Còn cảnh báo kích thước bundle hiện có.
- Chrome: kiểm tra tab Placement Test và chọn loại trừ cơ chế 3/4 ở màn hình 1440px và 390px đều đạt.
- Đối chiếu XML: styles/theme, độ rộng cột và chiều cao dòng của hai mẫu import khớp file tham chiếu; XML đọc hợp lệ, ExcelJS đọc được.
- Chưa kiểm tra mở file trực tiếp bằng Microsoft Excel desktop.

## Bàn giao
Đây là source cập nhật; chưa triển khai lên Vercel. Không cần chạy SQL mới cho vòng này. Các chức năng đã ổn và giao diện ngoài phạm vi trên được giữ nguyên.
