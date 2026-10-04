# Bản cập nhật vòng 4 — PAYSLIP

## Thay đổi
- Thiết kế lại toàn bộ giao diện theo xanh rừng, nền sáng, logo tài liệu và dấu xác nhận; chữ PAYSLIP mới, menu có icon nét thống nhất. Nút/chữ desktop nhỏ gọn, biểu mẫu và bảng thích ứng điện thoại.
- Nút đóng dạng tròn nhẹ, nhãn lưu cục bộ rõ hơn: Lưu trên trình duyệt này.
- MS1/GV và MS4/GV_BH: tiền BH chuyển từ dòng tiêu đề D59 xuống dòng chi tiết D60; thực nhận trừ đúng dòng này, kể cả khi số dòng chấm công thay đổi.
- Giữ quy tắc MS4/MS5: lương chính lấy lương chuyển khoản nhân viên; tiền mặt còn nhận trừ thực lĩnh CK sau BH trong chính mẫu.
- Import nhân viên: TP/PN và GV/VP ánh xạ lựa chọn tương ứng; giá trị khác chọn mục Khác và điền textbox. Không thay đổi cấu trúc dữ liệu cũ.
- Mẫu nhân viên: notes nhiều dòng Times New Roman trên header và ô mẫu; vị trí hộp note gần ô; hướng dẫn khi chọn ô ở các cột nhập trong dòng 2–1000.
- Export cá nhân và hàng loạt đều đóng ZIP theo chi nhánh/kỳ. Một mẫu đặt trực tiếp trong thư mục chi nhánh; nhiều mẫu đặt trong thư mục tên nhân viên. Mỗi XLSX chỉ một mẫu, giá trị tĩnh, không công thức.

## Cấu trúc xuất
```text
PAYSLIP_TP_10-2026/
  PAYSLIP_An_GV_TP_MS1_10-2026.xlsx
  Bình/
    PAYSLIP_Bình_GV_TP_MS1_10-2026.xlsx
    PAYSLIP_Bình_GV_TP_MS4_10-2026.xlsx
PAYSLIP_PN_10-2026/
  ...
```
Tên hiển thị thực tế được làm sạch ký tự không hợp lệ. Trùng tên được thêm hậu tố. Nhân viên chọn nhiều chi nhánh được giữ dưới tên chi nhánh kết hợp hiện có, không tự nhân đôi khoản lương.

## Kiểm chứng
- npm install đã thực hiện trong quá trình sửa baseline; package-lock được giữ trong ZIP.
- npm test: 24/24 đạt. Bao gồm attendance, Excel time fraction, mapping MS1–MS5, cơ chế đặc biệt, dữ liệu nhân viên cũ, bảo hiểm dòng dưới với 0/1/14 dòng lớp, cấu trúc ZIP chi nhánh và chú thích mẫu.
- npm run build: đạt; còn cảnh báo dung lượng bundle Excel lớn.
- 9 XLSX: XML parse, thứ tự thành phần worksheet và đích quan hệ đều đạt. Đây không phải kiểm chứng toàn bộ chuẩn OOXML.
- Kiểm tra giao diện trên trình duyệt: desktop 1280×720 và viewport điện thoại 390×844, trang nhân viên/chấm công/phiếu lương và biểu mẫu. Không có console error trong lần kiểm tra.
- Chưa kiểm tra trực tiếp bằng Microsoft Excel desktop hoặc điện thoại thật.

## Giới hạn chú thích Excel
XLSX không macro không thể điều khiển tooltip bám chính xác con trỏ ở mọi vị trí trong cột. Notes dùng cơ chế hover gốc của Excel; input message hiện khi chọn ô trong vùng nhập. Chức năng hover toàn cột tại con trỏ như yêu cầu chưa được đáp ứng hoàn toàn. Không thêm macro hoặc add-in. Các chức năng nghiệp vụ ngoài phạm vi yêu cầu được giữ.
