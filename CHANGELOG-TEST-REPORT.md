# V35 — Changelog và kết quả kiểm thử

Ngày bàn giao: 04/10/2026 (Asia/Saigon).

## Baseline và phạm vi

Sửa trực tiếp source từ payslip-web-v35-all-issues-fixed.zip, không viết lại app. ZIP gốc dùng thư mục payslip-web-v32; ZIP mới đặt thư mục payslip-web-v35-updated để tránh nhầm phiên bản. Bảng lương mẫu.xlsx và public/payslip-template.xlsx cùng SHA-256: 859774e3623dcab57ea8876b5c56360c2587fb9afe4d514ea4b049825e55ab1a. Workbook chuẩn được giữ nguyên.

## Thay đổi

- Import 5 category theo tên sheet/alias và đúng nhánh parser. Loại bỏ fallback theo thứ tự sheet vì file thực tế có nhiều sheet ngoài chấm công. Sheet thiếu/lỗi được báo, các sheet hợp lệ vẫn append.
- Văn phòng hỗ trợ header hai dòng thực tế: GIỜ VÀO/GIỜ RA/SỐ GIỜ ở dòng đầu, NHÂN VIÊN ở dòng sau, ngày ở cột đầu. Hỗ trợ NHÂN VIÊN và BUỔI.
- Giờ Excel: dùng format của ô hoặc đối chiếu với khoảng giờ bắt đầu/kết thúc để nhận diện fraction. 0.0625 -> 1.5 giờ; giữ nguyên 0.5 giờ và 12 giờ. Không nhân 24 mọi số nhỏ hơn 1 vì sheet Phụ đạo thực tế đã chứa 0.5 giờ dạng decimal.
- Phụ đạo kèm dùng salary.teacher.assistTutoring và override riêng. Editor phiếu có loại/đơn giá này. TG trong Lớp chung vẫn chuyển sang Phụ đạo.
- Cơ chế 3 áp dụng trên mọi category phù hợp, trước cơ chế 2 và 1; chỉ điều chỉnh đơn giá một lần. Cơ chế 2 chỉ Lớp kèm ONL; cơ chế 1 chỉ khi checkbox bật.
- Giờ đứng lớp chính không còn trừ giờ TG.
- Preview chỉ dựng mẫu đang mở; cache tab trong phiên modal. Generate/đọc Excel/dựng grid chạy trong Web Worker. Đổi tab, đóng modal hoặc chuyển editor terminate worker, tránh tác vụ cũ cập nhật UI. Preview và export dùng cùng payslipBuffer.
- MS2/MS3 không ghi đè nhãn merged. MS2 thông tin ở E10/E11/E17/E18; MS3 thông tin ở E9/E10/E11/E12. Nhãn A:D giữ nguyên. MS2 Full E20, Part E21, giờ E13; E12/E23/E26 dùng công thức mẫu.
- MS3 fill E14/E15/E16 và để công thức mẫu tính các tổng/bảo hiểm. Bộ tính công thức sửa lỗi SUM gọi thiếu worksheet; xử lý shared formulas; tính tất cả kết quả trước khi strip. Công thức không được hỗ trợ báo lỗi thay vì âm thầm trả 0.
- MS4 có đầy đủ chi tiết GV như MS1; MS5 dùng nhánh fill VP như MS2. Tháng/năm được fill trước khi tính công thức. Có thông tin nhân viên/tài khoản trong vùng tổng hợp BH và phần chuyển khoản/tiền mặt.
- Export mỗi MS một XLSX, nhiều MS/nhân viên đóng ZIP. Mỗi workbook đã kiểm tra chỉ có một sheet và không còn formula/sharedFormula. Tên theo PAYSLIP_Họ và tên_Chức vụ_Chi nhánh_MS_Kỳ.xlsx; làm sạch ký tự Windows và đuôi dấu chấm/khoảng trắng. Trùng tên trong ZIP thêm _2, _3 để không ghi đè file.
- Import lại nhân viên trùng tên chuẩn hóa + STK + chi nhánh được bỏ qua, không overwrite hồ sơ cũ. Giữ định dạng import 18 cột: 16 trường + noAttendance + cơ chế dạng 1; 2; 3. Vẫn đọc file cũ 20 cột cơ chế riêng.
- Sửa Excel Table dùng ref A1 và rows thực tế, cả mẫu và export nhân viên. Tái tạo 2 file mẫu static; Times New Roman 10, ghi chú header, STK dạng text. Có script generate-samples.mjs để cập nhật file static cùng logic runtime.
- Ngày nhập hiển thị dd/mm/yyyy, kiểm tra ngày hợp lệ khi rời ô; thay đổi ngày cập nhật kỳ attendance. Giữ toolbar compact, nút × nhỏ, layout employee, sidebar/topbar và favicon ADA đang có.
- Chọn một kỳ dữ liệu dùng kỳ đó nếu không chọn kỳ hiển thị riêng. Khởi tạo từ nhiều kỳ yêu cầu kỳ hiển thị, không tự lấy kỳ hiện tại.
- supabase.sql bổ sung branch, position, "noAttendance" bằng ADD COLUMN IF NOT EXISTS; giữ employee/salary JSON hiện có. Policy creation có kiểm tra tồn tại để script chạy lại được. Migration chưa chạy trên database production.

## Điểm workbook cần biết

1. Công thức H61 của GV trong file chuẩn thiếu H44 (Lớp kèm). Giữ hành vi của app V35: thực nhận có cộng Lớp kèm; không sửa file chuẩn. Tổng sau resize được ghi bằng giá trị. Đây là quyết định bảo toàn nghiệp vụ source, không tuyên bố công thức mẫu đã bao gồm Lớp kèm.
2. GV_BH trong workbook chuẩn thiếu nhiều dữ liệu bên trái và không có công thức vùng tổng hợp BH bên phải. MS4 dùng nội dung/định dạng vùng GV tương ứng để hoàn thiện phần trái, giữ vùng và merge của GV_BH. Vùng phải được bổ sung các công thức tương ứng các trường của MS5: lương chính lấy lương chuyển khoản Q7, gross = lương chính + cơm, bảo hiểm theo mức đóng BH U5 và tỷ lệ sẵn trong template, thực lĩnh = gross + hỗ trợ - các khoản trừ. Đây là phần bổ sung có chủ đích, không phải công thức đã tồn tại trong MS4 gốc.
3. MS5 R5 gốc tham chiếu lương chính M5; sửa input R5 sang mức đóng BH đã khai báo của nhân viên, giữ các công thức trích BH tham chiếu R5. Điều này bảo toàn mức đóng BH riêng theo master employee.
4. Layout bản gốc được giữ; chi tiết GV vẫn co/giãn theo số dòng như baseline. Không chuẩn hóa toàn bộ font phiếu lương sang Times New Roman 10 vì phải giữ format mẫu.

## Kết quả thực thi

- npm install: thành công, Node 24.21.0. Có cảnh báo deprecated từ dependency; không chạy audit fix --force.
- npm run build: thành công, Vite 8.3.2. Còn cảnh báo bundle >500 KB; worker được xuất thành asset riêng.
- npm test: 14 tests passed, 0 failed.

Các nhóm kiểm thử:

1. Workbook chấm công thực tế: Văn phòng hai dòng, Lớp chung fraction và Phụ đạo decimal.
2. Mẫu attendance đủ 5 sheet, import thành 5 category.
3. 0.0625/0.5/12 giờ không nhầm đơn vị.
4. Mẫu employee 18 cột, Excel Table/comments, STK số 0 đầu, noAttendance và cơ chế.
5. Ưu tiên cơ chế 3/2/1, không giảm kép, Phụ đạo kèm đúng đơn giá, TG chuyển Phụ đạo.
6. MS2 mapping và số ngày tháng nhuận 02/2024.
7. MS3 nhãn merge và tổng tiền/bảo hiểm/thực nhận.
8. Cả MS1–MS5: một sheet/file, value-only và grid preview chứa tên nhân viên.
9. MS4/MS5 mức đóng BH và chuyển khoản/tiền mặt.
10. 14 dòng Lớp chung vượt capacity vẫn đủ dòng/tổng.
11. Employee legacy và noAttendance không tạo attendance giả.
12. Abort trước khi tải template.
13. Bulk ZIP 10 file từ 2 phiếu, mỗi file một sheet; không mất file khi trùng tên.
14. Sheet tên không rõ không bị gán category bằng vị trí.

## Giới hạn kiểm chứng

Đã mở app localhost trong trình duyệt và xác nhận trang employee/attendance tải bình thường sau sửa tương thích import XLSX. Chưa hoàn tất thao tác end-to-end preview/chuyển tab/đóng modal trên trình duyệt, và chưa kiểm tra bằng Microsoft Excel native. Preview grid được kiểm thử tự động trên buffer xuất của cả 5 mẫu; cancellation worker được thực hiện trong cleanup của component, không có test đo thời gian tương tác UI.

Không có credentials Supabase production, nên migration và CRUD remote chưa được thực thi. Regression dữ liệu cũ kiểm tra employee legacy ở engine; không tuyên bố đã thử với database thực tế.

## Cách chạy

Giải nén, vào payslip-web-v35-updated, chạy npm install, npm test, npm run build hoặc npm run dev. Với Supabase, sao lưu dữ liệu theo quy trình hiện có rồi chạy supabase.sql trên database cần nâng cấp; điền cấu hình từ .env.example. ZIP source không chứa node_modules, dist hoặc thông tin đăng nhập thật.
