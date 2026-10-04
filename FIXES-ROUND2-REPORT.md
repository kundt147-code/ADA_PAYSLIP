# V35 — Bản sửa sau đợt test của người dùng

Bản này thay thế payslip-web-v35-updated.zip của đợt trước. Các quy tắc MS4/MS5 dưới đây thay thế nội dung tương ứng trong CHANGELOG-TEST-REPORT.md cũ.

## Các lỗi đã sửa

### Excel repair khi mở file

Đã xác định ExcelJS 4.4 ghi legacyDrawing (ghi chú ô) sau tableParts và extLst. Thứ tự này không đúng CT_Worksheet trong SpreadsheetML. Sửa ở src/lib/xlsx-output.js: sau khi ghi workbook, chuyển legacyDrawing về đúng thứ tự, giữ nguyên nội dung notes/comments, Table, định dạng và relationship. Không sửa dependency trong node_modules.

Áp dụng cùng đường ghi file cho:
- Mẫu import 5 loại chấm công.
- Mẫu import nhân viên.
- Export danh sách nhân viên (cả danh sách rỗng và có dữ liệu).
- Export/preview MS1–MS5, export từng phiếu và các file trong ZIP hàng loạt.

Đã tái tạo cả hai XLSX static trong public. Export danh sách nhân viên được tách sang employee-export.js để kiểm thử đúng builder mà web dùng.

Tham chiếu thứ tự chuẩn: schema CT_Worksheet của Microsoft Open XML SDK:
https://github.com/dotnet/Open-XML-SDK/blob/main/data/schemas/schemas_openxmlformats_org_spreadsheetml_2006_main.json

### MS4/MS5 — Quy tắc đã chốt lại

MS4:
- P5 (Lương chính) = Lương chuyển khoản trong thông tin nhân viên.
- AJ5 = Thực lĩnh tiền CK có bảo hiểm trong bảng của chính MS4.
- Q7 hiển thị AJ5, không còn lấy mức Lương CK ban đầu.
- Q8 (Tiền mặt còn nhận) = tổng thực nhận GV ở dòng đã co/giãn − AJ5.

MS5:
- M5 (Lương chính) = Lương chuyển khoản trong thông tin nhân viên.
- AG5 = Thực lĩnh tiền CK có bảo hiểm trong bảng của chính MS5.
- N7 hiển thị AG5.
- N8 (Tiền mặt còn nhận) = E26 − AG5.

Không lấy thực lĩnh MS3. Mức đóng BH riêng trong hồ sơ vẫn được giữ ở U5/MS4 và R5/MS5. Các khoản cơm/hỗ trợ và công thức bảng BH vẫn tham gia tính thực lĩnh theo logic đang có. Output cuối cùng vẫn value-only.

Ví dụ đã test: Lương CK 6.000.000, mức đóng BH 3.000.000, cơm 200.000, hỗ trợ 50.000 -> Thực lĩnh CK có BH 5.935.000. Tiền mặt trừ 5.935.000, không trừ 6.000.000 và không lấy kết quả MS3.

### Favicon

Đổi icon chữ A thành logo ADA hình tròn theo logo hiện có trên topbar. Thêm public/ada-logo.svg; index.html dùng URL có phiên bản để tránh favicon cũ trong cache. favicon.svg cũng đồng bộ nội dung mới. Giữ layout web hiện tại.

## Kết quả kiểm thử

- npm test: 17 passed, 0 failed.
- npm run build: thành công, Vite 8.3.2. Còn cảnh báo kích thước bundle, không phải lỗi build.
- 14 regression tests trước được giữ lại và đều đạt.
- 3 nhóm mới kiểm tra XML Table + notes, export danh sách nhân viên có dữ liệu/rỗng, XML cả MS1–MS5 và quy tắc Lương chính/thực lĩnh CK/tiền mặt vừa chốt.
- Kiểm tra độc lập bằng Python/lxml trên 9 XLSX: tất cả XML/RELS/VML đều parse được; worksheet đạt schema kiểm tra thứ tự CT_Worksheet; tất cả relationship nội bộ trỏ tới part tồn tại. Tổng số part đã parse: 34 cho mẫu attendance, 14 cho mỗi mẫu/export employee và 13 cho mỗi payslip.
- ExcelJS đọc lại thành công, Table và notes vẫn có, STK giữ số 0 đầu; mỗi file payslip chỉ có một sheet và không chứa công thức cuối cùng.

## Giới hạn kiểm chứng

Chưa mở trực tiếp các file mới bằng Microsoft Excel native trong phiên này. Kiểm tra XML/schema và round-trip đã đạt; đây không phải tuyên bố đã test bằng Excel. Schema độc lập kiểm tra thứ tự các phần tử cấp worksheet, không phải bộ validator đầy đủ cho mọi kiểu Open XML.

Không truy cập/chỉnh database Supabase production; migration bổ sung từ bản trước vẫn được giữ.

## Chạy bản mới

Giải nén payslip-web-v35-round2.zip, vào payslip-web-v35-round2, chạy npm install, npm test, npm run build hoặc npm run dev. Source không chứa node_modules, dist hoặc credentials thật. Dùng các file mẫu trong bản mới; file đã tải trước đây không tự thay đổi.
