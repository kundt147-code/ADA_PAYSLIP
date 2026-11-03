export const EMPLOYEE_FIELDS = [
  {
    "header": "Họ và tên",
    "path": "name",
    "note": "Họ và tên đầy đủ; bắt buộc, không chỉ có khoảng trắng.",
    "width": 22.7265625,
    "format": "General",
    "kind": "text",
    "prompt": "Họ và tên đầy đủ; bắt buộc, không chỉ có khoảng trắng."
  },
  {
    "header": "Chi nhánh",
    "path": "branch",
    "note": "Chi nhánh: TP, PN hoặc tên chi nhánh khác. Nhiều chi nhánh phân cách bằng dấu chấm phẩy (;).",
    "width": 13.0,
    "format": "General",
    "kind": "text",
    "prompt": "Chi nhánh: TP, PN hoặc tên chi nhánh khác. Nhiều chi nhánh phân cách bằng dấu chấm phẩy (;)."
  },
  {
    "header": "Chức vụ",
    "path": "position",
    "note": "Chức vụ: GV, VP hoặc chức vụ khác. Nhiều lựa chọn phân cách bằng dấu chấm phẩy (;).",
    "width": 11.7265625,
    "format": "General",
    "kind": "text",
    "prompt": "Chức vụ: GV, VP hoặc chức vụ khác. Nhiều lựa chọn phân cách bằng dấu chấm phẩy (;)."
  },
  {
    "header": "Email",
    "path": "email",
    "note": "Email nhân viên; được để trống, có nhập phải đúng định dạng email.",
    "width": 30.36328125,
    "format": "General",
    "kind": "text",
    "prompt": "Email nhân viên; được để trống, có nhập phải đúng định dạng email."
  },
  {
    "header": "Ngân hàng",
    "path": "bank",
    "note": "Tên ngân hàng nhận lương; nhập văn bản, có thể để trống.",
    "width": 19.08984375,
    "format": "General",
    "kind": "text",
    "prompt": "Tên ngân hàng nhận lương; nhập văn bản, có thể để trống."
  },
  {
    "header": "STK",
    "path": "account",
    "note": "Số tài khoản dạng Text để giữ số 0 đầu; không chuyển sang số hoặc dạng khoa học.",
    "width": 19.08984375,
    "format": "@",
    "kind": "text",
    "prompt": "Số tài khoản dạng Text để giữ số 0 đầu; không chuyển sang số hoặc dạng khoa học."
  },
  {
    "header": "Lương lớp chung",
    "path": "salary.teacher.class",
    "note": "Đơn giá Offline lớp chung, VND/giờ. Ô trống là chưa nhập; 0 là đơn giá bằng 0. Cơ chế 1/3/4 áp dụng theo điều kiện hiện hành.",
    "width": 18.26953125,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "text",
    "prompt": "Đơn giá Offline lớp chung, VND/giờ. Ô trống là chưa nhập; 0 là đơn giá bằng 0. Cơ chế 1/3/4 áp dụng theo điều kiện hiện hành."
  },
  {
    "header": "Lương phụ đạo",
    "path": "salary.teacher.assist",
    "note": "Đơn giá Offline phụ đạo, VND/giờ; cũng dùng cho trợ giảng lớp chung theo cơ chế hiện tại. Ô trống khác số 0.",
    "width": 16.81640625,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "text",
    "prompt": "Đơn giá Offline phụ đạo, VND/giờ; cũng dùng cho trợ giảng lớp chung theo cơ chế hiện tại. Ô trống khác số 0."
  },
  {
    "header": "Lương kèm",
    "path": "salary.teacher.tutoring",
    "note": "Đơn giá Offline lớp kèm, VND/giờ. Khi bật cơ chế 2, lớp kèm ONL dùng 80% mức này nếu chưa nhập đơn giá Online.",
    "width": 14.08984375,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "text",
    "prompt": "Đơn giá Offline lớp kèm, VND/giờ. Khi bật cơ chế 2, lớp kèm ONL dùng 80% mức này nếu chưa nhập đơn giá Online."
  },
  {
    "header": "Lương phụ đạo kèm",
    "path": "salary.teacher.assistTutoring",
    "note": "Đơn giá Offline phụ đạo kèm, VND/giờ. Ô trống là chưa nhập; 0 là đơn giá bằng 0.",
    "width": 20.54296875,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "text",
    "prompt": "Đơn giá Offline phụ đạo kèm, VND/giờ. Ô trống là chưa nhập; 0 là đơn giá bằng 0."
  },
  {
    "header": "Lương lớp chung Online",
    "path": "salary.teacher.classOnline",
    "note": "Đơn giá Online lớp chung, VND/giờ, dùng khi tên lớp có ONL. Bỏ trống dùng đơn giá/cách tính hiện tại. 0 là có nhập; giữ các cơ chế 1/3/4.",
    "width": 23.90625,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "rate",
    "prompt": "Đơn giá Online lớp chung, VND/giờ, dùng khi tên lớp có ONL. Bỏ trống dùng đơn giá/cách tính hiện tại. 0 là có nhập; giữ các cơ chế 1/3/4."
  },
  {
    "header": "Lương phụ đạo Online",
    "path": "salary.teacher.assistOnline",
    "note": "Đơn giá Online phụ đạo, VND/giờ, dùng khi tên lớp có ONL; cũng dùng cho trợ giảng lớp chung theo cơ chế hiện tại. Bỏ trống dùng mức Offline; 0 là có nhập.",
    "width": 22.54296875,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "rate",
    "prompt": "Đơn giá Online phụ đạo, VND/giờ, dùng khi tên lớp có ONL; cũng dùng cho trợ giảng lớp chung theo cơ chế hiện tại. Bỏ trống dùng mức Offline; 0 là có nhập."
  },
  {
    "header": "Lương kèm Online",
    "path": "salary.teacher.tutoringOnline",
    "note": "Đơn giá Online lớp kèm, VND/giờ. Có nhập (kể cả 0) thì ưu tiên hơn cơ chế 2, không giảm thêm 80%. Bỏ trống áp dụng cách tính hiện tại.",
    "width": 19.7265625,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "rate",
    "prompt": "Đơn giá Online lớp kèm, VND/giờ. Có nhập (kể cả 0) thì ưu tiên hơn cơ chế 2, không giảm thêm 80%. Bỏ trống áp dụng cách tính hiện tại."
  },
  {
    "header": "Lương phụ đạo kèm Online",
    "path": "salary.teacher.assistTutoringOnline",
    "note": "Đơn giá Online phụ đạo kèm, VND/giờ, dùng khi tên lớp có ONL. Bỏ trống dùng mức Offline; 0 là có nhập.",
    "width": 26.26953125,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "rate",
    "prompt": "Đơn giá Online phụ đạo kèm, VND/giờ, dùng khi tên lớp có ONL. Bỏ trống dùng mức Offline; 0 là có nhập."
  },
  {
    "header": "Lương lớp chung đặc biệt",
    "path": "salary.teacher.classSpecial",
    "note": "Đơn giá lớp chung đặc biệt, VND/giờ. Tên lớp có “đặc biệt” và có nhập (kể cả 0): dùng đúng mức này. Để trống: dùng cách tính hiện tại.",
    "width": 35,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "rate",
    "prompt": "Đơn giá lớp chung đặc biệt, VND/giờ. Tên lớp có “đặc biệt” và có nhập (kể cả 0): dùng đúng mức này. Để trống: dùng cách tính hiện tại."
  },
  {
    "header": "Lương phụ đạo đặc biệt",
    "path": "salary.teacher.assistSpecial",
    "note": "Đơn giá phụ đạo đặc biệt, VND/giờ. Tên lớp có “đặc biệt” và có nhập (kể cả 0): dùng đúng mức này. Để trống: dùng cách tính hiện tại.",
    "width": 35,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "rate",
    "prompt": "Đơn giá phụ đạo đặc biệt, VND/giờ. Tên lớp có “đặc biệt” và có nhập (kể cả 0): dùng đúng mức này. Để trống: dùng cách tính hiện tại."
  },
  {
    "header": "Lương kèm đặc biệt",
    "path": "salary.teacher.tutoringSpecial",
    "note": "Đơn giá kèm đặc biệt, VND/giờ. Tên lớp có “đặc biệt” và có nhập (kể cả 0): dùng đúng mức này. Để trống: dùng cách tính hiện tại.",
    "width": 35,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "rate",
    "prompt": "Đơn giá kèm đặc biệt, VND/giờ. Tên lớp có “đặc biệt” và có nhập (kể cả 0): dùng đúng mức này. Để trống: dùng cách tính hiện tại."
  },
  {
    "header": "Lương phụ đạo kèm đặc biệt",
    "path": "salary.teacher.assistTutoringSpecial",
    "note": "Đơn giá phụ đạo kèm đặc biệt, VND/giờ. Tên lớp có “đặc biệt” và có nhập (kể cả 0): dùng đúng mức này. Để trống: dùng cách tính hiện tại.",
    "width": 35,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "rate",
    "prompt": "Đơn giá phụ đạo kèm đặc biệt, VND/giờ. Tên lớp có “đặc biệt” và có nhập (kể cả 0): dùng đúng mức này. Để trống: dùng cách tính hiện tại."
  },
  {
    "header": "Lương trợ giảng đặc biệt",
    "path": "salary.teacher.taSpecial",
    "note": "Đơn giá trợ giảng đặc biệt, VND/giờ. Tên lớp có “đặc biệt” và có nhập (kể cả 0): dùng đúng mức này. Để trống: dùng cách tính hiện tại. Trợ giảng lớp chung dùng lương Phụ đạo khi không áp dụng mức đặc biệt.",
    "width": 35,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "rate",
    "prompt": "Đơn giá trợ giảng đặc biệt, VND/giờ. Tên lớp có “đặc biệt” và có nhập (kể cả 0): dùng đúng mức này. Để trống: dùng cách tính hiện tại. Trợ giảng lớp chung dùng lương Phụ đạo khi không áp dụng mức đặc biệt."
  },
  {
    "header": "Lương Văn phòng (full)",
    "path": "salary.office.full",
    "note": "Lương văn phòng Full, VND/tháng. Bỏ trống là chưa nhập; 0 vẫn là có dữ liệu.",
    "width": 23.36328125,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "text",
    "prompt": "Lương văn phòng Full, VND/tháng. Bỏ trống là chưa nhập; 0 vẫn là có dữ liệu."
  },
  {
    "header": "Lương văn phòng (Part)",
    "path": "salary.office.part",
    "note": "Đơn giá văn phòng Part, VND/giờ, nhân số giờ chấm công văn phòng. Bỏ trống khác số 0.",
    "width": 23.90625,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "text",
    "prompt": "Đơn giá văn phòng Part, VND/giờ, nhân số giờ chấm công văn phòng. Bỏ trống khác số 0."
  },
  {
    "header": "Lương chuyển khoản",
    "path": "salary.transfer",
    "note": "Lương chuyển khoản, VND. Có nhập (kể cả 0) được xem là có dữ liệu để tạo mẫu chuyển khoản theo quy tắc chọn mẫu hiện tại.",
    "width": 21.54296875,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "text",
    "prompt": "Lương chuyển khoản, VND. Có nhập (kể cả 0) được xem là có dữ liệu để tạo mẫu chuyển khoản theo quy tắc chọn mẫu hiện tại."
  },
  {
    "header": "Mức đóng BH",
    "path": "salary.insuranceBase",
    "note": "Mức lương làm căn cứ tính bảo hiểm thông thường, VND, không phải tỷ lệ %. Có nhập (kể cả 0) được xem là có dữ liệu; tạo mẫu BH khi có loại lương GV/VP tương ứng.",
    "width": 16.0,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "text",
    "prompt": "Mức lương làm căn cứ tính bảo hiểm thông thường, VND, không phải tỷ lệ %. Có nhập (kể cả 0) được xem là có dữ liệu; tạo mẫu BH khi có loại lương GV/VP tương ứng."
  },
  {
    "header": "Thưởng",
    "path": "salary.bonus",
    "note": "Khoản thưởng, VND; bỏ trống là chưa nhập, 0 là số tiền bằng 0.",
    "width": 11.36328125,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "text",
    "prompt": "Khoản thưởng, VND; bỏ trống là chưa nhập, 0 là số tiền bằng 0."
  },
  {
    "header": "Hỗ trợ",
    "path": "salary.support",
    "note": "Khoản hỗ trợ, VND; bỏ trống là chưa nhập, 0 là số tiền bằng 0.",
    "width": 10.453125,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "text",
    "prompt": "Khoản hỗ trợ, VND; bỏ trống là chưa nhập, 0 là số tiền bằng 0."
  },
  {
    "header": "Phụ cấp cơm",
    "path": "salary.mealAllowance",
    "note": "Phụ cấp cơm, VND; bỏ trống là chưa nhập, 0 là số tiền bằng 0.",
    "width": 15.0,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "text",
    "prompt": "Phụ cấp cơm, VND; bỏ trống là chưa nhập, 0 là số tiền bằng 0."
  },
  {
    "header": "Không cần chấm công",
    "path": "noAttendance",
    "note": "1 = bật Không cần chấm công; 0 hoặc trống = không bật. Không tự tạo chấm công giả.",
    "width": 22.0,
    "format": "General",
    "kind": "text",
    "prompt": "1 = bật Không cần chấm công; 0 hoặc trống = không bật. Không tự tạo chấm công giả."
  },
  {
    "header": "Cơ chế lương đặc biệt",
    "path": "mechanisms",
    "note": "Nhập cơ chế 1; 2; 3; 4, cách nhau bằng ;. 1: chỉ lớp chung có % dùng 80%. 2: lớp kèm ONL dùng 80% Offline khi chưa nhập lương Online. 3: IELTS - 56% ONL giữ 100% đơn giá. 4: lớp chung có % dùng 170.000đ/giờ. Ưu tiên 4/3 → 2/1; cơ chế 3 và 4 loại trừ nhau. Không giảm kép.",
    "width": 22.1796875,
    "format": "General",
    "kind": "text",
    "prompt": "1: chỉ Lớp chung có % → 80%; 2: Lớp kèm ONL → 80% khi trống Online; 3: IELTS - 56% ONL → 100%; 4: Lớp chung có % → 170.000đ/giờ. Cách các số bằng ;. 3 và 4 loại trừ nhau. Đơn giá Đặc biệt có nhập được ưu tiên."
  },
  {
    "header": "Ngày vào làm",
    "path": "startDate",
    "note": "Ngày vào làm: dd/mm/yyyy hoặc yyyy-mm-dd; có thể để trống. Giữ định dạng ngày/văn bản theo mẫu đã chốt, không hiểu là mức tiền bảo hiểm.",
    "width": 15.7265625,
    "format": "General",
    "kind": "text",
    "prompt": "Ngày vào làm: dd/mm/yyyy hoặc yyyy-mm-dd; có thể để trống. Giữ định dạng ngày/văn bản theo mẫu đã chốt, không hiểu là mức tiền bảo hiểm."
  },
  {
    "header": "Ngày nghỉ làm",
    "path": "endDate",
    "note": "Ngày nghỉ làm: dd/mm/yyyy hoặc yyyy-mm-dd; có thể để trống. Khi có cả hai ngày, ngày nghỉ không trước ngày vào làm.",
    "width": 16.1796875,
    "format": "General",
    "kind": "text",
    "prompt": "Ngày nghỉ làm: dd/mm/yyyy hoặc yyyy-mm-dd; có thể để trống. Khi có cả hai ngày, ngày nghỉ không trước ngày vào làm."
  },
  {
    "header": "Đã nghỉ việc",
    "path": "resigned",
    "note": "1 = đã nghỉ việc; 0 hoặc trống = đang làm việc.",
    "width": 14.7265625,
    "format": "General",
    "kind": "text",
    "prompt": "1 = đã nghỉ việc; 0 hoặc trống = đang làm việc."
  },
  {
    "header": "Chuyển khoản từ tài khoản công ty",
    "path": "salary.companyTransfer",
    "note": "1 = bật Chuyển khoản từ tài khoản công ty; 0 hoặc trống = tắt. Áp dụng cách chọn mẫu và phân nhóm file hiện hành.",
    "width": 32.36328125,
    "format": "General",
    "kind": "text",
    "prompt": "1 = bật Chuyển khoản từ tài khoản công ty; 0 hoặc trống = tắt. Áp dụng cách chọn mẫu và phân nhóm file hiện hành."
  },
  {
    "header": "Cơ chế tính bảo hiểm đặc biệt",
    "path": "salary.specialInsurance",
    "note": "1 = bật cơ chế bảo hiểm đặc biệt; khi Số tiền bảo hiểm đặc biệt có dữ liệu thì dùng số tiền đó, kể cả 0. 0 hoặc trống = dùng bảo hiểm thông thường.",
    "width": 28.1796875,
    "format": "General",
    "kind": "text",
    "prompt": "1 = bật cơ chế bảo hiểm đặc biệt; khi Số tiền bảo hiểm đặc biệt có dữ liệu thì dùng số tiền đó, kể cả 0. 0 hoặc trống = dùng bảo hiểm thông thường."
  },
  {
    "header": "Số tiền bảo hiểm đặc biệt",
    "path": "salary.insuranceAmount",
    "note": "Số tiền bảo hiểm đặc biệt, VND. Chỉ áp dụng khi bật cơ chế bảo hiểm đặc biệt và đã nhập số tiền. Trống là chưa nhập; 0 là không trừ khoản BH này. Không tự thay công thức thuế/chuyển khoản.",
    "width": 24.54296875,
    "format": "_-* #,##0\\ _₫_-;\\-* #,##0\\ _₫_-;_-* \"-\"\\ _₫_-;_-@_-",
    "kind": "text",
    "prompt": "Số tiền bảo hiểm đặc biệt, VND. Chỉ áp dụng khi bật cơ chế bảo hiểm đặc biệt và đã nhập số tiền. Trống là chưa nhập; 0 là không trừ khoản BH này. Không tự thay công thức thuế/chuyển khoản."
  }
]
export const EMPLOYEE_COLUMNS=EMPLOYEE_FIELDS.map(field=>field.header)
