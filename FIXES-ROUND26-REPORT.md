# Vòng 26
Thu gọn cửa sổ bổ sung ngày nghỉ còn tối đa 880px, ô tìm/ô số theo tone xanh, bảng căn đều, bố cục 3 ô trên mỗi thẻ nhân viên khi dùng điện thoại. Giữ logic nhập/xác nhận ngày nghỉ.

Sửa phần hướng dẫn cơ chế 4 còn thiếu: vòng 24 mới cập nhật Notes S1/S2/S3, nhưng Excel hiện thông báo nhập Data Validation của S2:S1037 khi chọn ô. Nay cập nhật cả Data Validation: 4 = Lớp chung có % dùng 170.000đ/giờ; ưu tiên 4/3 → 2/1; chỉ chọn một trong 3 hoặc 4. Nội dung có xuống dòng và dưới giới hạn 255 ký tự Excel. Giữ XML/format/cột ngoài phần prompt và notes.

Build thành công; 5 kiểm tra mẫu import/mapping đạt; Chrome kiểm tra luồng nhập/lọc tên/xác nhận vẫn đạt sau thiết kế. Đã đối chiếu trực tiếp XML prompt có cơ chế 4. Chưa mở bằng Excel desktop. Chưa triển khai Vercel.
