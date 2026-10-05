# Vòng 27 — Export theo chi nhánh và nhóm phiếu

Thư mục ZIP theo dạng PAYSLIP_PHÚ NHUẬN_GIÁO VIÊN, PAYSLIP_PHÚ NHUẬN_VĂN PHÒNG, PAYSLIP_TÂN PHÚ_GIÁO VIÊN, PAYSLIP_TÂN PHÚ_VĂN PHÒNG. PN đổi thành PHÚ NHUẬN, TP thành TÂN PHÚ; chi nhánh khác giữ tên viết hoa. Kỳ vẫn nằm trong tên từng file.

MS1/MS4 vào GIÁO VIÊN; MS2/MS5 vào VĂN PHÒNG. MS3 đi kèm nhóm phát sinh; khi có cả hai nhóm, đặt cùng MS3 ở cả hai. Nội dung MS3 không bị chia tiền hay thay đổi; tái sử dụng cùng buffer. Trong mỗi nhóm, một mẫu = file trực tiếp, nhiều mẫu = thư mục tên nhân viên. Giữ tên file cũ, MS3 không có chức vụ, chi nhánh trống không thêm vào tên file. Tránh ghi đè khi trùng tên.

56/56 kiểm tra đạt; build thành công. Kiểm tra ZIP đọc được, mỗi file đúng một sheet, nhân viên hỗn hợp có MS3 ở hai nhóm, MS1/MS2/MS4/MS5 đúng nhóm, thư mục cá nhân và tên trùng được bảo toàn.

Chưa triển khai Vercel. Bao gồm các chỉnh sửa vòng 26 trở về trước.
