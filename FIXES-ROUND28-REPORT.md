# Vòng 28 — Ba bảng tổng hợp đi kèm phiếu lương

## Export
Mỗi kỳ được chọn xuất có ba file ở ngoài cùng ZIP:
- GIỜ DẠY KÈM TMM.YYYY.xlsx (thêm tên chi nhánh khi chỉ có một cơ sở).
- TỔNG LƯƠNG CHUYỂN KHOẢN TMM.YYYY.xlsx.
- TỔNG LƯƠNG TIỀN MẶT TMM.YYYY.xlsx.
Các thư mục PAYSLIP_Chi nhánh_GIÁO VIÊN/VĂN PHÒNG vẫn giữ như vòng 27. Xuất một người cũng có ba bảng tương ứng. Chỉ tổng hợp phiếu được chọn xuất; nhiều kỳ tách riêng.

## Nguồn số tiền
- MS4: CK Q7; tiền mặt Q8. MS5: CK N7; tiền mặt N8.
- Nếu không có mẫu BH, CK từ thực lĩnh MS3 E23. MS1/MS2 lấy thực nhận, trừ CK một lần khi có MS3.
- Nếu người có cả MS4 và MS5, tiền mặt cộng hai ô tiền mặt thực tế; CK lấy một lần (MS4 ưu tiên nếu cả hai có). Không cộng MS1 thêm khi có MS4, không cộng MS2 thêm khi có MS5. MS3 sao chép ở hai thư mục không bị cộng trùng.
- Tiền mặt mỗi cơ sở một sheet; có tổng các cơ sở ở bên phải sheet đầu.
- Mọi tổng lấy từ workbook phiếu đã xuất, không lấy tiền mẫu tháng 8 hoặc tham chiếu workbook ngoài.

## Giờ kèm
Một sheet danh sách học viên và sheet chi tiết từng học viên, hai phần Kèm/Phụ đạo kèm có tổng riêng. Lấy lineEdits của phiếu được chọn (bao gồm dữ liệu đã chỉnh trên phiếu), loại dòng trùng ID. Tên lớp ghép bằng dấu ' - ' hoặc ' – ' được tách thành các học viên; buổi học chung xuất cho từng học viên, không cộng lẫn giữa chi nhánh/kỳ. Tên không có dấu phân cách giữ nguyên thành một tên học viên/lớp. Khi xuất nhiều chi nhánh, danh sách ghi cơ sở và tên sheet phân biệt cơ sở.

## Format và tương thích
Các tài nguyên mẫu được lấy từ ba workbook người dùng gửi, giữ style/font/độ rộng cột của các dòng tiêu đề, chi tiết và tổng. Tài nguyên chỉ chứa format đã xóa dữ liệu cá nhân mẫu. Không có liên kết ngoài trong kết quả, không có công thức: xuất giá trị đã tính, có thể mở độc lập. Tái dùng buffer phiếu cho báo cáo tránh tính lại và đảm bảo cùng số liệu. Không thay đổi công thức phiếu hay giao diện.

## Kiểm tra
59/59 bài kiểm tra đạt; sau thêm cache chạy lại ba kiểm tra báo cáo đều đạt. Build production thành công. Kiểm tra một/nhiều chi nhánh, một/nhiều kỳ, CK MS3, nhân viên có GV/VP và BH, trùng lựa chọn, lớp chung hai học viên, tổng giờ riêng, value-only và tổng tiền đối chiếu phiếu. Chưa kiểm tra mở bằng Excel desktop; chưa triển khai Vercel. Không cần SQL mới.
