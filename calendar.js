// ==========================================
// CALENDAR.JS - Lịch pháp thiên văn
// ==========================================
// Chuyển đổi Dương lịch ↔ Âm lịch, tính JDN,
// Tiết khí, Can Chi ngày/giờ/tháng/năm.

// ---------- TIỆN ÍCH ----------
function INT(d) { return Math.floor(d); }

// ---------- JULIAN DAY NUMBER ----------
function getJulianDayNumber(dd, mm, yy) {
    const a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
    let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) {
        jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    }
    return jd;
}

// JDN → Gregorian
function jdnToGregorian(jdn) {
    let j = jdn + 32044, g = INT(j / 146097), dg = j % 146097;
    let c = INT((INT(dg / 36524) + 1) * 3 / 4), dc = dg - c * 36524;
    let b = INT(dc / 1461), db = dc % 1461;
    let a = INT((INT(db / 365) + 1) * 3 / 4), da = db - a * 365;
    let y = g * 400 + c * 100 + b * 4 + a;
    let m = INT((da * 5 + 308) / 153) - 2;
    let d = da - INT((m + 4) * 153 / 5) + 122;
    let year = y - 4800 + INT((m + 2) / 12);
    let month = (m + 2) % 12 + 1;
    let day = d + 1;
    return { year, month, day };
}

// ---------- SÓC (NEW MOON) ----------
function getNewMoonDay(k) {
    const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = Math.PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3
            + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M)
           - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr)
           - 0.0004 * Math.sin(dr * 3 * Mpr) + 0.0104 * Math.sin(dr * 2 * F)
           - 0.0051 * Math.sin(dr * (M + Mpr)) - 0.0074 * Math.sin(dr * (M - Mpr))
           + 0.0004 * Math.sin(dr * (2 * F + M)) - 0.0004 * Math.sin(dr * (2 * F - M))
           - 0.0006 * Math.sin(dr * (2 * F + Mpr)) + 0.0010 * Math.sin(dr * (2 * F - Mpr))
           + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    let deltat = (T < -11)
        ? (0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3)
        : (-0.000278 + 0.000265 * T + 0.000262 * T2);
    return INT(Jd1 + C1 - deltat + 0.5 + TIME_ZONE / 24);
}

// ---------- KINH ĐỘ MẶT TRỜI ----------
function getSunLongitude(jdn) {
    const T = (jdn - 2451545.5 - TIME_ZONE / 24) / 36525, T2 = T * T, dr = Math.PI / 180;
    const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    const DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M)
             + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M)
             + 0.000290 * Math.sin(dr * 3 * M);
    let L = L0 + DL;
    while (L < 0) L += 360;
    while (L >= 360) L -= 360;
    return L;
}

// ---------- TIẾT KHÍ ----------
function getTietKhi(jdn) {
    return TIET_KHI[INT(getSunLongitude(jdn) / 15) % 24];
}

// ---------- THÁNG 11 ÂM LỊCH ----------
function getLunarMonth11(yy) {
    let nm = getNewMoonDay(INT((getJulianDayNumber(31, 12, yy) - 2415021) / 29.530588853));
    const sunLong = INT(getSunLongitude(nm) / 30);
    if (sunLong >= 9) {
        nm = getNewMoonDay(INT((getJulianDayNumber(31, 12, yy) - 2415021) / 29.530588853) - 1);
    }
    return nm;
}

// ---------- THÁNG NHUẬN ----------
function getLeapMonthOffset(a11) {
    const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let last = 0, i = 1, arc;
    do {
        last = INT(getSunLongitude(getNewMoonDay(k + i)) / 30);
        i++;
        arc = INT(getSunLongitude(getNewMoonDay(k + i)) / 30);
    } while (arc !== last && i < 14);
    return i - 1;
}

// ---------- DƯƠNG → ÂM ----------
function convertSolarToLunar(solarDay, solarMonth, solarYear, hour) {
    let jdToUse = getJulianDayNumber(solarDay, solarMonth, solarYear);
    if (hour >= 23) jdToUse += 1;
    const k = INT((jdToUse - 2415021.076998695) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1);
    if (monthStart > jdToUse) monthStart = getNewMoonDay(k);

    let a11 = getLunarMonth11(solarYear), b11 = a11, lunarYear, lunarMonth;
    if (a11 >= monthStart) {
        lunarYear = solarYear;
        a11 = getLunarMonth11(solarYear - 1);
    } else {
        lunarYear = solarYear + 1;
        b11 = getLunarMonth11(solarYear + 1);
    }
    const lunarDay = jdToUse - monthStart + 1;
    const diff = INT((monthStart - a11) / 29);
    let lunarLeap = 0;
    lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
        const leapMonthDiff = getLeapMonthOffset(a11);
        if (diff >= leapMonthDiff) {
            lunarMonth = diff + 10;
            if (diff === leapMonthDiff) lunarLeap = 1;
        }
    }
    if (lunarMonth > 12) lunarMonth -= 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
    return [lunarYear, lunarMonth, lunarDay, lunarLeap];
}

// ---------- THÔNG TIN NGÀY (TỔNG HỢP) ----------
function getDateInfo(jdn) {
    const { year, month, day } = jdnToGregorian(jdn);
    const [lunarYear, lunarMonth, lunarDay, lunarLeap] = convertSolarToLunar(day, month, year, 12);
    const tietKhi = getTietKhi(jdn);
    const canNgay = (jdn + 9) % 10;
    const chiNgay = (jdn + 1) % 12;
    return {
        jdn,
        solarDay: day, solarMonth: month, solarYear: year,
        lunarDay, lunarMonth, lunarYear, lunarLeap,
        dayCanChi: THIEN_CAN[canNgay] + " " + DIA_CHI[chiNgay],
        monthCanChi: THIEN_CAN[(lunarYear * 12 + lunarMonth + 3) % 10] + " " + DIA_CHI[(lunarMonth + 1) % 12],
        yearCanChi: THIEN_CAN[(lunarYear + 6) % 10] + " " + DIA_CHI[(lunarYear + 8) % 12],
        tietKhi
    };
}

// ---------- CAN CHI GIỜ ----------
function getHourCanChi(dayCan, hour) {
    const canNgayIndex = THIEN_CAN.indexOf(dayCan);
    const canGioTyDauIndex = (canNgayIndex % 5) * 2;
    const chiGioIndex = CHI_TO_INDEX[HOUR_TO_CHI[hour]];
    const canGioIndex = (canGioTyDauIndex + chiGioIndex) % 10;
    return THIEN_CAN[canGioIndex] + " " + DIA_CHI[chiGioIndex];
}

// ---------- MÙNG 1 TẾT ÂM LỊCH ----------
function getLunarNewYearJDN(lunarYear) {
    const a11 = getLunarMonth11(lunarYear - 1);
    const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    return getNewMoonDay(k + 2);
}

// ---------- EQUATION OF TIME ----------
function calculateEquationOfTime(jdn) {
    const n = jdn - 2451545.0;
    const L = (280.46061837 + 0.98564736629 * n) % 360;
    const g = (357.52911 + 0.98560028 * n) % 360;
    const g_rad = g * Math.PI / 180;
    const lambda = L + 1.914602 * Math.sin(g_rad) + 0.019993 * Math.sin(2 * g_rad) + 0.000289 * Math.sin(3 * g_rad);
    const obliq = (23.439291 - 0.00000036 * n) * Math.PI / 180;
    const alpha = Math.atan2(Math.cos(obliq) * Math.sin(lambda * Math.PI / 180), Math.cos(lambda * Math.PI / 180));
    let eot_minutes = 4 * ((L * Math.PI / 180 - alpha) * 180 / Math.PI);
    if (eot_minutes > 20) eot_minutes -= 1440;
    if (eot_minutes < -20) eot_minutes += 1440;
    return eot_minutes;
}

// ---------- LẬP XUÂN ----------
const lapXuanCache = {};
function getLapXuanJDN(year) {
    if (lapXuanCache[year]) return lapXuanCache[year];
    let jdn = getJulianDayNumber(20, 1, year);
    for (let i = 0; i < 30; i++) {
        if (getTietKhi(jdn + i) === 'Lập xuân') {
            return lapXuanCache[year] = jdn + i;
        }
    }
    return getJulianDayNumber(4, 2, year);
}

// ---------- CHÍNH NGỌ (SOLAR NOON) ----------
let longitudeCache = null;
let lastLocationName = '';

async function getSolarNoon(jdn, locationName) {
    if (!locationName) return "N/A";
    if (locationName !== lastLocationName) {
        longitudeCache = null;
        lastLocationName = locationName;
    }
    if (longitudeCache === null) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        try {
            if (typeof fetch === 'undefined') {
                longitudeCache = 105.8;
            } else {
                const geoResponse = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`,
                    { signal: controller.signal }
                );
                const geoData = await geoResponse.json();
                if (!geoData || geoData.length === 0) {
                    longitudeCache = 'error';
                    return "N/A (Lỗi vị trí)";
                }
                longitudeCache = parseFloat(geoData[0].lon);
            }
        } catch (error) {
            longitudeCache = 'error';
            return "N/A (Lỗi API hoặc Timeout)";
        } finally {
            clearTimeout(timeoutId);
        }
    }
    if (longitudeCache === 'error') return "N/A (Lỗi)";
    const eotMinutes = calculateEquationOfTime(jdn);
    const solarNoonDecimalHours = 12 - (longitudeCache / 15) - (eotMinutes / 60) + TIME_ZONE;
    const hours = Math.floor(solarNoonDecimalHours);
    const minutes = Math.round((solarNoonDecimalHours - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// ---------- CAN CHI NĂM ----------
function getYearCanChiInfo(year) {
    if (!year || isNaN(year)) return { canChi: 'N/A', lacThuNapAm: 'N/A', lucThapNapAm: 'N/A' };
    const canChi = THIEN_CAN[(year + 6) % 10] + " " + DIA_CHI[(year + 8) % 12];
    return {
        canChi,
        lacThuNapAm: LAC_THU_NAP_AM_MAP[canChi] || "N/A",
        lucThapNapAm: LUC_THAP_NAP_AM_MAP[canChi] || "N/A"
    };
}

// ---------- TIẾT KHÍ → THÁNG ----------
function getTietKhiMonth(tietKhi) {
    return TIET_KHI_MONTH_MAP[tietKhi] || 'N/A';
}
