# PAYSLIP web V38 — Round 34

Bản cập nhật web để kiểm tra các quy tắc mới. Bản ứng dụng Windows chưa thay đổi.

## Những điểm đã chốt

- Ô trống là chưa có dữ liệu; số 0 là có dữ liệu. Import, hồ sơ và export nhân viên giữ sự khác biệt này.
- Phần 3 có “Chuyển khoản từ tài khoản công ty”; phần 4 có cơ chế BH đặc biệt và số tiền nhập trực tiếp, kể cả 0.
- Công thức thu nhập tính thuế, thuế và chuyển khoản sau BH của mẫu vẫn giữ. BH đặc biệt ghi trực tiếp vào tổng BH, không phân bổ lại theo các tỷ lệ BH thành phần.
- Chấm công nhập riêng theo chi nhánh đang chọn. Có đủ các loại lớp, Placement Test và Văn phòng ở mỗi chi nhánh. Chi nhánh mới trong hồ sơ tự xuất hiện trong lựa chọn.
- Một người làm hai chi nhánh có hai phiếu riêng. **Lương VP Full và khoản chuyển khoản cố định dùng cùng mức tại cả hai chi nhánh**, theo xác nhận của người dùng.
- Toàn bộ BH trừ tại một chi nhánh đủ lương, chọn lương cao hơn; bằng nhau chọn PN. Nếu không nơi nào đủ lương, phải chọn chi nhánh nhận toàn bộ khoản trừ.
- Bước số ngày nghỉ dùng nút Xác nhận. Các ô chưa nhập bỏ qua bước chi tiết; nhập 0 vẫn là đã nhập. Bước chi tiết cho đổi nhân viên, thêm dòng, giữ dữ liệu khi đổi người và bấm Xong khi chưa có lý do. Chi tiết được lưu trong phiếu và xuất thành sheet kèm khi có nội dung.

## Các mẫu được giữ khi xuất

| Có các mẫu | Giữ |
|---|---|
| 1 và 2 | 1 |
| 4 và 5 | 4 |
| 1 và 4 | 4 |
| 2 và 5 | 5 |
| Đủ 1, 2, 3, 4, 5 | 4 và 3 |

MS3 luôn được giữ khi có dữ liệu chuyển khoản. Khi 2/5 được giữ, MS3 đi cùng 2/5; nếu 2/5 được gộp vào 1/4 thì MS3 đi cùng mẫu được giữ.

## Cấu trúc ZIP xuất phiếu

```
Chuyển khoản từ TK Công ty/
    MS3 của nhân viên có chọn chuyển khoản từ TK công ty
Thanh toán tiền mặt/
    PAYSLIP_PHÚ NHUẬN_GIÁO VIÊN/
    PAYSLIP_PHÚ NHUẬN_VĂN PHÒNG/
    PAYSLIP_TÂN PHÚ_GIÁO VIÊN/
    PAYSLIP_TÂN PHÚ_VĂN PHÒNG/
    GIỜ DẠY KÈM...
    TỔNG LƯƠNG CHUYỂN KHOẢN...
    TỔNG LƯƠNG TIỀN MẶT...
```

Ba file tổng hợp tạo cho mỗi kỳ xuất; lấy số tiền thực tế từ mẫu đã giữ. MS4 dùng Q7/Q8, MS5 dùng N7/N8. Tách tổng hợp theo từng chi nhánh. Các chi nhánh khác có folder tương ứng khi có phiếu.

## Kiểm tra với dữ liệu đang có

1. Vào Chấm công, chọn “Chưa phân chi nhánh” để xem dữ liệu cũ. Lọc theo người/kỳ/loại lớp rồi chọn nơi chuyển và bấm Chuyển dòng. Web không đoán hoặc tự tách chi nhánh.
2. Kiểm tra hồ sơ, các ô lương trống/0 và hai lựa chọn mới. File import nhân viên tải về đã thêm ba cột cuối, vẫn giữ hai ví dụ và định dạng mẫu.
3. Với kỳ đã có phiếu, chọn Khởi tạo lại đã chọn. Thao tác cập nhật cả các phiếu chi nhánh cùng người/cùng kỳ để bảo hiểm chỉ trừ một lần. Dòng chấm công và mức lương được lấy lại từ dữ liệu hiện tại; các chỉnh sửa riêng trên phiếu cần nhập lại nếu có.
4. Đối chiếu phiếu, file xuất và ba tổng hợp. Phiếu cũ của người có nhiều chi nhánh phải khởi tạo lại trước khi xuất.

## Chạy và đưa bản web lên môi trường hiện tại

Source dùng React + Vite (JavaScript/JSX), xử lý Excel bằng ExcelJS và SheetJS.

```
npm install
npm run dev
npm test
npm run build
```

Giữ cấu hình Vercel/Supabase đang dùng: VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY. Không cần SQL migration mới cho đợt này: các trường mới lưu trong JSON lương, chấm công và phiếu hiện có. .env.example chỉ chứa tên biến, không có khóa.

Bản ZIP chứa source, mẫu Excel, kiểm tra và hướng dẫn; không chứa node_modules, dữ liệu trình duyệt hoặc cấu hình bí mật. Chưa triển khai đè lên web công khai.

## Cập nhật BH đặc biệt (Round 33)

- Khi bật cơ chế và nhập 0: MS3 không tính/trừ BH; MS4/MS5 dùng BH bằng 0.
- Khi bật cơ chế và nhập khác 0: MS3 giữ công thức BH gốc của mẫu; MS4/MS5 dùng số tiền BH đặc biệt đã nhập ở khoản trừ BH bên trái và công thức chuyển khoản sau BH.
- Lương ở phần bên trái MS4/MS5 vẫn tính theo công thức mẫu; chỉ khoản BH sử dụng số tiền đặc biệt.
- Không bật cơ chế hoặc để trống số tiền: không kích hoạt ngoại lệ 0.
- Ô nhập trống và ô thông tin trống hiển thị “Dữ liệu trống” màu xám nhạt. Đây là gợi ý hiển thị, không phải giá trị được lưu. Số 0 vẫn hiển thị 0. Các bộ lọc tìm kiếm giữ lời gợi ý tìm kiếm.

## Sửa ô chọn bảng Nhân viên (Round 34)

Ô chọn từng dòng và chọn tất cả không còn bị khóa theo trạng thái tải/lưu dữ liệu. Đây chỉ là lựa chọn trong giao diện. Nút xóa đã chọn vẫn khóa lúc bận xử lý. Màu chữ Dữ liệu trống và các quy tắc bảo hiểm của Round 33 giữ nguyên.

## Sửa ô chọn bảng Nhân viên (Round 34)

Ô chọn từng dòng và chọn tất cả không còn bị khóa theo trạng thái tải/lưu dữ liệu. Đây chỉ là lựa chọn trong giao diện. Nút xóa đã chọn vẫn khóa lúc bận xử lý. Màu chữ Dữ liệu trống và các quy tắc bảo hiểm của Round 33 giữ nguyên.
