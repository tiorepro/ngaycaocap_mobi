// ==========================================
// MOBILE-UI.JS – Giao diện & Xử lý Mobile
// ==========================================

const MOBILE_STATE = {
    rangeMonths: 3,
    optLevel: 'cao',
    inputData: null,
    allDates: [],
    filteredDates: [],
    displayCount: 15,
    selectedDays: {},
    selectedHours: {},
    filterState: null,
};

// ==================== TOAST ====================
function showToast(msg, duration = 2500) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), duration);
}

// ==================== SECTION TOGGLE ====================
function toggleSection(bodyId) {
    const body = document.getElementById(bodyId);
    const chevron = document.getElementById(bodyId + '-chevron');
    if (!body || !chevron) return;
    const isOpen = body.classList.contains('m-section-body--open');
    if (isOpen) {
        body.classList.remove('m-section-body--open');
        chevron.textContent = '▶';
    } else {
        body.classList.add('m-section-body--open');
        chevron.textContent = '▼';
    }
}

// ==================== ACCORDION TOGGLE ====================
function toggleAccordion(bodyId) {
    const body = document.getElementById(bodyId);
    const chevron = document.getElementById(bodyId + '-chevron');
    if (!body || !chevron) return;
    if (body.style.display === 'none') {
        body.style.display = 'block';
        chevron.textContent = '▼';
    } else {
        body.style.display = 'none';
        chevron.textContent = '▶';
    }
}

// ==================== RANGE & OPT LEVEL ====================
function setRange(months, btn) {
    MOBILE_STATE.rangeMonths = months;
    document.querySelectorAll('#section-input .m-range-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function setOptLevel(level, btn) {
    MOBILE_STATE.optLevel = level;
    document.querySelectorAll('[data-opt-level]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ==================== HANDLE VIEW RESULT ====================
async function handleViewResult() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';
    await new Promise(r => setTimeout(r, 30));

    try {
        const birthYear = parseInt(document.getElementById('m-birth-year').value);
        const toaDo = parseFloat(document.getElementById('m-toa-do').value);
        const viewYear = parseInt(document.getElementById('m-view-year').value);
        const locationName = document.getElementById('m-location').value.trim();

        if (isNaN(birthYear) || isNaN(toaDo) || isNaN(viewYear)) {
            showToast('⚠️ Vui lòng nhập đầy đủ: Năm sinh, Tọa độ, Năm xem');
            overlay.style.display = 'none';
            return;
        }

        const birthInfo = getYearCanChiInfo(birthYear);
        const toaInfo = findDataByDegree(toaDo);
        const yearInfo = getYearCanChiInfo(viewYear);
        const satsInfo = calculateAllYearlySats(viewYear);

        if (!toaInfo) {
            showToast('⚠️ Không tìm thấy dữ liệu cho độ số này');
            overlay.style.display = 'none';
            return;
        }

        const hanhTuoiArr = getHanhFromCanChi(birthInfo.canChi);
        const vanTuoiArr = getVanFromCanChi(birthInfo.canChi);
        const hanhToaArr = getHanhFromCanChi(toaInfo.canChi);
        const vanToaArr = getVanFromCanChi(toaInfo.canChi);

        // [FIXED P2.7] Clear selected khi đổi input data
        MOBILE_STATE.selectedDays = {};
        MOBILE_STATE.selectedHours = {};
        MOBILE_STATE.filteredDates = [];
        MOBILE_STATE.displayCount = 15;

        MOBILE_STATE.inputData = {
            birthYear, toaDo, viewYear, locationName,
            birthInfo, toaInfo, yearInfo, satsInfo,
            hanhTuoiArr, vanTuoiArr, hanhToaArr, vanToaArr,
        };

        renderInputCards();

        if (!MOBILE_STATE.filterUIInitialized) {
            createFilterUI();
            MOBILE_STATE.filterUIInitialized = true;
        } else {
            updateFilterUIWithData();
        }

        await generateAllDates();

        document.getElementById('input-results').style.display = 'block';
        document.getElementById('results-container').innerHTML = '<div class="m-empty-state"><span style="font-size:48px;">🔍</span><p>Đã sẵn sàng! Mở bộ lọc và nhấn "ÁP DỤNG" để lọc ngày giờ</p></div>';
        document.getElementById('results-bar').style.display = 'none';
        document.getElementById('btn-load-more').style.display = 'none';
        document.getElementById('result-count-badge').style.display = 'none';
        updateSelectedCount();

        showToast('✅ Đã sẵn sàng! Mở bộ lọc để chọn tiêu chí');
        overlay.style.display = 'none';

    } catch (err) {
        console.error(err);
        overlay.style.display = 'none';
        showToast('❌ Lỗi: ' + err.message);
    }
}

// ==================== RENDER INPUT CARDS ====================
function renderInputCards() {
    const d = MOBILE_STATE.inputData;
    if (!d) return;
    renderCardTuoi(d);
    renderCardToa(d);
    renderCardNam(d);
    renderCardNguHoangThang(d);
    renderCardThaiDuongAm(d);
}

function renderCardTuoi(d) {
    const card = document.getElementById('card-tuoi');
    const canChi = d.birthInfo.canChi;
    const queName = (typeof huyenKhongQueMap !== 'undefined' && huyenKhongQueMap[canChi]) ? huyenKhongQueMap[canChi].join(' / ') : 'N/A';
    const hanh = d.hanhTuoiArr.join(', ');
    const van = d.vanTuoiArr.join(', ');
    const ltna = LAC_THU_NAP_AM_MAP[canChi] || 'N/A';
    const lctna = LUC_THAP_NAP_AM_MAP[canChi] || 'N/A';

    card.innerHTML = `
        <div class="m-info-row"><span class="m-info-label">Can Chi</span><span class="m-info-value">${canChi}</span></div>
        <div class="m-info-row"><span class="m-info-label">Lục Thập Nạp Âm</span><span class="m-info-value">${lctna}</span></div>
        <div class="m-info-row"><span class="m-info-label">Lạc Thư Nạp Âm</span><span class="m-info-value">${ltna}</span></div>
        <div class="m-info-row"><span class="m-info-label">Hành</span><span class="m-info-value text-gold">${hanh}</span></div>
        <div class="m-info-row"><span class="m-info-label">Vận</span><span class="m-info-value text-info">${van}</span></div>
        <div class="m-info-row"><span class="m-info-label">Quẻ HKĐQ</span><span class="m-info-value">${queName}</span></div>
    `;
}

function renderCardToa(d) {
    const card = document.getElementById('card-toa');
    const toaInfo = d.toaInfo;
    const canChi = toaInfo.canChi;
    const hanh = d.hanhToaArr.join(', ');
    const van = d.vanToaArr.join(', ');
    const queName = (typeof huyenKhongQueMap !== 'undefined' && huyenKhongQueMap[canChi]) ? huyenKhongQueMap[canChi].join(' / ') : 'N/A';

    const huongPalaceName = huongToPalaceNameMap[toaInfo.huong];
    const oppositeNguHoang = palaceOpposites[d.satsInfo.nguHoangNam];
    const phamNguHoang = (huongPalaceName === d.satsInfo.nguHoangNam || huongPalaceName === oppositeNguHoang);
    const phamThaiTue = d.satsInfo.thaiTue.split(' - ').includes(toaInfo.son);
    const phamTamSat = getTamSatSonsForYear(d.satsInfo.yearChi).includes(toaInfo.son);

    // [FIXED P0] Bát Sát: dùng BAT_SAT_NAM_CHI_MAP thay vì BAT_SAT_HUONG_MAP
    const batSatHuongByYear = BAT_SAT_NAM_CHI_MAP[d.satsInfo.yearChi];
    const phamBatSat = batSatHuongByYear && toaInfo.huong === batSatHuongByYear;

    let phamHtml = '';
    phamHtml += `<div class="m-info-row"><span class="m-info-label">Ngũ Hoàng</span><span class="m-info-value">${phamNguHoang ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;
    phamHtml += `<div class="m-info-row"><span class="m-info-label">Thái Tuế</span><span class="m-info-value">${phamThaiTue ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;
    phamHtml += `<div class="m-info-row"><span class="m-info-label">Tam Sát</span><span class="m-info-value">${phamTamSat ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;
    phamHtml += `<div class="m-info-row"><span class="m-info-label">Bát Sát</span><span class="m-info-value">${phamBatSat ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;

    card.innerHTML = `
        <div class="m-info-row"><span class="m-info-label">Độ số</span><span class="m-info-value">${d.toaDo}°</span></div>
        <div class="m-info-row"><span class="m-info-label">Sơn / Hướng</span><span class="m-info-value">${toaInfo.son} | ${toaInfo.huong}</span></div>
        <div class="m-info-row"><span class="m-info-label">Phương</span><span class="m-info-value">${toaInfo.phuong}</span></div>
        <div class="m-info-row"><span class="m-info-label">Can Chi</span><span class="m-info-value">${canChi}</span></div>
        <div class="m-info-row"><span class="m-info-label">Hành</span><span class="m-info-value text-gold">${hanh}</span></div>
        <div class="m-info-row"><span class="m-info-label">Vận</span><span class="m-info-value text-info">${van}</span></div>
        <div class="m-info-row"><span class="m-info-label">Quẻ HKĐQ</span><span class="m-info-value">${queName}</span></div>
        ${phamHtml}
    `;
}

function renderCardNam(d) {
    const card = document.getElementById('card-nam');
    const satsInfo = d.satsInfo;
    const yearInfo = d.yearInfo;
    const canChi = yearInfo.canChi;
    const ltna = LAC_THU_NAP_AM_MAP[canChi] || 'N/A';
    const lctna = LUC_THAP_NAP_AM_MAP[canChi] || 'N/A';
    const nguHoangSon = (palaceToSonMap[satsInfo.nguHoangNam] || []).join(', ');
    const nhiHacSon = (palaceToSonMap[satsInfo.nhiHacNam] || []).join(', ');

    card.innerHTML = `
        <div class="m-info-row"><span class="m-info-label">Năm ÂL</span><span class="m-info-value text-gold">${d.viewYear} – ${canChi}</span></div>
        <div class="m-info-row"><span class="m-info-label">Lục Thập Nạp Âm</span><span class="m-info-value">${lctna}</span></div>
        <div class="m-info-row"><span class="m-info-label">Lạc Thư Nạp Âm</span><span class="m-info-value">${ltna}</span></div>
        <div class="m-info-row"><span class="m-info-label">Ngũ Hoàng (Năm)</span><span class="m-info-value text-warning">${satsInfo.nguHoangNam} – ${nguHoangSon}</span></div>
        <div class="m-info-row"><span class="m-info-label">Nhị Hắc (Năm)</span><span class="m-info-value">${satsInfo.nhiHacNam} – ${nhiHacSon}</span></div>
        <div class="m-info-row"><span class="m-info-label">Thái Tuế</span><span class="m-info-value">${satsInfo.thaiTue}</span></div>
        <div class="m-info-row"><span class="m-info-label">Xung Thái Tuế</span><span class="m-info-value text-danger">${satsInfo.tuePha}</span></div>
        <div class="m-info-row"><span class="m-info-label">Tam Sát</span><span class="m-info-value">${getDetailedTamSatInfo(satsInfo.yearChi)}</span></div>
        <div class="m-info-row"><span class="m-info-label">Bát Sát (năm)</span><span class="m-info-value text-danger">${BAT_SAT_NAM_CHI_MAP[satsInfo.yearChi] || 'Không có'}</span></div>
    `;
}

function renderCardNguHoangThang(d) {
    const card = document.getElementById('card-nguhoang-thang');
    const satsInfo = d.satsInfo;
    let html = '<table class="m-mini-table"><thead><tr><th>Tháng</th>';
    for (let i = 1; i <= 12; i++) html += `<th>${i}</th>`;
    html += '</tr></thead><tbody>';

    html += '<tr><td style="font-weight:700;color:#ffc107;">NH</td>';
    for (let i = 1; i <= 12; i++) {
        const p = satsInfo.monthlyStars[i].nguHoang;
        const sons = (palaceToSonMap[p] || []).join(',');
        html += `<td class="highlight-5">${p}<br><small>${sons}</small></td>`;
    }
    html += '</tr>';

    html += '<tr><td style="font-weight:700;">2H</td>';
    for (let i = 1; i <= 12; i++) {
        const p = satsInfo.monthlyStars[i].nhiHac;
        const sons = (palaceToSonMap[p] || []).join(',');
        html += `<td class="highlight-2">${p}<br><small>${sons}</small></td>`;
    }
    html += '</tr>';

    html += '</tbody></table>';
    card.innerHTML = html;
}

function renderCardThaiDuongAm(d) {
    const card = document.getElementById('card-thaiduongam');
    const son = d.toaInfo.son;
    const data = THAI_DUONG_AM_DATA[son];

    if (!data) {
        card.innerHTML = '<p class="text-muted">Không có dữ liệu cho sơn này</p>';
        return;
    }

    card.innerHTML = `
        <div class="m-info-row"><span class="m-info-label">Tọa sơn</span><span class="m-info-value text-gold">${son}</span></div>
        <div class="m-info-row"><span class="m-info-label">☀ TD đáo tọa</span><span class="m-info-value text-warning">${data.tdDaoToa || '-'}</span></div>
        <div class="m-info-row"><span class="m-info-label">☀ TD đáo hướng</span><span class="m-info-value text-warning">${data.tdDaoHuong || '-'}</span></div>
        <div class="m-info-row"><span class="m-info-label">☀ TD đáo Tam Hợp</span><span class="m-info-value">${(data.tdDaoTamHop || '-').replace(/\n/g, '<br>')}</span></div>
        <div class="m-info-row"><span class="m-info-label">🌙 TÂ đáo tọa</span><span class="m-info-value text-info">${data.taDaoToa || '-'}</span></div>
        <div class="m-info-row"><span class="m-info-label">🌙 TÂ đáo hướng</span><span class="m-info-value text-info">${data.taDaoHuong || '-'}</span></div>
    `;
}

// ==================== CREATE FILTER UI ====================
function createFilterUI() {
    createFilterTranh();
    createFilterChon();
    createFilterTHBL();
    createFilterThaiDuongAm();
    createFilterTietKhi();
    createFilterCanChi();
    createFilterHanhVanPairs();
    createFilterHanhVanPillar();
    createFilterVaiTro();
    createFilterGiaDinh();
    createFilterThatTinh();
    createFilterHuynhDe();
}

function updateFilterUIWithData() {
    createFilterTietKhi();
}

// ---- 1A: TRÁNH ----
function createFilterTranh() {
    const container = document.getElementById('filter-tranh');
    const items = [
        { id: 'tranh-nguHoang', label: 'Ngũ Hoàng', apply: 'Năm CHI, Tháng CHI' },
        { id: 'tranh-nhiHac', label: 'Nhị Hắc (cảnh báo)', apply: 'Năm CHI, Tháng CHI' },
        { id: 'tranh-xungThaiTue', label: 'Xung Thái Tuế', apply: 'Năm CHI, Tháng CHI, Ngày CHI, Giờ CHI' },
        { id: 'tranh-tamSat', label: 'Tam Sát', apply: 'Năm CHI, Tháng CHI, Ngày CHI, Giờ CHI' },
        { id: 'tranh-batSat', label: 'Bát Sát', apply: 'Năm CHI, Tháng CHI, Ngày CHI, Giờ CHI' },
        { id: 'tranh-xungToa', label: 'Xung Tọa', apply: 'Năm CHI, Tháng CHI, Ngày CHI, Giờ CHI' },
        { id: 'tranh-xungTuoi', label: 'Xung Tuổi', apply: 'Năm CHI, Tháng CHI, Ngày CHI, Giờ CHI' },
    ];

    container.innerHTML = items.map(item => `
        <div class="m-filter-item">
            <input type="checkbox" id="${item.id}" onchange="updateFilterBadge()">
            <label for="${item.id}">${item.label}</label>
            <span class="m-filter-badge">${item.apply}</span>
        </div>
    `).join('');
}

// ---- 1B: CHỌN ----
function createFilterChon() {
    const container = document.getElementById('filter-chon');
    const items = [
        { id: 'chon-tuHop', label: 'Tự Hợp', apply: 'Tháng CHI, Ngày CAN+CHI, Giờ CAN+CHI' },
        { id: 'chon-sinhHop', label: 'Sinh Hợp', apply: 'Tháng CHI, Ngày CAN+CHI, Giờ CAN+CHI' },
        { id: 'chon-tamHop', label: 'Tam Hợp', apply: 'Tháng CHI, Ngày CHI, Giờ CHI' },
    ];

    container.innerHTML = items.map(item => `
        <div class="m-filter-item">
            <input type="checkbox" id="${item.id}" onchange="updateFilterBadge()">
            <label for="${item.id}">${item.label}</label>
            <span class="m-filter-badge">${item.apply}</span>
        </div>
    `).join('');
}

// ---- 1C: TAM HỢP BỔ LONG ----
function createFilterTHBL() {
    const container = document.getElementById('filter-thbl');
    const items = [
        { id: 'thbl-anCuc', label: 'Ấn Cục', apply: 'Tháng CHI, Ngày CAN+CHI, Giờ CAN+CHI' },
        { id: 'thbl-taiCuc', label: 'Tài Cục', apply: 'Tháng CHI, Ngày CAN+CHI, Giờ CAN+CHI' },
        { id: 'thbl-vuongCuc', label: 'Vượng Cục', apply: 'Tháng CHI, Ngày CAN+CHI, Giờ CAN+CHI' },
    ];

    container.innerHTML = items.map(item => `
        <div class="m-filter-item">
            <input type="checkbox" id="${item.id}" onchange="updateFilterBadge()">
            <label for="${item.id}">${item.label}</label>
            <span class="m-filter-badge">${item.apply}</span>
        </div>
    `).join('');
}

// ---- 1D: THÁI DƯƠNG / THÁI ÂM ----
function createFilterThaiDuongAm() {
    const container = document.getElementById('filter-thaiduongam');
    const items = [
        { id: 'tdta-tdDaoToa', label: 'Thái Dương đáo tọa' },
        { id: 'tdta-tdDaoHuong', label: 'Thái Dương đáo hướng' },
        { id: 'tdta-tdDaoTamHop', label: 'Thái Dương đáo Tam Hợp' },
        { id: 'tdta-taDaoToa', label: 'Thái Âm đáo tọa' },
        { id: 'tdta-taDaoHuong', label: 'Thái Âm đáo hướng' },
    ];

    container.innerHTML = items.map(item => `
        <div class="m-filter-item">
            <input type="checkbox" id="${item.id}" onchange="updateFilterBadge()">
            <label for="${item.id}">${item.label}</label>
        </div>
    `).join('');
}

// [FIXED P1] ---- 1E: TIẾT KHÍ - chỉ hiện tiết khí liên quan đến TD/TA đáo tọa ----
function createFilterTietKhi() {
    const container = document.getElementById('filter-tietkhi');
    let relevantTietKhi = [];

    if (MOBILE_STATE.inputData) {
        const son = MOBILE_STATE.inputData.toaInfo.son;
        const data = THAI_DUONG_AM_DATA[son];
        if (data) {
            const tietKhiSet = new Set();
            [data.tdDaoToa, data.tdDaoHuong, data.taDaoToa, data.taDaoHuong].forEach(tk => {
                if (tk && TIET_KHI.includes(tk)) tietKhiSet.add(tk);
            });
            if (data.tdDaoTamHop) {
                data.tdDaoTamHop.split('\n').forEach(line => {
                    const tk = line.split(' đáo ')[0];
                    if (tk && TIET_KHI.includes(tk)) tietKhiSet.add(tk);
                });
            }
            // Sắp xếp theo thứ tự trong năm
            relevantTietKhi = TIET_KHI.filter(tk => tietKhiSet.has(tk));
        }
    }

    // Fallback: nếu không có inputData, hiện tất cả 24 tiết khí
    if (relevantTietKhi.length === 0) {
        relevantTietKhi = [...TIET_KHI];
    }

    container.innerHTML = relevantTietKhi.map(tk => `
        <span class="m-chip" data-tietkhi="${tk}" onclick="toggleChip(this)">${tk}</span>
    `).join('');
}

// ---- 1G: LỌC CAN & CHI ----
function createFilterCanChi() {
    const canContainer = document.getElementById('filter-can');
    const chiContainer = document.getElementById('filter-chi');

    canContainer.innerHTML = THIEN_CAN.map(c => `
        <span class="m-chip" data-can="${c}" onclick="toggleChip(this)">${c}</span>
    `).join('');

    chiContainer.innerHTML = DIA_CHI.map(c => `
        <span class="m-chip" data-chi="${c}" onclick="toggleChip(this)">${c}</span>
    `).join('');
}

// ---- 2B + 2C: QUAN HỆ HÀNH & VẬN PAIRS ----
function createFilterHanhVanPairs() {
    const hanhContainer = document.getElementById('filter-hanh-pairs');
    const vanContainer = document.getElementById('filter-van-pairs');

    const pairLabels = {
        'tuoi-toa': 'Tuổi ↔ Tọa',
        'tuoi-ngay': 'Tuổi ↔ Ngày',
        'toa-ngay': 'Tọa ↔ Ngày',
        'ngay-gio': 'Ngày ↔ Giờ',
        'ngay-thang': 'Ngày ↔ Tháng',
        'ngay-nam': 'Ngày ↔ Năm',
        'thang-nam': 'Tháng ↔ Năm',
        'gio-ngay': 'Giờ ↔ Ngày',
    };

    const hanhRelations = ['Cùng Quái', 'Hợp Ngũ', 'Hợp Thập', 'Hợp Thập Ngũ', 'Hà Đồ', 'Sinh Nhập', 'Khắc Nhập'];
    const vanRelations = ['Cùng Quái', 'Hợp Ngũ', 'Hợp Thập', 'Hợp Thập Ngũ', 'Hà Đồ', 'Điên Đảo Ai Tinh'];

    function buildPairHTML(pairs, relations, prefix) {
        return Object.entries(pairs).map(([key, label]) => `
            <div class="m-pair-row">
                <span class="m-pair-label">${label}</span>
                <div class="m-pair-chips">
                    ${relations.map(r => `
                        <span class="m-pair-chip" data-pair="${prefix}-${key}" data-rel="${r}" onclick="togglePairChip(this)">${r}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    hanhContainer.innerHTML = buildPairHTML(pairLabels, hanhRelations, 'hanh');
    vanContainer.innerHTML = buildPairHTML(pairLabels, vanRelations, 'van');
}

// ---- 2D: HÀNH/VẬN THEO TRỤ ----
function createFilterHanhVanPillar() {
    const container = document.getElementById('filter-hanhvan-pillar');
    const pillars = ['tuoi', 'toa', 'ngay', 'thang', 'nam', 'gio'];
    const pillarLabels = { tuoi: 'Trụ Tuổi', toa: 'Trụ Tọa', ngay: 'Trụ Ngày', thang: 'Trụ Tháng', nam: 'Trụ Năm', gio: 'Trụ Giờ' };

    let html = '';
    pillars.forEach(p => {
        html += `<div class="m-pair-row">`;
        html += `<span class="m-pair-label">${pillarLabels[p]}</span>`;
        html += `<div style="display:flex;gap:8px;flex-wrap:wrap;">`;
        html += `<span style="font-size:0.7rem;color:var(--text-muted);">Hành:</span>`;
        for (let i = 1; i <= 9; i++) {
            html += `<span class="m-pair-chip" data-hanh-pillar="${p}" data-hanh-val="${i}" onclick="togglePairChip(this)">${i}</span>`;
        }
        html += `</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">`;
        html += `<span style="font-size:0.7rem;color:var(--text-muted);">Vận:</span>`;
        for (let i = 1; i <= 9; i++) {
            html += `<span class="m-pair-chip" data-van-pillar="${p}" data-van-val="${i}" onclick="togglePairChip(this)">${i}</span>`;
        }
        html += `</div></div>`;
    });
    container.innerHTML = html;
}

// ---- 3A: VAI TRÒ GIA ĐÌNH ----
function createFilterVaiTro() {
    const container = document.getElementById('filter-vaitro');
    const items = [
        { id: 'hkdq-phaiCoPhuMau', label: 'Phải có Phụ Mẫu (≥1 trụ)' },
        { id: 'hkdq-phaiCoTuTuc', label: 'Phải có Tử Tức (≥1 trụ)' },
        { id: 'hkdq-duPhuMauTuTuc', label: 'Có đủ Phụ Mẫu + Tử Tức' },
        { id: 'hkdq-khongKXD', label: 'Không trụ nào KXĐ (tạp khí)' },
        { id: 'hkdq-canBangAmDuong', label: 'Cân bằng Âm Dương (không Cô Âm/Dương)' },
        { id: 'hkdq-canBangTamTai', label: 'Tam Tài (Tuổi-Tọa-Ngày) cân bằng' },
    ];
    container.innerHTML = items.map(item => `
        <div class="m-filter-item">
            <input type="checkbox" id="${item.id}" onchange="updateFilterBadge()">
            <label for="${item.id}">${item.label}</label>
        </div>
    `).join('');
}

// ---- 3B: GIA ĐÌNH CỤ THỂ ----
function createFilterGiaDinh() {
    const container = document.getElementById('filter-giadinh');
    const families = [
        { name: 'Càn - Khôn', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] },
        { name: 'Khảm - Ly', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] },
        { name: 'Chấn - Tốn', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] },
        { name: 'Cấn - Đoài', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] },
        { name: 'Bĩ - Thái', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] },
        { name: 'Ký Tế - Vị Tế', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] },
        { name: 'Hằng - Ích', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] },
        { name: 'Tổn - Hàm', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] },
    ];

    let html = '';
    families.forEach(f => {
        html += `<div class="m-giadinh-row">`;
        html += `<span class="m-giadinh-name">${f.name}</span>`;
        html += `<div class="m-giadinh-chips">`;
        f.roles.forEach(r => {
            html += `<span class="m-pair-chip" data-giadinh="${f.name}" data-role="${r}" onclick="togglePairChip(this)">${r}</span>`;
        });
        html += `</div></div>`;
    });
    container.innerHTML = html;
}

// ---- 3C: THẤT TINH ----
function createFilterThatTinh() {
    const container = document.getElementById('filter-thattinh');
    container.innerHTML = `
        <div class="m-filter-item">
            <input type="checkbox" id="hkdq-phaiCoThatTinh" onchange="updateFilterBadge()">
            <label for="hkdq-phaiCoThatTinh">Phải có Thất Tinh Đả Kiếp (≥1 cặp)</label>
        </div>
        <div class="m-filter-item">
            <input type="checkbox" id="hkdq-khongThatTinh" onchange="updateFilterBadge()">
            <label for="hkdq-khongThatTinh">Không có Thất Tinh</label>
        </div>
    `;
}

// ---- 3E: HUYNH ĐỆ ----
function createFilterHuynhDe() {
    const container = document.getElementById('filter-huynhde');
    container.innerHTML = `
        <div class="m-filter-item">
            <input type="checkbox" id="hkdq-phaiCoHuynhDe" onchange="updateFilterBadge()">
            <label for="hkdq-phaiCoHuynhDe">Phải có Huynh Đệ (≥2 Tử Tức cùng gia đình)</label>
        </div>
        <div class="m-filter-item">
            <input type="checkbox" id="hkdq-khongHuynhDe" onchange="updateFilterBadge()">
            <label for="hkdq-khongHuynhDe">Không có Huynh Đệ</label>
        </div>
    `;
}

// ==================== CHIP TOGGLE ====================
function toggleChip(chip) {
    chip.classList.toggle('active');
    updateFilterBadge();
}

function togglePairChip(chip) {
    chip.classList.toggle('active');
    updateFilterBadge();
}

// ==================== GET FILTER STATE ====================
function getFilterState() {
    const state = {
        tranh: {},
        chon: {},
        thbl: {},
        tdta: {},
        tietKhi: [],
        can: [],
        chi: [],
        optLevel: MOBILE_STATE.optLevel,
        hanhPairs: {},
        vanPairs: {},
        hanhPillar: {},
        vanPillar: {},
        hkdq: {},
        giadinh: {},
    };

    ['tranh-nguHoang', 'tranh-nhiHac', 'tranh-xungThaiTue', 'tranh-tamSat', 'tranh-batSat', 'tranh-xungToa', 'tranh-xungTuoi'].forEach(id => {
        const el = document.getElementById(id);
        if (el) state.tranh[id.replace('tranh-', '')] = el.checked;
    });

    ['chon-tuHop', 'chon-sinhHop', 'chon-tamHop'].forEach(id => {
        const el = document.getElementById(id);
        if (el) state.chon[id.replace('chon-', '')] = el.checked;
    });

    ['thbl-anCuc', 'thbl-taiCuc', 'thbl-vuongCuc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) state.thbl[id.replace('thbl-', '')] = el.checked;
    });

    ['tdta-tdDaoToa', 'tdta-tdDaoHuong', 'tdta-tdDaoTamHop', 'tdta-taDaoToa', 'tdta-taDaoHuong'].forEach(id => {
        const el = document.getElementById(id);
        if (el) state.tdta[id.replace('tdta-', '')] = el.checked;
    });

    document.querySelectorAll('#filter-tietkhi .m-chip.active').forEach(chip => {
        state.tietKhi.push(chip.dataset.tietkhi);
    });

    document.querySelectorAll('#filter-can .m-chip.active').forEach(chip => state.can.push(chip.dataset.can));
    document.querySelectorAll('#filter-chi .m-chip.active').forEach(chip => state.chi.push(chip.dataset.chi));

    document.querySelectorAll('#filter-hanh-pairs .m-pair-chip.active').forEach(chip => {
        const pair = chip.dataset.pair.replace('hanh-', '');
        if (!state.hanhPairs[pair]) state.hanhPairs[pair] = [];
        state.hanhPairs[pair].push(chip.dataset.rel);
    });

    document.querySelectorAll('#filter-van-pairs .m-pair-chip.active').forEach(chip => {
        const pair = chip.dataset.pair.replace('van-', '');
        if (!state.vanPairs[pair]) state.vanPairs[pair] = [];
        state.vanPairs[pair].push(chip.dataset.rel);
    });

    document.querySelectorAll('.m-pair-chip.active[data-hanh-pillar]').forEach(chip => {
        const p = chip.dataset.hanhPillar;
        if (!state.hanhPillar[p]) state.hanhPillar[p] = [];
        state.hanhPillar[p].push(parseInt(chip.dataset.hanhVal));
    });

    document.querySelectorAll('.m-pair-chip.active[data-van-pillar]').forEach(chip => {
        const p = chip.dataset.vanPillar;
        if (!state.vanPillar[p]) state.vanPillar[p] = [];
        state.vanPillar[p].push(parseInt(chip.dataset.vanVal));
    });

    ['hkdq-phaiCoPhuMau', 'hkdq-phaiCoTuTuc', 'hkdq-duPhuMauTuTuc', 'hkdq-khongKXD', 'hkdq-canBangAmDuong', 'hkdq-canBangTamTai', 'hkdq-phaiCoThatTinh', 'hkdq-khongThatTinh', 'hkdq-phaiCoHuynhDe', 'hkdq-khongHuynhDe'].forEach(id => {
        const el = document.getElementById(id);
        if (el) state.hkdq[id.replace('hkdq-', '')] = el.checked;
    });

    document.querySelectorAll('.m-pair-chip.active[data-giadinh]').forEach(chip => {
        const gd = chip.dataset.giadinh;
        if (!state.giadinh[gd]) state.giadinh[gd] = [];
        state.giadinh[gd].push(chip.dataset.role);
    });

    return state;
}

// ==================== COUNT ACTIVE FILTERS ====================
function countActiveFilters(state) {
    let count = 0;
    if (state.tranh) count += Object.values(state.tranh).filter(Boolean).length;
    if (state.chon) count += Object.values(state.chon).filter(Boolean).length;
    if (state.thbl) count += Object.values(state.thbl).filter(Boolean).length;
    if (state.tdta) count += Object.values(state.tdta).filter(Boolean).length;
    count += state.tietKhi.length;
    count += state.can.length;
    count += state.chi.length;
    if (state.hanhPairs) count += Object.keys(state.hanhPairs).length;
    if (state.vanPairs) count += Object.keys(state.vanPairs).length;
    if (state.hanhPillar) count += Object.keys(state.hanhPillar).length;
    if (state.vanPillar) count += Object.keys(state.vanPillar).length;
    if (state.hkdq) count += Object.values(state.hkdq).filter(Boolean).length;
    if (state.giadinh) count += Object.keys(state.giadinh).length;
    return count;
}

function updateFilterBadge() {
    const state = getFilterState();
    const total = countActiveFilters(state);

    const badgeTotal = document.getElementById('filter-badge-total');
    badgeTotal.textContent = total;
    badgeTotal.style.display = total > 0 ? 'inline-flex' : 'none';

    updateLayerBadge('badge-layer1', countLayer1(state));
    updateLayerBadge('badge-layer2', countLayer2(state));
    updateLayerBadge('badge-layer3', countLayer3(state));
}

function countLayer1(state) {
    let c = 0;
    if (state.tranh) c += Object.values(state.tranh).filter(Boolean).length;
    if (state.chon) c += Object.values(state.chon).filter(Boolean).length;
    if (state.thbl) c += Object.values(state.thbl).filter(Boolean).length;
    if (state.tdta) c += Object.values(state.tdta).filter(Boolean).length;
    c += state.tietKhi.length;
    c += state.can.length;
    c += state.chi.length;
    return c;
}

function countLayer2(state) {
    let c = 0;
    if (state.hanhPairs) c += Object.keys(state.hanhPairs).length;
    if (state.vanPairs) c += Object.keys(state.vanPairs).length;
    if (state.hanhPillar) c += Object.keys(state.hanhPillar).length;
    if (state.vanPillar) c += Object.keys(state.vanPillar).length;
    return c;
}

function countLayer3(state) {
    let c = 0;
    if (state.hkdq) c += Object.values(state.hkdq).filter(Boolean).length;
    if (state.giadinh) c += Object.keys(state.giadinh).length;
    return c;
}

function updateLayerBadge(id, count) {
    const badge = document.getElementById(id);
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

// ==================== GENERATE ALL DATES ====================
async function generateAllDates() {
    const d = MOBILE_STATE.inputData;
    if (!d) return;

    const lunarYear = d.viewYear;
    const startJDN = getLunarNewYearJDN(lunarYear) - 15;

    let endJDN;
    const rangeMonths = MOBILE_STATE.rangeMonths;
    if (rangeMonths >= 12) {
        endJDN = getLunarNewYearJDN(lunarYear + 1) - 1 + 15;
    } else {
        endJDN = startJDN + rangeMonths * 31;
    }

    const dates = [];
    for (let jdn = startJDN; jdn <= endJDN; jdn++) {
        dates.push(getDateInfo(jdn));
    }

    MOBILE_STATE.allDates = dates;
}

// ==============================================
// [FIXED P2] HKĐQ HELPERS (dùng cho cả filter & modal)
// ==============================================
function layDanhSachQueMobile(canChi) {
    if (!canChi || canChi === 'N/A') return [];
    return (typeof huyenKhongQueMap !== 'undefined' && huyenKhongQueMap[canChi]) || [];
}

function giaDinhCuaQueMobile(tenQue) {
    if (typeof timThongTinQue !== 'function') return [];
    return [...new Set(timThongTinQue(tenQue).map(tt => tt.giaDinh))];
}

function thuThapHoBangChungMobile(tenTruHienTai, tatCaQueTheoTru) {
    const ho = new Set();
    Object.entries(tatCaQueTheoTru).forEach(([tenTru, dsQue]) => {
        if (tenTru === tenTruHienTai) return;
        (dsQue || []).forEach(q => {
            giaDinhCuaQueMobile(q).forEach(gd => ho.add(gd));
        });
    });
    return ho;
}

function chonQuePhanTichMobile(canChi, hoBangChung) {
    const ques = layDanhSachQueMobile(canChi);
    if (ques.length === 0) return { queChon: '', queConLai: [] };

    const quePhuMau = ques.find(q =>
        typeof timThongTinQue === 'function' &&
        timThongTinQue(q).some(tt => tt.vaiTroTongQuat === 'Phụ Mẫu')
    );
    if (quePhuMau) {
        return { queChon: quePhuMau, queConLai: ques.filter(q => q !== quePhuMau) };
    }
    if (ques.length === 1) return { queChon: ques[0], queConLai: [] };

    const unique = ques.filter(q => {
        const matched = giaDinhCuaQueMobile(q).filter(gd => hoBangChung && hoBangChung.has(gd));
        return matched.length === 1;
    });
    const queChon = unique.length === 1 ? unique[0] : ques[0];
    return { queChon, queConLai: ques.filter(q => q !== queChon) };
}

// [FIXED P0] Check xem có filter HKĐQ nào được bật không
function hasHkdqFilters(state) {
    if (!state || !state.hkdq && !state.giadinh) return false;
    if (state.hkdq && Object.values(state.hkdq).some(Boolean)) return true;
    if (state.giadinh && Object.keys(state.giadinh).length > 0) return true;
    return false;
}

// [FIXED P0] Kiểm tra điều kiện HKĐQ cho một kết quả phân tích
function checkHkdqConditions(ketQua, state) {
    const h = state.hkdq || {};
    const gd = state.giadinh || {};

    // Phải có Phụ Mẫu
    if (h.phaiCoPhuMau && ketQua.thongKeVaiTro['Phụ Mẫu'] < 1) return false;

    // Phải có Tử Tức
    if (h.phaiCoTuTuc && ketQua.thongKeVaiTro['Tử Tức'] < 1) return false;

    // Đủ Phụ Mẫu + Tử Tức
    if (h.duPhuMauTuTuc && (ketQua.thongKeVaiTro['Phụ Mẫu'] < 1 || ketQua.thongKeVaiTro['Tử Tức'] < 1)) return false;

    // Không KXĐ
    if (h.khongKXD && ketQua.thongKeAmDuong['KXĐ'] > 0) return false;

    // Cân bằng Âm Dương 6 trụ
    if (h.canBangAmDuong) {
        if (ketQua.thongKeAmDuong['Dương'] > 0 && ketQua.thongKeAmDuong['Âm'] === 0) return false;
        if (ketQua.thongKeAmDuong['Âm'] > 0 && ketQua.thongKeAmDuong['Dương'] === 0) return false;
    }

    // Tam Tài cân bằng
    if (h.canBangTamTai) {
        let soAmTT = 0, soDuongTT = 0;
        ['Trụ Tuổi', 'Trụ Tọa', 'Trụ Ngày'].forEach(tenTru => {
            const kq = ketQua.ketQuaCacTru[tenTru];
            if (kq && kq.thongTinDuocChon && kq.trangThai !== 'KXĐ') {
                if (kq.thongTinDuocChon.amDuong === 'Âm') soAmTT++;
                if (kq.thongTinDuocChon.amDuong === 'Dương') soDuongTT++;
            }
        });
        if (soDuongTT > 0 && soAmTT === 0) return false;
        if (soAmTT > 0 && soDuongTT === 0) return false;
    }

    // Thất Tinh
    if (h.phaiCoThatTinh && ketQua.cacCapThatTinh.length === 0) return false;
    if (h.khongThatTinh && ketQua.cacCapThatTinh.length > 0) return false;

    // Huynh Đệ
    if (h.phaiCoHuynhDe && ketQua.thongKeVaiTro['Huynh Đệ'] < 2) return false;
    if (h.khongHuynhDe && ketQua.thongKeVaiTro['Huynh Đệ'] > 0) return false;

    // Gia đình cụ thể
    const gdKeys = Object.keys(gd);
    if (gdKeys.length > 0) {
        const familyRolesFound = {};
        Object.values(ketQua.ketQuaCacTru).forEach(kq => {
            if (kq && kq.thongTinDuocChon && kq.trangThai !== 'KXĐ') {
                const fam = kq.thongTinDuocChon.giaDinh;
                const vt = kq.thongTinDuocChon.vaiTroChiTiet;
                if (!familyRolesFound[fam]) familyRolesFound[fam] = new Set();
                if (vt.includes('Cha') || vt.includes('Mẹ')) {
                    familyRolesFound[fam].add(vt.includes('Cha') ? 'Cha' : 'Mẹ');
                } else if (vt.includes('Nam')) {
                    familyRolesFound[fam].add('Nam');
                } else if (vt.includes('Nữ')) {
                    familyRolesFound[fam].add('Nữ');
                }
            }
        });
        // Mỗi gia đình được chọn phải có ít nhất 1 role khớp
        let allMatched = true;
        for (const [famKey, requiredRoles] of Object.entries(gd)) {
            const found = familyRolesFound[famKey];
            if (!found) { allMatched = false; break; }
            if (!requiredRoles.some(r => found.has(r))) { allMatched = false; break; }
        }
        if (!allMatched) return false;
    }

    return true;
}

// ==================== APPLY ALL FILTERS ====================
// [FIXED P0] Đã thêm bước lọc HKĐQ
function applyAllFilters() {
    if (!MOBILE_STATE.inputData) {
        showToast('⚠️ Vui lòng nhập thông tin và nhấn "XEM KẾT QUẢ" trước');
        return;
    }

    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';

    // [FIXED P2.5] Dùng requestAnimationFrame thay setTimeout
    requestAnimationFrame(async () => {
        try {
            const d = MOBILE_STATE.inputData;
            const filterState = getFilterState();
            MOBILE_STATE.filterState = filterState;

            const toaInfo = d.toaInfo;
            const satsInfo = d.satsInfo;
            const birthInfo = d.birthInfo;
            const hanhTuoiArr = d.hanhTuoiArr;
            const vanTuoiArr = d.vanTuoiArr;
            const hanhToaArr = d.hanhToaArr;
            const vanToaArr = d.vanToaArr;

            const xungToaChi = LUC_XUNG_MAP[toaInfo.canChi ? toaInfo.canChi.split(' ')[1] : ''] || '';
            const tuoiChi = birthInfo.canChi ? birthInfo.canChi.split(' ')[1] : '';
            const xungTuoiChi = LUC_XUNG_MAP[tuoiChi] || '';
            const phuong = toaInfo.phuong;

            const tuHopMap = { 'ĐÔNG': { can: ['Giáp', 'Ất'], chi: ['Dần', 'Mão', 'Thìn'] }, 'TÂY': { can: ['Canh', 'Tân'], chi: ['Thân', 'Dậu', 'Tuất'] }, 'NAM': { can: ['Bính', 'Đinh'], chi: ['Tị', 'Ngọ', 'Mùi'] }, 'BẮC': { can: ['Nhâm', 'Quý'], chi: ['Hợi', 'Tý', 'Sửu'] } };
            const sinhHopMap = { 'ĐÔNG': { can: ['Nhâm', 'Quý'], chi: ['Hợi', 'Tý', 'Sửu'] }, 'TÂY': { can: ['Mậu', 'Kỷ'], chi: ['Thìn', 'Tuất', 'Sửu', 'Mùi'] }, 'NAM': { can: ['Giáp', 'Ất'], chi: ['Dần', 'Mão', 'Thìn'] }, 'BẮC': { can: ['Canh', 'Tân'], chi: ['Thân', 'Dậu', 'Tuất'] } };
            const tamHopMap = { 'ĐÔNG': ['Hợi', 'Mão', 'Mùi'], 'TÂY': ['Tị', 'Dậu', 'Sửu'], 'NAM': ['Dần', 'Ngọ', 'Tuất'], 'BẮC': ['Thân', 'Tý', 'Thìn'] };

            const tuHopData = tuHopMap[phuong] || { can: [], chi: [] };
            const sinhHopData = sinhHopMap[phuong] || { can: [], chi: [] };
            const tamHopData = tamHopMap[phuong] || [];

            const thblCan = tamHopBoLongCanMap[toaInfo.huong] || '';
            const thblChiAn = tamHopBoLongChiMap['Ấn Cục'][toaInfo.huong] || [];
            const thblChiTai = tamHopBoLongChiMap['Tài Cục'][toaInfo.huong] || [];
            const thblChiVuong = tamHopBoLongChiMap['Vượng Cục'][toaInfo.huong] || [];

            const son = toaInfo.son;
            const tdtaData = THAI_DUONG_AM_DATA[son];

            const filtered = [];
            const needHkdqCheck = hasHkdqFilters(filterState);

            for (const dateInfo of MOBILE_STATE.allDates) {
                const dayCan = dateInfo.dayCanChi.split(' ')[0];
                const dayChi = dateInfo.dayCanChi.split(' ')[1];
                const lunarMonth = dateInfo.lunarMonth;
                const monthIndex = lunarMonth - 1;
                const monthChi = tietKhiMonthChi[monthIndex] || '';

                // ---- LỌC TRÁNH ----
                let skipDay = false;

                if (filterState.tranh.nguHoang) {
                    const monthlyNH = satsInfo.monthlyStars[lunarMonth];
                    if (monthlyNH) {
                        const nhSons = palaceToSonMap[monthlyNH.nguHoang] || [];
                        if (nhSons.includes(dayChi) || nhSons.includes(monthChi)) skipDay = true;
                    }
                }

                if (filterState.tranh.xungThaiTue) {
                    const tuePhaChi = satsInfo.tuePha.split(' - ')[1];
                    if (tuePhaChi && (dayChi === tuePhaChi || monthChi === tuePhaChi)) skipDay = true;
                }

                if (filterState.tranh.tamSat) {
                    const tamSatSons = getTamSatSonsForYear(satsInfo.yearChi);
                    if (tamSatSons.includes(dayChi) || tamSatSons.includes(monthChi)) skipDay = true;
                }

                if (filterState.tranh.batSat) {
                    const batSatChi = BAT_SAT_HUONG_MAP[toaInfo.huong] || '';
                    if (batSatChi && (dayChi === batSatChi || monthChi === batSatChi)) skipDay = true;
                }

                if (filterState.tranh.xungToa && xungToaChi) {
                    if (dayChi === xungToaChi || monthChi === xungToaChi) skipDay = true;
                }

                if (filterState.tranh.xungTuoi && xungTuoiChi) {
                    if (dayChi === xungTuoiChi || monthChi === xungTuoiChi) skipDay = true;
                }

                if (skipDay) continue;

                // ---- LỌC CHỌN ----
                let dayMatches = true;

                if (filterState.chon.tuHop) {
                    const hasTuHopCan = tuHopData.can.includes(dayCan);
                    const hasTuHopChi = tuHopData.chi.includes(dayChi) || tuHopData.chi.includes(monthChi);
                    if (!hasTuHopCan && !hasTuHopChi) dayMatches = false;
                }

                if (filterState.chon.sinhHop) {
                    const hasSinhHopCan = sinhHopData.can.includes(dayCan);
                    const hasSinhHopChi = sinhHopData.chi.includes(dayChi) || sinhHopData.chi.includes(monthChi);
                    if (!hasSinhHopCan && !hasSinhHopChi) dayMatches = false;
                }

                if (filterState.chon.tamHop) {
                    if (!tamHopData.includes(dayChi) && !tamHopData.includes(monthChi)) dayMatches = false;
                }

                if (filterState.thbl.anCuc) {
                    if (thblCan && dayCan !== thblCan && !thblChiAn.includes(dayChi) && !thblChiAn.includes(monthChi)) dayMatches = false;
                }
                if (filterState.thbl.taiCuc) {
                    if (thblCan && dayCan !== thblCan && !thblChiTai.includes(dayChi) && !thblChiTai.includes(monthChi)) dayMatches = false;
                }
                if (filterState.thbl.vuongCuc) {
                    if (thblCan && dayCan !== thblCan && !thblChiVuong.includes(dayChi) && !thblChiVuong.includes(monthChi)) dayMatches = false;
                }

                if (filterState.tietKhi.length > 0) {
                    if (!filterState.tietKhi.includes(dateInfo.tietKhi)) dayMatches = false;
                }

                if (tdtaData) {
                    if (filterState.tdta.tdDaoToa && dateInfo.tietKhi !== tdtaData.tdDaoToa) dayMatches = false;
                    if (filterState.tdta.tdDaoHuong && dateInfo.tietKhi !== tdtaData.tdDaoHuong) dayMatches = false;
                    if (filterState.tdta.taDaoToa && dateInfo.tietKhi !== tdtaData.taDaoToa) dayMatches = false;
                    if (filterState.tdta.taDaoHuong && dateInfo.tietKhi !== tdtaData.taDaoHuong) dayMatches = false;
                    if (filterState.tdta.tdDaoTamHop && tdtaData.tdDaoTamHop) {
                        const tamHopTKs = tdtaData.tdDaoTamHop.split('\n').map(l => l.split(' đáo ')[0]).filter(Boolean);
                        if (!tamHopTKs.includes(dateInfo.tietKhi)) dayMatches = false;
                    }
                }

                if (filterState.can.length > 0 && !filterState.can.includes(dayCan)) dayMatches = false;
                if (filterState.chi.length > 0 && !filterState.chi.includes(dayChi)) dayMatches = false;

                if (!dayMatches) continue;

                // ---- TÍNH THÁNG/NĂM TK ----
                const lapXuanJDN = getLapXuanJDN(dateInfo.solarYear);
                const tietKhiYear = dateInfo.jdn < lapXuanJDN ? dateInfo.solarYear - 1 : dateInfo.solarYear;
                const namCanChiTK = getYearCanChiInfo(tietKhiYear).canChi;
                const tietKhiMonthNum = parseInt(getTietKhiMonth(dateInfo.tietKhi));
                let thangCanChiTK = 'N/A';
                if (!isNaN(tietKhiMonthNum)) {
                    const canNamTKIndex = (tietKhiYear + 6) % 10;
                    const canThangDauIndex = [2, 4, 6, 8, 0][canNamTKIndex % 5];
                    const canThangTKIndex = (canThangDauIndex + tietKhiMonthNum - 1) % 10;
                    thangCanChiTK = THIEN_CAN[canThangTKIndex] + " " + tietKhiMonthChi[tietKhiMonthNum - 1];
                }

                const hanhNgayArr = getHanhFromCanChi(dateInfo.dayCanChi);
                const vanNgayArr = getVanFromCanChi(dateInfo.dayCanChi);
                const hanhThangArr = getHanhFromCanChi(thangCanChiTK);
                const vanThangArr = getVanFromCanChi(thangCanChiTK);
                const hanhNamArr = getHanhFromCanChi(namCanChiTK);
                const vanNamArr = getVanFromCanChi(namCanChiTK);

                // ---- LỌC GIỜ ----
                const passingHours = [];
                const hours = [
                    { chi: 'Tý', hour: 23 }, { chi: 'Sửu', hour: 1 }, { chi: 'Dần', hour: 3 },
                    { chi: 'Mão', hour: 5 }, { chi: 'Thìn', hour: 7 }, { chi: 'Tị', hour: 9 },
                    { chi: 'Ngọ', hour: 11 }, { chi: 'Mùi', hour: 13 }, { chi: 'Thân', hour: 15 },
                    { chi: 'Dậu', hour: 17 }, { chi: 'Tuất', hour: 19 }, { chi: 'Hợi', hour: 21 },
                ];

                for (const h of hours) {
                    const hourCanChiText = getHourCanChi(dayCan, h.hour);
                    const hourChi = hourCanChiText.split(' ')[1];

                    let skipHour = false;
                    if (filterState.tranh.xungThaiTue) {
                        const tuePhaChi = satsInfo.tuePha.split(' - ')[1];
                        if (tuePhaChi && hourChi === tuePhaChi) skipHour = true;
                    }
                    if (filterState.tranh.tamSat) {
                        const tamSatSons = getTamSatSonsForYear(satsInfo.yearChi);
                        if (tamSatSons.includes(hourChi)) skipHour = true;
                    }
                    if (filterState.tranh.batSat) {
                        const batSatChi = BAT_SAT_HUONG_MAP[toaInfo.huong] || '';
                        if (batSatChi && hourChi === batSatChi) skipHour = true;
                    }
                    if (filterState.tranh.xungToa && xungToaChi && hourChi === xungToaChi) skipHour = true;
                    if (filterState.tranh.xungTuoi && xungTuoiChi && hourChi === xungTuoiChi) skipHour = true;

                    if (filterState.chi.length > 0 && !filterState.chi.includes(hourChi)) skipHour = true;
                    if (filterState.chon.tamHop && !tamHopData.includes(hourChi)) skipHour = true;

                    if (skipHour) continue;

                    const hanhGioArr = getHanhFromCanChi(hourCanChiText);
                    const vanGioArr = getVanFromCanChi(hourCanChiText);

                    let totalScore = 0;
                    let bestHanhRel = '';
                    let bestVanRel = '';

                    if (hanhGioArr.length > 0 && hanhNgayArr.length > 0) {
                        const rels = [...checkHanhRelations(hanhGioArr[0], hanhNgayArr[0]), ...checkDirectedRelations(hanhGioArr[0], hanhNgayArr[0])];
                        const score = getBestScore(rels);
                        totalScore += score;
                        bestHanhRel = getBestRelName(rels);
                    }

                    if (vanGioArr.length > 0 && vanNgayArr.length > 0) {
                        const rels = checkVanRelations(vanGioArr[0], vanNgayArr[0]);
                        const score = getBestScore(rels);
                        totalScore += score;
                        bestVanRel = getBestRelName(rels);
                    }

                    const maxPossibleScore = 20;
                    const scorePercent = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
                    if (filterState.optLevel === 'cao' && scorePercent < 80) continue;
                    if (filterState.optLevel === 'trungbinh' && scorePercent < 50) continue;

                    if (filterState.hanhPillar.gio && filterState.hanhPillar.gio.length > 0) {
                        if (!hanhGioArr.some(hv => filterState.hanhPillar.gio.includes(hv))) continue;
                    }
                    if (filterState.vanPillar.gio && filterState.vanPillar.gio.length > 0) {
                        if (!vanGioArr.some(vv => filterState.vanPillar.gio.includes(vv))) continue;
                    }

                    if (filterState.hanhPairs['gio-ngay'] && filterState.hanhPairs['gio-ngay'].length > 0) {
                        const allRels = new Set();
                        for (const hg of hanhGioArr) for (const hn of hanhNgayArr) {
                            [...checkHanhRelations(hg, hn), ...checkDirectedRelations(hg, hn)].forEach(r => allRels.add(r));
                        }
                        if (![...allRels].some(r => filterState.hanhPairs['gio-ngay'].includes(r))) continue;
                    }

                    // ---- [FIXED P0] LỌC HKĐQ (Tầng 3) ----
                    if (needHkdqCheck) {
                        const tatCaQueTheoTruLocal = {
                            'Trụ Tuổi': layDanhSachQueMobile(birthInfo.canChi),
                            'Trụ Tọa': layDanhSachQueMobile(toaInfo.canChi),
                            'Trụ Ngày': layDanhSachQueMobile(dateInfo.dayCanChi),
                            'Trụ Tháng': layDanhSachQueMobile(thangCanChiTK),
                            'Trụ Năm': layDanhSachQueMobile(namCanChiTK),
                            'Trụ Giờ': layDanhSachQueMobile(hourCanChiText),
                        };

                        const chonTheoTruLocal = {};
                        Object.entries(tatCaQueTheoTruLocal).forEach(([tenTru, dsQue]) => {
                            if (dsQue.length === 0) {
                                chonTheoTruLocal[tenTru] = { queChon: '', queConLai: [] };
                                return;
                            }
                            const hoBangChung = thuThapHoBangChungMobile(tenTru, tatCaQueTheoTruLocal);
                            chonTheoTruLocal[tenTru] = chonQuePhanTichMobile(
                                Object.entries({
                                    'Trụ Tuổi': birthInfo.canChi,
                                    'Trụ Tọa': toaInfo.canChi,
                                    'Trụ Ngày': dateInfo.dayCanChi,
                                    'Trụ Tháng': thangCanChiTK,
                                    'Trụ Năm': namCanChiTK,
                                    'Trụ Giờ': hourCanChiText,
                                })[Object.keys(tatCaQueTheoTruLocal).indexOf(tenTru)],
                                // Fix: pass canChi string properly
                                hoBangChung
                            );
                        });

                        // Fix the chonTheoTruLocal building - use canChi directly
                        const canChiMap = {
                            'Trụ Tuổi': birthInfo.canChi,
                            'Trụ Tọa': toaInfo.canChi,
                            'Trụ Ngày': dateInfo.dayCanChi,
                            'Trụ Tháng': thangCanChiTK,
                            'Trụ Năm': namCanChiTK,
                            'Trụ Giờ': hourCanChiText,
                        };
                        Object.entries(canChiMap).forEach(([tenTru, cc]) => {
                            const hoBangChung = thuThapHoBangChungMobile(tenTru, tatCaQueTheoTruLocal);
                            chonTheoTruLocal[tenTru] = chonQuePhanTichMobile(cc, hoBangChung);
                        });

                        const hkdqInput = {
                            truTuoi: chonTheoTruLocal['Trụ Tuổi']?.queChon || '',
                            truToa: chonTheoTruLocal['Trụ Tọa']?.queChon || '',
                            truNgay: chonTheoTruLocal['Trụ Ngày']?.queChon || '',
                            truThang: chonTheoTruLocal['Trụ Tháng']?.queChon || '',
                            truNam: chonTheoTruLocal['Trụ Năm']?.queChon || '',
                            truGio: chonTheoTruLocal['Trụ Giờ']?.queChon || '',
                            lucXungList: [],
                            tatCaQueTheoTru: tatCaQueTheoTruLocal,
                        };

                        try {
                            if (typeof phanTichNhatKhoaDayDu === 'function') {
                                const ketQuaHkdq = phanTichNhatKhoaDayDu(hkdqInput);
                                if (!checkHkdqConditions(ketQuaHkdq, filterState)) continue;
                            }
                        } catch (e) {
                            // Nếu HKĐQ lỗi, vẫn giữ giờ (fallback an toàn)
                        }
                    }

                    passingHours.push({
                        chi: h.chi, hour: h.hour, hourCanChi: hourCanChiText,
                        hanhGioArr, vanGioArr,
                        totalScore, bestHanhRel, bestVanRel,
                    });
                }

                passingHours.sort((a, b) => b.totalScore - a.totalScore);

                if (passingHours.length > 0 || Object.values(filterState.tranh).every(v => !v)) {
                    const dayScore = passingHours.length > 0 ? Math.max(...passingHours.map(h => h.totalScore)) : 0;
                    filtered.push({
                        ...dateInfo,
                        dayScore,
                        passingHours,
                        namCanChiTK,
                        thangCanChiTK,
                    });
                }
            }

            MOBILE_STATE.filteredDates = filtered;
            MOBILE_STATE.displayCount = 15;

            renderResults();
            updateFilterBadge();
            updateResultsStats(filtered);
            // Chỉ scroll khi người dùng bấm nút "ÁP DỤNG", không scroll khi auto-apply từ debounce
if (window._userTriggeredApply) {
    document.getElementById('section-results').scrollIntoView({ behavior: 'smooth' });
}
            overlay.style.display = 'none';

            const totalHours = filtered.reduce((sum, d) => sum + d.passingHours.length, 0);
            showToast(`✅ Đã lọc: ${filtered.length} ngày, ${totalHours} giờ`);

        } catch (err) {
            console.error(err);
            overlay.style.display = 'none';
            showToast('❌ Lỗi khi lọc: ' + err.message);
        }
    });
}

// ==================== UPDATE RESULTS STATS ====================
function updateResultsStats(filtered) {
    document.getElementById('results-bar').style.display = 'flex';
    const totalHours = filtered.reduce((sum, d) => sum + d.passingHours.length, 0);
    document.getElementById('stat-ngay').textContent = `${filtered.length} ngày`;
    document.getElementById('stat-gio').textContent = `${totalHours} giờ`;
    const filterCount = countActiveFilters(MOBILE_STATE.filterState || {});
    document.getElementById('stat-filters').textContent = `${filterCount} filter`;

    document.getElementById('result-count-badge').textContent = filtered.length;
    document.getElementById('result-count-badge').style.display = 'inline-flex';
}

// ==================== RENDER RESULTS ====================
function renderResults() {
    const container = document.getElementById('results-container');
    const filtered = MOBILE_STATE.filteredDates;
    const displayCount = MOBILE_STATE.displayCount;
    const toShow = filtered.slice(0, displayCount);

    if (filtered.length === 0) {
        container.innerHTML = '<div class="m-empty-state"><span style="font-size:48px;">🔍</span><p>Không tìm thấy ngày nào phù hợp với bộ lọc</p></div>';
        document.getElementById('btn-load-more').style.display = 'none';
        return;
    }

    let html = '';
    toShow.forEach((dayInfo, idx) => {
        html += renderDayCard(dayInfo, idx);
    });
    container.innerHTML = html;

    document.getElementById('btn-load-more').style.display = displayCount < filtered.length ? 'flex' : 'none';
    updateSelectedCount();
}

// [FIXED P2.6] Pre-compute hour info map
const ALL_12_HOUR_INFO = [
    { chi: 'Tý', hour: 23 }, { chi: 'Sửu', hour: 1 }, { chi: 'Dần', hour: 3 },
    { chi: 'Mão', hour: 5 }, { chi: 'Thìn', hour: 7 }, { chi: 'Tị', hour: 9 },
    { chi: 'Ngọ', hour: 11 }, { chi: 'Mùi', hour: 13 }, { chi: 'Thân', hour: 15 },
    { chi: 'Dậu', hour: 17 }, { chi: 'Tuất', hour: 19 }, { chi: 'Hợi', hour: 21 },
];
const HOUR_MAP = {};
ALL_12_HOUR_INFO.forEach(h => { HOUR_MAP[h.chi] = h; });

function renderDayCard(dayInfo, idx) {
    const jdn = dayInfo.jdn;
    const isSelected = MOBILE_STATE.selectedDays[jdn];

    const solarDate = `${String(dayInfo.solarDay).padStart(2, '0')}/${String(dayInfo.solarMonth).padStart(2, '0')}/${dayInfo.solarYear}`;
    const lunarDate = `${dayInfo.lunarDay}/${dayInfo.lunarMonth}${dayInfo.lunarLeap ? ' (N)' : ''}/${dayInfo.lunarYear}`;
    const dayOfWeek = NGAY_TRONG_TUAN[(jdn + 1) % 7];

    let metaTags = '';
    const d = MOBILE_STATE.inputData;
    if (d) {
        const satsInfo = d.satsInfo;
        const toaInfo = d.toaInfo;
        const dayChi = dayInfo.dayCanChi.split(' ')[1];
        const xungToaChi = LUC_XUNG_MAP[toaInfo.canChi ? toaInfo.canChi.split(' ')[1] : ''] || '';
        const tuoiChi = d.birthInfo.canChi ? d.birthInfo.canChi.split(' ')[1] : '';
        const xungTuoiChi = LUC_XUNG_MAP[tuoiChi] || '';
        const tuePhaChi = satsInfo.tuePha.split(' - ')[1];

        if (tuePhaChi && dayChi === tuePhaChi) metaTags += '<span class="m-day-meta-tag m-day-meta-tag--tranh">Xung Thái Tuế</span>';
        if (xungToaChi && dayChi === xungToaChi) metaTags += '<span class="m-day-meta-tag m-day-meta-tag--tranh">Xung Tọa</span>';
        if (xungTuoiChi && dayChi === xungTuoiChi) metaTags += '<span class="m-day-meta-tag m-day-meta-tag--tranh">Xung Tuổi</span>';
    }
    if (dayInfo.tietKhi && dayInfo.tietKhi !== '') {
        metaTags += `<span class="m-day-meta-tag m-day-meta-tag--tietkhi">${dayInfo.tietKhi}</span>`;
    }

    // [FIXED P2.6] Dùng HOUR_MAP đã pre-compute
    const all12Chi = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

    let hoursHtml = '';
    all12Chi.forEach(chi => {
        const hourData = dayInfo.passingHours.find(h => h.chi === chi);
        const hourKey = `${jdn}_${chi}`;
        const isHourSelected = MOBILE_STATE.selectedHours[hourKey];

        if (hourData) {
            hoursHtml += `
                <div class="m-hour-cell ${isHourSelected ? 'selected' : ''}" onclick="toggleHourSelect('${hourKey}', '${chi}', this)" oncontextmenu="event.preventDefault(); showDetailModal('${jdn}', '${chi}'); return false;">
                    <div class="m-hour-name">${chi}</div>
                    <div class="m-hour-time">${HOUR_MAP[chi].hour}h</div>
                    <div class="m-hour-relation">${hourData.bestHanhRel || hourData.bestVanRel || ''}</div>
                    <div class="m-hour-score">${hourData.totalScore > 0 ? hourData.totalScore + 'đ' : ''}</div>
                </div>`;
        } else {
            hoursHtml += `
                <div class="m-hour-cell filtered-out">
                    <div class="m-hour-name">${chi}</div>
                    <div class="m-hour-time">${HOUR_MAP[chi].hour}h</div>
                    <div class="m-hour-relation"></div>
                </div>`;
        }
    });

    return `
        <div class="m-day-card ${isSelected ? 'selected' : ''}" id="day-card-${jdn}">
            <div class="m-day-header" onclick="toggleDayExpand(${jdn})">
                <div class="m-day-info">
                    <div class="m-day-date">📅 ${solarDate}</div>
                    <div class="m-day-lunar">${dayOfWeek} | ${dayInfo.dayCanChi} | ${lunarDate}</div>
                    <div class="m-day-meta">${metaTags}</div>
                </div>
                <div class="m-day-select" onclick="event.stopPropagation(); toggleDaySelect(${jdn}, this)">
                    <span style="font-size:0.65rem;">${isSelected ? '⭐' : '☐'}</span>
                </div>
                <span class="m-day-chevron" id="day-chevron-${jdn}">▼</span>
            </div>
            <div class="m-day-body" id="day-body-${jdn}">
                <div class="m-day-section">
                    <div class="m-day-section-title">🕐 GIỜ PHÙ HỢP (${dayInfo.passingHours.length}/12)</div>
                    <div class="m-hour-grid">${hoursHtml}</div>
                </div>
                <div class="m-day-section">
                    <div class="m-day-section-title">📋 THÔNG TIN NGÀY</div>
                    <div class="m-day-detail-grid">
                        <div class="m-day-detail-item"><span>Âm lịch:</span><span>${lunarDate}</span></div>
                        <div class="m-day-detail-item"><span>Can Chi:</span><span>${dayInfo.dayCanChi}</span></div>
                        <div class="m-day-detail-item"><span>Tháng TK:</span><span>${dayInfo.thangCanChiTK}</span></div>
                        <div class="m-day-detail-item"><span>Năm TK:</span><span>${dayInfo.namCanChiTK}</span></div>
                        <div class="m-day-detail-item"><span>Tiết khí:</span><span>${dayInfo.tietKhi || '-'}</span></div>
                        <div class="m-day-detail-item"><span>Điểm:</span><span class="text-gold">${dayInfo.dayScore}đ</span></div>
                    </div>
                </div>
            </div>
        </div>`;
}

// ==================== DAY EXPAND ====================
function toggleDayExpand(jdn) {
    const body = document.getElementById('day-body-' + jdn);
    const chevron = document.getElementById('day-chevron-' + jdn);
    if (!body || !chevron) return;
    if (body.classList.contains('open')) {
        body.classList.remove('open');
        chevron.classList.remove('open');
    } else {
        body.classList.add('open');
        chevron.classList.add('open');
    }
}

// ==================== SELECTION ====================
function toggleDaySelect(jdn, el) {
    if (MOBILE_STATE.selectedDays[jdn]) {
        delete MOBILE_STATE.selectedDays[jdn];
        Object.keys(MOBILE_STATE.selectedHours).forEach(k => {
            if (k.startsWith(jdn + '_')) delete MOBILE_STATE.selectedHours[k];
        });
    } else {
        MOBILE_STATE.selectedDays[jdn] = true;
        const dayInfo = MOBILE_STATE.filteredDates.find(d => d.jdn === jdn);
        if (dayInfo) {
            dayInfo.passingHours.forEach(h => {
                MOBILE_STATE.selectedHours[jdn + '_' + h.chi] = true;
            });
        }
    }
    updateDayCardUI(jdn);
    updateSelectedCount();
}

function toggleHourSelect(hourKey, chi, el) {
    if (MOBILE_STATE.selectedHours[hourKey]) {
        delete MOBILE_STATE.selectedHours[hourKey];
    } else {
        MOBILE_STATE.selectedHours[hourKey] = true;
    }
    el.classList.toggle('selected');
    updateSelectedCount();
}

function updateDayCardUI(jdn) {
    const idx = MOBILE_STATE.filteredDates.findIndex(d => d.jdn === jdn);
    if (idx >= 0 && idx < MOBILE_STATE.displayCount) {
        const dayInfo = MOBILE_STATE.filteredDates[idx];
        const cardEl = document.getElementById('day-card-' + jdn);
        if (cardEl && dayInfo) {
            const newHtml = renderDayCard(dayInfo, idx);
            cardEl.outerHTML = newHtml;
        }
    }
}

function updateSelectedCount() {
    const totalSelectedHours = Object.keys(MOBILE_STATE.selectedHours).length;
    const el = document.getElementById('selected-count');
    if (el) el.textContent = totalSelectedHours;
}

// ==================== LOAD MORE ====================
function loadMoreResults() {
    MOBILE_STATE.displayCount += 15;
    renderResults();
}

// ==================== DETAIL MODAL ====================
// [FIXED P2] Sử dụng chonQuePhanTichMobile thay vì selector đơn giản
function showDetailModal(jdn, chi) {
    const dayInfo = MOBILE_STATE.filteredDates.find(d => d.jdn === jdn);
    if (!dayInfo) return;

    const hourData = dayInfo.passingHours.find(h => h.chi === chi);
    if (!hourData) return;

    const d = MOBILE_STATE.inputData;
    const toaInfo = d.toaInfo;

    const dayCan = dayInfo.dayCanChi.split(' ')[0];
    const hourCanChi = hourData.hourCanChi;

    const hanhTuoiArr = d.hanhTuoiArr;
    const vanTuoiArr = d.vanTuoiArr;
    const hanhToaArr = d.hanhToaArr;
    const vanToaArr = d.vanToaArr;
    const hanhNgayArr = getHanhFromCanChi(dayInfo.dayCanChi);
    const vanNgayArr = getVanFromCanChi(dayInfo.dayCanChi);
    const hanhGioArr = hourData.hanhGioArr;
    const vanGioArr = hourData.vanGioArr;
    const hanhThangArr = getHanhFromCanChi(dayInfo.thangCanChiTK);
    const vanThangArr = getVanFromCanChi(dayInfo.thangCanChiTK);
    const hanhNamArr = getHanhFromCanChi(dayInfo.namCanChiTK);
    const vanNamArr = getVanFromCanChi(dayInfo.namCanChiTK);

    const pairChecks = [
        { label: 'Tuổi ↔ Tọa', h1: hanhTuoiArr, h2: hanhToaArr, v1: vanTuoiArr, v2: vanToaArr },
        { label: 'Tuổi ↔ Ngày', h1: hanhTuoiArr, h2: hanhNgayArr, v1: vanTuoiArr, v2: vanNgayArr },
        { label: 'Tọa ↔ Ngày', h1: hanhToaArr, h2: hanhNgayArr, v1: vanToaArr, v2: vanNgayArr },
        { label: 'Ngày ↔ Giờ', h1: hanhNgayArr, h2: hanhGioArr, v1: vanNgayArr, v2: vanGioArr },
        { label: 'Ngày ↔ Tháng', h1: hanhNgayArr, h2: hanhThangArr, v1: vanNgayArr, v2: vanThangArr },
        { label: 'Ngày ↔ Năm', h1: hanhNgayArr, h2: hanhNamArr, v1: vanNgayArr, v2: vanNamArr },
        { label: 'Tháng ↔ Năm', h1: hanhThangArr, h2: hanhNamArr, v1: vanThangArr, v2: vanNamArr },
    ];

    let hanhTableRows = '';
    let vanTableRows = '';
    pairChecks.forEach(pair => {
        const hanhRels = [];
        if (pair.h1.length > 0 && pair.h2.length > 0) {
            for (const h1 of pair.h1) for (const h2 of pair.h2) {
                [...checkHanhRelations(h1, h2), ...checkDirectedRelations(h1, h2)].forEach(r => hanhRels.push(r));
            }
        }
        const vanRels = [];
        if (pair.v1.length > 0 && pair.v2.length > 0) {
            for (const v1 of pair.v1) for (const v2 of pair.v2) {
                checkVanRelations(v1, v2).forEach(r => vanRels.push(r));
            }
        }
        const uniqueHanh = [...new Set(hanhRels)];
        const uniqueVan = [...new Set(vanRels)];
        hanhTableRows += `<tr><td>${pair.label}</td><td>${uniqueHanh.join(', ') || '-'}</td><td>${getBestScore(uniqueHanh)}đ</td></tr>`;
        vanTableRows += `<tr><td>${pair.label}</td><td>${uniqueVan.join(', ') || '-'}</td><td>${getBestScore(uniqueVan)}đ</td></tr>`;
    });

    // [FIXED P2] HKĐQ analysis dùng chonQuePhanTichMobile
    const canChiMap = {
        'Trụ Tuổi': d.birthInfo.canChi,
        'Trụ Tọa': toaInfo.canChi,
        'Trụ Ngày': dayInfo.dayCanChi,
        'Trụ Tháng': dayInfo.thangCanChiTK,
        'Trụ Năm': dayInfo.namCanChiTK,
        'Trụ Giờ': hourCanChi,
    };

    const tatCaQueTheoTru = {};
    Object.entries(canChiMap).forEach(([tenTru, cc]) => {
        tatCaQueTheoTru[tenTru] = layDanhSachQueMobile(cc);
    });

    const chonTheoTru = {};
    Object.entries(canChiMap).forEach(([tenTru, cc]) => {
        const hoBangChung = thuThapHoBangChungMobile(tenTru, tatCaQueTheoTru);
        chonTheoTru[tenTru] = chonQuePhanTichMobile(cc, hoBangChung);
    });

    let hkdqHtml = '';
    try {
        const hkdqInput = {
            truTuoi: chonTheoTru['Trụ Tuổi']?.queChon || '',
            truToa: chonTheoTru['Trụ Tọa']?.queChon || '',
            truNgay: chonTheoTru['Trụ Ngày']?.queChon || '',
            truThang: chonTheoTru['Trụ Tháng']?.queChon || '',
            truNam: chonTheoTru['Trụ Năm']?.queChon || '',
            truGio: chonTheoTru['Trụ Giờ']?.queChon || '',
            lucXungList: [],
            tatCaQueTheoTru,
        };
        if (typeof phanTichNhatKhoaDayDu === 'function') {
            const ketQua = phanTichNhatKhoaDayDu(hkdqInput);

            hkdqHtml += '<div class="m-hkdq-mini-grid">';
            ['Trụ Tuổi', 'Trụ Tọa', 'Trụ Ngày', 'Trụ Tháng', 'Trụ Năm', 'Trụ Giờ'].forEach(tenTru => {
                const kq = ketQua.ketQuaCacTru[tenTru];
                if (kq && kq.tenQue && kq.thongTinDuocChon) {
                    const tt = kq.thongTinDuocChon;
                    hkdqHtml += `<div class="m-hkdq-mini-box">
                        <div style="font-size:0.6rem;color:var(--text-muted);">${tenTru.replace('Trụ ', '')}</div>
                        <div class="m-hkdq-mini-name">${kq.tenQue}</div>
                        <div class="m-hkdq-mini-family">${tt.giaDinh}</div>
                        <div class="m-hkdq-mini-ad ${tt.amDuong === 'Dương' ? 'duong' : 'am'}">${tt.amDuong}</div>
                    </div>`;
                } else {
                    hkdqHtml += `<div class="m-hkdq-mini-box">
                        <div style="font-size:0.6rem;color:var(--text-muted);">${tenTru.replace('Trụ ', '')}</div>
                        <div style="color:var(--text-muted);">KXĐ</div>
                    </div>`;
                }
            });
            hkdqHtml += '</div>';

            hkdqHtml += `<div style="font-size:0.75rem;margin:8px 0;padding:8px;background:rgba(0,0,0,0.15);border-radius:6px;">
                AD: <b style="color:#FF6B6B;">Dương ${ketQua.thongKeAmDuong['Dương']}</b> | 
                <b style="color:#64B5F6;">Âm ${ketQua.thongKeAmDuong['Âm']}</b> | 
                KXĐ: <b style="color:#FF9800;">${ketQua.thongKeAmDuong['KXĐ']}</b><br>
                PM: <b style="color:#4FC3F7;">${ketQua.thongKeVaiTro['Phụ Mẫu']}</b> | 
                TT: <b style="color:#81C784;">${ketQua.thongKeVaiTro['Tử Tức']}</b> | 
                HĐ: <b style="color:#CE93D8;">${ketQua.thongKeVaiTro['Huynh Đệ']}</b>
            </div>`;

            if (ketQua.canhBao.length > 0) {
                ketQua.canhBao.forEach(cb => {
                    hkdqHtml += `<div class="m-warning-badge m-warning-badge--${cb.type === 'critical' ? 'critical' : 'moderate'}">${cb.message}</div>`;
                });
            }

            hkdqHtml += `<div class="m-rating-final m-rating-final--${ketQua.ratingClass === 'rating-good' ? 'good' : ketQua.ratingClass === 'rating-medium' ? 'medium' : 'bad'}">🎯 ${ketQua.danhGia}</div>`;
        }
    } catch (err) {
        hkdqHtml = '<p class="text-muted">Không thể phân tích HKĐQ</p>';
    }

    let quyNhanHtml = '-';
    if (dayCan && dayInfo.tietKhi && typeof QUY_NHAN_DATA !== 'undefined' && QUY_NHAN_DATA[dayCan] && QUY_NHAN_DATA[dayCan][dayInfo.tietKhi]) {
        const found = QUY_NHAN_DATA[dayCan][dayInfo.tietKhi][chi];
        if (found) quyNhanHtml = `<span class="text-gold">${found}</span>`;
    }

    const content = document.getElementById('detail-modal-content');
    content.innerHTML = `
        <div class="m-detail-block">
            <div class="m-detail-block-title">🔤 CAN CHI & HÀNH/VẬN</div>
            <table class="m-detail-table">
                <tr><td>Giờ</td><td>${hourCanChi}</td><td>Hành: ${hanhGioArr.join(', ')}</td><td>Vận: ${vanGioArr.join(', ')}</td></tr>
                <tr><td>Ngày</td><td>${dayInfo.dayCanChi}</td><td>Hành: ${hanhNgayArr.join(', ')}</td><td>Vận: ${vanNgayArr.join(', ')}</td></tr>
                <tr><td>Tháng TK</td><td>${dayInfo.thangCanChiTK}</td><td>Hành: ${hanhThangArr.join(', ')}</td><td>Vận: ${vanThangArr.join(', ')}</td></tr>
                <tr><td>Năm TK</td><td>${dayInfo.namCanChiTK}</td><td>Hành: ${hanhNamArr.join(', ')}</td><td>Vận: ${vanNamArr.join(', ')}</td></tr>
            </table>
        </div>

        <div class="m-detail-block">
            <div class="m-detail-block-title">🔥 QUAN HỆ HÀNH</div>
            <table class="m-detail-table">
                <tr><th>Cặp</th><th>Quan hệ</th><th>Điểm</th></tr>
                ${hanhTableRows}
            </table>
        </div>

        <div class="m-detail-block">
            <div class="m-detail-block-title">🌀 QUAN HỆ VẬN</div>
            <table class="m-detail-table">
                <tr><th>Cặp</th><th>Quan hệ</th><th>Điểm</th></tr>
                ${vanTableRows}
            </table>
        </div>

        <div class="m-detail-block">
            <div class="m-detail-block-title">☯ HUYỀN KHÔNG ĐẠI QUÁI</div>
            ${hkdqHtml}
        </div>

        <div class="m-detail-block">
            <div class="m-detail-block-title">👑 THIÊN ẤT QUÝ NHÂN</div>
            <p style="font-size:0.9rem;">${quyNhanHtml}</p>
        </div>

        <div class="m-detail-block">
            <div class="m-detail-block-title">📋 XUNG CHI</div>
            <p style="font-size:0.85rem;color:${LUC_XUNG_MAP[dayInfo.dayCanChi.split(' ')[1]] === chi ? 'var(--danger)' : 'var(--text-secondary)'};">
                ${LUC_XUNG_MAP[dayInfo.dayCanChi.split(' ')[1]] === chi ? '⚠️ XUNG CHI NGÀY-GIỜ' : '✅ Không xung'}
            </p>
        </div>
    `;

    document.getElementById('detail-modal-title').textContent = `⏰ Giờ ${chi} - ${dayInfo.dayCanChi}`;
    document.getElementById('detail-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
    document.getElementById('detail-modal').style.display = 'none';
    document.body.style.overflow = '';
}

// ==================== SELECTED LIST ====================
function showSelectedList() {
    const sheet = document.getElementById('selected-sheet');
    const content = document.getElementById('selected-list-content');

    const selectedDays = Object.keys(MOBILE_STATE.selectedDays).map(Number);
    const selectedHours = Object.keys(MOBILE_STATE.selectedHours);

    if (selectedHours.length === 0) {
        content.innerHTML = '<p class="m-empty-text">Chưa có ngày/giờ nào được chọn</p>';
    } else {
        let html = '';
        selectedDays.forEach(jdn => {
            const dayInfo = MOBILE_STATE.filteredDates.find(d => d.jdn === jdn) ||
                           MOBILE_STATE.allDates.find(d => d.jdn === jdn);
            if (!dayInfo) return;
            const solarDate = `${String(dayInfo.solarDay).padStart(2, '0')}/${String(dayInfo.solarMonth).padStart(2, '0')}/${dayInfo.solarYear}`;
            const hoursForDay = selectedHours.filter(k => k.startsWith(jdn + '_')).map(k => k.split('_')[1]);

            html += `<div class="m-selected-item">
                <div class="m-selected-item-info">
                    <b>${solarDate}</b> – ${dayInfo.dayCanChi}<br>
                    <small class="text-gold">Giờ: ${hoursForDay.join(', ') || 'Tất cả'}</small>
                </div>
                <span class="m-selected-item-remove" onclick="deselectDay(${jdn})">🗑️</span>
            </div>`;
        });
        content.innerHTML = html;
    }

    sheet.style.display = 'flex';
}

function hideSelectedList() {
    document.getElementById('selected-sheet').style.display = 'none';
}

function deselectDay(jdn) {
    delete MOBILE_STATE.selectedDays[jdn];
    Object.keys(MOBILE_STATE.selectedHours).forEach(k => {
        if (k.startsWith(jdn + '_')) delete MOBILE_STATE.selectedHours[k];
    });
    updateSelectedCount();
    showSelectedList();
    updateDayCardUI(jdn);
}

// ==================== CLEAR ALL FILTERS ====================
// [FIXED P2] Reset range & opt buttons về default
function clearAllFilters() {
    document.querySelectorAll('.m-filter-item input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.m-chip.active').forEach(chip => chip.classList.remove('active'));
    document.querySelectorAll('.m-pair-chip.active').forEach(chip => chip.classList.remove('active'));

    // [FIXED] Reset range buttons về default (3 Tháng)
    document.querySelectorAll('#section-input .m-range-btn').forEach(b => b.classList.remove('active'));
    const defaultRangeBtn = document.querySelector('#section-input .m-range-btn[data-range="3"]');
    if (defaultRangeBtn) defaultRangeBtn.classList.add('active');
    MOBILE_STATE.rangeMonths = 3;

    // [FIXED] Reset opt level buttons về default (Cao)
    document.querySelectorAll('[data-opt-level]').forEach(b => b.classList.remove('active'));
    const defaultOptBtn = document.querySelector('[data-opt-level="cao"]');
    if (defaultOptBtn) defaultOptBtn.classList.add('active');
    MOBILE_STATE.optLevel = 'cao';

    MOBILE_STATE.filteredDates = [];
    MOBILE_STATE.displayCount = 15;
    MOBILE_STATE.filterState = null;
    document.getElementById('results-container').innerHTML = '<div class="m-empty-state"><span style="font-size:48px;">🔍</span><p>Nhập thông tin và nhấn "XEM KẾT QUẢ"<br>để bắt đầu chọn ngày</p></div>';
    document.getElementById('results-bar').style.display = 'none';
    document.getElementById('btn-load-more').style.display = 'none';
    document.getElementById('result-count-badge').style.display = 'none';
    updateFilterBadge();
    showToast('🗑️ Đã xóa tất cả bộ lọc');
}

// ==================== PRINT ====================
function printSelected() {
    const selectedDays = Object.keys(MOBILE_STATE.selectedDays).map(Number);
    const selectedHours = Object.keys(MOBILE_STATE.selectedHours);

    if (selectedHours.length === 0) {
        showToast('⚠️ Chưa chọn ngày/giờ nào để in');
        return;
    }

    const printContent = document.getElementById('print-selected-content');
    let html = '<h3>Danh sách Ngày Giờ Đã Chọn</h3>';

    selectedDays.forEach(jdn => {
        const dayInfo = MOBILE_STATE.filteredDates.find(d => d.jdn === jdn) ||
                       MOBILE_STATE.allDates.find(d => d.jdn === jdn);
        if (!dayInfo) return;
        const solarDate = `${String(dayInfo.solarDay).padStart(2, '0')}/${String(dayInfo.solarMonth).padStart(2, '0')}/${dayInfo.solarYear}`;
        const hoursForDay = selectedHours.filter(k => k.startsWith(jdn + '_')).map(k => k.split('_')[1]);

        html += `<div style="margin-bottom:12px;padding:8px;border:1px solid #ddd;">`;
        html += `<strong>${solarDate}</strong> – ${dayInfo.dayCanChi} – ÂL: ${dayInfo.lunarDay}/${dayInfo.lunarMonth}/${dayInfo.lunarYear}<br>`;
        html += `Tiết khí: ${dayInfo.tietKhi || '-'}<br>`;
        html += `<em>Giờ tốt: ${hoursForDay.join(', ')}</em>`;
        html += `</div>`;
    });

    printContent.innerHTML = html;
    window.print();
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    const nowYear = new Date().getFullYear();
    const viewYearInput = document.getElementById('m-view-year');
    if (viewYearInput && !viewYearInput.value) {
        viewYearInput.value = nowYear;
    }

    createFilterUI();

    ['m-birth-year', 'm-toa-do', 'm-view-year', 'm-event', 'm-location'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') handleViewResult();
            });
        }
    });

    document.querySelector('.m-modal-overlay')?.addEventListener('click', closeDetailModal);
    document.querySelector('.m-sheet-overlay')?.addEventListener('click', hideSelectedList);

    updateFilterBadge();
});
