# Vòng 30 — CK chỉ trừ một lần khi có cả MS4 và MS5

Khi bộ phiếu có cả GV_BH (MS4) và VP_BH (MS5):
- Giữ bảng tính BH/thuế/CK nội bộ MS4 (AK5) như cũ; không xóa hoặc làm sai phần tính bảo hiểm.
- MS4 ô LƯƠNG CHUYỂN KHOẢN Q7 = 0; NHẬN LƯƠNG TIỀN MẶT Q8 = tổng thực nhận GV - Q7, nên không trừ CK.
- MS5 LƯƠNG CHUYỂN KHOẢN N7 = CK thực nhận sau BH/thuế (AH5); tiền mặt N8 = thực nhận VP - N7.
- Tổng tiền mặt = thực nhận GV + thực nhận VP - CK thực nhận đúng một lần.
Nếu chỉ có MS4, Q7 tiếp tục lấy AK5; chỉ có MS5 giữ nguyên. Không đổi cách trừ BH trong tổng thực nhận theo yêu cầu người dùng.

Cùng đường tính áp dụng preview, file MS4/MS5 export riêng và ZIP. Tổng hợp tiền lấy các ô đã sửa: CK = MS5 N7, tiền mặt = MS4 Q8 + MS5 N8. Không trừ lại CK. Phiếu đã tạo có cả hai loại sẽ dùng quy tắc mới khi xem/xuất từ phiên bản này; không cần SQL hoặc tạo lại dữ liệu chỉ để áp dụng quy tắc.

63/63 kiểm tra đạt. Kiểm tra bảng BH vẫn 315.000đ, CK thực nhận vẫn 5.935.000đ, MS4 Q7=0 khi cả hai, tổng tiền mặt khớp công thức chỉ trừ một CK, trường hợp MS4/MS5 riêng lẻ giữ nguyên và bảng tổng hợp đối chiếu trực tiếp hai file. Build thành công sau thử lại lỗi khóa tệp EPERM nhất thời. Còn cảnh báo bundle lớn hiện có. Chưa triển khai Vercel.
