// ==========================================
// HUYENKHONG.JS - Huyền Không Đại Quái
// ==========================================
// Tra cứu quẻ theo độ số, tính Hành/Vận,
// phân tích quan hệ quẻ, Thất Tinh Đả Kiếp,
// đánh giá Âm Dương, Phụ Mẫu, Tử Tức, Huynh Đệ.
//
// HUYẾT THỐNG 6 TRỤ: logic Thầy Tiến (HTML)
//   - Phụ Mẫu ưu tiên tuyệt đối
//   - Tử Tức chỉ xác định khi đúng 1 gia đình có bằng chứng
//   - 0 họ / đụng ≥ 2 họ → KXĐ (tạp khí), không gán ép
//   - Huynh Đệ = quan hệ nhóm giữa các Tử Tức cùng họ
//   - Gán vai trò: 1 quẻ/trụ (ưu tiên Phụ Mẫu)
//   - Bằng chứng họ: mọi quẻ của 5 trụ kia (kể cả quẻ phụ)
// CÁC MODULE KHÁC: giữ nguyên bản gốc
// ==========================================

const TRUC_TAM_TAI = ['Trụ Tuổi', 'Trụ Tọa', 'Trụ Ngày'];

const NHAN_LY_DO_KXD = {
    khong_bang_chung: 'Không có huyết thống cùng họ',
    dung_nhieu_ho: 'Đụng nhiều họ, khí tạp',
    khong_tim_thay: 'Không tìm thấy quẻ trong database'
};

function nhanLyDoKXD(lyDoKXD) {
    return lyDoKXD ? (NHAN_LY_DO_KXD[lyDoKXD] || 'Không xác định') : null;
}

// ---------- TRA CỨU DỮ LIỆU THEO ĐỘ ----------
function findDataByDegree(degree) {
    let normalizedDegree = parseFloat(degree);
    if (isNaN(normalizedDegree)) return null;
    while (normalizedDegree >= 360) normalizedDegree -= 360;
    while (normalizedDegree < 0) normalizedDegree += 360;
    if (normalizedDegree === 360) normalizedDegree = 0;

    const findInRange = (data) => data.find(d => {
        if (d.from > d.to) return normalizedDegree >= d.from || normalizedDegree < d.to;
        return normalizedDegree >= d.from && normalizedDegree < d.to;
    });

    const detail = findInRange(huyenKhongData_DegreeMap);
    if (!detail) return null;

    return {
        phuong: findInRange(phuongData)?.name || 'N/A',
        huong: findInRange(huongData)?.name || 'N/A',
        son: findInRange(sonData)?.name || 'N/A',
        canChi: detail.canChi
    };
}

// ---------- LẤY HÀNH / VẬN TỪ CAN CHI ----------
function getHanhFromCanChi(canChi) {
    if (!canChi || !hoaGiapData[canChi]) return [];
    return hoaGiapData[canChi].map(item => item.h);
}

function getVanFromCanChi(canChi) {
    if (!canChi || !hoaGiapData[canChi]) return [];
    return hoaGiapData[canChi].map(item => item.v);
}

// ---------- FORMAT HIỂN THỊ HCCV & QUẺ ----------
function formatHccvAndQue(canChi) {
    if (!canChi || !hoaGiapData[canChi]) return 'N/A\nN/A';
    const hccvData = hoaGiapData[canChi];
    const queDataFromMap = huyenKhongQueMap[canChi] || ['N/A'];
    const results = [];

    for (let i = 0; i < hccvData.length; i++) {
        const item = hccvData[i];
        const queName = queDataFromMap[i] || queDataFromMap[0];
        const hccvString = `${item.h} - ${canChi.replace(' ', '-')} - ${item.v}`;
        const quanHeStrings = quanHeQueData[queName];
        let finalString = `${hccvString}\n${queName}`;
        if (quanHeStrings && quanHeStrings.length > 0) {
            finalString += '\n' + quanHeStrings.join('\n');
        }
        results.push(finalString);
    }
    return results.join('\n-----\n');
}

// ---------- TRA CỨU THÔNG TIN QUẺ ----------
function timThongTinQue(tenQue) {
    return HKDQ_DATABASE[tenQue] || [];
}

// ---------- PHÁT HIỆN THẤT TINH ĐẢ KIẾP ----------
function phatHienThatTinhDaKiep(ketQuaCacTru) {
    const cacCapThatTinh = [];
    const danhSachTru = Object.entries(ketQuaCacTru)
        .filter(([_, data]) => data.tenQue)
        .map(([tenTru, data]) => ({ tenTru, tenQue: data.tenQue }));

    for (let i = 0; i < danhSachTru.length; i++) {
        for (let j = i + 1; j < danhSachTru.length; j++) {
            const tru1 = danhSachTru[i], tru2 = danhSachTru[j];
            if (HKDQ_MAP_THAT_TINH[tru1.tenQue] && HKDQ_MAP_THAT_TINH[tru1.tenQue].includes(tru2.tenQue)) {
                cacCapThatTinh.push({
                    tru1: tru1.tenTru, que1: tru1.tenQue,
                    tru2: tru2.tenTru, que2: tru2.tenQue
                });
            }
        }
    }
    return cacCapThatTinh;
}

// ---------- PHÂN TÍCH HUYNH ĐỆ (logic Thầy Tiến) ----------
// Xét riêng: mỗi quẻ vẫn là Tử Tức.
// Xét chung: ≥ 2 Tử Tức cùng gia đình → cách cục Huynh Đệ.
function phanTichHuynhDe(ketQuaCacTru) {
    const giaDinhTuTuc = {};
    const danhSachHuynhDe = [];

    Object.values(ketQuaCacTru).forEach(tru => {
        if (tru.thongTinDuocChon && tru.thongTinDuocChon.vaiTroTongQuat === 'Tử Tức') {
            const giaDinh = tru.thongTinDuocChon.giaDinh;
            if (!giaDinhTuTuc[giaDinh]) giaDinhTuTuc[giaDinh] = [];
            giaDinhTuTuc[giaDinh].push(tru);
        }
    });

    let tongHuynhDe = 0;
    Object.entries(giaDinhTuTuc).forEach(([giaDinh, danhSach]) => {
        if (danhSach.length >= 2) {
            tongHuynhDe += danhSach.length;
            danhSachHuynhDe.push({
                giaDinh,
                soLuong: danhSach.length,
                cacQue: danhSach.map(tru => tru.tenQue),
                cacTru: danhSach.map(tru => tru.tenTru)
            });
        }
    });

    return {
        tongHuynhDe,
        danhSachHuynhDe,
        chiTiet: danhSachHuynhDe.length > 0
            ? danhSachHuynhDe.map(hd => `${hd.giaDinh}: ${hd.soLuong} quẻ`).join(', ')
            : 'Không có'
    };
}

// ---------- QUAN HỆ HÀNH ----------
function checkHanhRelations(h1, h2) {
    let results = [];
    if (h1 && h2) {
        if (h1 === h2) results.push("Cùng Quái");
        if (h1 + h2 === 5) results.push("Hợp Ngũ");
        if (h1 + h2 === 10) results.push("Hợp Thập");
        if (h1 + h2 === 15) results.push("Hợp Thập Ngũ");
        const pairs = [[1, 6], [2, 7], [3, 8], [4, 9]];
        if (pairs.some(p => (p[0] === h1 && p[1] === h2) || (p[0] === h2 && p[1] === h1))) {
            results.push("Hà Đồ");
        }
    }
    return results;
}

// ---------- QUAN HỆ VẬN ----------
function checkVanRelations(v1, v2) {
    let results = [];
    if (v1 && v2) {
        if (v1 === v2) results.push("Cùng Quái");
        if (v1 + v2 === 5) results.push("Hợp Ngũ");
        if (v1 + v2 === 10) results.push("Hợp Thập");
        if (v1 + v2 === 15) results.push("Hợp Thập Ngũ");
        const haDoPairs = [[1, 6], [2, 7], [3, 8], [4, 9]];
        if (haDoPairs.some(p => (p[0] === v1 && p[1] === v2) || (p[0] === v2 && p[1] === v1))) {
            results.push("Hà Đồ");
        }
        const aiTinhPairs = [[1, 3], [2, 4], [6, 8], [7, 9]];
        if (aiTinhPairs.some(p => (p[0] === v1 && p[1] === v2) || (p[0] === v2 && p[1] === v1))) {
            results.push("Điên Đảo Ai Tinh");
        }
    }
    return results;
}

// ---------- QUAN HỆ CÓ HƯỚNG (SINH/KHẮC) ----------
function checkDirectedRelations(h_dest, h_src) {
    let results = [];
    if (h_dest && h_src) {
        const HANH_ELEMENT_MAP = { 1: 'Thủy', 2: 'Hỏa', 3: 'Mộc', 4: 'Kim', 5: 'Thổ', 6: 'Thủy', 7: 'Hỏa', 8: 'Mộc', 9: 'Kim' };
        const SINH_MAP = { 'Kim': 'Thủy', 'Thủy': 'Mộc', 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim' };
        const KHAC_MAP = { 'Kim': 'Mộc', 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim' };
        if (HANH_ELEMENT_MAP[h_dest] === SINH_MAP[HANH_ELEMENT_MAP[h_src]]) results.push("Sinh Nhập");
        if (HANH_ELEMENT_MAP[h_dest] === KHAC_MAP[HANH_ELEMENT_MAP[h_src]]) results.push("Khắc Nhập");
    }
    return results;
}

// ---------- ĐIỂM THANH THẾ (CHỈ THAM KHẢO, KHÔNG GÁN HỌ) ----------
function tinhDiemThanhThe(cacTruInput) {
    const diemThanhThe = {};
    const tanSuatGiaDinhTuTuc = {};

    for (const [tenTru, tenQue] of Object.entries(cacTruInput)) {
        if (!tenQue) continue;
        const thongTinList = timThongTinQue(tenQue);
        const giaDinhDaQuet = new Set();
        const heSoViTri = TRUC_TAM_TAI.includes(tenTru) ? 2 : 1;

        thongTinList.forEach(tt => {
            if (!diemThanhThe[tt.giaDinh]) diemThanhThe[tt.giaDinh] = 0;
            if (tt.vaiTroTongQuat === 'Phụ Mẫu') {
                diemThanhThe[tt.giaDinh] += 10 * heSoViTri;
            } else if (tt.vaiTroTongQuat === 'Tử Tức') {
                diemThanhThe[tt.giaDinh] += 1 * heSoViTri;
                giaDinhDaQuet.add(tt.giaDinh);
            }
        });

        giaDinhDaQuet.forEach(gd => {
            tanSuatGiaDinhTuTuc[gd] = (tanSuatGiaDinhTuTuc[gd] || 0) + 1;
        });
    }

    return { diemThanhThe, tanSuatGiaDinhTuTuc };
}

function sapXepGiaDinhTheoThanhThe(danhSachGiaDinh, diemThanhThe, tanSuatGiaDinhTuTuc) {
    return [...danhSachGiaDinh].sort((a, b) => {
        const diemDiff = (diemThanhThe[b] || 0) - (diemThanhThe[a] || 0);
        if (diemDiff !== 0) return diemDiff;
        return (tanSuatGiaDinhTuTuc[b] || 0) - (tanSuatGiaDinhTuTuc[a] || 0);
    });
}

function taoKetQuaQue({
    thongTinDuocChon,
    trangThai,
    tatCaThongTin,
    bangChungGiaDinh,
    lyDoKXD
}) {
    return {
        thongTinDuocChon,
        trangThai,
        tatCaThongTin,
        bangChungGiaDinh,
        lyDoKXD,
        lyDoKXDLabel: nhanLyDoKXD(lyDoKXD)
    };
}

function thuThapQueCuaTru(tenQueChinh, quePhu) {
    const ds = [];
    if (tenQueChinh) ds.push(tenQueChinh);
    if (Array.isArray(quePhu)) {
        quePhu.forEach(q => { if (q && !ds.includes(q)) ds.push(q); });
    }
    return ds;
}

// ---------- QUAN XÉT QUẺ THEO NGỮ CẢNH 6 TRỤ (logic Thầy Tiến) ----------
// Gán vai trò: 1 quẻ đã chọn / trụ.
// Bằng chứng huyết thống: mọi quẻ của 5 trụ còn lại (quẻ chính + quẻ phụ).
// Bỏ qua chính trụ và bỏ qua quẻ trùng tên — quẻ lưỡng họ không được
// tự làm bằng chứng cho chính nó.
function quanXetQueTheoNguCanh(tenQueCanXet, tenTruCanXet, tatCaCacTru, tatCaQueTheoTru) {
    const thongTinList = timThongTinQue(tenQueCanXet);

    if (!thongTinList || thongTinList.length === 0) {
        return taoKetQuaQue({
            thongTinDuocChon: null,
            trangThai: 'Không tìm thấy',
            tatCaThongTin: [],
            bangChungGiaDinh: [],
            lyDoKXD: 'khong_tim_thay'
        });
    }

    const tatCaThongTin = thongTinList;

    // BƯỚC 1: Phụ Mẫu — 16 quẻ cha mẹ, ưu tiên tuyệt đối
    const laPhuMau = thongTinList.find(tt => tt.vaiTroTongQuat === 'Phụ Mẫu');
    if (laPhuMau) {
        return taoKetQuaQue({
            thongTinDuocChon: laPhuMau,
            trangThai: 'Phụ Mẫu',
            tatCaThongTin,
            bangChungGiaDinh: [laPhuMau.giaDinh],
            lyDoKXD: null
        });
    }

    // BƯỚC 2: Tử Tức — chỉ nhận họ khi đúng 1 gia đình có bằng chứng
    const laTuTuc = thongTinList.some(tt => tt.vaiTroTongQuat === 'Tử Tức');
    if (laTuTuc) {
        const cacGiaDinhTiemNang = [...new Set(thongTinList.map(tt => tt.giaDinh))];
        const cacGiaDinhXuatHien = new Set();
        const nguonQue = tatCaQueTheoTru || {};

        for (const [tenTru, tenQueChinh] of Object.entries(tatCaCacTru)) {
            if (tenTru === tenTruCanXet) continue;
            const dsQue = thuThapQueCuaTru(tenQueChinh, nguonQue[tenTru]);
            dsQue.forEach(tenQue => {
                if (!tenQue || tenQue === tenQueCanXet) return;
                timThongTinQue(tenQue).forEach(tt => {
                    if (cacGiaDinhTiemNang.includes(tt.giaDinh)) {
                        cacGiaDinhXuatHien.add(tt.giaDinh);
                    }
                });
            });
        }

        const bangChungGiaDinh = Array.from(cacGiaDinhXuatHien);

        if (bangChungGiaDinh.length === 1) {
            const giaDinhDuyNhat = bangChungGiaDinh[0];
            const thongTinDuocChon = thongTinList.find(tt => tt.giaDinh === giaDinhDuyNhat) || null;
            return taoKetQuaQue({
                thongTinDuocChon,
                trangThai: 'Tử Tức',
                tatCaThongTin,
                bangChungGiaDinh,
                lyDoKXD: null
            });
        }

        return taoKetQuaQue({
            thongTinDuocChon: null,
            trangThai: 'KXĐ',
            tatCaThongTin,
            bangChungGiaDinh,
            lyDoKXD: bangChungGiaDinh.length === 0 ? 'khong_bang_chung' : 'dung_nhieu_ho'
        });
    }

    // BƯỚC 3: không phải Phụ Mẫu / Tử Tức → không gán ép
    return taoKetQuaQue({
        thongTinDuocChon: null,
        trangThai: 'KXĐ',
        tatCaThongTin,
        bangChungGiaDinh: [],
        lyDoKXD: 'khong_bang_chung'
    });
}

// ---------- PHÂN TÍCH NHẬT KHÓA ĐẦY ĐỦ ----------
function phanTichNhatKhoaDayDu(input) {
    const cacTruInput = {
        'Trụ Tuổi': input.truTuoi,
        'Trụ Tọa': input.truToa,
        'Trụ Ngày': input.truNgay,
        'Trụ Năm': input.truNam,
        'Trụ Tháng': input.truThang,
        'Trụ Giờ': input.truGio
    };

    const tatCaQueTheoTru = input.tatCaQueTheoTru || {};
    const { diemThanhThe, tanSuatGiaDinhTuTuc } = tinhDiemThanhThe(cacTruInput);

    const ketQuaCacTru = {};
    const thongKeAmDuong = { 'Dương': 0, 'Âm': 0, 'KXĐ': 0 };
    const thongKeVaiTro = { 'Phụ Mẫu': 0, 'Tử Tức': 0, 'Huynh Đệ': 0 };
    let coKXD = false;

    for (const [tenTru, tenQue] of Object.entries(cacTruInput)) {
        if (!tenQue) continue;

        const ketQua = quanXetQueTheoNguCanh(tenQue, tenTru, cacTruInput, tatCaQueTheoTru);
        const bangChungSapXep = sapXepGiaDinhTheoThanhThe(
            ketQua.bangChungGiaDinh,
            diemThanhThe,
            tanSuatGiaDinhTuTuc
        );

        ketQuaCacTru[tenTru] = {
            tenTru,
            tenQue,
            ...ketQua,
            bangChungGiaDinh: bangChungSapXep,
            goiYThanhThe: bangChungSapXep[0] || null,
            queConLai: []
        };

        if (ketQua.trangThai === 'KXĐ' || ketQua.trangThai === 'Không tìm thấy' || !ketQua.thongTinDuocChon) {
            thongKeAmDuong['KXĐ']++;
            coKXD = true;
        } else {
            thongKeAmDuong[ketQua.thongTinDuocChon.amDuong]++;
            if (ketQua.trangThai === 'Phụ Mẫu') thongKeVaiTro['Phụ Mẫu']++;
            else if (ketQua.trangThai === 'Tử Tức') thongKeVaiTro['Tử Tức']++;
        }
    }

    const thongTinHuynhDe = phanTichHuynhDe(ketQuaCacTru);
    thongKeVaiTro['Huynh Đệ'] = thongTinHuynhDe.tongHuynhDe;

    const cacCapThatTinh = phatHienThatTinhDaKiep(ketQuaCacTru);
    const canhBao = [];

    if (coKXD) {
        canhBao.push({
            type: 'critical',
            message: `TẠP KHÍ, ÂM DƯƠNG RỐI LOẠN (${thongKeAmDuong['KXĐ']} trụ KXĐ)`
        });
    }

    if (thongKeAmDuong['Dương'] > 0 && thongKeAmDuong['Âm'] === 0) {
        canhBao.push({ type: 'critical', message: 'CÔ DƯƠNG 6 TRỤ' });
    } else if (thongKeAmDuong['Âm'] > 0 && thongKeAmDuong['Dương'] === 0) {
        canhBao.push({ type: 'critical', message: 'CÔ ÂM 6 TRỤ' });
    }

    if (input.lucXungList && input.lucXungList.length > 0) {
        canhBao.push({
            type: 'critical',
            message: `CÓ TƯỚNG XUNG CHI: ${input.lucXungList.join(', ')}`
        });
    }

    let soAmTamTai = 0, soDuongTamTai = 0, soTruTamTaiHopLe = 0;
    TRUC_TAM_TAI.forEach(tenTru => {
        const tru = ketQuaCacTru[tenTru];
        if (tru && tru.thongTinDuocChon && tru.trangThai !== 'KXĐ') {
            if (tru.thongTinDuocChon.amDuong === 'Âm') soAmTamTai++;
            if (tru.thongTinDuocChon.amDuong === 'Dương') soDuongTamTai++;
            soTruTamTaiHopLe++;
        }
    });

    if (soTruTamTaiHopLe > 0) {
        if (soDuongTamTai > 0 && soAmTamTai === 0) {
            canhBao.push({ type: 'moderate', message: 'Trục Tam Tài (Tuổi-Tọa-Ngày) CÔ DƯƠNG' });
        } else if (soAmTamTai > 0 && soDuongTamTai === 0) {
            canhBao.push({ type: 'moderate', message: 'Trục Tam Tài (Tuổi-Tọa-Ngày) CÔ ÂM' });
        }
    }

    if (thongKeVaiTro['Phụ Mẫu'] === 0) {
        canhBao.push({ type: 'moderate', message: 'Thiếu Phụ Mẫu (Gốc rễ)' });
    }
    if (thongKeVaiTro['Tử Tức'] === 0) {
        canhBao.push({ type: 'moderate', message: 'Thiếu Tử Tức' });
    }

    let danhGia = '', ratingClass = '';
    const coCritical = canhBao.some(cb => cb.type === 'critical');
    if (coCritical) {
        danhGia = 'KHÔNG THỂ DÙNG';
        ratingClass = 'rating-bad';
    } else {
        const soModerate = canhBao.filter(cb => cb.type === 'moderate').length;
        if (soModerate === 0) {
            danhGia = 'TỐT';
            ratingClass = 'rating-good';
        } else if (soModerate <= 2) {
            danhGia = 'TRUNG BÌNH';
            ratingClass = 'rating-medium';
        } else {
            danhGia = 'YẾU';
            ratingClass = 'rating-bad';
        }
    }

    return {
        ketQuaCacTru,
        thongKeAmDuong,
        thongKeVaiTro,
        thongTinHuynhDe,
        cacCapThatTinh,
        canhBao,
        danhGia,
        ratingClass,
        diemThanhThe,
        tanSuatGiaDinhTuTuc
    };
}
