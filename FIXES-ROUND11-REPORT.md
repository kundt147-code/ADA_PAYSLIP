# PAYSLIP — vòng 11: tên file chức vụ và chi nhánh

MS1/MS4 ghi GV (gồm GV/TG), MS2/MS5 ghi VP (gồm VP/các chức vụ khác). Nhân viên nhiều chức vụ dùng chức vụ theo từng mẫu, không ghép chức vụ. MS3 bỏ chức vụ hoàn toàn. Chưa nhập chi nhánh hoặc chỉ có khoảng trắng: bỏ chi nhánh khỏi tên file, không thêm UNKNOWN; thư mục gom giữ Chưa có chi nhánh.

Không thay đổi nội dung chức vụ trên phiếu, công thức tính lương, điều kiện tạo mẫu, giao diện hay cấu trúc xuất theo chi nhánh/nhân viên.

Kiểm chứng: 33/33 tests đạt, build thành công. Test tên file cho nhân viên kết hợp GV/TG/VP/chức vụ khác và nhân viên chưa có chi nhánh. Cảnh báo bundle Excel lớn vẫn có. Bản này gồm sửa dấu × vòng 10; chưa triển khai hosting/Supabase vì chưa có đích triển khai.
