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

# Web V39 — Round 35

- Lọc chấm công từ ngày đến ngày, bao gồm hai ngày biên, kết hợp kỳ/tên/chi nhánh. Tổng giờ, tiền test và số dòng tính theo kết quả lọc. Có nút bỏ lọc ngày.
- BH đặc biệt chỉ thay dòng trừ BH bảng lương phía dưới MS4/MS5. Bảng trắng phía trên dùng công thức gốc kể cả khi BH đặc biệt bằng 0. MS3 giữ quy tắc đã chốt ở Round 33.
- Hai folder gốc: CHUYỂN KHOẢN TỪ TK CÔNG TY và THANH TOÁN TIỀN MẶT. Giữ nguyên cơ chế folder nhân viên (câu hỏi chưa yêu cầu sửa).
- Hiển thị nhân viên đã lưu trên máy ngay; cập nhật cache sau lần tải thành công. Chấm công/phiếu tiếp tục dùng dữ liệu local hiện có trong khi tải.
- Tải nền mỗi 60 giây thay 15 giây; bỏ qua khi tab ẩn, không tải nhân viên chồng nhau, thử lại giãn dần tối đa 5 phút khi lỗi. Dữ liệu không đổi không thay state chấm công/phiếu, giảm dựng lại xem trước.
- Thanh trên có biểu tượng xoay và Đang tải dữ liệu/Đang lưu dữ liệu/Đã đồng bộ. Lỗi kết nối hiển thị Chưa đồng bộ và Thử lại, không lặp banner lỗi tải nền.

Kiểm tra: 83/83 tests đạt; Vite build đạt; Chrome kiểm tra khoảng ngày, tổng giờ, bỏ lọc, không lỗi JavaScript. Chưa đo tốc độ với dữ liệu Supabase thật; chưa triển khai website công khai. Không thay SQL, không làm lại app Desktop trong đợt này.

Quy tắc Round 35 thay thế các mô tả cũ về BH đặc biệt trong bảng trắng MS4/MS5.

# Web V40 — Chi tiết ngày nghỉ
Chi tiết nhập ở cửa sổ thứ 3 được đặt thành bảng 4 cột ngay dưới nội dung mẫu GV/VP/GV_BH/VP_BH, cách nội dung cũ hai dòng. Không chèn lên công thức hay dữ liệu mẫu. Không tạo sheet chi tiết riêng nữa. MS3 giữ nguyên. Dòng trống không xuất, số ngày 0 vẫn xuất. Mở rộng vùng in và bỏ giới hạn 120 dòng của preview để xem đủ dữ liệu.
83 kiểm tra hiện có đạt; thêm 1 kiểm tra trên 4 mẫu đạt: đối chiếu toàn bộ giá trị ô mẫu không đổi, số 0 được giữ, vùng in và preview chứa chi tiết cuối khi trên 120 dòng. Vite build đạt. Chưa triển khai link web.

# Web V41 — Chi tiết ngày nghỉ
Chi tiết nhập ở cửa sổ thứ 3 được đặt thành bảng 4 cột bên phải bảng lương GV/VP/GV_BH/VP_BH, ngay dưới vùng bảng bảo hiểm/chuyển khoản, cách nội dung cũ hai dòng. Không chèn lên công thức hay dữ liệu mẫu. Không tạo sheet chi tiết riêng nữa. MS3 giữ nguyên. Dòng trống không xuất, số ngày 0 vẫn xuất. Mở rộng vùng in và bỏ giới hạn 120 dòng của preview để xem đủ dữ liệu.
84 kiểm tra đạt; kiểm tra trên 4 mẫu đạt: đối chiếu toàn bộ giá trị ô mẫu không đổi, số 0 được giữ, vùng in và preview chứa chi tiết cuối khi trên 120 dòng. Vite build đạt. Chưa triển khai link web.

# Web V42 — Một vị trí hiển thị đồng bộ
Bỏ khung vàng dưới header. Trạng thái tải/lưu, lỗi kết nối/timeout và Thử lại hiển thị tại vị trí màu xanh trên header. Biểu tượng chỉ xoay khi có yêu cầu đang chạy; khi thử lại ưu tiên chữ Đang tải dữ liệu. Thông báo lỗi lưu dùng chung cũng đưa vào cùng vị trí. Giữ thông báo thao tác nghiệp vụ riêng. Vite build thành công. Chưa triển khai website.

# Web V43 — Đồng bộ
Nguyên nhân xác nhận trong source: refresh chờ flush hết hàng đợi trước khi đọc; lô 50 dòng không giới hạn số byte; tải dữ liệu hai bảng dùng Promise.all làm lỗi một bảng chặn áp dụng bảng còn lại; có thể đọc trùng khi migration/refresh cùng chạy.
Sửa: đọc trước và gửi ở nền độc lập; áp dụng từng bảng đọc thành công, chỉ mở chỉnh sửa khi cả hai đã có bản tải thành công; chia lô ghi tối đa 128 KiB hoặc 50 dòng (một dòng lớn hơn giới hạn gửi riêng); debounce ghi 300ms; chia đọc phiếu 50 dòng và chấm công/nhân viên 250 dòng; gộp đọc đang chạy; hàng đợi pending vẫn lưu và chỉ xóa sau xác nhận thành công. Tự thử đọc mỗi 30 giây, backoff lỗi tối đa 5 phút, bỏ qua tab ẩn. Trạng thái đang gửi hiển thị số dòng chờ, lỗi đọc/lưu cùng trên header; nút Thử lại ép thử đọc và ghi.
87 kiểm tra đạt và Vite build đạt. Chrome fixture chứng minh dữ liệu mở được trong khi gửi bị treo, chỉ một writer, pending chỉ xóa sau phản hồi thành công. Đo trực tiếp Supabase bị kết nối máy kiểm tra chặn, chưa xác định được tình trạng server hoặc đo thời gian tải trên dữ liệu thật. Chưa triển khai website. Không cần đổi SQL. Khi tải nhiều dòng, tổng lượt đọc có thể tăng nhưng từng lượt nhỏ hơn để giảm nguy cơ timeout; vẫn tải toàn bộ dữ liệu, chưa áp dụng đồng bộ incremental phía server.

# Web V44 — Import, xuất chấm công và bố cục
Import chấm công/nhân viên: ghi nhận dòng không hợp lệ theo sheet, dòng Excel và lý do; tách số dòng trống; cảnh báo thiếu/lỗi sheet khi import tất cả. Cửa sổ kiểm tra xuất hiện trước nhập, cho hủy hoặc tiếp tục phần hợp lệ; giữ bước kiểm tra trùng sau đó. Tất cả dòng không hợp lệ vẫn hiện được danh sách và không cho tiếp tục 0 dòng. Không thay đổi quy tắc loại dòng hoặc mặc định tiền test.
Xuất chấm công: cửa sổ checkbox các chi nhánh có dữ liệu, chọn tất cả/bỏ chọn tất cả; mặc định chọn chi nhánh đang xem. Không phụ thuộc kỳ, tên, ngày hoặc tab đang lọc. Mỗi chi nhánh 1 Excel gồm 6 sheet và có cột chi nhánh; chọn nhiều xuất ZIP gồm các Excel riêng. Có nhóm Chưa phân chi nhánh nếu dữ liệu có. Xuất giữ dòng trống/0 hiện có, không tự loại dữ liệu. Loại chấm công không nhận diện báo lỗi thay vì bỏ qua âm thầm.
Bố cục: bỏ thanh chi nhánh riêng, hướng dẫn và chức năng chuyển dòng; đưa chi nhánh bên phải các tab; thu gọn filters. Đưa Khởi tạo lại đã chọn/Export phiếu đã chọn/Xóa lên cạnh Khởi tạo phiếu, dưới chỉ còn tìm tên/kỳ/số đã chọn/chọn tất cả.
Kiểm tra 92 tests đạt; chạy lại 5 tests import/export sau sửa số dòng sheet lệch vị trí đạt; Vite build đạt. Chrome kiểm tra bố cục, checkbox xuất theo chi nhánh, cảnh báo import, nút thao tác và không lỗi JS. Xem ảnh giao diện desktop. Không đổi nhịp đồng bộ (câu hỏi trong lúc làm chỉ được giải thích). Chưa triển khai website hoặc desktop.

# Web V45 — Làm mới và trạng thái import
Ô chọn chi nhánh: nền trắng, viền xanh nhạt, bo 12px, mũi tên riêng, cao 48px, trạng thái hover/focus rõ và cùng hàng các tab.
Refresh trình duyệt/F5 và logo giữ cách tải lại toàn ứng dụng: nhân viên, chấm công, phiếu, giữ trang đang mở và dữ liệu local/pending. Bấm mục menu đang mở gọi tải lại riêng mục đó; bấm mục khác chỉ chuyển trang. Hook đồng bộ nhận phạm vi attendance/payslips/all; yêu cầu thủ công đang chờ lượt đọc trước được xếp lại, không bỏ mất. Lỗi bảng chưa được tải lại không bị xóa khi chỉ làm mới bảng khác. Chưa thay nhịp kiểm tra tự động 30 giây.
Import: cửa sổ riêng với vòng xoay/thanh chuyển động trong khi đọc file và kiểm tra sheets, áp dụng cho nhân viên/chấm công/import tất cả. Giai đoạn lưu nhân viên hiển thị số hồ sơ đã xử lý. Nhường khung hình trước đọc để cửa sổ kịp hiện, tự đóng khi xong hoặc lỗi. Không hiển thị phần trăm giả khi đọc Excel. Giữ bước cảnh báo dòng loại/trùng. Thanh báo nhập chấm công phản ánh nhập vào web; việc gửi dữ liệu chung tiếp tục hiển thị riêng trên header.
92 tests đạt sau sửa refresh; Vite build đạt sau thêm trạng thái import. Chrome fixture xác nhận tải từng bảng, tải toàn bộ lúc khởi động/reload, xếp yêu cầu, giữ lỗi bảng khác. Chrome app xác nhận CSS chi nhánh, menu lặp, logo/F5 giữ trang và dữ liệu. Chrome test import với file chậm xác nhận cửa sổ progress/thanh animation và tiếp nối audit; không lỗi JavaScript. Chưa triển khai website hoặc app Desktop. Không cần SQL.

# Web V46 — Giảm lag
Nguyên nhân xác nhận: useState(readAttendance()) / useState(readPayslips()) thực thi đọc và JSON.parse cả dữ liệu trên mỗi render; trạng thái saving bật khi pending rỗng; polling và focus tải toàn bộ quá thường xuyên; lưu full snapshot từng lần nhập; bảng chấm công dựng toàn bộ input; useLayoutEffect serialize/diff dữ liệu trước paint.
Sửa: lazy initializers; memo chi nhánh/tổng giờ; serialization theo object immutable và bỏ pending persist/revision nếu không đổi; chuyển diff sang useEffect; chỉ gửi/toggle saving khi có pending; tải tự động 5 phút, focus throttle cùng hạn; vẫn gửi thay đổi sau debounce 500ms. Snapshot local gom 400ms, flush dữ liệu mới nhất khi pagehide/beforeunload/ẩn tab. Pending giữ riêng và chỉ xóa khi server xác nhận. Trạng thái tải nhân viên tách loading thao tác; không khóa chọn/xóa theo tải nền. Chấm công/phiếu có readiness riêng, bảng đã tải không chờ lỗi bảng kia; bảng chưa có baseline vẫn không sửa được để tránh ghi đè dữ liệu chưa tải. Xem/lọc vẫn được. Bảng chấm công 50 dòng/trang, tổng và export vẫn dùng đủ dữ liệu.
92 tests hiện có đạt, thêm 1 test no-op/cache đạt. Vite build đạt. Chrome fake clock: không writes/saving khi rỗng, focus 10 lần không tải thêm, 5 phút mới tải, attendance vẫn gửi khi payslips lỗi. Chrome với 3000 dòng: 50 hàng DOM, tổng đầy đủ, chuyển trang+sửa 482ms trên máy thử, không lặp getItem snapshots; logo reload ngay vẫn giữ thay đổi, không lỗi JS. Đây là dữ liệu mô phỏng, chưa xác nhận độ trễ Supabase thật. Chưa triển khai website/desktop, không cần SQL. Dữ liệu từ máy khác tự cập nhật trong tối đa khoảng 5 phút cộng thời gian tải; logo/menu/Thử lại vẫn tải ngay.
