# Web V51 — Thống nhất định dạng chi tiết phiếu lương
Các dòng chấm công MS1/MS4: ngày/thứ/giờ căn giữa, tên lớp căn trái, số giờ/đơn giá/thành tiền căn phải. Times New Roman 10, chữ thường ở dòng dữ liệu, dòng tổng đậm. Loại khoảng đệm của định dạng tiền ở dòng chi tiết. Placement Test áp dụng tương tự, tên bài test căn trái.
Tách đối tượng style cho từng ô trước khi đặt font/alignment: ExcelJS dùng chung style giữa dòng dữ liệu và dòng tổng trong mẫu nên định dạng dòng tổng có thể làm dòng dữ liệu đậm lại.
104 kiểm tra đạt; Vite build thành công. Test mở lại XLSX MS1/MS4 với 14 dòng mỗi mục, kiểm tra căn lề/chữ và preview. Giữ các sửa V49/V50. Chưa triển khai web; không sửa/build app. Sau khi cập nhật web, xuất lại để áp dụng định dạng.
