# Vòng 14

- GV/GV_BH chỉ tạo khi có dòng giảng dạy hợp lệ: đúng loại, có ngày/tên lớp, số giờ lớn hơn 0. Dòng rỗng/0 giờ không tạo phiếu.
- Preview giữ worker và cache; khi worker lỗi khởi động, lỗi xử lý hoặc truyền dữ liệu sẽ dựng dự phòng trên luồng chính. Hủy khi đóng hoặc chuyển tab, tránh cập nhật preview cũ.
- 37/37 kiểm tra tự động đạt; build thành công.
- Kiểm tra trình duyệt Chrome với bản production: preview hiển thị cả khi worker hoạt động bình thường và khi giả lập worker không khởi động được.
- Web Vercel đang phục vụ bundle vòng 13 (index-B7WvzD_v.js) tại thời điểm kiểm tra. Chưa triển khai vòng 14 lên Vercel.
- Chưa tái hiện chính xác lỗi preview trên bộ dữ liệu thật trong ảnh; thay đổi dự phòng xử lý lỗi worker, còn lỗi dữ liệu nếu có sẽ hiện thông báo gốc.
- Phiếu đã lưu cần khởi tạo lại để áp dụng điều kiện tạo GV mới.
