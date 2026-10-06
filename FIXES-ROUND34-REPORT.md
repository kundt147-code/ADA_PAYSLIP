# Web V38 — Round 34

Bảng Nhân viên đang dùng loading để vô hiệu hóa checkbox từng dòng và chọn tất cả. loading cũng được bật khi tải lại danh sách định kỳ. Đã bỏ điều kiện loading khỏi thao tác chọn; nút xóa vẫn khóa trong lúc xử lý.

Đã thử trên Chrome với 60 nhân viên: chọn dòng đầu, giữa và cuối khi loading=true; chọn tất cả 60 dòng; đổi trạng thái tải mà vẫn giữ lựa chọn; bỏ chọn một dòng khi loading=true còn đúng 59 dòng. Thao tác không mở nhầm hồ sơ, không có lỗi JavaScript. Build bản web thành công.

Không thay đổi logic lương/BH hoặc chữ gợi ý Dữ liệu trống. Chưa triển khai lên web công khai.
