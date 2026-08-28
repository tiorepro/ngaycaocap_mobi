// ==========================================
// FENGSHUI.JS - Phong thủy & Thần Sát
// ==========================================
// Tính toán Ngũ Hoàng, Nhị Hắc, Thái Tuế,
// Tam Sát, Bát Sát theo năm và tháng.

// ---------- CHUẨN HÓA SAO (1-9) ----------
function normalizeStar(number) {
    return ((number - 1) % 9 + 9) % 9 + 1;
}

// ---------- VỊ TRÍ CÁC SAO TRONG CỬU CUNG ----------
function getStarPositions(centralStar) {
    const positions = {};
    const path = [
        { p: 5, s: 0 }, { p: 6, s: 1 }, { p: 7, s: 2 }, { p: 8, s: 3 },
        { p: 9, s: 4 }, { p: 1, s: 5 }, { p: 2, s: 6 }, { p: 3, s: 7 }, { p: 4, s: 8 }
    ];
    path.forEach(item => {
        positions[normalizeStar(centralStar + item.s)] = palaces[item.p];
    });
    return positions;
}

// ---------- SAO TRUNG CUNG THEO NĂM ----------
function getAnnualCentralStar(year) {
    const sumOfDigits = year.toString().split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
    let remainder = sumOfDigits % 9;
    if (remainder === 0) remainder = 9;
    return normalizeStar(11 - remainder);
}

// ---------- SAO KHỞI ĐẦU THÁNG ----------
function getMonthlyStartStar(year) {
    const yearChiIndex = (year - 4 + 12) % 12;
    const chi = chiNames[yearChiIndex];
    if (['Dần', 'Thân', 'Tị', 'Hợi'].includes(chi)) return 2;
    if (['Thìn', 'Tuất', 'Sửu', 'Mùi'].includes(chi)) return 5;
    if (['Tý', 'Ngọ', 'Mão', 'Dậu'].includes(chi)) return 8;
    return 0;
}

// ---------- TỔNG HỢP THẦN SÁT NĂM ----------
function calculateAllYearlySats(year) {
    if (isNaN(year) || year < 1900) return null;
    const yearChi = chiNames[(year - 4 + 12) % 12];
    const annualCentralStar = getAnnualCentralStar(year);
    const annualPositions = getStarPositions(annualCentralStar);
    const yearSats = satsData[yearChi];
    const monthlyStartStar = getMonthlyStartStar(year);
    const monthlyStars = {};

    for (let month = 1; month <= 12; month++) {
        let monthlyCentralStar = monthlyStartStar - (month - 1);
        while (monthlyCentralStar < 1) monthlyCentralStar += 9;
        const monthlyPositions = getStarPositions(monthlyCentralStar);
        monthlyStars[month] = {
            nguHoang: monthlyPositions[5],
            nhiHac: monthlyPositions[2]
        };
    }

    return {
        year,
        yearChi,
        nguHoangNam: annualPositions[5],
        nhiHacNam: annualPositions[2],
        thaiTue: yearSats.thaiTue,
        tuePha: yearSats.tuePha,
        monthlyStars
    };
}

// ---------- CHI TIẾT TAM SÁT ----------
function getDetailedTamSatInfo(yearChi) {
    const tamHopGroup = Object.keys(TAM_SAT_YEAR_BASED_MAP).find(
        key => TAM_SAT_YEAR_BASED_MAP[key].includes(yearChi) || key === yearChi
    );
    if (!tamHopGroup) return 'N/A';

    let kiepSat, taiSat, tueSat;
    if (['Dần', 'Ngọ', 'Tuất'].includes(tamHopGroup)) {
        [kiepSat, taiSat, tueSat] = ['Hợi', 'Tý', 'Sửu'];
    } else if (['Thân', 'Tý', 'Thìn'].includes(tamHopGroup)) {
        [kiepSat, taiSat, tueSat] = ['Tị', 'Ngọ', 'Mùi'];
    } else if (['Tị', 'Dậu', 'Sửu'].includes(tamHopGroup)) {
        [kiepSat, taiSat, tueSat] = ['Dần', 'Mão', 'Thìn'];
    } else if (['Hợi', 'Mão', 'Mùi'].includes(tamHopGroup)) {
        [kiepSat, taiSat, tueSat] = ['Thân', 'Dậu', 'Tuất'];
    } else {
        return 'N/A';
    }

    const formatSat = (label, chi) => `${label}: ${CHI_TO_SONG_SON_MAP[chi] || ''}`;
    return `${formatSat('Kiếp Sát', kiepSat)}, ${formatSat('Tai Sát', taiSat)}, ${formatSat('Tuế Sát', tueSat)}`;
}

// ---------- DANH SÁCH SƠN TAM SÁT ----------
function getTamSatSonsForYear(yearChi) {
    const tamHopGroup = Object.keys(TAM_SAT_YEAR_BASED_MAP).find(
        key => TAM_SAT_YEAR_BASED_MAP[key].includes(yearChi) || key === yearChi
    );
    if (!tamHopGroup) return [];

    let satChis = [];
    if (['Dần', 'Ngọ', 'Tuất'].includes(tamHopGroup))      satChis = ['Hợi', 'Tý', 'Sửu'];
    else if (['Thân', 'Tý', 'Thìn'].includes(tamHopGroup))  satChis = ['Tị', 'Ngọ', 'Mùi'];
    else if (['Tị', 'Dậu', 'Sửu'].includes(tamHopGroup))    satChis = ['Dần', 'Mão', 'Thìn'];
    else if (['Hợi', 'Mão', 'Mùi'].includes(tamHopGroup))   satChis = ['Thân', 'Dậu', 'Tuất'];
    else return [];

    const allSons = new Set();
    satChis.forEach(chi => {
        const songSonStr = CHI_TO_SONG_SON_MAP[chi];
        if (songSonStr) songSonStr.split(' - ').forEach(son => allSons.add(son));
    });
    return [...allSons];
}
