# PAYSLIP ADA

Web quản lý thông tin nhân viên, chấm công và phiếu lương.

## Template phiếu lương
`public/payslip-template.xlsx` là bản sao nguyên gốc của `Bảng lương mẫu(1).xlsx`.

Khi export:
- Giữ layout, logo, merge, font và định dạng của template.
- Dữ liệu được ghi đúng vị trí theo 2 sheet `GV` và `VP`.
- Các ô công thức của template được tính theo đúng công thức hiện có rồi xuất **giá trị**, không xuất công thức.
- Tiền được xuất dạng Accounting, không kèm đơn vị tiền.
- Nếu số dòng chấm công vượt số dòng mẫu, hệ thống chèn thêm dòng trước dòng tổng và giữ style của dòng mẫu.

## Import chấm công
Một file Excel mẫu có 4 sheet:
- Lớp chung
- Lớp phụ đạo
- Lớp kèm
- Văn phòng

Ba sheet lớp dùng 8 cột:
`Ngày | Thứ | Tên lớp | Giờ bắt đầu | Giờ kết thúc | Tổng giờ | Tên GV | Tên TG`

Sheet Văn phòng dùng 6 cột:
`Ngày | Thứ | Tên nhân viên | Giờ in | Giờ out | Tổng số giờ`

## Chạy
```powershell
npm.cmd install
npm.cmd run dev
```

## V35 – latest fixes
- Chấm công và phiếu lương được lưu bền trong trình duyệt (localStorage), không tự mất khi đóng tab; xóa bằng thao tác chủ động.
- Import dữ liệu mới là bổ sung, không ghi đè dữ liệu đang có.
- Import chấm công 5 sheet dùng đúng 5 parser: Lớp chung, Phụ đạo, Lớp kèm, Phụ đạo kèm, Văn phòng; nút giao diện là “Import các lớp”.
- File mẫu chấm công và nhân viên là Excel Table, Times New Roman 10 và có Note/Comment giải thích từng cột.
- File mẫu lương chính thức là `public/payslip-template.xlsx`, lấy từ Bảng lương mẫu mới; giữ công thức của 5 mẫu GV/VP/CK/GV_BH/VP_BH.
- Preview dùng template mới nhỏ hơn và không xóa công thức khỏi workbook.
- Phiếu lương: MS3 đi kèm khi có Lương chuyển khoản; MS4/MS5 đi kèm tương ứng khi có Mức đóng BH và có GV/VP.
- Xóa phiếu lương: dùng chọn tất cả/chọn nhiều rồi bấm “Xóa”, không còn nút “Xóa tất cả”.
- Favicon ADA được khai báo tại `public/favicon.svg`.
