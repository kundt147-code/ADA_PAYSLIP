# Sửa timeout đồng bộ — vòng 22

- Gửi chấm công/phiếu lương theo nhóm tối đa 50 dòng thay vì một yêu cầu mỗi dòng; xóa theo nhóm ID cụ thể.
- Các lượt lưu đồng thời dùng chung tiến trình đang gửi, không xếp chồng nhiều lượt gửi giống nhau.
- Chỉ loại khỏi hàng chờ những dòng đã gửi thành công; thay đổi phát sinh trong lúc gửi được gửi tiếp. Hàng chờ cũ giữ nguyên khóa lưu trữ để bản mới tiếp tục gửi.
- Thời gian chờ thao tác ghi tăng từ 15 lên 60 giây; đọc vẫn 15 giây.
- Khi lỗi, giãn thử lại 30/60/120/240/300 giây; thử kết nối lại thủ công có thể bỏ qua thời gian chờ. Không lặp lại thông báo cùng lỗi trong mỗi lần làm mới.
- Lỗi ghi không ngăn tải dữ liệu đã có trên kho; dữ liệu chưa gửi vẫn được ghép vào dữ liệu hiển thị trên máy này.

Kiểm tra: 54/54 bài kiểm tra đạt; sau chỉnh thông báo chạy lại 6 kiểm tra đồng bộ đều đạt. Build thành công. Kiểm tra bao gồm gửi nhóm, thất bại giữa chừng, bảo toàn dữ liệu chờ, chỉnh sửa trong lúc gửi, giãn thử lại và hai thiết bị.

Chưa triển khai lên Vercel, chưa xác minh kết nối Supabase trực tiếp trên mạng/thiết bị gặp lỗi. Thay đổi giúp xử lý khối lượng dữ liệu và phục hồi timeout; không đảm bảo loại bỏ lỗi do mạng hoặc máy chủ. Không cần SQL mới. Không xóa dữ liệu trình duyệt hay nhập lại cùng file trong lúc còn hàng chờ.
