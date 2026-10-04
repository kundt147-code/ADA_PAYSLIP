# Vòng 13 — Điều kiện tạo phiếu giáo viên

- Chỉ tạo GV/MS1 và GV_BH/MS4 khi có chấm công giảng dạy của nhân viên trong kỳ đang tạo: Lớp chung, Phụ đạo, Lớp kèm hoặc Phụ đạo kèm.
- Đơn giá giảng dạy được cài trong thông tin nhân viên không tự tạo phiếu GV nữa.
- Không cần chấm công không miễn điều kiện này cho phiếu GV/GV_BH.
- GV_BH vẫn cần Mức đóng BH lớn hơn 0.
- Giữ điều kiện tạo VP, VP_BH và CK như trước.
- Phiếu đã lưu trước thay đổi giữ nguyên; cần tạo lại để áp dụng điều kiện mới.

Kiểm tra: npm test 36/36 đạt; npm run build thành công. Kiểm tra không có chấm công, chỉ chấm công VP, chấm công kỳ khác/người khác, bốn loại giảng dạy và nhân viên Không cần chấm công. Vite vẫn có cảnh báo kích thước bundle.
