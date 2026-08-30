// ==========================================
// MOBILE-UI.JS – Giao diện & Xử lý Mobile
// ==========================================

const MOBILE_STATE = {
    rangeMonths: 3,
    selectedMonths: Array.from({ length: 12 }, (_, i) => i + 1),
    inputData: null,
    allDates: [],
    filteredDates: [],
    displayCount: 15,
    selectedDays: {},
    selectedHours: {},
    filterState: null,
    chonCanArr: [], 
    chonChiArr: [],
    tranhCanArr: [],
    tranhChiArr: [],
    // Riêng cho 1B (Chỉ tính Ngày & Giờ)
    chonCanNgayGioArr: [],
    chonChiNgayGioArr: [],
    tranhCanNgayGioArr: [],
    tranhChiNgayGioArr: []
};

// Hàm trống để tránh lỗi ReferenceError từ mobile-main.js do đã xóa bộ lọc 2A
function setRange() {}
function setOptLevel() {}

// ==================== HỖ TRỢ HIỂN THỊ QUẺ HKĐQ ====================
const TRIGRAM_MAP = {
    'Thiên': '☰', 'Trạch': '☱', 'Hỏa': '☲', 'Lôi': '☳',
    'Phong': '☴', 'Thủy': '☵', 'Sơn': '☶', 'Địa': '☷',
    'Càn': '☰', 'Đoài': '☱', 'Ly': '☲', 'Chấn': '☳',
    'Tốn': '☴', 'Khảm': '☵', 'Cấn': '☶', 'Khôn': '☷'
};

function getGuaStackHTML(queName, h, v) {
    if (!queName || queName === 'N/A') return '<span class="tc-empty">-</span>';
    let top = '', bottom = '';
    
    if (queName.startsWith('Thuần ')) {
        const t = queName.replace('Thuần ', '');
        top = TRIGRAM_MAP[t] || ''; 
        bottom = TRIGRAM_MAP[t] || '';
    } else {
        const parts = queName.split(' ');
        top = TRIGRAM_MAP[parts[0]] || '';
        bottom = TRIGRAM_MAP[parts[1]] || '';
    }
    
    return `<div class="m-gua-symbol-wrapper">
        <div class="m-gua-symbol-stack">
            <div class="m-gua-trigram">${top}</div>
            <div class="m-gua-trigram">${bottom}</div>
        </div>
        <div class="m-gua-hanh" title="Hành">${h}</div>
        <div class="m-gua-van" title="Vận">${v}</div>
    </div>`;
}

function renderGuaVisual(canChi, hanhArr, vanArr) {
    const ques = (typeof huyenKhongQueMap !== 'undefined' && huyenKhongQueMap[canChi]) ? huyenKhongQueMap[canChi] : [];
    if (ques.length === 0) return '<span class="tc-empty">Không có Quẻ</span>';
    
    let html = '<div class="m-gua-container">';
    for (let i = 0; i < ques.length; i++) {
        const qName = ques[i];
        const h = hanhArr[i] || hanhArr[0] || '-';
        const v = vanArr[i] || vanArr[0] || '-';
        
        html += `
        <div class="m-gua-block">
            ${getGuaStackHTML(qName, h, v)}
            <div class="m-gua-name">${qName.replace('Thuần ', '')}</div>
        </div>`;
    }
    html += '</div>';
    return html;
}

// ==================== TOAST ====================
function showToast(msg, duration = 2500) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), duration);
}

// ==================== SECTION & DROPDOWN TOGGLE (AUTO-COLLAPSE) ====================
function toggleSection(bodyId) {
    const sections = ['section-input-body', 'section-filter-body', 'section-results-body'];
    const body = document.getElementById(bodyId);
    const chevron = document.getElementById(bodyId + '-chevron');
    if (!body || !chevron) return;
    
    const isOpen = body.classList.contains('m-section-body--open');
    
    // Thu gọn tất cả các Section
    sections.forEach(id => {
        const b = document.getElementById(id);
        const c = document.getElementById(id + '-chevron');
        if (b && c) {
            b.classList.remove('m-section-body--open');
            b.style.display = 'none';
            c.textContent = '▶';
        }
    });

    if (!isOpen) {
        body.classList.add('m-section-body--open');
        chevron.textContent = '▼';
        body.style.display = 'block';
    }
}

function toggleAccordion(bodyId) {
    const accordions = ['acc-layer1', 'acc-layer2', 'acc-layer3'];
    const body = document.getElementById(bodyId);
    const chevron = document.getElementById(bodyId + '-chevron');
    if (!body || !chevron) return;
    
    const isHidden = body.style.display === 'none' || !body.style.display;

    // Thu gọn tất cả các Accordion
    accordions.forEach(id => {
        const b = document.getElementById(id);
        const c = document.getElementById(id + '-chevron');
        if (b && c) {
            b.style.display = 'none';
            c.textContent = '▶';
        }
    });

    if (isHidden) {
        body.style.display = 'block';
        chevron.textContent = '▼';
    }
}

function toggleGenericDropdown(bodyId, chevronId) {
    const body = document.getElementById(bodyId);
    const chevron = document.getElementById(chevronId);
    if (!body || !chevron) return;
    
    const isHidden = body.style.display === 'none';

    // Thu gọn tất cả các Dropdown khác
    document.querySelectorAll('.m-dropdown-body').forEach(b => b.style.display = 'none');
    document.querySelectorAll('.m-dropdown-header .m-chevron').forEach(c => c.textContent = '▼');

    if (isHidden) {
        body.style.display = 'block';
        chevron.textContent = '▲';
    }
}

function toggleSelectAllDropdown(containerId, btnEl) {
    const chips = document.querySelectorAll(`#${containerId} .m-pair-chip`);
    if (chips.length === 0) return;
    const allActive = Array.from(chips).every(c => c.classList.contains('active'));
    chips.forEach(c => {
        if (allActive) c.classList.remove('active');
        else c.classList.add('active');
    });
    updateSelectAllBtn(containerId, btnEl);
    updateFilterBadge();
}

function updateSelectAllBtn(containerId, btnEl) {
    if (!btnEl) return;
    const chips = document.querySelectorAll(`#${containerId} .m-pair-chip`);
    const allActive = chips.length > 0 && Array.from(chips).every(c => c.classList.contains('active'));
    btnEl.textContent = allActive ? '❎ Bỏ chọn tất cả' : '✅ Chọn tất cả';
}

// ==================== CHỌN THÁNG ====================
const MOBILE_MONTH_NAMES = [
    'Tháng 1 (Giêng)', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11 (Một)', 'Tháng 12 (Chạp)',
];

function buildMonthGrid() {
    const grid = document.getElementById('month-grid');
    if (!grid) return;
    
    const months = MOBILE_STATE.selectedMonths || [];
    const chonChis = MOBILE_STATE.chonChiArr || [];
    const tranhChis = MOBILE_STATE.tranhChiArr || [];

    grid.innerHTML = MOBILE_MONTH_NAMES.map((name, i) => {
        const m = i + 1; 
        const checked = months.includes(m);
        const chiOfMonth = tietKhiMonthChi[m - 1]; 
        
        let star = '';
        if (chonChis.includes(chiOfMonth)) {
            star = '<span class="m-chip-star" title="Nên chọn" style="color:var(--gold);">⭐</span>';
        } else if (!tranhChis.includes(chiOfMonth)) {
            // Không thuộc Tránh và không thuộc Chọn -> Sao Trắng
            star = '<span class="m-chip-star" title="Bình thường" style="color:#FFF; text-shadow: 0 0 1px #000;">☆</span>';
        }

        return `<label class="m-month-item ${checked ? 'month-checked' : ''}">
            <input type="checkbox" data-month="${m}" ${checked ? 'checked' : ''} onchange="toggleMonth(${m}, this)">
            <span>${star}${name}</span>
        </label>`;
    }).join('');
    
    updateMonthAllBtn();
}

function toggleMonth(m, el) {
    const set = new Set(MOBILE_STATE.selectedMonths || []);
    if (el.checked) set.add(m); else set.delete(m);
    MOBILE_STATE.selectedMonths = [...set].sort((a, b) => a - b);
    const item = el.closest('.m-month-item');
    if (item) item.classList.toggle('month-checked', el.checked);
    updateMonthAllBtn();
}

function toggleAllMonths() {
    if ((MOBILE_STATE.selectedMonths || []).length >= 12) {
        MOBILE_STATE.selectedMonths = [];
    } else {
        MOBILE_STATE.selectedMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    }
    buildMonthGrid();
}

function updateMonthAllBtn() {
    const btn = document.getElementById('btn-month-all');
    const textLabel = document.getElementById('month-dropdown-text');
    const count = (MOBILE_STATE.selectedMonths || []).length;
    
    if (btn) btn.textContent = count >= 12 ? '❎ Bỏ chọn tất cả' : '✅ Chọn tất cả';
    if (textLabel) {
        textLabel.textContent = count === 12 ? 'Đã chọn 12 tháng' : `Đã chọn ${count} tháng`;
    }
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
        const hanhNamArr = getHanhFromCanChi(yearInfo.canChi);
        const vanNamArr = getVanFromCanChi(yearInfo.canChi);

        MOBILE_STATE.selectedDays = {};
        MOBILE_STATE.selectedHours = {};
        MOBILE_STATE.filteredDates = [];
        MOBILE_STATE.displayCount = 15;

        MOBILE_STATE.inputData = {
            birthYear, toaDo, viewYear, locationName,
            birthInfo, toaInfo, yearInfo, satsInfo,
            hanhTuoiArr, vanTuoiArr, hanhToaArr, vanToaArr,
            hanhNamArr, vanNamArr
        };

        renderInputCards();
        renderTranhChonSummary(); 

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

        showToast('✅ Đã có thông tin');
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
    const ltna = LAC_THU_NAP_AM_MAP[canChi] || 'N/A';
    const lctna = LUC_THAP_NAP_AM_MAP[canChi] || 'N/A';

    card.innerHTML = `
        <div class="m-info-row"><span class="m-info-label">Can Chi</span><span class="m-info-value">${canChi}</span></div>
        <div class="m-info-row"><span class="m-info-label">Lục Thập Nạp Âm</span><span class="m-info-value">${lctna}</span></div>
        <div class="m-info-row"><span class="m-info-label">Lạc Thư Nạp Âm</span><span class="m-info-value">${ltna}</span></div>
        <div class="m-info-row m-info-row--col">
            <span class="m-info-label">Quẻ HKĐQ</span>
            ${renderGuaVisual(canChi, d.hanhTuoiArr, d.vanTuoiArr)}
        </div>
    `;
}

function renderCardToa(d) {
    const card = document.getElementById('card-toa');
    const toaInfo = d.toaInfo;
    const canChi = toaInfo.canChi;

    const huongPalaceName = huongToPalaceNameMap[toaInfo.huong];
    const oppositeNguHoang = palaceOpposites[d.satsInfo.nguHoangNam];
    const phamNguHoang = (huongPalaceName === d.satsInfo.nguHoangNam || huongPalaceName === oppositeNguHoang);
    const phamThaiTue = d.satsInfo.thaiTue.split(' - ').includes(toaInfo.son);
    const phamTamSat = getTamSatSonsForYear(d.satsInfo.yearChi).includes(toaInfo.son);
    const phamTuePha = d.satsInfo.tuePha.split(' - ').includes(toaInfo.son); 

    const batSatHuongByYear = BAT_SAT_NAM_CHI_MAP[d.satsInfo.yearChi];
    const phamBatSat = batSatHuongByYear && toaInfo.huong === batSatHuongByYear;

    let phamHtml = '';
    phamHtml += `<div class="m-info-row"><span class="m-info-label">Trục Ngũ Hoàng</span><span class="m-info-value">${phamNguHoang ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;
    phamHtml += `<div class="m-info-row"><span class="m-info-label">Thái Tuế</span><span class="m-info-value">${phamThaiTue ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;
    phamHtml += `<div class="m-info-row"><span class="m-info-label">Xung Thái Tuế</span><span class="m-info-value">${phamTuePha ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;
    phamHtml += `<div class="m-info-row"><span class="m-info-label">Tam Sát</span><span class="m-info-value">${phamTamSat ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;
    phamHtml += `<div class="m-info-row"><span class="m-info-label">Bát Sát</span><span class="m-info-value">${phamBatSat ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;

    card.innerHTML = `
        <div class="m-info-row"><span class="m-info-label">Độ số</span><span class="m-info-value">${d.toaDo}°</span></div>
        <div class="m-info-row"><span class="m-info-label">Sơn / Hướng</span><span class="m-info-value">${toaInfo.son} | ${toaInfo.huong}</span></div>
        <div class="m-info-row"><span class="m-info-label">Phương</span><span class="m-info-value">${toaInfo.phuong}</span></div>
        <div class="m-info-row"><span class="m-info-label">Can Chi</span><span class="m-info-value">${canChi}</span></div>
        <div class="m-info-row m-info-row--col">
            <span class="m-info-label">Quẻ HKĐQ</span>
            ${renderGuaVisual(canChi, d.hanhToaArr, d.vanToaArr)}
        </div>
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
        <div class="m-info-row"><span class="m-info-label">Năm</span><span class="m-info-value text-gold">${d.viewYear} – ${canChi}</span></div>
        <div class="m-info-row"><span class="m-info-label">Lục Thập Nạp Âm</span><span class="m-info-value">${lctna}</span></div>
        <div class="m-info-row"><span class="m-info-label">Lạc Thư Nạp Âm</span><span class="m-info-value">${ltna}</span></div>
        <div class="m-info-row m-info-row--col">
            <span class="m-info-label">Quẻ HKĐQ</span>
            ${renderGuaVisual(canChi, d.hanhNamArr, d.vanNamArr)}
        </div>
        <div class="m-info-row"><span class="m-info-label">Ngũ Hoàng</span><span class="m-info-value text-warning">${satsInfo.nguHoangNam} – ${nguHoangSon}</span></div>
        <div class="m-info-row"><span class="m-info-label">Nhị Hắc</span><span class="m-info-value">${satsInfo.nhiHacNam} – ${nhiHacSon}</span></div>
        <div class="m-info-row"><span class="m-info-label">Thái Tuế</span><span class="m-info-value">${satsInfo.thaiTue}</span></div>
        <div class="m-info-row"><span class="m-info-label">Xung Thái Tuế</span><span class="m-info-value text-danger">${satsInfo.tuePha}</span></div>
        <div class="m-info-row"><span class="m-info-label">Tam Sát</span><span class="m-info-value">${getDetailedTamSatInfo(satsInfo.yearChi)}</span></div>
        <div class="m-info-row"><span class="m-info-label">Bát Sát</span><span class="m-info-value text-danger">${BAT_SAT_NAM_CHI_MAP[satsInfo.yearChi] || 'Không có'}</span></div>
    `;
}

function renderCardNguHoangThang(d) {
    const card = document.getElementById('card-nguhoang-thang');
    const satsInfo = d.satsInfo;
    let html = '<div class="m-table-wrap"><table class="m-mini-table"><thead><tr><th>Tháng</th>';
    for (let i = 1; i <= 12; i++) html += `<th>${i}</th>`;
    html += '</tr></thead><tbody>';

    html += '<tr><td style="font-weight:700;color:#ffc107;">5H</td>';
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

    html += '</tbody></table></div>';
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
        <div class="m-info-row"><span class="m-info-label">TỌA SƠN</span><span class="m-info-value text-gold">${son}</span></div>
        <div class="m-info-row"><span class="m-info-label">☀ Thái Dương đáo tọa</span><span class="m-info-value text-warning">${data.tdDaoToa || '-'}</span></div>
        <div class="m-info-row"><span class="m-info-label">☀ Thái Dương đáo hướng</span><span class="m-info-value text-warning">${data.tdDaoHuong || '-'}</span></div>
        <div class="m-info-row"><span class="m-info-label">☀ Thái Dương đáo Tam Hợp</span><span class="m-info-value">${(data.tdDaoTamHop || '-').replace(/\n/g, '<br>')}</span></div>
        <div class="m-info-row"><span class="m-info-label">🌙 Thái Âm đáo tọa</span><span class="m-info-value text-info">${data.taDaoToa || '-'}</span></div>
        <div class="m-info-row"><span class="m-info-label">🌙 Thái Âm đáo hướng</span><span class="m-info-value text-info">${data.taDaoHuong || '-'}</span></div>
    `;
}

// ==================== BẢNG TỔNG HỢP TRÁNH / CHỌN ====================
function fmtTcArr(arr) {
    if (!arr || arr.length === 0) return '—';
    return arr.join(', ');
}

function renderTranhChonSummary() {
    const d = MOBILE_STATE.inputData;
    const container = document.getElementById('tranchon-summary');
    const bodyEl = document.getElementById('tranchon-summary-body');

    if (!d || !container || !bodyEl) {
        return;
    }

    const satsInfo = d.satsInfo;
    const toaInfo = d.toaInfo;
    const birthInfo = d.birthInfo;
    const phuong = toaInfo.phuong;
    const huong = toaInfo.huong;
    const huongKey = (typeof huongToPalaceNameMap !== 'undefined' && huongToPalaceNameMap[huong]) || huong;
    const huongPalaceName = huongToPalaceNameMap[toaInfo.huong];
    const toaPalaceName = palaceOpposites[huongPalaceName];

    const tuePhaParts = satsInfo.tuePha ? satsInfo.tuePha.split(' - ') : [];
    const tuePhaChi = tuePhaParts[1] || '';

    const toaParts = (toaInfo.canChi || '').split(' ');
    const toaChi = toaParts[1] || '';
    const xungToaChi = LUC_XUNG_MAP[toaChi] || '';

    const birthParts = (birthInfo.canChi || '').split(' ');
    const birthChi = birthParts[1] || '';
    const xungTuoiChi = LUC_XUNG_MAP[birthChi] || '';

    const tamSatChi = getTamSatSonsForYear(satsInfo.yearChi).filter(s => DIA_CHI.includes(s));
    const batSatChi = BAT_SAT_HUONG_MAP[huongKey] || '';

    const nguHoangThangChi = [];
    for (let m = 1; m <= 12; m++) {
        const nhPalace = satsInfo.monthlyStars[m].nguHoang;
        if (nhPalace === huongPalaceName || nhPalace === toaPalaceName) {
            const mChi = tietKhiMonthChi[m - 1]; 
            if (!nguHoangThangChi.includes(mChi)) {
                nguHoangThangChi.push(mChi);
            }
        }
    }

    function chiFromPalace(p) {
        return (palaceToSonMap[p] || []).filter(s => DIA_CHI.includes(s));
    }
    const sortChi = (arr) => arr.sort((a, b) => (CHI_TO_INDEX[a] ?? 99) - (CHI_TO_INDEX[b] ?? 99));
    const nguHoangNamChi = sortChi(chiFromPalace(satsInfo.nguHoangNam));

    const tuHopMap = { 'ĐÔNG': { can: ['Giáp', 'Ất'], chi: ['Dần', 'Mão', 'Thìn'] }, 'TÂY': { can: ['Canh', 'Tân'], chi: ['Thân', 'Dậu', 'Tuất'] }, 'NAM': { can: ['Bính', 'Đinh'], chi: ['Tị', 'Ngọ', 'Mùi'] }, 'BẮC': { can: ['Nhâm', 'Quý'], chi: ['Hợi', 'Tý', 'Sửu'] } };
    const sinhHopMap = { 'ĐÔNG': { can: ['Nhâm', 'Quý'], chi: ['Hợi', 'Tý', 'Sửu'] }, 'TÂY': { can: ['Mậu', 'Kỷ'], chi: ['Thìn', 'Tuất', 'Sửu', 'Mùi'] }, 'NAM': { can: ['Giáp', 'Ất'], chi: ['Dần', 'Mão', 'Thìn'] }, 'BẮC': { can: ['Canh', 'Tân'], chi: ['Thân', 'Dậu', 'Tuất'] } };
    const tamHopMap = { 'ĐÔNG': ['Hợi', 'Mão', 'Mùi'], 'TÂY': ['Tị', 'Dậu', 'Sửu'], 'NAM': ['Dần', 'Ngọ', 'Tuất'], 'BẮC': ['Thân', 'Tý', 'Thìn'] };

    const tuHopData = tuHopMap[phuong] || { can: [], chi: [] };
    const sinhHopData = sinhHopMap[phuong] || { can: [], chi: [] };
    const tamHopData = tamHopMap[phuong] || [];

    const thblCan = tamHopBoLongCanMap[huongKey] || '';
    const thblChiAn = tamHopBoLongChiMap['Ấn Cục'][huongKey] || [];
    const thblChiTai = tamHopBoLongChiMap['Tài Cục'][huongKey] || [];
    const thblChiVuong = tamHopBoLongChiMap['Vượng Cục'][huongKey] || [];

    const cell = (can, chi, chiRaw) => ({ can: can || [], chi: chi || [], chiRaw: chiRaw || null });

    const tranhRows = [
        { label: 'Ngũ Hoàng', nam: cell([], nguHoangNamChi), thang: cell([], nguHoangThangChi), ngay: cell([], []), gio: cell([], []) },
        { label: 'Xung Thái Tuế', nam: cell([], [tuePhaChi]), thang: cell([], [tuePhaChi]), ngay: cell([], []), gio: cell([], []) },
        { label: 'Tam Sát', nam: cell([], tamSatChi), thang: cell([], tamSatChi), ngay: cell([], tamSatChi), gio: cell([], tamSatChi) },
        { label: 'Bát Sát', nam: cell([], [batSatChi]), thang: cell([], [batSatChi]), ngay: cell([], [batSatChi]), gio: cell([], [batSatChi]) },
        { label: 'Xung Tọa', nam: cell([], [xungToaChi]), thang: cell([], [xungToaChi]), ngay: cell([], [xungToaChi]), gio: cell([], [xungToaChi]) },
        { label: 'Xung Tuổi', nam: cell([], [xungTuoiChi]), thang: cell([], [xungTuoiChi]), ngay: cell([], [xungTuoiChi]), gio: cell([], [xungTuoiChi]) },
    ];

    const chonRows = [
        { label: 'Tự Hợp', nam: cell([], []), thang: cell([], tuHopData.chi), ngay: cell(tuHopData.can, tuHopData.chi), gio: cell(tuHopData.can, tuHopData.chi) },
        { label: 'Sinh Hợp', nam: cell([], []), thang: cell([], sinhHopData.chi), ngay: cell(sinhHopData.can, sinhHopData.chi), gio: cell(sinhHopData.can, sinhHopData.chi) },
        { label: 'Tam Hợp', nam: cell([], []), thang: cell([], tamHopData), ngay: cell([], tamHopData), gio: cell([], tamHopData) },
        { label: 'Ấn Cục', nam: cell([], []), thang: cell([], thblChiAn), ngay: cell(thblCan ? [thblCan] : [], thblChiAn), gio: cell(thblCan ? [thblCan] : [], thblChiAn) },
        { label: 'Tài Cục', nam: cell([], []), thang: cell([], thblChiTai), ngay: cell(thblCan ? [thblCan] : [], thblChiTai), gio: cell(thblCan ? [thblCan] : [], thblChiTai) },
        { label: 'Vượng Cục', nam: cell([], []), thang: cell([], thblChiVuong), ngay: cell(thblCan ? [thblCan] : [], thblChiVuong), gio: cell(thblCan ? [thblCan] : [], thblChiVuong) },
    ];

    function collectColSets(rows, colName) {
        const canSet = new Set(), chiSet = new Set();
        rows.forEach(r => {
            (r[colName].can || []).forEach(c => c && canSet.add(c));
            (r[colName].chi || []).forEach(c => c && chiSet.add(c));
        });
        return { canSet, chiSet };
    }

    const cellHtml = (value, typeCls) => {
        const isEmpty = !value || value.length === 0 || (value.length === 1 && value[0] === '');
        if (isEmpty) return '<span class="tc-empty">—</span>';
        const cls = typeCls === 'tranh' ? 'tc-value--tranh' : 'tc-value--chon';
        return `<span class="tc-value ${cls}">${fmtTcArr(value)}</span>`;
    };

    let html = `<div class="m-tranchon-table-wrap"><table class="m-tranchon-table">`;
    html += `<thead>
        <tr>
            <th class="col-type" rowspan="2">THẦN SÁT/ TAM HỢP ( Bổ Long)</th>
            <th colspan="2" class="col-year">NĂM</th>
            <th colspan="2" class="col-month">THÁNG</th>
            <th colspan="2" class="col-day">NGÀY</th>
            <th colspan="2" class="col-hour">GIỜ</th>
        </tr>
        <tr>
            <th>CAN</th><th>CHI</th>
            <th>CAN</th><th>CHI</th>
            <th>CAN</th><th>CHI</th>
            <th>CAN</th><th>CHI</th>
        </tr>
    </thead><tbody>`;

    function renderCellPair(cc, type) {
        const canTd = `<td>${cellHtml(cc.can, type)}</td>`;
        const chiTd = cc.chiRaw != null ? `<td class="tc-multi">${cc.chiRaw}</td>` : `<td>${cellHtml(cc.chi, type)}</td>`;
        return canTd + chiTd;
    }

    function renderSummaryRows(rows, type) {
        const color = type === 'tranh' ? 'var(--danger)' : 'var(--success)';
        const icon = type === 'tranh' ? '🔴' : '🟢';
        const cls = type === 'tranh' ? 'tc-tranh' : 'tc-chon';
        let out = '';
        rows.forEach(r => {
            out += `<tr class="${cls}"><td class="col-type" style="color:${color};">${icon} ${r.label}</td>`;
            ['nam', 'thang', 'ngay', 'gio'].forEach(col => { out += renderCellPair(r[col], type); });
            out += `</tr>`;
        });
        return out;
    }

    html += renderSummaryRows(tranhRows, 'tranh');
    html += renderSummaryRows(chonRows, 'chon');

    const cols = ['nam', 'thang', 'ngay', 'gio'];
    const ketLuanTranh = {};
    const ketLuanChon = {};

    const allGlobalTranhCan = new Set();
    const allGlobalTranhChi = new Set();
    const allGlobalChonCanRaw = new Set();
    const allGlobalChonChiRaw = new Set();

    cols.forEach(col => {
        const t = collectColSets(tranhRows, col);
        const cRaw = collectColSets(chonRows, col);
        
        const cCanFiltered = [...cRaw.canSet].filter(x => !t.canSet.has(x));
        const cChiFiltered = [...cRaw.chiSet].filter(x => !t.chiSet.has(x));

        ketLuanTranh[col] = cell([...t.canSet], [...t.chiSet]);
        ketLuanChon[col] = cell(cCanFiltered, cChiFiltered);

        t.canSet.forEach(v => allGlobalTranhCan.add(v));
        t.chiSet.forEach(v => allGlobalTranhChi.add(v));
        cRaw.canSet.forEach(v => allGlobalChonCanRaw.add(v));
        cRaw.chiSet.forEach(v => allGlobalChonChiRaw.add(v));
    });

    MOBILE_STATE.tranhCanArr = [...allGlobalTranhCan];
    MOBILE_STATE.tranhChiArr = [...allGlobalTranhChi];
    MOBILE_STATE.chonCanArr = [...allGlobalChonCanRaw].filter(x => !allGlobalTranhCan.has(x));
    MOBILE_STATE.chonChiArr = [...allGlobalChonChiRaw].filter(x => !allGlobalTranhChi.has(x));

    // LẤY DỮ LIỆU RIÊNG CHO NGÀY & GIỜ (Để phục vụ mục 1B Lọc Can/Chi)
    const tNgayGio = { canSet: new Set(), chiSet: new Set() };
    const cNgayGioRaw = { canSet: new Set(), chiSet: new Set() };
    ['ngay', 'gio'].forEach(col => {
        const t = collectColSets(tranhRows, col);
        const cRaw = collectColSets(chonRows, col);
        t.canSet.forEach(v => tNgayGio.canSet.add(v));
        t.chiSet.forEach(v => tNgayGio.chiSet.add(v));
        cRaw.canSet.forEach(v => cNgayGioRaw.canSet.add(v));
        cRaw.chiSet.forEach(v => cNgayGioRaw.chiSet.add(v));
    });

    MOBILE_STATE.tranhCanNgayGioArr = [...tNgayGio.canSet];
    MOBILE_STATE.tranhChiNgayGioArr = [...tNgayGio.chiSet];
    MOBILE_STATE.chonCanNgayGioArr = [...cNgayGioRaw.canSet].filter(x => !tNgayGio.canSet.has(x));
    MOBILE_STATE.chonChiNgayGioArr = [...cNgayGioRaw.chiSet].filter(x => !tNgayGio.chiSet.has(x));

    html += `<tr class="tc-summary-row tc-tranh">
                <td class="col-type" style="color:var(--danger);">🚫 NÊN TRÁNH</td>`;
    cols.forEach(col => { html += renderCellPair(ketLuanTranh[col], 'tranh'); });
    html += `</tr>`;

    html += `<tr class="tc-summary-row tc-chon">
                <td class="col-type" style="color:var(--success);">✅ NÊN CHỌN</td>`;
    cols.forEach(col => { html += renderCellPair(ketLuanChon[col], 'chon'); });
    html += `</tr>`;

    html += `</tbody></table></div>`;
    bodyEl.innerHTML = html;
    container.style.display = 'block';
}

// ==================== CREATE FILTER UI ====================
function createFilterUI() {
    buildMonthGrid(); 
    createFilterCanChi(); 
    createFilterTietKhi(); 
    createFilterHanhVanPairs();
    createFilterHanhVanPillar();
    createFilterChiPairs();
    createFilterVaiTro();
    createFilterGiaDinh();
    createFilterThatTinh();
    createFilterHuynhDe();
}

function updateFilterUIWithData() {
    buildMonthGrid(); 
    createFilterCanChi(); 
    createFilterTietKhi(); 
}

function createFilterCanChi() {
    const canContainer = document.getElementById('filter-can');
    const chiContainer = document.getElementById('filter-chi');
    
    // Sử dụng dữ liệu riêng của Ngày & Giờ cho bộ lọc 1B
    const chonCans = MOBILE_STATE.chonCanNgayGioArr || [];
    const chonChis = MOBILE_STATE.chonChiNgayGioArr || [];
    const tranhCans = MOBILE_STATE.tranhCanNgayGioArr || [];
    const tranhChis = MOBILE_STATE.tranhChiNgayGioArr || [];

    if (canContainer) {
        canContainer.innerHTML = THIEN_CAN.map(c => {
            let star = '';
            if (chonCans.includes(c)) star = '<span class="m-chip-star" title="Nên chọn" style="color:var(--gold);">⭐</span>';
            else if (!tranhCans.includes(c)) star = '<span class="m-chip-star" title="Bình thường" style="color:#FFF; text-shadow: 0 0 1px #000;">☆</span>';
            
            return `<span class="m-chip" data-can="${c}" onclick="toggleChip(this)">${star}${c}</span>`;
        }).join('');
    }

    if (chiContainer) {
        chiContainer.innerHTML = DIA_CHI.map(c => {
            let star = '';
            if (chonChis.includes(c)) star = '<span class="m-chip-star" title="Nên chọn" style="color:var(--gold);">⭐</span>';
            else if (!tranhChis.includes(c)) star = '<span class="m-chip-star" title="Bình thường" style="color:#FFF; text-shadow: 0 0 1px #000;">☆</span>';
            
            return `<span class="m-chip" data-chi="${c}" onclick="toggleChip(this)">${star}${c}</span>`;
        }).join('');
    }
}

function toggleAllCanChi() {
    const chips = document.querySelectorAll('#filter-can .m-chip, #filter-chi .m-chip');
    if (chips.length === 0) return;
    const allActive = Array.from(chips).every(c => c.classList.contains('active'));
    chips.forEach(c => {
        if (allActive) c.classList.remove('active');
        else c.classList.add('active');
    });
    updateCanChiAllBtn();
    updateFilterBadge();
}

function updateCanChiAllBtn() {
    const btn = document.getElementById('btn-canchi-all');
    if (!btn) return;
    const chips = document.querySelectorAll('#filter-can .m-chip, #filter-chi .m-chip');
    const allActive = chips.length > 0 && Array.from(chips).every(c => c.classList.contains('active'));
    btn.textContent = allActive ? '❎ Bỏ chọn tất cả' : '✅ Chọn tất cả';
    
    const activeCount = document.querySelectorAll('#filter-can .m-chip.active, #filter-chi .m-chip.active').length;
    const textEl = document.getElementById('canchi-dropdown-text');
    if (textEl) textEl.textContent = activeCount > 0 ? `Đã chọn ${activeCount} Can/Chi` : 'Lọc Can & Chi';
}

function createFilterTietKhi() {
    const container = document.getElementById('filter-tietkhi');
    const relevantSet = new Set();

    if (MOBILE_STATE.inputData) {
        const son = MOBILE_STATE.inputData.toaInfo.son;
        const data = THAI_DUONG_AM_DATA[son];
        if (data) {
            [data.tdDaoToa, data.tdDaoHuong, data.taDaoToa, data.taDaoHuong].forEach(tk => {
                if (tk && TIET_KHI.includes(tk)) relevantSet.add(tk);
            });
            if (data.tdDaoTamHop) {
                data.tdDaoTamHop.split('\n').forEach(line => {
                    const tk = line.split(' đáo ')[0];
                    if (tk && TIET_KHI.includes(tk)) relevantSet.add(tk);
                });
            }
        }
    }

    if (container) {
        container.innerHTML = TIET_KHI.map(tk => {
            const star = relevantSet.has(tk) ? '<span class="m-chip-star" title="Thái Dương/Thái Âm đáo tọa" style="color:var(--gold);">⭐</span>' : '';
            return `<span class="m-chip" data-tietkhi="${tk}" onclick="toggleChip(this)">${star}${tk}</span>`;
        }).join('');
    }

    updateTietKhiAllBtn();
}

function toggleAllTietKhi() {
    const chips = document.querySelectorAll('#filter-tietkhi .m-chip');
    const allActive = chips.length > 0 && Array.from(chips).every(c => c.classList.contains('active'));
    chips.forEach(c => {
        if (allActive) c.classList.remove('active');
        else c.classList.add('active');
    });
    updateTietKhiAllBtn();
    updateFilterBadge();
}

function updateTietKhiAllBtn() {
    const btn = document.getElementById('btn-tietkhi-all');
    if (!btn) return;
    const chips = document.querySelectorAll('#filter-tietkhi .m-chip');
    const all = chips.length > 0 && Array.from(chips).every(c => c.classList.contains('active'));
    btn.textContent = all ? '❎ Bỏ chọn tất cả' : '✅ Chọn tất cả';
    
    const activeCount = document.querySelectorAll('#filter-tietkhi .m-chip.active').length;
    const textEl = document.getElementById('tietkhi-dropdown-text');
    if (textEl) textEl.textContent = activeCount > 0 ? `Đã chọn ${activeCount} Tiết khí` : 'Lọc Tiết Khí';
}

function createFilterHanhVanPairs() {
    const hanhContainer = document.getElementById('filter-hanh-pairs');
    const vanContainer = document.getElementById('filter-van-pairs');

    const orderedPairs = [
        { key: 'tuoi-toa', label: '☆  Tuổi ↔ Tọa' },
        { key: 'tuoi-ngay', label: '⭐ Tuổi ↔ Ngày' },
        { key: 'toa-ngay', label: '⭐ Tọa ↔ Ngày' },
        { key: 'gio-ngay', label: '⭐ Giờ ↔ Ngày' },
        { key: 'ngay-thang', label: '⭐ Ngày ↔ Tháng' },
        { key: 'ngay-nam', label: '☆  Ngày ↔ Năm' },
        { key: 'thang-nam', label: '⭐ Tháng ↔ Năm' }
    ];

    const hanhRelations = ['Cùng Quái', 'Hợp Ngũ', 'Hợp Thập', 'Hợp Thập Ngũ', 'Hà Đồ', 'Sinh Nhập', 'Khắc Nhập'];
    const vanRelations = ['Cùng Quái', 'Hợp Ngũ', 'Hợp Thập', 'Hợp Thập Ngũ', 'Hà Đồ', 'Điên Đảo Ai Tinh'];

    function buildPairHTML(prefix, relations) {
        return orderedPairs.map(p => {
            const bodyId = `dropdown-${prefix}-${p.key}-body`;
            const chevId = `dropdown-${prefix}-${p.key}-chev`;
            return `
            <div class="m-dropdown">
                <div class="m-dropdown-header" onclick="toggleGenericDropdown('${bodyId}', '${chevId}')">
                    <span>${p.label}</span>
                    <span class="m-chevron" id="${chevId}">▼</span>
                </div>
                <div class="m-dropdown-body" id="${bodyId}" style="display:none;">
                    <button type="button" class="m-select-all-btn" onclick="toggleSelectAllDropdown('${bodyId}', this)">✅ Chọn tất cả</button>
                    <div class="m-pair-chips">
                        ${relations.map(r => `
                            <span class="m-pair-chip" data-pair="${prefix}-${p.key}" data-rel="${r}" onclick="togglePairChip(this); updateSelectAllBtn('${bodyId}', this.parentNode.previousElementSibling)">${r}</span>
                        `).join('')}
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    if (hanhContainer) hanhContainer.innerHTML = buildPairHTML('hanh', hanhRelations);
    if (vanContainer) vanContainer.innerHTML = buildPairHTML('van', vanRelations);
}

function createFilterHanhVanPillar() {
    const container = document.getElementById('filter-hanhvan-pillar');
    if (!container) return;
    
    const pillars = [
        { id: 'tuoi', label: 'Trụ Tuổi' },
        { id: 'toa', label: 'Trụ Tọa' },
        { id: 'gio', label: 'Trụ Giờ' },
        { id: 'ngay', label: 'Trụ Ngày' },
        { id: 'thang', label: 'Trụ Tháng' },
        { id: 'nam', label: 'Trụ Năm' }
    ];

    let html = '';
    pillars.forEach(p => {
        const bodyId = `dropdown-pillar-${p.id}-body`;
        const chevId = `dropdown-pillar-${p.id}-chev`;
        html += `
        <div class="m-dropdown">
            <div class="m-dropdown-header" onclick="toggleGenericDropdown('${bodyId}', '${chevId}')">
                <span>${p.label}</span>
                <span class="m-chevron" id="${chevId}">▼</span>
            </div>
            <div class="m-dropdown-body" id="${bodyId}" style="display:none;">
                <button type="button" class="m-select-all-btn" onclick="toggleSelectAllDropdown('${bodyId}', this)">✅ Chọn tất cả</button>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <span style="font-size:0.7rem;color:var(--text-muted);width:100%;">Hành:</span>
                    ${[1,2,3,4,5,6,7,8,9].map(i => `<span class="m-pair-chip" data-hanh-pillar="${p.id}" data-hanh-val="${i}" onclick="togglePairChip(this); updateSelectAllBtn('${bodyId}', this.parentNode.previousElementSibling.previousElementSibling)">${i}</span>`).join('')}
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
                    <span style="font-size:0.7rem;color:var(--text-muted);width:100%;">Vận:</span>
                    ${[1,2,3,4,5,6,7,8,9].map(i => `<span class="m-pair-chip" data-van-pillar="${p.id}" data-van-val="${i}" onclick="togglePairChip(this); updateSelectAllBtn('${bodyId}', this.parentNode.previousElementSibling.previousElementSibling.previousElementSibling)">${i}</span>`).join('')}
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function createFilterChiPairs() {
    const chiContainer = document.getElementById('filter-chi-pairs');
    if (!chiContainer) return;

    const orderedPairs = [
        { key: 'tuoi-toa', label: '☆  Tuổi ↔ Tọa' },
        { key: 'tuoi-ngay', label: '⭐ Tuổi ↔ Ngày' },
        { key: 'toa-ngay', label: '⭐ Tọa ↔ Ngày' },
        { key: 'gio-ngay', label: '⭐ Giờ ↔ Ngày' },
        { key: 'ngay-thang', label: '⭐ Ngày ↔ Tháng' },
        { key: 'ngay-nam', label: '☆  Ngày ↔ Năm' },
        { key: 'thang-nam', label: '⭐ Tháng ↔ Năm' }
    ];

    const chiRelations = ['Không Xung', 'Tam Hợp', 'Nhị Hợp'];

    let html = orderedPairs.map(p => {
        const bodyId = `dropdown-chi-${p.key}-body`;
        const chevId = `dropdown-chi-${p.key}-chev`;
        return `
        <div class="m-dropdown">
            <div class="m-dropdown-header" onclick="toggleGenericDropdown('${bodyId}', '${chevId}')">
                <span>${p.label}</span>
                <span class="m-chevron" id="${chevId}">▼</span>
            </div>
            <div class="m-dropdown-body" id="${bodyId}" style="display:none;">
                <button type="button" class="m-select-all-btn" onclick="toggleSelectAllDropdown('${bodyId}', this)">✅ Chọn tất cả</button>
                <div class="m-pair-chips">
                    ${chiRelations.map(r => `
                        <span class="m-pair-chip" data-pair="chi-${p.key}" data-rel="${r}" onclick="togglePairChip(this); updateSelectAllBtn('${bodyId}', this.parentNode.previousElementSibling)">${r}</span>
                    `).join('')}
                </div>
            </div>
        </div>`;
    }).join('');

    chiContainer.innerHTML = html;
}

function createFilterVaiTro() {
    const container = document.getElementById('filter-vaitro');
    if (!container) return;
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

function createFilterGiaDinh() {
    const container = document.getElementById('filter-giadinh');
    if (!container) return;
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

function createFilterThatTinh() {
    const container = document.getElementById('filter-thattinh');
    if (!container) return;
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

function createFilterHuynhDe() {
    const container = document.getElementById('filter-huynhde');
    if (!container) return;
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
    updateTietKhiAllBtn();
    updateCanChiAllBtn();
}

function togglePairChip(chip) {
    chip.classList.toggle('active');
    updateFilterBadge();
}

// ==================== GET FILTER STATE ====================
function getFilterState() {
    const state = {
        tietKhi: [],
        can: [],
        chi: [],
        hanhPairs: {},
        vanPairs: {},
        chiPairs: {}, // 2E
        hanhPillar: {},
        vanPillar: {},
        hkdq: {},
        giadinh: {},
    };

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

    document.querySelectorAll('#filter-chi-pairs .m-pair-chip.active').forEach(chip => {
        const pair = chip.dataset.pair.replace('chi-', '');
        if (!state.chiPairs[pair]) state.chiPairs[pair] = [];
        state.chiPairs[pair].push(chip.dataset.rel);
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

function countActiveFilters(state) {
    let count = 0;
    count += state.tietKhi.length;
    count += state.can.length;
    count += state.chi.length;
    if (state.hanhPairs) count += Object.keys(state.hanhPairs).length;
    if (state.vanPairs) count += Object.keys(state.vanPairs).length;
    if (state.chiPairs) count += Object.keys(state.chiPairs).length;
    if (state.hanhPillar) count += Object.keys(state.hanhPillar).length;
    if (state.vanPillar) count += Object.keys(state.vanPillar).length;
    if (state.hkdq) count += Object.values(state.hkdq).filter(Boolean).length;
    if (state.giadinh) count += Object.keys(state.giadinh).length;
    return count;
}

function updateLayerBadge(id, count) {
    const badge = document.getElementById(id);
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

function updateFilterBadge() {
    const state = getFilterState();
    const total = countActiveFilters(state);

    const badgeTotal = document.getElementById('filter-badge-total');
    if (badgeTotal) {
        badgeTotal.textContent = total;
        badgeTotal.style.display = total > 0 ? 'inline-flex' : 'none';
    }

    updateLayerBadge('badge-layer1', state.tietKhi.length + state.can.length + state.chi.length);
    
    let l2 = 0;
    if (state.hanhPairs) l2 += Object.keys(state.hanhPairs).length;
    if (state.vanPairs) l2 += Object.keys(state.vanPairs).length;
    if (state.chiPairs) l2 += Object.keys(state.chiPairs).length;
    if (state.hanhPillar) l2 += Object.keys(state.hanhPillar).length;
    if (state.vanPillar) l2 += Object.keys(state.vanPillar).length;
    updateLayerBadge('badge-layer2', l2);

    let l3 = 0;
    if (state.hkdq) l3 += Object.values(state.hkdq).filter(Boolean).length;
    if (state.giadinh) l3 += Object.keys(state.giadinh).length;
    updateLayerBadge('badge-layer3', l3);
}

// ==================== GENERATE ALL DATES ====================
async function generateAllDates() {
    const d = MOBILE_STATE.inputData;
    if (!d) return;

    const lunarYear = d.viewYear;
    const startJDN = getLunarNewYearJDN(lunarYear) - 15;
    const endJDN = getLunarNewYearJDN(lunarYear + 1) - 1 + 15;

    const selected = new Set(MOBILE_STATE.selectedMonths || []);
    const dates = [];
    for (let jdn = startJDN; jdn <= endJDN; jdn++) {
        const info = getDateInfo(jdn);
        if (selected.has(info.lunarMonth)) dates.push(info);
    }

    MOBILE_STATE.allDates = dates;
}

// ==============================================
// HKĐQ HELPERS
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

function hasHkdqFilters(state) {
    if (!state || !state.hkdq && !state.giadinh) return false;
    if (state.hkdq && Object.values(state.hkdq).some(Boolean)) return true;
    if (state.giadinh && Object.keys(state.giadinh).length > 0) return true;
    return false;
}

function checkHkdqConditions(ketQua, state) {
    const h = state.hkdq || {};
    const gd = state.giadinh || {};

    if (h.phaiCoPhuMau && ketQua.thongKeVaiTro['Phụ Mẫu'] < 1) return false;
    if (h.phaiCoTuTuc && ketQua.thongKeVaiTro['Tử Tức'] < 1) return false;
    if (h.duPhuMauTuTuc && (ketQua.thongKeVaiTro['Phụ Mẫu'] < 1 || ketQua.thongKeVaiTro['Tử Tức'] < 1)) return false;
    if (h.khongKXD && ketQua.thongKeAmDuong['KXĐ'] > 0) return false;
    if (h.canBangAmDuong) {
        if (ketQua.thongKeAmDuong['Dương'] > 0 && ketQua.thongKeAmDuong['Âm'] === 0) return false;
        if (ketQua.thongKeAmDuong['Âm'] > 0 && ketQua.thongKeAmDuong['Dương'] === 0) return false;
    }
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
    if (h.phaiCoThatTinh && ketQua.cacCapThatTinh.length === 0) return false;
    if (h.khongThatTinh && ketQua.cacCapThatTinh.length > 0) return false;
    if (h.phaiCoHuynhDe && ketQua.thongKeVaiTro['Huynh Đệ'] < 2) return false;
    if (h.khongHuynhDe && ketQua.thongKeVaiTro['Huynh Đệ'] > 0) return false;

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

// ==================== CHI RELATIONS HELPERS ====================
const LUC_HOP_MAP = {
    'Tý': 'Sửu', 'Sửu': 'Tý',
    'Dần': 'Hợi', 'Hợi': 'Dần',
    'Mão': 'Tuất', 'Tuất': 'Mão',
    'Thìn': 'Dậu', 'Dậu': 'Thìn',
    'Tị': 'Thân', 'Thân': 'Tị',
    'Ngọ': 'Mùi', 'Mùi': 'Ngọ'
};

function isLucHop(c1, c2) {
    return LUC_HOP_MAP[c1] === c2;
}

function isTamHop(c1, c2) {
    const groups = [
        ['Thân', 'Tý', 'Thìn'],
        ['Dần', 'Ngọ', 'Tuất'],
        ['Hợi', 'Mão', 'Mùi'],
        ['Tị', 'Dậu', 'Sửu']
    ];
    for (const g of groups) {
        if (g.includes(c1) && g.includes(c2)) return true;
    }
    return false;
}

function getChiForPillar(pillarKey, d, dayInfo, hourCanChiText) {
    let canChi = null;
    switch(pillarKey) {
        case 'tuoi': canChi = d.birthInfo.canChi; break;
        case 'toa': canChi = d.toaInfo.canChi; break;
        case 'ngay': canChi = dayInfo.dayCanChi; break;
        case 'thang': canChi = dayInfo.thangCanChiTK; break;
        case 'nam': canChi = dayInfo.namCanChiTK; break;
        case 'gio': canChi = hourCanChiText; break;
    }
    if (!canChi || canChi === 'N/A') return null;
    return canChi.split(' ')[1];
}

// ==================== APPLY ALL FILTERS ====================
function getHanhVanForPillar(pillarKey, hanhOrVan, d, dayInfo, hourCanChiText) {
    let canChi = null;
    switch(pillarKey) {
        case 'tuoi': canChi = d.birthInfo.canChi; break;
        case 'toa': canChi = d.toaInfo.canChi; break;
        case 'ngay': canChi = dayInfo.dayCanChi; break;
        case 'thang': canChi = dayInfo.thangCanChiTK; break;
        case 'nam': canChi = dayInfo.namCanChiTK; break;
        case 'gio': canChi = hourCanChiText; break;
    }
    if (!canChi || canChi === 'N/A') return [];
    return hanhOrVan === 'hanh' ? getHanhFromCanChi(canChi) : getVanFromCanChi(canChi);
}

function applyAllFilters() {
    if (!MOBILE_STATE.inputData) {
        showToast('⚠️ Vui lòng nhập thông tin và nhấn "XEM KẾT QUẢ" trước');
        return;
    }

    // NẾU KHÔNG PHẢI DO NGƯỜI DÙNG BẤM NÚT, CHỈ CẬP NHẬT BADGE VÀ THOÁT
    if (!window._userTriggeredApply) {
        updateFilterBadge();
        return;
    }

    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';

    requestAnimationFrame(async () => {
        try {
            await generateAllDates();
            const d = MOBILE_STATE.inputData;
            const filterState = getFilterState();
            MOBILE_STATE.filterState = filterState;

            const toaInfo = d.toaInfo;
            const satsInfo = d.satsInfo;
            const birthInfo = d.birthInfo;

            const filtered = [];
            const needHkdqCheck = hasHkdqFilters(filterState);

            for (const dateInfo of MOBILE_STATE.allDates) {
                const dayCan = dateInfo.dayCanChi.split(' ')[0];
                const dayChi = dateInfo.dayCanChi.split(' ')[1];

                // Lọc Tiết khí
                if (filterState.tietKhi.length > 0 && !filterState.tietKhi.includes(dateInfo.tietKhi)) continue;

                // TÍNH THÁNG/NĂM TK
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
                dateInfo.thangCanChiTK = thangCanChiTK;
                dateInfo.namCanChiTK = namCanChiTK;

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
                    const hourCan = hourCanChiText.split(' ')[0];
                    const hourChi = hourCanChiText.split(' ')[1];

                    // ==== LỌC CAN / CHI (1B) ====
                    let skipHour = false;
                    
                    if (filterState.can.length > 0) {
                        if (!filterState.can.includes(dayCan) && !filterState.can.includes(hourCan)) {
                            skipHour = true;
                        }
                    }
                    if (filterState.chi.length > 0) {
                        if (!filterState.chi.includes(dayChi) && !filterState.chi.includes(hourChi)) {
                            skipHour = true;
                        }
                    }

                    if (skipHour) continue;

                    // ==== LỌC TẦNG 2: TỐI ƯU HÀNH, VẬN & CHI ====
                    let passLayer2 = true;

                    // 1. Kiểm tra 2D: Hành Cụ thể (OR trong 1 trụ, AND giữa các trụ)
                    for (const [pKey, requiredHanh] of Object.entries(filterState.hanhPillar)) {
                        if (requiredHanh.length === 0) continue;
                        const hanhArr = getHanhVanForPillar(pKey, 'hanh', d, dateInfo, hourCanChiText);
                        if (!hanhArr.some(hv => requiredHanh.includes(hv))) {
                            passLayer2 = false; break;
                        }
                    }
                    if (!passLayer2) continue;

                    // 2. Kiểm tra 2D: Vận Cụ thể (OR trong 1 trụ, AND giữa các trụ)
                    for (const [pKey, requiredVan] of Object.entries(filterState.vanPillar)) {
                        if (requiredVan.length === 0) continue;
                        const vanArr = getHanhVanForPillar(pKey, 'van', d, dateInfo, hourCanChiText);
                        if (!vanArr.some(vv => requiredVan.includes(vv))) {
                            passLayer2 = false; break;
                        }
                    }
                    if (!passLayer2) continue;

                    // 3. Kiểm tra 2B: Quan hệ Hành giữa các cặp (OR trong 1 cặp, AND giữa các cặp)
                    for (const [pairKey, requiredRels] of Object.entries(filterState.hanhPairs)) {
                        if (requiredRels.length === 0) continue;
                        const [p1, p2] = pairKey.split('-');
                        const hanh1 = getHanhVanForPillar(p1, 'hanh', d, dateInfo, hourCanChiText);
                        const hanh2 = getHanhVanForPillar(p2, 'hanh', d, dateInfo, hourCanChiText);
                        
                        let pairMatched = false;
                        for (const h1 of hanh1) {
                            for (const h2 of hanh2) {
                                const rels = [...checkHanhRelations(h1, h2), ...checkDirectedRelations(h1, h2)];
                                if (rels.some(r => requiredRels.includes(r))) {
                                    pairMatched = true; break;
                                }
                            }
                            if (pairMatched) break;
                        }
                        if (!pairMatched) { passLayer2 = false; break; }
                    }
                    if (!passLayer2) continue;

                    // 4. Kiểm tra 2C: Quan hệ Vận giữa các cặp (OR trong 1 cặp, AND giữa các cặp)
                    for (const [pairKey, requiredRels] of Object.entries(filterState.vanPairs)) {
                        if (requiredRels.length === 0) continue;
                        const [p1, p2] = pairKey.split('-');
                        const van1 = getHanhVanForPillar(p1, 'van', d, dateInfo, hourCanChiText);
                        const van2 = getHanhVanForPillar(p2, 'van', d, dateInfo, hourCanChiText);
                        
                        let pairMatched = false;
                        for (const v1 of van1) {
                            for (const v2 of van2) {
                                const rels = checkVanRelations(v1, v2);
                                if (rels.some(r => requiredRels.includes(r))) {
                                    pairMatched = true; break;
                                }
                            }
                            if (pairMatched) break;
                        }
                        if (!pairMatched) { passLayer2 = false; break; }
                    }
                    if (!passLayer2) continue;

                    // 5. Kiểm tra 2E: Quan hệ Chi giữa các cặp (OR trong 1 cặp, AND giữa các cặp)
                    for (const [pairKey, requiredRels] of Object.entries(filterState.chiPairs)) {
                        if (requiredRels.length === 0) continue;
                        const [p1, p2] = pairKey.split('-');
                        const chi1 = getChiForPillar(p1, d, dateInfo, hourCanChiText);
                        const chi2 = getChiForPillar(p2, d, dateInfo, hourCanChiText);

                        if (!chi1 || !chi2) { passLayer2 = false; break; }

                        let pairMatched = false;
                        for (const rel of requiredRels) {
                            if (rel === 'Không Xung') {
                                if (LUC_XUNG_MAP[chi1] !== chi2) pairMatched = true;
                            } else if (rel === 'Tam Hợp') {
                                if (isTamHop(chi1, chi2)) pairMatched = true;
                            } else if (rel === 'Lục Hợp') {
                                if (isLucHop(chi1, chi2)) pairMatched = true;
                            }
                        }
                        if (!pairMatched) { passLayer2 = false; break; }
                    }
                    if (!passLayer2) continue;


                    // ---- TÍNH ĐIỂM (Chỉ để hiển thị cho biết) ----
                    const hanhNgayArr = getHanhFromCanChi(dateInfo.dayCanChi);
                    const vanNgayArr = getVanFromCanChi(dateInfo.dayCanChi);
                    const hanhGioArr = getHanhFromCanChi(hourCanChiText);
                    const vanGioArr = getVanFromCanChi(hourCanChiText);
                    let totalScore = 0;
                    let bestHanhRel = '';
                    let bestVanRel = '';

                    if (hanhGioArr.length > 0 && hanhNgayArr.length > 0) {
                        const rels = [...checkHanhRelations(hanhGioArr[0], hanhNgayArr[0]), ...checkDirectedRelations(hanhGioArr[0], hanhNgayArr[0])];
                        totalScore += getBestScore(rels);
                        bestHanhRel = getBestRelName(rels);
                    }
                    if (vanGioArr.length > 0 && vanNgayArr.length > 0) {
                        const rels = checkVanRelations(vanGioArr[0], vanNgayArr[0]);
                        totalScore += getBestScore(rels);
                        bestVanRel = getBestRelName(rels);
                    }

                    // ---- LỌC HKĐQ (Tầng 3) ----
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
                        } catch (e) {}
                    }

                    passingHours.push({
                        chi: h.chi, hour: h.hour, hourCanChi: hourCanChiText,
                        hanhGioArr, vanGioArr,
                        totalScore, bestHanhRel, bestVanRel,
                    });
                }

                passingHours.sort((a, b) => b.totalScore - a.totalScore);

                if (passingHours.length > 0) {
                    const dayScore = passingHours.length > 0 ? Math.max(...passingHours.map(h => h.totalScore)) : 0;
                    filtered.push({
                        ...dateInfo,
                        dayScore,
                        passingHours,
                    });
                }
            }

            MOBILE_STATE.filteredDates = filtered;
            MOBILE_STATE.displayCount = 15;

            renderResults();
            updateFilterBadge();
            updateResultsStats(filtered);
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
    if (dayInfo.tietKhi && dayInfo.tietKhi !== '') {
        metaTags += `<span class="m-day-meta-tag m-day-meta-tag--tietkhi">${dayInfo.tietKhi}</span>`;
    }

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

function loadMoreResults() {
    MOBILE_STATE.displayCount += 15;
    renderResults();
}

// ==================== DETAIL MODAL ====================
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
function clearAllFilters() {
    document.querySelectorAll('.m-filter-item input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.m-chip.active').forEach(chip => chip.classList.remove('active'));
    document.querySelectorAll('.m-pair-chip.active').forEach(chip => chip.classList.remove('active'));

    MOBILE_STATE.selectedMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    buildMonthGrid();

    // Cập nhật lại Text cho nút Chọn tất cả
    document.querySelectorAll('.m-select-all-btn').forEach(btn => btn.textContent = '✅ Chọn tất cả');

    MOBILE_STATE.filteredDates = [];
    MOBILE_STATE.displayCount = 15;
    MOBILE_STATE.filterState = null;
    document.getElementById('results-container').innerHTML = '<div class="m-empty-state"><span style="font-size:48px;">🔍</span><p>Nhập thông tin và nhấn "XEM KẾT QUẢ"<br>để bắt đầu chọn ngày</p></div>';
    document.getElementById('results-bar').style.display = 'none';
    document.getElementById('btn-load-more').style.display = 'none';
    document.getElementById('result-count-badge').style.display = 'none';
    
    // Tự động thu gọn tất cả khi xóa
    const sections = ['section-input-body', 'section-filter-body', 'section-results-body'];
    sections.forEach(id => {
        const body = document.getElementById(id);
        const chevron = document.getElementById(id + '-chevron');
        if(body) { body.classList.remove('m-section-body--open'); body.style.display = 'none'; }
        if(chevron) { chevron.textContent = '▶'; }
    });

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
