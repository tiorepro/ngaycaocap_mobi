// ==========================================
// MOBILE-CORE.JS - Dataset + bộ lọc (không DOM)
// Logic tính toán gọi lại file desktop, không sửa công thức.
// ==========================================

const HOUR_SLOTS = [
    { hour: 23, name: 'Tý', range: '23H-1H' },
    { hour: 1, name: 'Sửu', range: '1H-3H' },
    { hour: 3, name: 'Dần', range: '3H-5H' },
    { hour: 5, name: 'Mão', range: '5H-7H' },
    { hour: 7, name: 'Thìn', range: '7H-9H' },
    { hour: 9, name: 'Tị', range: '9H-11H' },
    { hour: 11, name: 'Ngọ', range: '11H-13H' },
    { hour: 13, name: 'Mùi', range: '13H-15H' },
    { hour: 15, name: 'Thân', range: '15H-17H' },
    { hour: 17, name: 'Dậu', range: '17H-19H' },
    { hour: 19, name: 'Tuất', range: '19H-21H' },
    { hour: 21, name: 'Hợi', range: '21H-23H' }
];

const HKDQ_FAMILIES = [
    'Càn - Khôn', 'Khảm - Ly', 'Chấn - Tốn', 'Cấn - Đoài',
    'Bĩ - Thái', 'Ký Tế - Vị Tế', 'Hằng - Ích', 'Tổn - Hàm'
];

const TAM_SAT_PHUONG_MAP = {
    'NAM': ['Thân', 'Tý', 'Thìn'],
    'BẮC': ['Dần', 'Ngọ', 'Tuất'],
    'TÂY': ['Hợi', 'Mão', 'Mùi'],
    'ĐÔNG': ['Tị', 'Dậu', 'Sửu']
};
const TU_HOP_MAP = {
    'ĐÔNG': { can: ['Giáp', 'Ất'], chi: ['Dần', 'Mão', 'Thìn'] },
    'TÂY': { can: ['Canh', 'Tân'], chi: ['Thân', 'Dậu', 'Tuất'] },
    'NAM': { can: ['Bính', 'Đinh'], chi: ['Tị', 'Ngọ', 'Mùi'] },
    'BẮC': { can: ['Nhâm', 'Quý'], chi: ['Hợi', 'Tý', 'Sửu'] }
};
const SINH_HOP_MAP = {
    'ĐÔNG': { can: ['Nhâm', 'Quý'], chi: ['Hợi', 'Tý', 'Sửu'] },
    'TÂY': { can: ['Mậu', 'Kỷ'], chi: ['Thìn', 'Tuất', 'Sửu', 'Mùi'] },
    'NAM': { can: ['Giáp', 'Ất'], chi: ['Dần', 'Mão', 'Thìn'] },
    'BẮC': { can: ['Canh', 'Tân'], chi: ['Thân', 'Dậu', 'Tuất'] }
};
const TAM_HOP_MAP = {
    'ĐÔNG': ['Hợi', 'Mão', 'Mùi'],
    'TÂY': ['Tị', 'Dậu', 'Sửu'],
    'NAM': ['Dần', 'Ngọ', 'Tuất'],
    'BẮC': ['Thân', 'Tý', 'Thìn']
};

function getCan(canChi) {
    if (!canChi || typeof canChi !== 'string') return '';
    return canChi.split(' ')[0] || '';
}
function getChi(canChi) {
    if (!canChi || typeof canChi !== 'string') return '';
    return canChi.split(' ')[1] || '';
}
function arr(v) { return Array.isArray(v) ? v : []; }
function hasAnyNum(nums, sel) {
    return sel.some(s => nums.some(n => Number(n) === Number(s)));
}
function inList(val, list) { return arr(list).includes(val); }

function collectHanhRels(a, b) {
    const s = new Set();
    for (const h1 of arr(a)) {
        for (const h2 of arr(b)) {
            [...checkHanhRelations(h1, h2), ...checkDirectedRelations(h1, h2)].forEach(r => s.add(r));
        }
    }
    return [...s];
}
function collectVanRels(a, b) {
    const s = new Set();
    for (const v1 of arr(a)) {
        for (const v2 of arr(b)) checkVanRelations(v1, v2).forEach(r => s.add(r));
    }
    return [...s];
}

function getQuyNhan(dayCan, tietKhi, hourChi) {
    if (dayCan && tietKhi && QUY_NHAN_DATA[dayCan] && QUY_NHAN_DATA[dayCan][tietKhi]) {
        return QUY_NHAN_DATA[dayCan][tietKhi][hourChi] || '';
    }
    return '';
}

function layDanhSachQue(canChi) {
    if (!canChi || canChi === 'N/A') return [];
    return (typeof huyenKhongQueMap !== 'undefined' && huyenKhongQueMap[canChi]) || [];
}
function giaDinhCuaQue(tenQue) {
    return [...new Set(timThongTinQue(tenQue).map(tt => tt.giaDinh))];
}
function thuThapHoBangChung(tenTruHienTai, tatCaQueTheoTru) {
    const ho = new Set();
    Object.entries(tatCaQueTheoTru).forEach(([tenTru, dsQue]) => {
        if (tenTru === tenTruHienTai) return;
        (dsQue || []).forEach(q => giaDinhCuaQue(q).forEach(gd => ho.add(gd)));
    });
    return ho;
}
function chonQuePhanTich(canChi, hoBangChung) {
    const ques = layDanhSachQue(canChi);
    if (ques.length === 0) return { queChon: '', queConLai: [] };
    const quePhuMau = ques.find(q => timThongTinQue(q).some(tt => tt.vaiTroTongQuat === 'Phụ Mẫu'));
    if (quePhuMau) return { queChon: quePhuMau, queConLai: ques.filter(q => q !== quePhuMau) };
    if (ques.length === 1) return { queChon: ques[0], queConLai: [] };
    const unique = ques.filter(q => giaDinhCuaQue(q).filter(gd => hoBangChung && hoBangChung.has(gd)).length === 1);
    const queChon = unique.length === 1 ? unique[0] : ques[0];
    return { queChon, queConLai: ques.filter(q => q !== queChon) };
}

function createEmptyFilters() {
    return {
        profile: 'tuy-chinh',
        group1On: true,
        group2On: false,
        group3On: false,
        tranh: {
            nguHoangThang: false, nguHoangNgayChi: false, nguHoangGioChi: false,
            tuePhaThang: false, tuePhaNgay: false, tuePhaGio: false,
            tamSatThang: false, tamSatNgay: false, tamSatGio: false,
            batSatThang: false, batSatNgay: false, batSatGio: false,
            xungToaThang: false, xungToaNgay: false, xungToaGio: false,
            xungTuoiThang: false, xungTuoiNgay: false, xungTuoiGio: false
        },
        chon: {
            tuHopThangChi: false, tuHopNgayCan: false, tuHopNgayChi: false, tuHopGioCan: false, tuHopGioChi: false,
            sinhHopThangChi: false, sinhHopNgayCan: false, sinhHopNgayChi: false, sinhHopGioCan: false, sinhHopGioChi: false,
            tamHopThangChi: false, tamHopNgayChi: false, tamHopGioChi: false,
            thangPhaiChon: false
        },
        bolong: {
            anCuc: false, taiCuc: false, vuongCuc: false,
            matchCan: true, matchChi: true, matchBoth: false
        },
        tietKhi: { selected: [], onlyThoseDays: false, prioritize: false },
        lich: {
            solarFrom: '', solarTo: '',
            lunarMonths: [], weekdays: [], lunarDays: [],
            dayCans: [], dayChis: [], hourCans: [], hourChis: []
        },
        toiUu: {
            hanhNgay: [], vanNgay: [], hanhGio: [], vanGio: [], hanhThang: [], vanThang: [],
            chainsHanh: [], chainsVan: [], chains6Hanh: [], chains6Van: [],
            applyHanh: true, applyVan: false, gioPhaiKhopChain: true
        },
        quanHe: {
            rels: [], pairs: [], applyHanh: true, applyVan: true,
            allPairsMustMatch: false, minScoreNgayGio: 0
        },
        que: {
            batBuocPhuMau: false, batBuocTuTuc: false, batBuocHuynhDe: false,
            maxKXD: null, camKXDTamTai: false,
            khongCoDuong: false, khongCoAm: false,
            khongCoDuongTamTai: false, khongCoAmTamTai: false, canAmDuong: false,
            minDuong: 0, minAm: 0,
            loaiLucXung: false, xungPairs: [],
            loaiThatTinh: false, warnThatTinh: false,
            loaiKhongTheDung: false, chiTot: false, totVaTb: false,
            hoUuTien: [], batBuocTruNgayHo: [],
            tuoiNgayCungHo: false, tamTaiCungHo: false,
            truNgayQue: [], camQue: []
        }
    };
}

function setTranhNghiem(t, withXung) {
    t.nguHoangThang = true;
    t.tuePhaThang = t.tuePhaNgay = t.tuePhaGio = true;
    t.tamSatThang = t.tamSatNgay = t.tamSatGio = true;
    t.batSatThang = t.batSatNgay = t.batSatGio = true;
    if (withXung) {
        t.xungToaThang = t.xungToaNgay = t.xungToaGio = true;
        t.xungTuoiThang = t.xungTuoiNgay = t.xungTuoiGio = true;
    }
}

function applyProfile(name, computed) {
    const f = createEmptyFilters();
    f.profile = name;
    const utHanh = (prioMax) => (computed.toiUu.hanhNgay || []).filter(x => x.prio <= prioMax).map(x => x.ngay);
    const utVan = (prioMax) => (computed.toiUu.vanNgay || []).filter(x => x.prio <= prioMax).map(x => x.ngay);

    if (name === 'lỏng') {
        f.tranh.nguHoangThang = true;
        f.tranh.tamSatThang = f.tranh.tamSatNgay = f.tranh.tamSatGio = true;
        f.tranh.batSatThang = f.tranh.batSatNgay = f.tranh.batSatGio = true;
        f.tranh.tuePhaThang = f.tranh.tuePhaNgay = f.tranh.tuePhaGio = true;
    } else if (name === 'vừa') {
        setTranhNghiem(f.tranh, true);
        f.chon.tuHopNgayCan = f.chon.tuHopNgayChi = true;
        f.chon.sinhHopNgayCan = f.chon.sinhHopNgayChi = true;
        f.chon.tamHopNgayChi = true;
        f.group2On = true;
        f.toiUu.applyHanh = true;
        f.toiUu.hanhNgay = utHanh(2);
        f.group3On = true;
        f.que.maxKXD = 1;
        f.que.khongCoDuong = true;
        f.que.khongCoAm = true;
        f.que.loaiKhongTheDung = true;
    } else if (name === 'nghiêm') {
        setTranhNghiem(f.tranh, true);
        f.chon.tuHopNgayCan = f.chon.tuHopNgayChi = f.chon.tuHopGioCan = f.chon.tuHopGioChi = true;
        f.chon.sinhHopNgayCan = f.chon.sinhHopNgayChi = f.chon.sinhHopGioCan = f.chon.sinhHopGioChi = true;
        f.chon.tamHopNgayChi = f.chon.tamHopGioChi = true;
        f.group2On = true;
        f.toiUu.applyHanh = true;
        f.toiUu.applyVan = true;
        f.toiUu.hanhNgay = utHanh(1);
        f.toiUu.vanNgay = utVan(1);
        f.group3On = true;
        f.que.batBuocPhuMau = true;
        f.que.maxKXD = 0;
        f.que.khongCoDuong = true;
        f.que.khongCoAm = true;
        f.que.loaiLucXung = true;
        f.que.chiTot = true;
    }
    return f;
}

function computePhamToa(toaInfo, satsInfo) {
    if (!toaInfo || !satsInfo) return { text: '', className: '', list: [] };
    const toaHuongPalace = huongToPalaceNameMap[toaInfo.huong];
    const toaSon = toaInfo.son;
    const phamList = new Set();
    const nguHoangNamPalace = satsInfo.nguHoangNam;
    const oppositeNguHoangPalace = palaceOpposites[nguHoangNamPalace];
    if (toaHuongPalace === nguHoangNamPalace || toaHuongPalace === oppositeNguHoangPalace) phamList.add('Trục Ngũ Hoàng');
    const batSatHuong = BAT_SAT_NAM_CHI_MAP[satsInfo.yearChi];
    if (batSatHuong && toaInfo.huong === batSatHuong) phamList.add('Bát Sát');
    if (satsInfo.thaiTue.split(' - ').includes(toaSon)) phamList.add('Thái Tuế');
    if (satsInfo.tuePha.split(' - ').includes(toaSon)) phamList.add('Xung Thái Tuế');
    const allTamSatSons = getTamSatSonsForYear(satsInfo.yearChi);
    if (allTamSatSons.includes(toaSon)) phamList.add('Tam Sát');
    if (phamList.size > 0) return { text: `(${[...phamList].join(', ')})`, className: 'pham-bad', list: [...phamList] };
    return { text: 'KHÔNG PHẠM', className: 'pham-ok', list: [] };
}

function computeKetLuan(toaInfo, satsInfo, birthInfo) {
    const empty = { can: [], chi: [] };
    const tuHop = (toaInfo && TU_HOP_MAP[toaInfo.phuong]) || empty;
    const sinhHop = (toaInfo && SINH_HOP_MAP[toaInfo.phuong]) || empty;
    const tamHop = (toaInfo && TAM_HOP_MAP[toaInfo.phuong]) || [];
    const avoid_strict = { thangChi: new Set(), ngayCan: new Set(), ngayChi: new Set(), gioCan: new Set(), gioChi: new Set() };
    const avoid_warning = { thangChi: new Set(), ngayChi: new Set(), gioChi: new Set() };
    const choose = { thangChi: new Set(), ngayCan: new Set(), ngayChi: new Set(), gioCan: new Set(), gioChi: new Set() };

    const namChiNguHoang = (palaceToSonMap[satsInfo.nguHoangNam] || []).filter(s => DIA_CHI.includes(s));
    const huongPalaceName = huongToPalaceNameMap[toaInfo.huong];
    const nguHoangThangChi = [];
    if (huongPalaceName) {
        const oppositeHuongPalace = palaceOpposites[huongPalaceName];
        for (let m = 1; m <= 12; m++) {
            if ([huongPalaceName, oppositeHuongPalace].includes(satsInfo.monthlyStars[m].nguHoang)) {
                const c = tietKhiMonthChi[m - 1];
                if (!nguHoangThangChi.includes(c)) nguHoangThangChi.push(c);
                avoid_strict.thangChi.add(c);
            }
        }
    }
    const tuePhaChi = satsInfo.tuePha.split(' - ')[1] || '';
    if (tuePhaChi) {
        avoid_strict.thangChi.add(tuePhaChi);
        avoid_strict.ngayChi.add(tuePhaChi);
        avoid_strict.gioChi.add(tuePhaChi);
    }
    const tamSatChi = toaInfo.phuong ? (TAM_SAT_PHUONG_MAP[toaInfo.phuong] || []) : [];
    tamSatChi.forEach(c => {
        avoid_strict.thangChi.add(c); avoid_strict.ngayChi.add(c); avoid_strict.gioChi.add(c);
    });
    const batSatChi = BAT_SAT_HUONG_MAP[toaInfo.huong] || '';
    if (batSatChi) {
        avoid_strict.thangChi.add(batSatChi); avoid_strict.ngayChi.add(batSatChi); avoid_strict.gioChi.add(batSatChi);
    }
    const xungToaChi = LUC_XUNG_MAP[getChi(toaInfo.canChi)] || '';
    if (xungToaChi) {
        avoid_warning.thangChi.add(xungToaChi); avoid_warning.ngayChi.add(xungToaChi); avoid_warning.gioChi.add(xungToaChi);
    }
    const xungTuoiChi = LUC_XUNG_MAP[getChi(birthInfo.canChi)] || '';
    if (xungTuoiChi) {
        avoid_warning.thangChi.add(xungTuoiChi); avoid_warning.ngayChi.add(xungTuoiChi); avoid_warning.gioChi.add(xungTuoiChi);
    }

    [tuHop, sinhHop].forEach(data => {
        (data.can || []).forEach(c => { choose.ngayCan.add(c); choose.gioCan.add(c); });
        (data.chi || []).forEach(c => { choose.thangChi.add(c); choose.ngayChi.add(c); choose.gioChi.add(c); });
    });
    tamHop.forEach(c => { choose.thangChi.add(c); choose.ngayChi.add(c); choose.gioChi.add(c); });

    const canBoLong = toaInfo.huong && toaInfo.huong !== 'N/A' ? (tamHopBoLongCanMap[toaInfo.huong] || '') : '';
    const bolong = {
        can: canBoLong,
        an: tamHopBoLongChiMap['Ấn Cục'][toaInfo.huong] || [],
        tai: tamHopBoLongChiMap['Tài Cục'][toaInfo.huong] || [],
        vuong: tamHopBoLongChiMap['Vượng Cục'][toaInfo.huong] || []
    };
    if (canBoLong) { choose.ngayCan.add(canBoLong); choose.gioCan.add(canBoLong); }
    [...bolong.an, ...bolong.tai, ...bolong.vuong].forEach(c => {
        choose.thangChi.add(c); choose.ngayChi.add(c); choose.gioChi.add(c);
    });

    const minus = (setA, ...sets) => [...setA].filter(c => sets.every(s => !s.has(c)));
    const chinh = {
        thangChi: minus(choose.thangChi, avoid_strict.thangChi, avoid_warning.thangChi),
        ngayCan: minus(choose.ngayCan, avoid_strict.ngayCan),
        ngayChi: minus(choose.ngayChi, avoid_strict.ngayChi, avoid_warning.ngayChi),
        gioCan: minus(choose.gioCan, avoid_strict.gioCan),
        gioChi: minus(choose.gioChi, avoid_strict.gioChi, avoid_warning.gioChi)
    };
    const pho = {
        thangChi: [...choose.thangChi].filter(c => !avoid_strict.thangChi.has(c) && avoid_warning.thangChi.has(c)),
        ngayChi: [...choose.ngayChi].filter(c => !avoid_strict.ngayChi.has(c) && avoid_warning.ngayChi.has(c)),
        gioChi: [...choose.gioChi].filter(c => !avoid_strict.gioChi.has(c) && avoid_warning.gioChi.has(c))
    };

    return {
        namChiNguHoang, nguHoangThangChi, tuePhaChi, tamSatChi, batSatChi, xungToaChi, xungTuoiChi,
        tuHop, sinhHop, tamHop, bolong,
        avoid_strict: {
            thangChi: [...avoid_strict.thangChi],
            ngayCan: [...avoid_strict.ngayCan],
            ngayChi: [...avoid_strict.ngayChi],
            gioCan: [...avoid_strict.gioCan],
            gioChi: [...avoid_strict.gioChi]
        },
        avoid_warning: {
            thangChi: [...avoid_warning.thangChi],
            ngayChi: [...avoid_warning.ngayChi],
            gioChi: [...avoid_warning.gioChi]
        },
        choose: {
            thangChi: [...choose.thangChi], ngayCan: [...choose.ngayCan], ngayChi: [...choose.ngayChi],
            gioCan: [...choose.gioCan], gioChi: [...choose.gioChi]
        },
        chinh, pho
    };
}

function computeThaiDuong(toaInfo) {
    const tietKhiSet = new Set();
    if (!toaInfo || !toaInfo.son || toaInfo.son === 'N/A') {
        return { son: null, data: null, tietKhiList: [], items: [] };
    }
    const son = toaInfo.son;
    const data = THAI_DUONG_AM_DATA[son];
    const items = [];
    if (data) {
        const add = (key, label, val) => {
            if (!val) return;
            items.push({ key, label, value: val });
            tietKhiSet.add(val);
        };
        add('tdDaoToa', 'Thái Dương Đáo Tọa', data.tdDaoToa);
        add('tdDaoHuong', 'Thái Dương Đáo Hướng', data.tdDaoHuong);
        add('taDaoToa', 'Thái Âm Đáo Tọa', data.taDaoToa);
        add('taDaoHuong', 'Thái Âm Đáo Hướng', data.taDaoHuong);
        (data.tdDaoTamHop || '').split('\n').forEach((line, i) => {
            const tk = line.split(' đáo ')[0];
            if (tk && TIET_KHI.includes(tk)) {
                items.push({ key: 'tdDaoTamHop' + i, label: 'Thái Dương Đáo Tam Hợp', value: tk, extra: line });
                tietKhiSet.add(tk);
            }
        });
    }
    return { son, data, tietKhiList: [...tietKhiSet], items };
}

function computeAll(input) {
    const birthYear = parseInt(input.birthYear, 10);
    const viewYear = parseInt(input.viewYear, 10);
    const toaDo = parseFloat(input.toaDo);
    if (!viewYear || isNaN(viewYear)) throw new Error('Năm xem không hợp lệ');
    if (!birthYear || isNaN(birthYear)) throw new Error('Tuổi xem không hợp lệ');
    if (input.toaDo === '' || isNaN(toaDo)) throw new Error('Tọa xem không hợp lệ');

    const birthInfo = getYearCanChiInfo(birthYear);
    const yearInfo = getYearCanChiInfo(viewYear);
    const satsInfo = calculateAllYearlySats(viewYear);
    if (!satsInfo) throw new Error('Năm không hợp lệ (cần ≥ 1900)');
    const toaInfo = findDataByDegree(toaDo);
    if (!toaInfo) throw new Error('Không có dữ liệu cho độ số tọa này');

    const ketLuan = computeKetLuan(toaInfo, satsInfo, birthInfo);
    const thaiDuong = computeThaiDuong(toaInfo);
    const pham = computePhamToa(toaInfo, satsInfo);

    const hanhTuoiArr = getHanhFromCanChi(birthInfo.canChi);
    const hanhToaArr = getHanhFromCanChi(toaInfo.canChi);
    const vanTuoiArr = getVanFromCanChi(birthInfo.canChi);
    const vanToaArr = getVanFromCanChi(toaInfo.canChi);
    const hanhNamArr = getHanhFromCanChi(yearInfo.canChi);
    const vanNamArr = getVanFromCanChi(yearInfo.canChi);

    const hanhNgay = solveToiUu(hanhTuoiArr, hanhToaArr);
    const vanNgay = solveToiUuVan(vanTuoiArr, vanToaArr);
    const hanhChains = solveChainedHanhOptimization(hanhNgay, hanhNamArr);
    const vanChains = solveChainedVanOptimization(vanNgay, vanNamArr);
    const full6 = solveFull6PillarOptimization({
        hanhTuoiArr, hanhToaArr, hanhNamArr, vanTuoiArr, vanToaArr, vanNamArr,
        hasTuoi: hanhTuoiArr.length > 0, hasToa: hanhToaArr.length > 0, hasNam: hanhNamArr.length > 0
    });

    return {
        input: { ...input, birthYear, viewYear, toaDo },
        birthInfo, yearInfo, satsInfo, toaInfo, ketLuan, thaiDuong, pham,
        hanhTuoiArr, hanhToaArr, vanTuoiArr, vanToaArr, hanhNamArr, vanNamArr,
        toiUu: { hanhNgay, vanNgay, hanhChains, vanChains, hanh6: full6.hanh, van6: full6.van }
    };
}

function parseChain(chainName) {
    const grab = (k) => {
        const m = String(chainName).match(new RegExp(k + '\\((\\d+)\\)'));
        return m ? Number(m[1]) : null;
    };
    return { tu: grab('Tu'), to: grab('To'), g: grab('G'), ng: grab('Ng'), th: grab('Th'), n: grab('N') };
}

async function buildYearDataset(computed, locationName) {
    const lunarYearToView = computed.input.viewYear;
    const startLunarYearJDN = getLunarNewYearJDN(lunarYearToView);
    const endLunarYearJDN = getLunarNewYearJDN(lunarYearToView + 1) - 1;
    const finalStartDateJDN = startLunarYearJDN - 15;
    const finalEndDateJDN = endLunarYearJDN + 15;
    const k = computed.ketLuan;
    const tietKhiSet = new Set(computed.thaiDuong.tietKhiList || []);
    const days = [];

    if (locationName) await getSolarNoon(finalStartDateJDN, locationName);

    for (let jdn = finalStartDateJDN; jdn <= finalEndDateJDN; jdn++) {
        const dayInfo = getDateInfo(jdn);
        const lapXuanThisYearJDN = getLapXuanJDN(dayInfo.solarYear);
        const tietKhiYear = jdn < lapXuanThisYearJDN ? dayInfo.solarYear - 1 : dayInfo.solarYear;
        const namCanChiTK = getYearCanChiInfo(tietKhiYear).canChi;
        const dayOfWeek = NGAY_TRONG_TUAN[(jdn + 1) % 7];
        const solarNoonStr = await getSolarNoon(jdn, locationName);
        const tietKhiMonth = getTietKhiMonth(dayInfo.tietKhi);
        let thangCanChiTK = 'N/A';
        const tietKhiMonthNum = parseInt(tietKhiMonth, 10);
        if (!isNaN(tietKhiMonthNum)) {
            const canNamTKIndex = (tietKhiYear + 6) % 10;
            const canThangDauIndex = [2, 4, 6, 8, 0][canNamTKIndex % 5];
            const canThangTKIndex = (canThangDauIndex + tietKhiMonthNum - 1) % 10;
            thangCanChiTK = THIEN_CAN[canThangTKIndex] + ' ' + tietKhiMonthChi[tietKhiMonthNum - 1];
        }

        const hanhNgay = getHanhFromCanChi(dayInfo.dayCanChi);
        const vanNgay = getVanFromCanChi(dayInfo.dayCanChi);
        const hanhThang = getHanhFromCanChi(thangCanChiTK);
        const vanThang = getVanFromCanChi(thangCanChiTK);
        const hanhNam = getHanhFromCanChi(namCanChiTK);
        const vanNam = getVanFromCanChi(namCanChiTK);
        const ngayCan = getCan(dayInfo.dayCanChi);
        const ngayChi = getChi(dayInfo.dayCanChi);
        const thangChiTK = getChi(thangCanChiTK);

        const hours = HOUR_SLOTS.map(slot => {
            const canChi = getHourCanChi(ngayCan, slot.hour);
            const hanh = getHanhFromCanChi(canChi);
            const van = getVanFromCanChi(canChi);
            const chi = getChi(canChi);
            const can = getCan(canChi);
            return {
                hour: slot.hour, name: slot.name, range: slot.range, canChi, can, chi, hanh, van,
                ques: layDanhSachQue(canChi),
                quyNhan: getQuyNhan(ngayCan, dayInfo.tietKhi, chi),
                scoreHanh: getBestScore(collectHanhRels(hanhNgay, hanh)),
                scoreVan: getBestScore(collectVanRels(vanNgay, van)),
                isTuePha: chi === k.tuePhaChi,
                isTamSat: inList(chi, k.tamSatChi),
                isBatSat: chi === k.batSatChi,
                isXungToa: chi === k.xungToaChi,
                isXungTuoi: chi === k.xungTuoiChi,
                isNguHoang: inList(chi, k.namChiNguHoang),
                inTuHopCan: inList(can, k.tuHop.can), inTuHopChi: inList(chi, k.tuHop.chi),
                inSinhHopCan: inList(can, k.sinhHop.can), inSinhHopChi: inList(chi, k.sinhHop.chi),
                inTamHopChi: inList(chi, k.tamHop),
                inBoLongCan: k.bolong.can && can === k.bolong.can,
                inAnChi: inList(chi, k.bolong.an),
                inTaiChi: inList(chi, k.bolong.tai),
                inVuongChi: inList(chi, k.bolong.vuong)
            };
        });

        days.push({
            jdn,
            solarDay: dayInfo.solarDay, solarMonth: dayInfo.solarMonth, solarYear: dayInfo.solarYear,
            lunarDay: dayInfo.lunarDay, lunarMonth: dayInfo.lunarMonth, lunarYear: dayInfo.lunarYear, lunarLeap: dayInfo.lunarLeap,
            weekday: dayOfWeek, tietKhi: dayInfo.tietKhi, tietKhiMonth, tietKhiMonthNum: tietKhiMonthNum || 0,
            dayCanChi: dayInfo.dayCanChi, monthCanChi: dayInfo.monthCanChi, yearCanChi: dayInfo.yearCanChi,
            thangCanChiTK, namCanChiTK, solarNoon: solarNoonStr,
            ngayCan, ngayChi, thangChiTK, thangCan: getCan(thangCanChiTK),
            hanhTuoi: computed.hanhTuoiArr, vanTuoi: computed.vanTuoiArr,
            hanhToa: computed.hanhToaArr, vanToa: computed.vanToaArr,
            hanhNgay, vanNgay, hanhThang, vanThang, hanhNam, vanNam,
            canChiTuoi: computed.birthInfo.canChi,
            canChiToa: computed.toaInfo.canChi,
            tietKhiHighlight: tietKhiSet.has(dayInfo.tietKhi),
            tranhNguHoangThang: inList(thangChiTK, k.nguHoangThangChi),
            isTuePhaThang: thangChiTK === k.tuePhaChi,
            isTamSatThang: inList(thangChiTK, k.tamSatChi),
            isBatSatThang: thangChiTK === k.batSatChi,
            isXungToaThang: thangChiTK === k.xungToaChi,
            isXungTuoiThang: thangChiTK === k.xungTuoiChi,
            isTuePhaNgay: ngayChi === k.tuePhaChi,
            isTamSatNgay: inList(ngayChi, k.tamSatChi),
            isBatSatNgay: ngayChi === k.batSatChi,
            isXungToaNgay: ngayChi === k.xungToaChi,
            isXungTuoiNgay: ngayChi === k.xungTuoiChi,
            isNguHoangNgay: inList(ngayChi, k.namChiNguHoang),
            inTuHopNgayCan: inList(ngayCan, k.tuHop.can), inTuHopNgayChi: inList(ngayChi, k.tuHop.chi),
            inSinhHopNgayCan: inList(ngayCan, k.sinhHop.can), inSinhHopNgayChi: inList(ngayChi, k.sinhHop.chi),
            inTamHopNgayChi: inList(ngayChi, k.tamHop),
            inBoLongNgayCan: k.bolong.can && ngayCan === k.bolong.can,
            inAnNgayChi: inList(ngayChi, k.bolong.an),
            inTaiNgayChi: inList(ngayChi, k.bolong.tai),
            inVuongNgayChi: inList(ngayChi, k.bolong.vuong),
            inTuHopThangChi: inList(thangChiTK, k.tuHop.chi),
            inSinhHopThangChi: inList(thangChiTK, k.sinhHop.chi),
            inTamHopThangChi: inList(thangChiTK, k.tamHop),
            hours
        });
    }
    return days;
}

function hourKey(day, hour) { return day.jdn + '|' + hour.name; }

function matchBoLong(flagCan, flagAn, flagTai, flagVuong, f) {
    const cucs = [];
    if (f.bolong.anCuc) cucs.push(flagAn);
    if (f.bolong.taiCuc) cucs.push(flagTai);
    if (f.bolong.vuongCuc) cucs.push(flagVuong);
    if (!cucs.length && !f.bolong.anCuc && !f.bolong.taiCuc && !f.bolong.vuongCuc) return null;
    if (!cucs.length) return null;
    return cucs.some(chiOk => {
        const canOk = f.bolong.matchCan ? flagCan : true;
        const cOk = f.bolong.matchChi ? chiOk : true;
        if (f.bolong.matchBoth) return (f.bolong.matchCan ? flagCan : true) && (f.bolong.matchChi ? chiOk : true);
        if (f.bolong.matchCan && f.bolong.matchChi) return canOk || cOk;
        if (f.bolong.matchCan) return canOk;
        if (f.bolong.matchChi) return cOk;
        return canOk || cOk;
    });
}

function orChecks(list) {
    if (!list.length) return null;
    return list.some(Boolean);
}

function chainMatch(day, hour, chainName, isHanh, needGio) {
    const p = parseChain(chainName);
    const dH = isHanh ? day.hanhNgay : day.vanNgay;
    const tH = isHanh ? day.hanhThang : day.vanThang;
    const nH = isHanh ? day.hanhNam : day.vanNam;
    const gH = isHanh ? hour.hanh : hour.van;
    if (p.ng != null && !hasAnyNum(dH, [p.ng])) return false;
    if (p.th != null && !hasAnyNum(tH, [p.th])) return false;
    if (p.n != null && !hasAnyNum(nH, [p.n])) return false;
    if (needGio && p.g != null && !hasAnyNum(gH, [p.g])) return false;
    return true;
}

function pairRelsFor(day, hour, pair, isHanh) {
    const map = {
        'tuoi-toa': [day.hanhTuoi, day.hanhToa, day.vanTuoi, day.vanToa],
        'tuoi-ngay': [day.hanhTuoi, day.hanhNgay, day.vanTuoi, day.vanNgay],
        'toa-ngay': [day.hanhToa, day.hanhNgay, day.vanToa, day.vanNgay],
        'ngay-gio': [day.hanhNgay, hour.hanh, day.vanNgay, hour.van],
        'ngay-thang': [day.hanhNgay, day.hanhThang, day.vanNgay, day.vanThang],
        'ngay-nam': [day.hanhNgay, day.hanhNam, day.vanNgay, day.vanNam],
        'thang-nam': [day.hanhThang, day.hanhNam, day.vanThang, day.vanNam]
    };
    const x = map[pair];
    if (!x) return [];
    return isHanh ? collectHanhRels(x[0], x[1]) : collectVanRels(x[2], x[3]);
}

function dayPassGroup1(day, f) {
    const t = f.tranh, c = f.chon, L = f.lich;
    if (t.nguHoangThang && day.tranhNguHoangThang) return false;
    if (t.tuePhaThang && day.isTuePhaThang) return false;
    if (t.tamSatThang && day.isTamSatThang) return false;
    if (t.batSatThang && day.isBatSatThang) return false;
    if (t.xungToaThang && day.isXungToaThang) return false;
    if (t.xungTuoiThang && day.isXungTuoiThang) return false;
    if (t.tuePhaNgay && day.isTuePhaNgay) return false;
    if (t.tamSatNgay && day.isTamSatNgay) return false;
    if (t.batSatNgay && day.isBatSatNgay) return false;
    if (t.xungToaNgay && day.isXungToaNgay) return false;
    if (t.xungTuoiNgay && day.isXungTuoiNgay) return false;
    if (t.nguHoangNgayChi && day.isNguHoangNgay) return false;

    const ngayOr = [];
    if (c.tuHopNgayCan) ngayOr.push(day.inTuHopNgayCan);
    if (c.tuHopNgayChi) ngayOr.push(day.inTuHopNgayChi);
    if (c.sinhHopNgayCan) ngayOr.push(day.inSinhHopNgayCan);
    if (c.sinhHopNgayChi) ngayOr.push(day.inSinhHopNgayChi);
    if (c.tamHopNgayChi) ngayOr.push(day.inTamHopNgayChi);
    const blNgay = matchBoLong(day.inBoLongNgayCan, day.inAnNgayChi, day.inTaiNgayChi, day.inVuongNgayChi, f);
    if (blNgay !== null) ngayOr.push(blNgay);
    const ngayOk = orChecks(ngayOr);
    if (ngayOk === false) return false;

    if (c.thangPhaiChon || c.tuHopThangChi || c.sinhHopThangChi || c.tamHopThangChi) {
        const thOr = [];
        if (c.tuHopThangChi) thOr.push(day.inTuHopThangChi);
        if (c.sinhHopThangChi) thOr.push(day.inSinhHopThangChi);
        if (c.tamHopThangChi) thOr.push(day.inTamHopThangChi);
        if (thOr.length && orChecks(thOr) === false) return false;
    }

    if (f.tietKhi.onlyThoseDays && f.tietKhi.selected.length) {
        if (!f.tietKhi.selected.includes(day.tietKhi)) return false;
    }
    if (L.solarFrom) {
        const [y, m, d] = L.solarFrom.split('-').map(Number);
        if (y && (day.solarYear < y || (day.solarYear === y && (day.solarMonth < m || (day.solarMonth === m && day.solarDay < d))))) return false;
    }
    if (L.solarTo) {
        const [y, m, d] = L.solarTo.split('-').map(Number);
        if (y && (day.solarYear > y || (day.solarYear === y && (day.solarMonth > m || (day.solarMonth === m && day.solarDay > d))))) return false;
    }
    if (L.lunarMonths.length && !L.lunarMonths.map(Number).includes(day.lunarMonth)) return false;
    if (L.weekdays.length && !L.weekdays.includes(day.weekday)) return false;
    if (L.lunarDays.length && !L.lunarDays.map(Number).includes(day.lunarDay)) return false;
    if (L.dayCans.length && !L.dayCans.includes(day.ngayCan)) return false;
    if (L.dayChis.length && !L.dayChis.includes(day.ngayChi)) return false;
    return true;
}

function hourPassGroup1(hour, f) {
    const t = f.tranh, c = f.chon, L = f.lich;
    if (t.tuePhaGio && hour.isTuePha) return false;
    if (t.tamSatGio && hour.isTamSat) return false;
    if (t.batSatGio && hour.isBatSat) return false;
    if (t.xungToaGio && hour.isXungToa) return false;
    if (t.xungTuoiGio && hour.isXungTuoi) return false;
    if (t.nguHoangGioChi && hour.isNguHoang) return false;

    const gioOr = [];
    if (c.tuHopGioCan) gioOr.push(hour.inTuHopCan);
    if (c.tuHopGioChi) gioOr.push(hour.inTuHopChi);
    if (c.sinhHopGioCan) gioOr.push(hour.inSinhHopCan);
    if (c.sinhHopGioChi) gioOr.push(hour.inSinhHopChi);
    if (c.tamHopGioChi) gioOr.push(hour.inTamHopChi);
    const bl = matchBoLong(hour.inBoLongCan, hour.inAnChi, hour.inTaiChi, hour.inVuongChi, f);
    if (bl !== null) gioOr.push(bl);
    const gioOk = orChecks(gioOr);
    if (gioOk === false) return false;
    if (L.hourCans.length && !L.hourCans.includes(hour.can)) return false;
    if (L.hourChis.length && !L.hourChis.includes(hour.chi)) return false;
    return true;
}

function dayPassGroup2(day, f) {
    const u = f.toiUu;
    if (u.applyHanh && u.hanhNgay.length && !hasAnyNum(day.hanhNgay, u.hanhNgay)) return false;
    if (u.applyVan && u.vanNgay.length && !hasAnyNum(day.vanNgay, u.vanNgay)) return false;
    if (u.applyHanh && u.hanhThang.length && !hasAnyNum(day.hanhThang, u.hanhThang)) return false;
    if (u.applyVan && u.vanThang.length && !hasAnyNum(day.vanThang, u.vanThang)) return false;
    return true;
}

function hourPassGroup2(day, hour, f) {
    const u = f.toiUu;
    if (u.applyHanh && u.hanhGio.length && !hasAnyNum(hour.hanh, u.hanhGio)) return false;
    if (u.applyVan && u.vanGio.length && !hasAnyNum(hour.van, u.vanGio)) return false;

    const needG = u.gioPhaiKhopChain;
    const hanhChains = [...u.chainsHanh, ...u.chains6Hanh];
    const vanChains = [...u.chainsVan, ...u.chains6Van];
    if (u.applyHanh && hanhChains.length && !hanhChains.some(ch => chainMatch(day, hour, ch, true, needG))) return false;
    if (u.applyVan && vanChains.length && !vanChains.some(ch => chainMatch(day, hour, ch, false, needG))) return false;

    const q = f.quanHe;
    if (q.rels.length && q.pairs.length) {
        const okPair = (pair) => {
            let rels = [];
            if (q.applyHanh) rels = rels.concat(pairRelsFor(day, hour, pair, true));
            if (q.applyVan) rels = rels.concat(pairRelsFor(day, hour, pair, false));
            return q.rels.some(r => rels.includes(r));
        };
        const hits = q.pairs.map(okPair);
        if (q.allPairsMustMatch ? hits.some(x => !x) : hits.every(x => !x)) return false;
    }
    if (q.minScoreNgayGio > 0) {
        const score = Math.max(hour.scoreHanh || 0, hour.scoreVan || 0);
        if (score < q.minScoreNgayGio) return false;
    }
    return true;
}

function analyzeHour(day, hour) {
    if (hour._hkdq) return hour._hkdq;
    const canChiTheoTru = {
        'Trụ Tuổi': day.canChiTuoi,
        'Trụ Tọa': day.canChiToa,
        'Trụ Ngày': day.dayCanChi,
        'Trụ Tháng': day.thangCanChiTK,
        'Trụ Năm': day.namCanChiTK,
        'Trụ Giờ': hour.canChi
    };
    const tatCaQueTheoTru = {};
    Object.entries(canChiTheoTru).forEach(([tenTru, canChi]) => { tatCaQueTheoTru[tenTru] = layDanhSachQue(canChi); });
    const chonTheoTru = {};
    Object.entries(canChiTheoTru).forEach(([tenTru, canChi]) => {
        chonTheoTru[tenTru] = chonQuePhanTich(canChi, thuThapHoBangChung(tenTru, tatCaQueTheoTru));
    });
    const chi = {
        tuoi: getChi(day.canChiTuoi), toa: getChi(day.canChiToa), nam: getChi(day.namCanChiTK),
        thang: getChi(day.thangCanChiTK), ngay: day.ngayChi, gio: hour.chi
    };
    const lucXungList = [];
    [['Tuổi-Tọa', chi.tuoi, chi.toa], ['Tuổi-Ngày', chi.tuoi, chi.ngay], ['Tọa-Ngày', chi.toa, chi.ngay],
     ['Ngày-Giờ', chi.ngay, chi.gio], ['Ngày-Tháng', chi.ngay, chi.thang], ['Ngày-Năm', chi.ngay, chi.nam],
     ['Tháng-Năm', chi.thang, chi.nam]].forEach(([ten, c1, c2]) => {
        if (c1 && c2 && LUC_XUNG_MAP[c1] === c2) lucXungList.push(`${ten} (${c1}-${c2})`);
    });
    const ketQua = phanTichNhatKhoaDayDu({
        truTuoi: chonTheoTru['Trụ Tuổi'].queChon,
        truToa: chonTheoTru['Trụ Tọa'].queChon,
        truNgay: chonTheoTru['Trụ Ngày'].queChon,
        truThang: chonTheoTru['Trụ Tháng'].queChon,
        truNam: chonTheoTru['Trụ Năm'].queChon,
        truGio: chonTheoTru['Trụ Giờ'].queChon,
        lucXungList, tatCaQueTheoTru
    });
    Object.entries(chonTheoTru).forEach(([tenTru, chon]) => {
        if (ketQua.ketQuaCacTru[tenTru]) ketQua.ketQuaCacTru[tenTru].queConLai = chon.queConLai;
    });
    const hanhPairs = {
        'tuoi-toa': analyzeHanhPair(day.hanhTuoi, day.hanhToa),
        'tuoi-ngay': analyzeHanhPair(day.hanhTuoi, day.hanhNgay),
        'toa-ngay': analyzeHanhPair(day.hanhToa, day.hanhNgay),
        'ngay-gio': analyzeHanhPair(day.hanhNgay, hour.hanh),
        'ngay-thang': analyzeHanhPair(day.hanhNgay, day.hanhThang),
        'ngay-nam': analyzeHanhPair(day.hanhNgay, day.hanhNam),
        'thang-nam': analyzeHanhPair(day.hanhThang, day.hanhNam)
    };
    const vanPairs = {
        'tuoi-toa': analyzeVanPair(day.vanTuoi, day.vanToa),
        'tuoi-ngay': analyzeVanPair(day.vanTuoi, day.vanNgay),
        'toa-ngay': analyzeVanPair(day.vanToa, day.vanNgay),
        'ngay-gio': analyzeVanPair(day.vanNgay, hour.van),
        'ngay-thang': analyzeVanPair(day.vanNgay, day.vanThang),
        'ngay-nam': analyzeVanPair(day.vanNgay, day.vanNam),
        'thang-nam': analyzeVanPair(day.vanThang, day.vanNam)
    };
    const out = { ketQua, hanhPairs, vanPairs, lucXungList, chi };
    hour._hkdq = out;
    return out;
}

function hourPassGroup3(day, hour, f) {
    const q = f.que;
    const an = analyzeHour(day, hour);
    const kq = an.ketQua;
    const tk = kq.thongKeAmDuong, tv = kq.thongKeVaiTro, hd = kq.thongTinHuynhDe || {};
    if (q.batBuocPhuMau && !(tv['Phụ Mẫu'] > 0)) return false;
    if (q.batBuocTuTuc && !(tv['Tử Tức'] > 0)) return false;
    if (q.batBuocHuynhDe && !(hd.tongHuynhDe > 0)) return false;
    if (q.maxKXD !== null && q.maxKXD !== undefined && tk['KXĐ'] > q.maxKXD) return false;
    if (q.camKXDTamTai) {
        const bad = ['Trụ Tuổi', 'Trụ Tọa', 'Trụ Ngày'].some(t => {
            const x = kq.ketQuaCacTru[t];
            return !x || x.trangThai === 'KXĐ' || x.trangThai === 'Không tìm thấy' || !x.thongTinDuocChon;
        });
        if (bad) return false;
    }
    if (q.khongCoDuong && tk['Dương'] > 0 && tk['Âm'] === 0) return false;
    if (q.khongCoAm && tk['Âm'] > 0 && tk['Dương'] === 0) return false;
    if (q.canAmDuong && !(tk['Âm'] > 0 && tk['Dương'] > 0)) return false;
    if (q.minDuong && tk['Dương'] < q.minDuong) return false;
    if (q.minAm && tk['Âm'] < q.minAm) return false;
    if (q.khongCoDuongTamTai || q.khongCoAmTamTai) {
        let am = 0, duong = 0, ok = 0;
        ['Trụ Tuổi', 'Trụ Tọa', 'Trụ Ngày'].forEach(t => {
            const x = kq.ketQuaCacTru[t];
            if (x && x.thongTinDuocChon && x.trangThai !== 'KXĐ') {
                ok++;
                if (x.thongTinDuocChon.amDuong === 'Âm') am++;
                if (x.thongTinDuocChon.amDuong === 'Dương') duong++;
            }
        });
        if (ok > 0) {
            if (q.khongCoDuongTamTai && duong > 0 && am === 0) return false;
            if (q.khongCoAmTamTai && am > 0 && duong === 0) return false;
        }
    }
    if (q.loaiLucXung && an.lucXungList.length) return false;
    if (q.xungPairs && q.xungPairs.length) {
        const hit = q.xungPairs.some(p => an.lucXungList.some(x => x.indexOf(p) === 0 || x.includes(p)));
        if (hit) return false;
    }
    if (q.loaiThatTinh && kq.cacCapThatTinh && kq.cacCapThatTinh.length) return false;
    if (q.loaiKhongTheDung && kq.danhGia === 'KHÔNG THỂ DÙNG') return false;
    if (q.chiTot && kq.danhGia !== 'TỐT') return false;
    if (q.totVaTb && kq.danhGia !== 'TỐT' && kq.danhGia !== 'TRUNG BÌNH') return false;

    const famOf = (ten) => (kq.ketQuaCacTru[ten] && kq.ketQuaCacTru[ten].thongTinDuocChon)
        ? kq.ketQuaCacTru[ten].thongTinDuocChon.giaDinh : '';
    if (q.hoUuTien.length) {
        const fams = ['Trụ Tuổi', 'Trụ Tọa', 'Trụ Ngày', 'Trụ Tháng', 'Trụ Năm', 'Trụ Giờ'].map(famOf).filter(Boolean);
        if (!fams.some(x => q.hoUuTien.includes(x))) return false;
    }
    if (q.batBuocTruNgayHo.length && !q.batBuocTruNgayHo.includes(famOf('Trụ Ngày'))) return false;
    if (q.tuoiNgayCungHo) {
        const a = famOf('Trụ Tuổi'), b = famOf('Trụ Ngày');
        if (!a || !b || a !== b) return false;
    }
    if (q.tamTaiCungHo) {
        const a = famOf('Trụ Tuổi'), b = famOf('Trụ Tọa'), c = famOf('Trụ Ngày');
        if (!a || a !== b || a !== c) return false;
    }
    const tenNgay = kq.ketQuaCacTru['Trụ Ngày'] && kq.ketQuaCacTru['Trụ Ngày'].tenQue;
    if (q.truNgayQue.length && !q.truNgayQue.includes(tenNgay)) return false;
    if (q.camQue.length) {
        const names = Object.values(kq.ketQuaCacTru).map(x => x && x.tenQue).filter(Boolean);
        if (names.some(n => q.camQue.includes(n))) return false;
    }
    hour._danhGia = kq.danhGia;
    return true;
}

function filterDays(dataset, filters, opts) {
    opts = opts || {};
    const runG3 = !!(filters.group3On && opts.includeGroup3);
    const out = [];
    let skippedG3 = 0;
    for (const day of dataset) {
        if (filters.group1On && !dayPassGroup1(day, filters)) continue;
        if (filters.group2On && !dayPassGroup2(day, filters)) continue;
        const hours = [];
        for (const hour of day.hours) {
            if (filters.group1On && !hourPassGroup1(hour, filters)) continue;
            if (filters.group2On && !hourPassGroup2(day, hour, filters)) continue;
            if (runG3) {
                if (!hourPassGroup3(day, hour, filters)) continue;
            }
            hours.push(hour);
        }
        if (hours.length) {
            const badges = buildDayBadges(day, hours, filters);
            out.push({
                day, hours, badges,
                maxScore: Math.max(...hours.map(h => (h.scoreHanh || 0) + (h.scoreVan || 0))),
                bestDanhGia: hours.map(h => h._danhGia).filter(Boolean)[0] || ''
            });
        } else if (filters.group3On && !runG3) skippedG3++;
    }
    if (filters.tietKhi.prioritize && filters.tietKhi.selected.length) {
        out.sort((a, b) => Number(filters.tietKhi.selected.includes(b.day.tietKhi)) - Number(filters.tietKhi.selected.includes(a.day.tietKhi)));
    }
    return { rows: out, group3Pending: !!(filters.group3On && !opts.includeGroup3) };
}

function buildDayBadges(day, hours, f) {
    const b = [];
    if (hours.some(h => h.inTuHopChi || h.inTuHopCan || day.inTuHopNgayChi || day.inTuHopNgayCan)) b.push({ cls: 'chinh', text: 'Tự Hợp' });
    if (hours.some(h => h.inTamHopChi) || day.inTamHopNgayChi) b.push({ cls: 'chinh', text: 'Tam Hợp' });
    if (hours.some(h => h.inAnChi) || day.inAnNgayChi) b.push({ cls: 'chinh', text: 'Ấn Cục' });
    if (hours.some(h => h.inTaiChi) || day.inTaiNgayChi) b.push({ cls: 'chinh', text: 'Tài Cục' });
    if (hours.some(h => h.inVuongChi) || day.inVuongNgayChi) b.push({ cls: 'chinh', text: 'Vượng Cục' });
    if (day.isXungToaNgay || day.isXungTuoiNgay) b.push({ cls: 'pho', text: 'Phó / Hóa Xung' });
    if (day.tietKhiHighlight) b.push({ cls: 'tk', text: day.tietKhi });
    const h0 = hours[0];
    if (h0 && h0._danhGia) b.push({ cls: h0._danhGia === 'TỐT' ? 'tot' : (h0._danhGia === 'KHÔNG THỂ DÙNG' ? 'bad' : 'pho'), text: h0._danhGia });
    return b;
}

function sortRows(rows, mode) {
    const copy = rows.slice();
    const pad = (d) => d.solarYear * 10000 + d.solarMonth * 100 + d.solarDay;
    const lunar = (d) => d.lunarYear * 10000 + d.lunarMonth * 100 + d.lunarDay;
    if (mode === 'lunar') copy.sort((a, b) => lunar(a.day) - lunar(b.day));
    else if (mode === 'tietkhi') copy.sort((a, b) => Number(b.day.tietKhiHighlight) - Number(a.day.tietKhiHighlight) || pad(a.day) - pad(b.day));
    else if (mode === 'score') copy.sort((a, b) => b.maxScore - a.maxScore || pad(a.day) - pad(b.day));
    else if (mode === 'que') {
        const rank = { 'TỐT': 0, 'TRUNG BÌNH': 1, 'YẾU': 2, 'KHÔNG THỂ DÙNG': 3 };
        copy.sort((a, b) => (rank[a.bestDanhGia] ?? 9) - (rank[b.bestDanhGia] ?? 9) || pad(a.day) - pad(b.day));
    } else copy.sort((a, b) => pad(a.day) - pad(b.day));
    return copy;
}

function pad2(n) { return String(n).padStart(2, '0'); }
function fmtSolar(d) { return `${pad2(d.solarDay)}/${pad2(d.solarMonth)}/${d.solarYear}`; }
function fmtLunar(d) { return `${d.lunarDay}/${d.lunarMonth}${d.lunarLeap ? ' (nhuận)' : ''}/${d.lunarYear}`; }
