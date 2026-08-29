// ==========================================
// CONSTANTS.JS - Khai báo hằng số & dữ liệu
// ==========================================
// Tất cả các hằng số dùng chung: Can Chi, Tiết Khí,
// Huyền Không Đại Quái, Quẻ Dịch, Thần Sát, bản đồ tra cứu.
// File này KHÔNG chứa hàm xử lý, chỉ khai báo dữ liệu.

// ---------- THAM SỐ HỆ THỐNG ----------
const TIME_ZONE = 7;
const PI = Math.PI;

// ---------- CAN CHI CƠ BẢN ----------
const NGAY_TRONG_TUAN = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const THIEN_CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const DIA_CHI   = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

// ---------- TIẾT KHÍ ----------
const TIET_KHI = [
    "Xuân phân", "Thanh minh", "Cốc vũ", "Lập hạ", "Tiểu mãn", "Mang chủng",
    "Hạ chí", "Tiểu thử", "Đại thử", "Lập thu", "Xử thử", "Bạch lộ",
    "Thu phân", "Hàn lộ", "Sương giáng", "Lập đông", "Tiểu tuyết", "Đại tuyết",
    "Đông chí", "Tiểu hàn", "Đại hàn", "Lập xuân", "Vũ thủy", "Kinh trập"
];

// ---------- GIỜ → ĐỊA CHI ----------
const HOUR_TO_CHI = {
    23: "Tý", 0: "Tý", 1: "Sửu", 2: "Sửu", 3: "Dần", 4: "Dần",
    5: "Mão", 6: "Mão", 7: "Thìn", 8: "Thìn", 9: "Tị", 10: "Tị",
    11: "Ngọ", 12: "Ngọ", 13: "Mùi", 14: "Mùi", 15: "Thân", 16: "Thân",
    17: "Dậu", 18: "Dậu", 19: "Tuất", 20: "Tuất", 21: "Hợi", 22: "Hợi"
};

const CHI_TO_INDEX = { "Tý": 0, "Sửu": 1, "Dần": 2, "Mão": 3, "Thìn": 4, "Tị": 5,
                       "Ngọ": 6, "Mùi": 7, "Thân": 8, "Dậu": 9, "Tuất": 10, "Hợi": 11 };

// ---------- NẠP ÂM (Lục Thập Hoa Giáp & Lạc Thư) ----------
const LUC_THAP_NAP_AM_MAP = {
    "Giáp Tý": "Hải Trung Kim", "Ất Sửu": "Hải Trung Kim",
    "Bính Dần": "Lư Trung Hỏa", "Đinh Mão": "Lư Trung Hỏa",
    "Mậu Thìn": "Đại Lâm Mộc", "Kỷ Tị": "Đại Lâm Mộc",
    "Canh Ngọ": "Lộ Bàng Thổ", "Tân Mùi": "Lộ Bàng Thổ",
    "Nhâm Thân": "Kiếm Phong Kim", "Quý Dậu": "Kiếm Phong Kim",
    "Giáp Tuất": "Sơn Đầu Hỏa", "Ất Hợi": "Sơn Đầu Hỏa",
    "Bính Tý": "Giản Hạ Thủy", "Đinh Sửu": "Giản Hạ Thủy",
    "Mậu Dần": "Thành Đầu Thổ", "Kỷ Mão": "Thành Đầu Thổ",
    "Canh Thìn": "Bạch Lạp Kim", "Tân Tị": "Bạch Lạp Kim",
    "Nhâm Ngọ": "Dương Liễu Mộc", "Quý Mùi": "Dương Liễu Mộc",
    "Giáp Thân": "Tuyền Trung Thủy", "Ất Dậu": "Tuyền Trung Thủy",
    "Bính Tuất": "Ốc Thượng Thổ", "Đinh Hợi": "Ốc Thượng Thổ",
    "Mậu Tý": "Tích Lịch Hỏa", "Kỷ Sửu": "Tích Lịch Hỏa",
    "Canh Dần": "Tùng Bách Mộc", "Tân Mão": "Tùng Bách Mộc",
    "Nhâm Thìn": "Trường Lưu Thủy", "Quý Tị": "Trường Lưu Thủy",
    "Giáp Ngọ": "Sa Trung Kim", "Ất Mùi": "Sa Trung Kim",
    "Bính Thân": "Sơn Hạ Hỏa", "Đinh Dậu": "Sơn Hạ Hỏa",
    "Mậu Tuất": "Bình Địa Mộc", "Kỷ Hợi": "Bình Địa Mộc",
    "Canh Tý": "Bích Thượng Thổ", "Tân Sửu": "Bích Thượng Thổ",
    "Nhâm Dần": "Kim Bạch Kim", "Quý Mão": "Kim Bạch Kim",
    "Giáp Thìn": "Phúc Đăng Hỏa", "Ất Tị": "Phúc Đăng Hỏa",
    "Bính Ngọ": "Thiên Hà Thủy", "Đinh Mùi": "Thiên Hà Thủy",
    "Mậu Thân": "Đại Trạch Thổ", "Kỷ Dậu": "Đại Trạch Thổ",
    "Canh Tuất": "Thoa Xuyến Kim", "Tân Hợi": "Thoa Xuyến Kim",
    "Nhâm Tý": "Tang Đố Mộc", "Quý Sửu": "Tang Đố Mộc",
    "Giáp Dần": "Đại Khê Thủy", "Ất Mão": "Đại Khê Thủy",
    "Bính Thìn": "Sa Trung Thổ", "Đinh Tị": "Sa Trung Thổ",
    "Mậu Ngọ": "Thiên Thượng Hỏa", "Kỷ Mùi": "Thiên Thượng Hỏa",
    "Canh Thân": "Thạch Lựu Mộc", "Tân Dậu": "Thạch Lựu Mộc",
    "Nhâm Tuất": "Đại Hải Thủy", "Quý Hợi": "Đại Hải Thủy"
};

const LAC_THU_NAP_AM_MAP = {
    "Giáp Tý": "Hải Trung Kim", "Ất Sửu": "Hải Trung Kim",
    "Bính Dần": "Giản Hạ Thủy", "Đinh Mão": "Giản Hạ Thủy",
    "Mậu Thìn": "Đại Lâm Mộc", "Kỷ Tị": "Đại Lâm Mộc",
    "Canh Ngọ": "Lộ Bàng Thổ", "Tân Mùi": "Lộ Bàng Thổ",
    "Nhâm Thân": "Kiếm Phong Kim", "Quý Dậu": "Kiếm Phong Kim",
    "Giáp Tuất": "Tuyền Trung Thủy", "Ất Hợi": "Tuyền Trung Thủy",
    "Bính Tý": "Lư Trung Hỏa", "Đinh Sửu": "Lư Trung Hỏa",
    "Mậu Dần": "Thành Đầu Thổ", "Kỷ Mão": "Thành Đầu Thổ",
    "Canh Thìn": "Bạch Lạp Kim", "Tân Tị": "Bạch Lạp Kim",
    "Nhâm Ngọ": "Dương Liễu Mộc", "Quý Mùi": "Dương Liễu Mộc",
    "Giáp Thân": "Sơn Đầu Hỏa", "Ất Dậu": "Sơn Đầu Hỏa",
    "Bính Tuất": "Ốc Thượng Thổ", "Đinh Hợi": "Ốc Thượng Thổ",
    "Mậu Tý": "Trường Lưu Thủy", "Kỷ Sửu": "Trường Lưu Thủy",
    "Canh Dần": "Tùng Bách Mộc", "Tân Mão": "Tùng Bách Mộc",
    "Nhâm Thìn": "Tích Lịch Hỏa", "Quý Tị": "Tích Lịch Hỏa",
    "Giáp Ngọ": "Sa Trung Kim", "Ất Mùi": "Sa Trung Kim",
    "Bính Thân": "Thiên Hà Thủy", "Đinh Dậu": "Thiên Hà Thủy",
    "Mậu Tuất": "Bình Địa Mộc", "Kỷ Hợi": "Bình Địa Mộc",
    "Canh Tý": "Bích Thượng Thổ", "Tân Sửu": "Bích Thượng Thổ",
    "Nhâm Dần": "Kim Bạch Kim", "Quý Mão": "Kim Bạch Kim",
    "Giáp Thìn": "Đại Khê Thủy", "Ất Tị": "Đại Khê Thủy",
    "Bính Ngọ": "Sơn Hạ Hỏa", "Đinh Mùi": "Sơn Hạ Hỏa",
    "Mậu Thân": "Đại Trạch Thổ", "Kỷ Dậu": "Đại Trạch Thổ",
    "Canh Tuất": "Thoa Xuyến Kim", "Tân Hợi": "Thoa Xuyến Kim",
    "Nhâm Tý": "Tang Đố Mộc", "Quý Sửu": "Tang Đố Mộc",
    "Giáp Dần": "Phúc Đăng Hỏa", "Ất Mão": "Phúc Đăng Hỏa",
    "Bính Thìn": "Sa Trung Thổ", "Đinh Tị": "Sa Trung Thổ",
    "Mậu Ngọ": "Đại Hải Thủy", "Kỷ Mùi": "Đại Hải Thủy",
    "Canh Thân": "Thạch Lựu Mộc", "Tân Dậu": "Thạch Lựu Mộc",
    "Nhâm Tuất": "Thiên Thượng Hỏa", "Quý Hợi": "Thiên Thượng Hỏa"
};

// ---------- TIẾT KHÍ → THÁNG ----------
const TIET_KHI_MONTH_MAP = {
    "Lập xuân": "1", "Vũ thủy": "1", "Kinh trập": "2", "Xuân phân": "2",
    "Thanh minh": "3", "Cốc vũ": "3", "Lập hạ": "4", "Tiểu mãn": "4",
    "Mang chủng": "5", "Hạ chí": "5", "Tiểu thử": "6", "Đại thử": "6",
    "Lập thu": "7", "Xử thử": "7", "Bạch lộ": "8", "Thu phân": "8",
    "Hàn lộ": "9", "Sương giáng": "9", "Lập đông": "10", "Tiểu tuyết": "10",
    "Đại tuyết": "11", "Đông chí": "11", "Tiểu hàn": "12", "Đại hàn": "12"
};

// ---------- HUYỀN KHÔNG ĐẠI QUÁI: 64 QUẺ PHÂN BỔ 360° ----------
// 4 Can Chi lặp (Phục-Cách-Cấu-Mông): Giáp Tý, Canh Dần, Giáp Ngọ, Canh Thân
const huyenKhongData_DegreeMap = [
    // CUNG KHẢM
    { from: 0, to: 5.625, queDich: "Địa Lôi Phục", canChi: "Giáp Tý" },
    { from: 5.625, to: 11.25, queDich: "Sơn Lôi Di", canChi: "Bính Tý" },
    { from: 11.25, to: 16.875, queDich: "Thủy Lôi Truân", canChi: "Mậu Tý" },
    { from: 16.875, to: 22.5, queDich: "Phong Lôi Ích", canChi: "Canh Tý" },
    { from: 22.5, to: 28.125, queDich: "Thuần Chấn", canChi: "Nhâm Tý" },
    { from: 28.125, to: 33.75, queDich: "Hỏa Lôi Phệ Hạp", canChi: "Ất Sửu" },
    { from: 33.75, to: 39.375, queDich: "Trạch Lôi Tùy", canChi: "Đinh Sửu" },
    { from: 39.375, to: 45, queDich: "Thiên Lôi Vô Vọng", canChi: "Kỷ Sửu" },
    // CUNG LY
    { from: 45, to: 50.625, queDich: "Địa Hỏa Minh Di", canChi: "Tân Sửu" },
    { from: 50.625, to: 56.25, queDich: "Sơn Hỏa Bí", canChi: "Quý Sửu" },
    { from: 56.25, to: 61.875, queDich: "Thủy Hỏa Ký Tế", canChi: "Giáp Dần" },
    { from: 61.875, to: 67.5, queDich: "Phong Hỏa Gia Nhân", canChi: "Bính Dần" },
    { from: 67.5, to: 73.125, queDich: "Lôi Hỏa Phong", canChi: "Mậu Dần" },
    { from: 73.125, to: 78.75, queDich: "Thuần Ly", canChi: "Canh Dần" },
    { from: 78.75, to: 84.375, queDich: "Trạch Hỏa Cách", canChi: "Canh Dần" },
    { from: 84.375, to: 90, queDich: "Thiên Hỏa Đồng Nhân", canChi: "Nhâm Dần" },
    // CUNG CHẤN
    { from: 90, to: 95.625, queDich: "Địa Trạch Lâm", canChi: "Ất Mão" },
    { from: 95.625, to: 101.25, queDich: "Sơn Trạch Tổn", canChi: "Đinh Mão" },
    { from: 101.25, to: 106.875, queDich: "Thủy Trạch Tiết", canChi: "Kỷ Mão" },
    { from: 106.875, to: 112.5, queDich: "Phong Trạch Trung Phu", canChi: "Tân Mão" },
    { from: 112.5, to: 118.125, queDich: "Lôi Trạch Quy Muội", canChi: "Quý Mão" },
    { from: 118.125, to: 123.75, queDich: "Hỏa Trạch Khuê", canChi: "Giáp Thìn" },
    { from: 123.75, to: 129.375, queDich: "Thuần Đoài", canChi: "Bính Thìn" },
    { from: 129.375, to: 135, queDich: "Thiên Trạch Lý", canChi: "Mậu Thìn" },
    // CUNG CÀN
    { from: 135, to: 140.625, queDich: "Địa Thiên Thái", canChi: "Canh Thìn" },
    { from: 140.625, to: 146.25, queDich: "Sơn Thiên Đại Súc", canChi: "Nhâm Thìn" },
    { from: 146.25, to: 151.875, queDich: "Thủy Thiên Nhu", canChi: "Ất Tị" },
    { from: 151.875, to: 157.5, queDich: "Phong Thiên Tiểu Súc", canChi: "Đinh Tị" },
    { from: 157.5, to: 163.125, queDich: "Lôi Thiên Đại Tráng", canChi: "Kỷ Tị" },
    { from: 163.125, to: 168.75, queDich: "Hỏa Thiên Đại Hữu", canChi: "Tân Tị" },
    { from: 168.75, to: 174.375, queDich: "Trạch Thiên Quải", canChi: "Quý Tị" },
    { from: 174.375, to: 180, queDich: "Thuần Càn", canChi: "Giáp Ngọ" },
    // CUNG TỐN
    { from: 180, to: 185.625, queDich: "Thiên Phong Cấu", canChi: "Giáp Ngọ" },
    { from: 185.625, to: 191.25, queDich: "Trạch Phong Đại Quá", canChi: "Bính Ngọ" },
    { from: 191.25, to: 196.875, queDich: "Hỏa Phong Đỉnh", canChi: "Mậu Ngọ" },
    { from: 196.875, to: 202.5, queDich: "Lôi Phong Hằng", canChi: "Canh Ngọ" },
    { from: 202.5, to: 208.125, queDich: "Thuần Tốn", canChi: "Nhâm Ngọ" },
    { from: 208.125, to: 213.75, queDich: "Thủy Phong Tỉnh", canChi: "Ất Mùi" },
    { from: 213.75, to: 219.375, queDich: "Sơn Phong Cổ", canChi: "Đinh Mùi" },
    { from: 219.375, to: 225, queDich: "Địa Phong Thăng", canChi: "Kỷ Mùi" },
    // CUNG CẤN
    { from: 225, to: 230.625, queDich: "Thiên Thủy Tụng", canChi: "Tân Mùi" },
    { from: 230.625, to: 236.25, queDich: "Trạch Thủy Khốn", canChi: "Quý Mùi" },
    { from: 236.25, to: 241.875, queDich: "Hỏa Thủy Vị Tế", canChi: "Giáp Thân" },
    { from: 241.875, to: 247.5, queDich: "Lôi Thủy Giải", canChi: "Bính Thân" },
    { from: 247.5, to: 253.125, queDich: "Phong Thủy Hoán", canChi: "Mậu Thân" },
    { from: 253.125, to: 258.75, queDich: "Thuần Khảm", canChi: "Canh Thân" },
    { from: 258.75, to: 264.375, queDich: "Sơn Thủy Mông", canChi: "Canh Thân" },
    { from: 264.375, to: 270, queDich: "Địa Thủy Sư", canChi: "Nhâm Thân" },
    // CUNG KHÔN
    { from: 270, to: 275.625, queDich: "Thiên Sơn Độn", canChi: "Ất Dậu" },
    { from: 275.625, to: 281.25, queDich: "Trạch Sơn Hàm", canChi: "Đinh Dậu" },
    { from: 281.25, to: 286.875, queDich: "Hỏa Sơn Lữ", canChi: "Kỷ Dậu" },
    { from: 286.875, to: 292.5, queDich: "Lôi Sơn Tiểu Quá", canChi: "Tân Dậu" },
    { from: 292.5, to: 298.125, queDich: "Phong Sơn Tiệm", canChi: "Quý Dậu" },
    { from: 298.125, to: 303.75, queDich: "Thủy Sơn Kiển", canChi: "Giáp Tuất" },
    { from: 303.75, to: 309.375, queDich: "Thuần Cấn", canChi: "Bính Tuất" },
    { from: 309.375, to: 315, queDich: "Địa Sơn Khiêm", canChi: "Mậu Tuất" },
    // CUNG ĐOÀI
    { from: 315, to: 320.625, queDich: "Thiên Địa Bĩ", canChi: "Canh Tuất" },
    { from: 320.625, to: 326.25, queDich: "Trạch Địa Tụy", canChi: "Nhâm Tuất" },
    { from: 326.25, to: 331.875, queDich: "Hỏa Địa Tấn", canChi: "Ất Hợi" },
    { from: 331.875, to: 337.5, queDich: "Lôi Địa Dự", canChi: "Đinh Hợi" },
    { from: 337.5, to: 343.125, queDich: "Phong Địa Quán", canChi: "Kỷ Hợi" },
    { from: 343.125, to: 348.75, queDich: "Thủy Địa Tỷ", canChi: "Tân Hợi" },
    { from: 348.75, to: 354.375, queDich: "Sơn Địa Bác", canChi: "Quý Hợi" },
    { from: 354.375, to: 360, queDich: "Thuần Khôn", canChi: "Giáp Tý" }
];

// ---------- HÀNH/VẬN (HOA GIÁP) ----------
const hoaGiapData = {
    "Giáp Tý": [{h:1, v:1}, {h:1, v:8}], "Bính Tuất": [{h:6, v:1}],
    "Canh Thân": [{h:7, v:1}, {h:6, v:2}], "Nhâm Ngọ": [{h:2, v:1}],
    "Nhâm Tý": [{h:8, v:1}], "Canh Dần": [{h:3, v:1}, {h:4, v:2}],
    "Bính Thìn": [{h:4, v:1}], "Giáp Ngọ": [{h:9, v:1}, {h:9, v:8}],
    "Kỷ Mùi": [{h:1, v:2}], "Giáp Tuất": [{h:7, v:2}],
    "Kỷ Hợi": [{h:2, v:2}], "Kỷ Tị": [{h:8, v:2}],
    "Giáp Thìn": [{h:3, v:2}], "Kỷ Sửu": [{h:9, v:2}],
    "Tân Sửu": [{h:1, v:3}], "Bính Tý": [{h:6, v:3}],
    "Ất Tị": [{h:7, v:3}], "Tân Mão": [{h:2, v:3}],
    "Tân Dậu": [{h:8, v:3}], "Ất Hợi": [{h:3, v:3}],
    "Bính Ngọ": [{h:4, v:3}], "Tân Mùi": [{h:9, v:3}],
    "Ất Mão": [{h:1, v:4}], "Nhâm Thìn": [{h:6, v:4}],
    "Mậu Tý": [{h:7, v:4}], "Bính Dần": [{h:2, v:4}],
    "Bính Thân": [{h:8, v:4}], "Mậu Ngọ": [{h:3, v:4}],
    "Nhâm Tuất": [{h:4, v:4}], "Ất Dậu": [{h:9, v:4}],
    "Mậu Tuất": [{h:1, v:6}], "Quý Hợi": [{h:6, v:6}],
    "Ất Mùi": [{h:7, v:6}], "Mậu Thân": [{h:2, v:6}],
    "Mậu Dần": [{h:8, v:6}], "Ất Sửu": [{h:3, v:6}],
    "Quý Tị": [{h:4, v:6}], "Mậu Thìn": [{h:9, v:6}],
    "Nhâm Thân": [{h:1, v:7}], "Đinh Mùi": [{h:6, v:7}],
    "Tân Hợi": [{h:7, v:7}], "Quý Dậu": [{h:2, v:7}],
    "Quý Mão": [{h:8, v:7}], "Tân Tị": [{h:3, v:7}],
    "Đinh Sửu": [{h:4, v:7}], "Nhâm Dần": [{h:9, v:7}],
    "Quý Sửu": [{h:6, v:8}], "Kỷ Mão": [{h:7, v:8}],
    "Đinh Tị": [{h:2, v:8}], "Đinh Hợi": [{h:8, v:8}],
    "Kỷ Dậu": [{h:3, v:8}], "Quý Mùi": [{h:4, v:8}],
    "Canh Thìn": [{h:1, v:9}], "Đinh Mão": [{h:6, v:9}],
    "Giáp Dần": [{h:7, v:9}], "Canh Tý": [{h:2, v:9}],
    "Canh Ngọ": [{h:8, v:9}], "Giáp Thân": [{h:3, v:9}],
    "Đinh Dậu": [{h:4, v:9}], "Canh Tuất": [{h:9, v:9}]
};

// ---------- QUAN HỆ 64 QUẺ (8 nhóm × 14 quẻ) ----------
const QUAN_HE_QUE = [
    "Thuần Càn; Càn - Khôn; Cha (Dương)", "Thuần Khôn; Càn - Khôn; Mẹ (Âm)",
    "Thiên Phong Cấu; Càn - Khôn; Nữ tử (Âm)", "Thiên Hỏa Đồng Nhân; Càn - Khôn; Nữ tử (Âm)",
    "Thiên Trạch Lý; Càn - Khôn; Nữ tử (Âm)", "Phong Thiên Tiểu Súc; Càn - Khôn; Nữ tử (Âm)",
    "Hỏa Thiên Đại Hữu; Càn - Khôn; Nữ tử (Âm)", "Trạch Thiên Quải; Càn - Khôn; Nữ tử (Âm)",
    "Địa Lôi Phục; Càn - Khôn; Nam tử (Dương)", "Địa Thủy Sư; Càn - Khôn; Nam tử (Dương)",
    "Địa Sơn Khiêm; Càn - Khôn; Nam tử (Dương)", "Lôi Địa Dự; Càn - Khôn; Nam tử (Dương)",
    "Thủy Địa Tỷ; Càn - Khôn; Nam tử (Dương)", "Sơn Địa Bác; Càn - Khôn; Nam tử (Dương)",

    "Thuần Khảm; Khảm - Ly; Cha (Dương)", "Thuần Ly; Khảm - Ly; Mẹ (Âm)",
    "Thủy Trạch Tiết; Khảm - Ly; Nữ tử (Âm)", "Thủy Địa Tỷ; Khảm - Ly; Nữ tử (Âm)",
    "Thủy Phong Tỉnh; Khảm - Ly; Nữ tử (Âm)", "Trạch Thủy Khốn; Khảm - Ly; Nữ tử (Âm)",
    "Địa Thủy Sư; Khảm - Ly; Nữ tử (Âm)", "Phong Thủy Hoán; Khảm - Ly; Nữ tử (Âm)",
    "Hỏa Sơn Lữ; Khảm - Ly; Nam tử (Dương)", "Hỏa Thiên Đại Hữu; Khảm - Ly; Nam tử (Dương)",
    "Hỏa Lôi Phệ Hạp; Khảm - Ly; Nam tử (Dương)", "Sơn Hỏa Bí; Khảm - Ly; Nam tử (Dương)",
    "Thiên Hỏa Đồng Nhân; Khảm - Ly; Nam tử (Dương)", "Lôi Hỏa Phong; Khảm - Ly; Nam tử (Dương)",

    "Thuần Chấn; Chấn - Tốn; Cha (Dương)", "Thuần Tốn; Chấn - Tốn; Mẹ (Âm)",
    "Lôi Địa Dự; Chấn - Tốn; Nữ tử (Âm)", "Lôi Trạch Quy Muội; Chấn - Tốn; Nữ tử (Âm)",
    "Lôi Hỏa Phong; Chấn - Tốn; Nữ tử (Âm)", "Địa Lôi Phục; Chấn - Tốn; Nữ tử (Âm)",
    "Trạch Lôi Tùy; Chấn - Tốn; Nữ tử (Âm)", "Hỏa Lôi Phệ Hạp; Chấn - Tốn; Nữ tử (Âm)",
    "Phong Thiên Tiểu Súc; Chấn - Tốn; Nam tử (Dương)", "Phong Sơn Tiệm; Chấn - Tốn; Nam tử (Dương)",
    "Phong Thủy Hoán; Chấn - Tốn; Nam tử (Dương)", "Thiên Phong Cấu; Chấn - Tốn; Nam tử (Dương)",
    "Sơn Phong Cổ; Chấn - Tốn; Nam tử (Dương)", "Thủy Phong Tỉnh; Chấn - Tốn; Nam tử (Dương)",

    "Thuần Cấn; Cấn - Đoài; Cha (Dương)", "Thuần Đoài; Cấn - Đoài; Mẹ (Âm)",
    "Sơn Hỏa Bí; Cấn - Đoài; Nữ tử (Âm)", "Sơn Phong Cổ; Cấn - Đoài; Nữ tử (Âm)",
    "Sơn Địa Bác; Cấn - Đoài; Nữ tử (Âm)", "Hỏa Sơn Lữ; Cấn - Đoài; Nữ tử (Âm)",
    "Phong Sơn Tiệm; Cấn - Đoài; Nữ tử (Âm)", "Địa Sơn Khiêm; Cấn - Đoài; Nữ tử (Âm)",
    "Trạch Thủy Khốn; Cấn - Đoài; Nam tử (Dương)", "Trạch Lôi Tùy; Cấn - Đoài; Nam tử (Dương)",
    "Trạch Thiên Quải; Cấn - Đoài; Nam tử (Dương)", "Thủy Trạch Tiết; Cấn - Đoài; Nam tử (Dương)",
    "Lôi Trạch Quy Muội; Cấn - Đoài; Nam tử (Dương)", "Thiên Trạch Lý; Cấn - Đoài; Nam tử (Dương)",

    "Thiên Địa Bĩ; Bĩ - Thái; Cha (Dương)", "Địa Thiên Thái; Bĩ - Thái; Mẹ (Âm)",
    "Thiên Lôi Vô Vọng; Bĩ - Thái; Nữ tử (Âm)", "Thiên Thủy Tụng; Bĩ - Thái; Nữ tử (Âm)",
    "Thiên Sơn Độn; Bĩ - Thái; Nữ tử (Âm)", "Phong Địa Quán; Bĩ - Thái; Nữ tử (Âm)",
    "Hỏa Địa Tấn; Bĩ - Thái; Nữ tử (Âm)", "Trạch Địa Tụy; Bĩ - Thái; Nữ tử (Âm)",
    "Địa Phong Thăng; Bĩ - Thái; Nam tử (Dương)", "Địa Hỏa Minh Di; Bĩ - Thái; Nam tử (Dương)",
    "Địa Trạch Lâm; Bĩ - Thái; Nam tử (Dương)", "Lôi Thiên Đại Tráng; Bĩ - Thái; Nam tử (Dương)",
    "Thủy Thiên Nhu; Bĩ - Thái; Nam tử (Dương)", "Sơn Thiên Đại Súc; Bĩ - Thái; Nam tử (Dương)",

    "Thủy Hỏa Ký Tế; Ký Tế - Vị Tế; Cha (Dương)", "Hỏa Thủy Vị Tế; Ký Tế - Vị Tế; Mẹ (Âm)",
    "Thủy Sơn Kiển; Ký Tế - Vị Tế; Nữ tử (Âm)", "Thủy Thiên Nhu; Ký Tế - Vị Tế; Nữ tử (Âm)",
    "Thủy Lôi Truân; Ký Tế - Vị Tế; Nữ tử (Âm)", "Trạch Hỏa Cách; Ký Tế - Vị Tế; Nữ tử (Âm)",
    "Địa Hỏa Minh Di; Ký Tế - Vị Tế; Nữ tử (Âm)", "Phong Hỏa Gia Nhân; Ký Tế - Vị Tế; Nữ tử (Âm)",
    "Hỏa Trạch Khuê; Ký Tế - Vị Tế; Nam tử (Dương)", "Hỏa Địa Tấn; Ký Tế - Vị Tế; Nam tử (Dương)",
    "Hỏa Phong Đỉnh; Ký Tế - Vị Tế; Nam tử (Dương)", "Sơn Thủy Mông; Ký Tế - Vị Tế; Nam tử (Dương)",
    "Thiên Thủy Tụng; Ký Tế - Vị Tế; Nam tử (Dương)", "Lôi Thủy Giải; Ký Tế - Vị Tế; Nam tử (Dương)",

    "Lôi Phong Hằng; Hằng - Ích; Cha (Dương)", "Phong Lôi Ích; Hằng - Ích; Mẹ (Âm)",
    "Lôi Thiên Đại Tráng; Hằng - Ích; Nữ tử (Âm)", "Lôi Sơn Tiểu Quá; Hằng - Ích; Nữ tử (Âm)",
    "Lôi Thủy Giải; Hằng - Ích; Nữ tử (Âm)", "Địa Phong Thăng; Hằng - Ích; Nữ tử (Âm)",
    "Trạch Phong Đại Quá; Hằng - Ích; Nữ tử (Âm)", "Hỏa Phong Đỉnh; Hằng - Ích; Nữ tử (Âm)",
    "Phong Địa Quán; Hằng - Ích; Nam tử (Dương)", "Phong Trạch Trung Phu; Hằng - Ích; Nam tử (Dương)",
    "Phong Hỏa Gia Nhân; Hằng - Ích; Nam tử (Dương)", "Thiên Lôi Vô Vọng; Hằng - Ích; Nam tử (Dương)",
    "Sơn Lôi Di; Hằng - Ích; Nam tử (Dương)", "Thủy Lôi Truân; Hằng - Ích; Nam tử (Dương)",

    "Sơn Trạch Tổn; Tổn - Hàm; Cha (Dương)", "Trạch Sơn Hàm; Tổn - Hàm; Mẹ (Âm)",
    "Sơn Thủy Mông; Tổn - Hàm; Nữ tử (Âm)", "Sơn Lôi Di; Tổn - Hàm; Nữ tử (Âm)",
    "Sơn Thiên Đại Súc; Tổn - Hàm; Nữ tử (Âm)", "Hỏa Trạch Khuê; Tổn - Hàm; Nữ tử (Âm)",
    "Phong Trạch Trung Phu; Tổn - Hàm; Nữ tử (Âm)", "Địa Trạch Lâm; Tổn - Hàm; Nữ tử (Âm)",
    "Trạch Hỏa Cách; Tổn - Hàm; Nam tử (Dương)", "Trạch Phong Đại Quá; Tổn - Hàm; Nam tử (Dương)",
    "Trạch Địa Tụy; Tổn - Hàm; Nam tử (Dương)", "Thủy Sơn Kiển; Tổn - Hàm; Nam tử (Dương)",
    "Lôi Sơn Tiểu Quá; Tổn - Hàm; Nam tử (Dương)", "Thiên Sơn Độn; Tổn - Hàm; Nam tử (Dương)"
];

// ---------- THẤT TINH ĐẢ KIẾP (32 cặp) ----------
const THAT_TINH_DA_KIEP = [
    "Thủy Lôi Truân - Sơn Thủy Mông", "Thủy Thiên Nhu - Thiên Thủy Tụng",
    "Địa Thủy Sư - Thủy Địa Tỷ", "Phong Thiên Tiểu Súc - Thiên Trạch Lý",
    "Thiên Địa Bĩ - Địa Thiên Thái", "Thiên Hỏa Đồng Nhân - Hỏa Thiên Đại Hữu",
    "Lôi Địa Dự - Địa Sơn Khiêm", "Trạch Lôi Tùy - Sơn Phong Cổ",
    "Phong Địa Quán - Địa Trạch Lâm", "Sơn Hỏa Bí - Hỏa Lôi Phệ Hạp",
    "Địa Lôi Phục - Sơn Địa Bác", "Sơn Thiên Đại Súc - Thiên Lôi Vô Vọng",
    "Lôi Phong Hằng - Trạch Sơn Hàm", "Lôi Thiên Đại Tráng - Thiên Sơn Độn",
    "Địa Hỏa Minh Di - Hỏa Địa Tấn", "Hỏa Trạch Khuê - Phong Hỏa Gia Nhân",
    "Lôi Thủy Giải - Thủy Sơn Kiển", "Phong Lôi Ích - Sơn Trạch Tổn",
    "Thiên Phong Cấu - Trạch Thiên Quải", "Địa Phong Thăng - Trạch Địa Tụy",
    "Thủy Phong Tỉnh - Trạch Thủy Khốn", "Trạch Hỏa Cách - Hỏa Phong Đỉnh",
    "Thuần Cấn - Thuần Chấn", "Lôi Trạch Quy Muội - Phong Sơn Tiệm",
    "Hỏa Sơn Lữ - Lôi Hỏa Phong", "Thuần Đoài - Thuần Tốn",
    "Thủy Trạch Tiết - Phong Thủy Hoán", "Hỏa Thủy Vị Tế - Thủy Hỏa Ký Tế"
];

// ---------- PHƯƠNG / HƯỚNG / SƠN ----------
const phuongData = [
    { name: "BẮC", from: 315, to: 45 }, { name: "ĐÔNG", from: 45, to: 135 },
    { name: "NAM", from: 135, to: 225 }, { name: "TÂY", from: 225, to: 315 }
];

const huongData = [
    { name: "BẮC", from: 337.5, to: 22.5 }, { name: "ĐÔNG BẮC", from: 22.5, to: 67.5 },
    { name: "ĐÔNG", from: 67.5, to: 112.5 }, { name: "ĐÔNG NAM", from: 112.5, to: 157.5 },
    { name: "NAM", from: 157.5, to: 202.5 }, { name: "TÂY NAM", from: 202.5, to: 247.5 },
    { name: "TÂY", from: 247.5, to: 292.5 }, { name: "TÂY BẮC", from: 292.5, to: 337.5 }
];

const sonData = [
    { name: "Nhâm", from: 337.5, to: 352.5 }, { name: "Tý", from: 352.5, to: 7.5 },
    { name: "Quý", from: 7.5, to: 22.5 }, { name: "Sửu", from: 22.5, to: 37.5 },
    { name: "Cấn", from: 37.5, to: 52.5 }, { name: "Dần", from: 52.5, to: 67.5 },
    { name: "Giáp", from: 67.5, to: 82.5 }, { name: "Mão", from: 82.5, to: 97.5 },
    { name: "Ất", from: 97.5, to: 112.5 }, { name: "Thìn", from: 112.5, to: 127.5 },
    { name: "Tốn", from: 127.5, to: 142.5 }, { name: "Tị", from: 142.5, to: 157.5 },
    { name: "Bính", from: 157.5, to: 172.5 }, { name: "Ngọ", from: 172.5, to: 187.5 },
    { name: "Đinh", from: 187.5, to: 202.5 }, { name: "Mùi", from: 202.5, to: 217.5 },
    { name: "Khôn", from: 217.5, to: 232.5 }, { name: "Thân", from: 232.5, to: 247.5 },
    { name: "Canh", from: 247.5, to: 262.5 }, { name: "Dậu", from: 262.5, to: 277.5 },
    { name: "Tân", from: 277.5, to: 292.5 }, { name: "Tuất", from: 292.5, to: 307.5 },
    { name: "Càn", from: 307.5, to: 322.5 }, { name: "Hợi", from: 322.5, to: 337.5 }
];

// ---------- TAM HỢP BỔ LONG ----------
const tamHopBoLongCanMap = {
    'Nam': 'Nhâm', 'Bắc': 'Quý', 'Đông': 'Canh', 'Tây': 'Đinh',
    'Đông Nam': 'Tân', 'Tây Nam': 'Ất', 'Tây Bắc': 'Giáp', 'Đông Bắc': 'Bính'
};

const tamHopBoLongChiMap = {
    'Ấn Cục': {
        'Nam': ['Hợi', 'Mão', 'Mùi'], 'Bắc': ['Tị', 'Dậu', 'Sửu'],
        'Đông': ['Thân', 'Tý', 'Thìn'], 'Tây': [],
        'Đông Nam': ['Thân', 'Tý', 'Thìn'], 'Tây Nam': ['Dần', 'Ngọ', 'Tuất'],
        'Tây Bắc': [], 'Đông Bắc': ['Dần', 'Ngọ', 'Tuất']
    },
    'Tài Cục': {
        'Nam': ['Tị', 'Dậu', 'Sửu'], 'Bắc': ['Dần', 'Ngọ', 'Tuất'],
        'Đông': [], 'Tây': ['Hợi', 'Mão', 'Mùi'],
        'Đông Nam': [], 'Tây Nam': ['Thân', 'Tý', 'Thìn'],
        'Tây Bắc': ['Hợi', 'Mão', 'Mùi'], 'Đông Bắc': ['Thân', 'Tý', 'Thìn']
    },
    'Vượng Cục': {
        'Nam': ['Dần', 'Ngọ', 'Tuất'], 'Bắc': ['Thân', 'Tý', 'Thìn'],
        'Đông': ['Hợi', 'Mão', 'Mùi'], 'Tây': ['Tị', 'Dậu', 'Sửu'],
        'Đông Nam': ['Hợi', 'Mão', 'Mùi'], 'Tây Nam': [],
        'Tây Bắc': ['Tị', 'Dậu', 'Sửu'], 'Đông Bắc': []
    }
};

// ---------- THÁI DƯƠNG / THÁI ÂM ----------
const THAI_DUONG_AM_DATA = {
    "Nhâm": { tdDaoToa: "Lập xuân", tdDaoHuong: "Lập thu", tdDaoTamHop: "Mang chủng đáo Khôn\nHàn lộ đáo Ất", taDaoToa: "Đại tuyết", taDaoHuong: "Mang chủng" },
    "Tý":   { tdDaoToa: "Đại hàn",  tdDaoHuong: "Đại thử", tdDaoTamHop: "Tiểu mãn đáo Thân\nThu phân đáo Thìn", taDaoToa: "Đông chí", taDaoHuong: "Hạ chí" },
    "Quý":  { tdDaoToa: "Tiểu hàn", tdDaoHuong: "Tiểu thử", tdDaoTamHop: "Lập hạ đáo Canh\nBạch lộ đáo Tốn", taDaoToa: "Tiểu hàn", taDaoHuong: "Tiểu thử" },
    "Sửu":  { tdDaoToa: "Đông chí", tdDaoHuong: "Hạ chí", tdDaoTamHop: "Cốc vũ đáo Dậu\nXử thử đáo Tỵ", taDaoToa: "Đại hàn", taDaoHuong: "Đại thử" },
    "Cấn":  { tdDaoToa: "Đại tuyết", tdDaoHuong: "Mang chủng", tdDaoTamHop: "Thanh minh đáo Tân\nLập thu đáo Bính", taDaoToa: "Lập xuân", taDaoHuong: "Lập thu" },
    "Dần":  { tdDaoToa: "Tiểu tuyết", tdDaoHuong: "Tiểu mãn", tdDaoTamHop: "Xuân phân đáo Tuất\nĐại thử đáo Ngọ", taDaoToa: "Vũ thủy", taDaoHuong: "Xử thử" },
    "Giáp": { tdDaoToa: "Lập đông", tdDaoHuong: "Lập hạ", tdDaoTamHop: "Kinh trập đáo Càn\nTiểu thử đáo Đinh", taDaoToa: "Kinh trập", taDaoHuong: "Bạch lộ" },
    "Mão":  { tdDaoToa: "Sương giáng", tdDaoHuong: "Cốc vũ", tdDaoTamHop: "Vũ thủy đáo Hợi\nHạ chí đáo Mùi", taDaoToa: "Xuân phân", taDaoHuong: "Thu phân" },
    "Ất":   { tdDaoToa: "Hàn lộ", tdDaoHuong: "Thanh minh", tdDaoTamHop: "Lập xuân đáo Nhâm\nMang chủng đáo Khôn", taDaoToa: "Thanh minh", taDaoHuong: "Hàn lộ" },
    "Thìn": { tdDaoToa: "Thu phân", tdDaoHuong: "Xuân phân", tdDaoTamHop: "Đại hàn đáo Tý\nTiểu mãn đáo Thân", taDaoToa: "Cốc vũ", taDaoHuong: "Sương giáng" },
    "Tốn":  { tdDaoToa: "Bạch lộ", tdDaoHuong: "Kinh trập", tdDaoTamHop: "Tiểu hàn đáo Quý\nLập hạ đáo Canh", taDaoToa: "Lập hạ", taDaoHuong: "Lập đông" },
    "Tị":   { tdDaoToa: "Xử thử", tdDaoHuong: "Vũ thủy", tdDaoTamHop: "Đại tuyết đáo Sửu\nCốc vũ đáo Dậu", taDaoToa: "Tiểu mãn", taDaoHuong: "Tiểu tuyết" },
    "Bính": { tdDaoToa: "Lập thu", tdDaoHuong: "Lập xuân", tdDaoTamHop: "Đại tuyết đáo Cấn\nThanh minh đáo Tân", taDaoToa: "Mang chủng", taDaoHuong: "Đại tuyết" },
    "Ngọ":  { tdDaoToa: "Đại thử", tdDaoHuong: "Đại hàn", tdDaoTamHop: "Tiểu tuyết đáo Dần\nXuân phân đáo Tuất", taDaoToa: "Hạ chí", taDaoHuong: "Đông chí" },
    "Đinh": { tdDaoToa: "Tiểu thử", tdDaoHuong: "Tiểu hàn", tdDaoTamHop: "Lập đông đáo Giáp\nKinh trập đáo Càn", taDaoToa: "Tiểu thử", taDaoHuong: "Tiểu hàn" },
    "Mùi":  { tdDaoToa: "Hạ chí", tdDaoHuong: "Đông chí", tdDaoTamHop: "Sương giáng đáo Mão\nVũ thủy đáo Hợi", taDaoToa: "Đại thử", taDaoHuong: "Đại hàn" },
    "Khôn": { tdDaoToa: "Mang chủng", tdDaoHuong: "Đại tuyết", tdDaoTamHop: "Hàn lộ đáo Ất\nLập xuân đáo Nhâm", taDaoToa: "Lập thu", taDaoHuong: "Lập xuân" },
    "Thân": { tdDaoToa: "Tiểu mãn", tdDaoHuong: "Tiểu tuyết", tdDaoTamHop: "Thu phân đáo Thìn\nĐại hàn đáo Tý", taDaoToa: "Xử thử", taDaoHuong: "Vũ thủy" },
    "Canh": { tdDaoToa: "Lập hạ", tdDaoHuong: "Lập đông", tdDaoTamHop: "Bạch lộ đáo Tốn\nTiểu hàn đáo Quý", taDaoToa: "Bạch lộ", taDaoHuong: "Kinh trập" },
    "Dậu":  { tdDaoToa: "Cốc vũ", tdDaoHuong: "Sương giáng", tdDaoTamHop: "Xử thử đáo Tỵ\nĐông chí đáo Sửu", taDaoToa: "Thu phân", taDaoHuong: "Xuân phân" },
    "Tân":  { tdDaoToa: "Thanh minh", tdDaoHuong: "Hàn lộ", tdDaoTamHop: "Lập thu đáo Bính\nĐại tuyết đáo Cấn", taDaoToa: "Hàn lộ", taDaoHuong: "Hàn lộ" },
    "Tuất": { tdDaoToa: "Xuân phân", tdDaoHuong: "Thu phân", tdDaoTamHop: "Đại thử đáo Ngọ\nTiểu tuyết đáo Dần", taDaoToa: "Sương giáng", taDaoHuong: "Cốc vũ" },
    "Càn":  { tdDaoToa: "Kinh trập", tdDaoHuong: "Bạch lộ", tdDaoTamHop: "Tiểu thử đáo Đinh\nLập đông đáo Giáp", taDaoToa: "Lập đông", taDaoHuong: "Lập hạ" },
    "Hợi":  { tdDaoToa: "Vũ thủy", tdDaoHuong: "Xử thử", tdDaoTamHop: "Hạ chí đáo Mùi\nSương giáng đáo Mão", taDaoToa: "Tiểu tuyết", taDaoHuong: "Tiểu mãn" }
};

// ---------- THIÊN ẤT QUÝ NHÂN ----------
const QUY_NHAN_DATA = {
    "Giáp": { "Vũ thủy": { "Mão": "Dương QN", "Dậu": "Âm QN" }, "Thu phân": { "Dần": "Âm QN", "Thân": "Dương QN" }, "Sương giáng": { "Sửu": "Âm QN", "Mùi": "Dương QN" }, "Tiểu tuyết": { "Tý": "Âm QN", "Ngọ": "Dương QN" }, "Đông chí": { "Tỵ": "Dương QN", "Hợi": "Âm QN" }, "Đại hàn": { "Thìn": "Dương QN", "Tuất": "Âm QN" } },
    "Ất":   { "Vũ thủy": { "Tuất": "Âm QN" }, "Xuân phân": { "Dậu": "Âm QN" }, "Hạ chí": { "Tuất": "Âm QN" }, "Đại thử": { "Dậu": "Âm QN" }, "Xử thử": { "Thân": "Dương QN" }, "Thu phân": { "Mùi": "Dương QN" }, "Sương giáng": { "Ngọ": "Dương QN", "Dần": "Âm QN" }, "Tiểu tuyết": { "Tỵ": "Dương QN", "Sửu": "Âm QN" }, "Đông chí": { "Thìn": "Dương QN", "Tý": "Âm QN" }, "Đại hàn": { "Mão": "Dương QN", "Hợi": "Âm QN" } },
    "Bính": { "Vũ thủy": { "Hợi": "Âm QN" }, "Xuân phân": { "Tuất": "Âm QN" }, "Tiểu mãn": { "Hợi": "Âm QN" }, "Hạ chí": { "Dậu": "Âm QN" }, "Đại thử": { "Thân": "Dương QN" }, "Xử thử": { "Mùi": "Dương QN" }, "Thu phân": { "Ngọ": "Dương QN" }, "Sương giáng": { "Tỵ": "Dương QN" }, "Tiểu tuyết": { "Thìn": "Dương QN", "Dần": "Âm QN" }, "Đông chí": { "Sửu": "Âm QN" }, "Đại hàn": { "Tý": "Âm QN" } },
    "Đinh": { "Vũ thủy": { "Sửu": "Âm QN" }, "Cốc vũ": { "Hợi": "Âm QN" }, "Tiểu mãn": { "Thân": "Dương QN" }, "Hạ chí": { "Mùi": "Dương QN" }, "Đại thử": { "Ngọ": "Dương QN" }, "Xử thử": { "Tỵ": "Dương QN" }, "Thu phân": { "Thìn": "Dương QN" }, "Sương giáng": { "Mão": "Dương QN" }, "Đông chí": { "Mão": "Dương QN" }, "Đại hàn": { "Dần": "Âm QN" } },
    "Mậu":  { "Vũ thủy": { "Mão": "Dương QN", "Dậu": "Âm QN" }, "Xuân phân": { "Thân": "Dương QN", "Dần": "Âm QN" }, "Cốc vũ": { "Sửu": "Âm QN", "Mùi": "Dương QN" }, "Tiểu mãn": { "Tý": "Âm QN", "Ngọ": "Dương QN" }, "Hạ chí": { "Tỵ": "Dương QN", "Hợi": "Âm QN" }, "Đại thử": { "Thìn": "Dương QN", "Tuất": "Âm QN" }, "Xử thử": { "Mão": "Dương QN", "Dậu": "Âm QN" } },
    "Kỷ":   { "Vũ thủy": { "Dần": "Âm QN" }, "Xuân phân": { "Sửu": "Âm QN" }, "Cốc vũ": { "Tý": "Âm QN", "Thân": "Dương QN" }, "Tiểu mãn": { "Hợi": "Âm QN", "Mùi": "Dương QN" }, "Hạ chí": { "Tuất": "Âm QN", "Ngọ": "Dương QN" }, "Đại thử": { "Tỵ": "Dương QN" }, "Xử thử": { "Ngọ": "Dương QN" }, "Thu phân": { "Mão": "Dương QN" } },
    "Canh": { "Vũ thủy": { "Mão": "Dương QN", "Dậu": "Âm QN" }, "Xuân phân": { "Thân": "Dương QN", "Dần": "Âm QN" }, "Cốc vũ": { "Sửu": "Âm QN", "Mùi": "Dương QN" }, "Tiểu mãn": { "Tý": "Âm QN", "Ngọ": "Dương QN" }, "Hạ chí": { "Tỵ": "Dương QN", "Hợi": "Âm QN" }, "Đại thử": { "Thìn": "Dương QN", "Tuất": "Âm QN" }, "Xử thử": { "Mão": "Dương QN", "Dậu": "Âm QN" } },
    "Tân":  { "Vũ thủy": { "Thân": "Dương QN" }, "Xuân phân": { "Mùi": "Dương QN" }, "Cốc vũ": { "Dần": "Âm QN", "Ngọ": "Dương QN" }, "Tiểu mãn": { "Sửu": "Âm QN", "Tỵ": "Dương QN" }, "Hạ chí": { "Tý": "Âm QN", "Thìn": "Dương QN" }, "Đại thử": { "Mão": "Dương QN", "Hợi": "Âm QN" }, "Xử thử": { "Tuất": "Âm QN" }, "Thu phân": { "Dậu": "Âm QN" } },
    "Nhâm": { "Vũ thủy": { "Mùi": "Dương QN" }, "Xuân phân": { "Ngọ": "Dương QN" }, "Cốc vũ": { "Tỵ": "Dương QN" }, "Tiểu mãn": { "Thìn": "Dương QN", "Dần": "Âm QN" }, "Hạ chí": { "Mão": "Dương QN", "Sửu": "Âm QN" }, "Đại thử": { "Tý": "Âm QN" }, "Xử thử": { "Hợi": "Âm QN" }, "Thu phân": { "Tuất": "Âm QN" }, "Sương giáng": { "Dậu": "Âm QN" }, "Đại hàn": { "Thân": "Dương QN" } },
    "Quý":  { "Vũ thủy": { "Tỵ": "Dương QN" }, "Xuân phân": { "Thìn": "Dương QN" }, "Cốc vũ": { "Mão": "Dương QN" }, "Tiểu mãn": { "Dần": "Âm QN" }, "Đại thử": { "Dần": "Âm QN" }, "Xử thử": { "Sửu": "Âm QN" }, "Thu phân": { "Tý": "Âm QN" }, "Sương giáng": { "Hợi": "Âm QN" }, "Tiểu tuyết": { "Thân": "Dương QN", "Tuất": "Âm QN" }, "Đông chí": { "Mùi": "Dương QN", "Dậu": "Âm QN" }, "Đại hàn": { "Ngọ": "Dương QN" } }
};

// ---------- CUNG / ĐỐI CUNG ----------
const palaces = { 1: 'Bắc', 2: 'Tây Nam', 3: 'Đông', 4: 'Đông Nam', 5: 'Trung Cung', 6: 'Tây Bắc', 7: 'Tây', 8: 'Đông Bắc', 9: 'Nam' };
const palaceOpposites = { 'Bắc': 'Nam', 'Nam': 'Bắc', 'Đông': 'Tây', 'Tây': 'Đông', 'Đông Bắc': 'Tây Nam', 'Tây Nam': 'Đông Bắc', 'Đông Nam': 'Tây Bắc', 'Tây Bắc': 'Đông Nam' };
const palaceToSonMap = {
    'Bắc': ['Nhâm', 'Tý', 'Quý'], 'Tây Nam': ['Mùi', 'Khôn', 'Thân'],
    'Đông': ['Giáp', 'Mão', 'Ất'], 'Đông Nam': ['Thìn', 'Tốn', 'Tị'],
    'Trung Cung': [], 'Tây Bắc': ['Tuất', 'Càn', 'Hợi'],
    'Tây': ['Canh', 'Dậu', 'Tân'], 'Đông Bắc': ['Sửu', 'Cấn', 'Dần'],
    'Nam': ['Bính', 'Ngọ', 'Đinh']
};
const huongToPalaceNameMap = {
    'BẮC': 'Bắc', 'TÂY NAM': 'Tây Nam', 'ĐÔNG': 'Đông', 'ĐÔNG NAM': 'Đông Nam',
    'TÂY BẮC': 'Tây Bắc', 'TÂY': 'Tây', 'ĐÔNG BẮC': 'Đông Bắc', 'NAM': 'Nam'
};

// ---------- XUNG ----------
const LUC_XUNG_MAP   = { 'Tý': 'Ngọ', 'Sửu': 'Mùi', 'Dần': 'Thân', 'Mão': 'Dậu', 'Thìn': 'Tuất', 'Tị': 'Hợi', 'Ngọ': 'Tý', 'Mùi': 'Sửu', 'Thân': 'Dần', 'Dậu': 'Mão', 'Tuất': 'Thìn', 'Hợi': 'Tị' };
const CAN_XUNG_MAP   = { 'Giáp': 'Canh', 'Ất': 'Tân', 'Bính': 'Nhâm', 'Đinh': 'Quý', 'Mậu': 'Nhâm', 'Kỷ': 'Quý', 'Canh': 'Giáp', 'Tân': 'Ất', 'Nhâm': 'Bính', 'Quý': 'Đinh' };
const chiNames        = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const tietKhiMonthChi = ['Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu'];

// ---------- THÁI TUẾ / TAM SÁT / BÁT SÁT ----------
const satsData = {
    'Tý': { thaiTue: 'Nhâm - Tý',     tuePha: 'Bính - Ngọ' },
    'Sửu': { thaiTue: 'Quý - Sửu',     tuePha: 'Đinh - Mùi' },
    'Dần': { thaiTue: 'Cấn - Dần',     tuePha: 'Khôn - Thân' },
    'Mão': { thaiTue: 'Giáp - Mão',    tuePha: 'Canh - Dậu' },
    'Thìn': { thaiTue: 'Ất - Thìn',    tuePha: 'Tân - Tuất' },
    'Tị':  { thaiTue: 'Tốn - Tị',      tuePha: 'Càn - Hợi' },
    'Ngọ': { thaiTue: 'Bính - Ngọ',    tuePha: 'Nhâm - Tý' },
    'Mùi': { thaiTue: 'Đinh - Mùi',    tuePha: 'Quý - Sửu' },
    'Thân': { thaiTue: 'Khôn - Thân',  tuePha: 'Cấn - Dần' },
    'Dậu': { thaiTue: 'Canh - Dậu',    tuePha: 'Giáp - Mão' },
    'Tuất': { thaiTue: 'Tân - Tuất',   tuePha: 'Ất - Thìn' },
    'Hợi': { thaiTue: 'Càn - Hợi',     tuePha: 'Tốn - Tị' }
};

const TAM_SAT_YEAR_BASED_MAP = {
    'Hợi': ['Thân', 'Dậu', 'Tuất'], 'Mão': ['Thân', 'Dậu', 'Tuất'], 'Mùi': ['Thân', 'Dậu', 'Tuất'],
    'Dần': ['Hợi', 'Tý', 'Sửu'],   'Ngọ': ['Hợi', 'Tý', 'Sửu'],   'Tuất': ['Hợi', 'Tý', 'Sửu'],
    'Tị':  ['Dần', 'Mão', 'Thìn'], 'Dậu': ['Dần', 'Mão', 'Thìn'], 'Sửu': ['Dần', 'Mão', 'Thìn'],
    'Thân': ['Tị', 'Ngọ', 'Mùi'],  'Tý':  ['Tị', 'Ngọ', 'Mùi'],   'Thìn': ['Tị', 'Ngọ', 'Mùi']
};

const CHI_TO_SONG_SON_MAP = {
    'Tý': 'Nhâm - Tý', 'Sửu': 'Quý - Sửu', 'Dần': 'Cấn - Dần',
    'Mão': 'Giáp - Mão', 'Thìn': 'Ất - Thìn', 'Tị': 'Tốn - Tị',
    'Ngọ': 'Bính - Ngọ', 'Mùi': 'Đinh - Mùi', 'Thân': 'Khôn - Thân',
    'Dậu': 'Canh - Dậu', 'Tuất': 'Tân - Tuất', 'Hợi': 'Càn - Hợi'
};

const BAT_SAT_HUONG_MAP = {
    'Bắc': 'Thìn', 'Đông Bắc': 'Dần', 'Đông': 'Thân', 'Đông Nam': 'Dậu',
    'Nam': 'Hợi', 'Tây Nam': 'Mão', 'Tây': 'Tị', 'Tây Bắc': 'Ngọ'
};

const BAT_SAT_NAM_CHI_MAP = {
    'Dần': 'Đông Bắc', 'Ngọ': 'Tây Bắc', 'Tuất': null,
    'Thân': 'Đông',    'Tý': null,        'Thìn': 'Bắc',
    'Hợi': 'Nam',      'Mão': 'Tây Nam',  'Mùi': null,
    'Tị': 'Tây',       'Dậu': 'Đông Nam', 'Sửu': null
};

// ============================================================
// KHỞI TẠO CÁC MAP DẪN XUẤT (được tính một lần từ dữ liệu gốc)
// ============================================================

// Map Can Chi → [quẻ]
const huyenKhongQueMap = huyenKhongData_DegreeMap.reduce((acc, item) => {
    if (!acc[item.canChi]) acc[item.canChi] = [];
    acc[item.canChi].push(item.queDich);
    return acc;
}, {});

// Map tên quẻ → thông tin quan hệ
const quanHeQueData = {};
QUAN_HE_QUE.forEach(line => {
    const parts = line.split(';').map(p => p.trim());
    if (parts.length === 3) {
        const [que, family, role] = parts;
        if (!quanHeQueData[que]) quanHeQueData[que] = [];
        quanHeQueData[que].push(`${family}; ${role}`);
    }
});

// Map Thất Tinh Đả Kiếp (hai chiều)
const thatTinhDaKiepMap = {};
THAT_TINH_DA_KIEP.forEach(pair => {
    const [que1, que2] = pair.split(' - ').map(q => q.trim());
    if (que1 && que2) {
        thatTinhDaKiepMap[que1] = que2;
        thatTinhDaKiepMap[que2] = que1;
    }
});

// HKDQ_DATABASE: thông tin chi tiết mỗi quẻ
const HKDQ_DATABASE = {};
QUAN_HE_QUE.forEach(dong => {
    const parts = dong.split(';').map(p => p.trim());
    if (parts.length === 3) {
        const tenQue = parts[0], giaDinh = parts[1], vaiTroRaw = parts[2];
        const match = vaiTroRaw.match(/^(.+?)\s*\((.+?)\)$/);
        if (match) {
            const vaiTroChiTiet = match[1].trim(), amDuong = match[2].trim();
            let vaiTroTongQuat = 'Huynh Đệ';
            if (['Cha', 'Mẹ'].includes(vaiTroChiTiet)) vaiTroTongQuat = 'Phụ Mẫu';
            else if (['Nam tử', 'Nữ tử'].includes(vaiTroChiTiet)) vaiTroTongQuat = 'Tử Tức';
            if (!HKDQ_DATABASE[tenQue]) HKDQ_DATABASE[tenQue] = [];
            HKDQ_DATABASE[tenQue].push({ tenQue, giaDinh, vaiTroChiTiet, amDuong, vaiTroTongQuat });
        }
    }
});

// HKDQ_MAP_THAT_TINH: Map Thất Tinh (dạng mảng)
const HKDQ_MAP_THAT_TINH = {};
THAT_TINH_DA_KIEP.forEach(cap => {
    const [que1, que2] = cap.split(' - ').map(q => q.trim());
    if (!HKDQ_MAP_THAT_TINH[que1]) HKDQ_MAP_THAT_TINH[que1] = [];
    if (!HKDQ_MAP_THAT_TINH[que2]) HKDQ_MAP_THAT_TINH[que2] = [];
    HKDQ_MAP_THAT_TINH[que1].push(que2);
    HKDQ_MAP_THAT_TINH[que2].push(que1);
});
