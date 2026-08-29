// ==========================================
// MOBILE-UI.JS – UI Logic cho Mobile
// ==========================================

/* =============================================
   GLOBAL STATE
   ============================================= */
const MOBILE_STATE = {
    // Input
    inputData: null,
    rangeMonths: 3,
    optLevel: 'cao',

    // Results
    allDays: [],
    filteredDays: [],
    renderedCount: 20,
    pageSize: 20,

    // Selection
    selectedDays: {},
    selectedHours: {},

    // Filter UI
    filterUIInitialized: false,
    filterState: {
        tietKhi: [],
        can: [],
        chi: [],
        hanhPairs: {},
        vanPairs: {},
        hanhVanPillar: {},
        vaiTro: [],
        giaDinh: {},
        thatTinh: [],
        huynhDe: []
    },

    // UI flags
    _userTriggeredApply: false,
    _savedInputHash: ''
};

/* =============================================
   SECTION / ACCORDION TOGGLE
   ============================================= */
function toggleSection(bodyId) {
    const body = document.getElementById(bodyId);
    const chevron = document.getElementById(bodyId + '-chevron');
    if (!body) return;
    const isOpen = body.classList.contains('m-section-body--open');
    if (isOpen) {
        body.classList.remove('m-section-body--open');
        body.style.display = 'none';
        if (chevron) chevron.textContent = '▶';
    } else {
        body.classList.add('m-section-body--open');
        body.style.display = 'block';
        if (chevron) chevron.textContent = '▼';
    }
}

function toggleAccordion(accId) {
    const body = document.getElementById(accId);
    const chevron = document.getElementById(accId + '-chevron');
    if (!body || !chevron) return;
    if (body.style.display === 'none' || !body.style.display) {
        body.style.display = 'block';
        chevron.textContent = '▼';
    } else {
        body.style.display = 'none';
        chevron.textContent = '▶';
    }
}

/* =============================================
   RANGE & OPT LEVEL
   ============================================= */
function setRange(months, btn) {
    MOBILE_STATE.rangeMonths = months;
    document.querySelectorAll('.m-range-btn[data-range]').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

function setOptLevel(level, btn) {
    MOBILE_STATE.optLevel = level;
    document.querySelectorAll('.m-range-btn[data-opt-level]').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

/* =============================================
   TOAST
   ============================================= */
function showToast(msg, duration = 2500) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('m-toast--show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('m-toast--show');
    }, duration);
}

/* =============================================
   LOADING
   ============================================= */
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
}

/* =============================================
   HANDLE VIEW RESULT
   ============================================= */
async function handleViewResult() {
    const birthYear = parseInt(document.getElementById('m-birth-year').value);
    const toaDo = parseFloat(document.getElementById('m-toa-do').value);
    const viewYear = parseInt(document.getElementById('m-view-year').value);
    const event = document.getElementById('m-event').value.trim();
    const location = document.getElementById('m-location').value.trim();

    if (!birthYear || !viewYear || isNaN(toaDo)) {
        showToast('⚠️ Vui lòng nhập đầy đủ: Năm sinh, Tọa độ, Năm xem');
        return;
    }

    if (birthYear < 1900 || birthYear > 2100) {
        showToast('⚠️ Năm sinh không hợp lệ (1900-2100)');
        return;
    }

    if (viewYear < 1900 || viewYear > 2100) {
        showToast('⚠️ Năm xem không hợp lệ (1900-2100)');
        return;
    }

    showLoading();

    try {
        MOBILE_STATE.inputData = {
            birthYear,
            toaDo,
            viewYear,
            event,
            location
        };

        // Clear old selections
        MOBILE_STATE.selectedDays = {};
        MOBILE_STATE.selectedHours = {};
        MOBILE_STATE._savedInputHash = '';
        try { localStorage.removeItem('xemngay_mobile_selected'); } catch (e) {}

        // Gọi hàm tính toán từ file gốc
        if (typeof computeAllDays === 'function') {
            MOBILE_STATE.allDays = computeAllDays(birthYear, toaDo, viewYear, MOBILE_STATE.rangeMonths);
        } else {
            MOBILE_STATE.allDays = [];
            console.warn('⚠️ computeAllDays chưa được định nghĩa (cần file calendar.js/fengshui.js)');
        }

        MOBILE_STATE.filteredDays = [...MOBILE_STATE.allDays];
        MOBILE_STATE.renderedCount = MOBILE_STATE.pageSize;

        // Render input info cards
        renderInputCards(MOBILE_STATE.inputData);

        // Render summary table
        renderSummaryTable(MOBILE_STATE.inputData);

        // Render Ngũ Hoàng cards
        renderNguHoangCards(MOBILE_STATE.inputData);

        // Show input results
        document.getElementById('input-results').style.display = 'block';

        // Apply filters & render
        window._userTriggeredApply = true;
        applyAllFilters();

        // Show results
        document.getElementById('results-bar').style.display = 'flex';
        document.getElementById('result-count-badge').style.display = 'inline-flex';

        // Scroll to results if user triggered
        if (window._userTriggeredApply) {
            setTimeout(() => {
                document.getElementById('section-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
                window._userTriggeredApply = false;
            }, 400);
        }

        showToast(`✅ Đã tìm thấy ${MOBILE_STATE.allDays.length} ngày trong ${MOBILE_STATE.rangeMonths} tháng`);

    } catch (error) {
        console.error('❌ Lỗi xử lý:', error);
        showToast('❌ Có lỗi xảy ra khi tính toán. Vui lòng thử lại.');
    } finally {
        hideLoading();
    }
}

/* =============================================
   RENDER INPUT CARDS
   ============================================= */
function renderInputCards(inputData) {
    const { birthYear, toaDo, viewYear } = inputData;

    // Card tuổi
    const cardTuoi = document.getElementById('card-tuoi');
    if (cardTuoi) {
        const canChi = getCanChiFromYear ? getCanChiFromYear(birthYear) : { can: '?', chi: '?' };
        cardTuoi.innerHTML = `
            <strong>Năm sinh:</strong> ${birthYear}<br>
            <strong>Can Chi:</strong> ${canChi.can} ${canChi.chi}<br>
            <strong>Mệnh:</strong> ${getMenhFromYear ? getMenhFromYear(birthYear) : '?'}
        `;
    }

    // Card tọa
    const cardToa = document.getElementById('card-toa');
    if (cardToa) {
        const sonName = getSonName ? getSonName(toaDo) : `${toaDo}°`;
        cardToa.innerHTML = `
            <strong>Tọa độ:</strong> ${toaDo}°<br>
            <strong>Sơn:</strong> ${sonName}<br>
            <strong>Hướng:</strong> ${getHuongFromToa ? getHuongFromToa(toaDo) : '?'}
        `;
    }

    // Card năm
    const cardNam = document.getElementById('card-nam');
    if (cardNam) {
        const yearCanChi = getCanChiFromYear ? getCanChiFromYear(viewYear) : { can: '?', chi: '?' };
        cardNam.innerHTML = `
            <strong>Năm xem (ÂL):</strong> ${viewYear} – ${yearCanChi.can} ${yearCanChi.chi}<br>
            <strong>Thái Tuế:</strong> ${yearCanChi.chi}<br>
            <strong>Tam Sát năm:</strong> ${computeTamSat ? computeTamSat(yearCanChi.chi) : '?'}
        `;
    }
}

/* =============================================
   RENDER BẢNG TỔNG HỢP TRÁNH/CHỌN (MOBILE)
   ============================================= */
function renderSummaryTable(inputData) {
    const wrapper = document.getElementById('summary-table-wrapper');
    if (!wrapper) return;
    wrapper.style.display = 'block';

    const { birthYear, toaDo, viewYear } = inputData;

    // Lấy Can Chi
    const birthCC = (typeof getCanChiFromYear === 'function') ? getCanChiFromYear(birthYear) : { can: '?', chi: '?', canIdx: 0, chiIdx: 0 };
    const yearCC = (typeof getCanChiFromYear === 'function') ? getCanChiFromYear(viewYear) : { can: '?', chi: '?', canIdx: 0, chiIdx: 0 };

    // Tính các giá trị
    const tranhData = computeTranhSummary(birthCC, yearCC, toaDo);
    const chonData = computeChonSummary(birthCC, yearCC);
    const thblData = computeTHBLSummary(birthCC, toaDo);
    const tdtaData = computeThaiDuongThaiAmSummary(toaDo, viewYear);
    const ketLuan = computeKetLuanSummary(tranhData, chonData);

    // Helper: gán text vào cell
    function set(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val || '';
    }

    const P = ['nam', 'thang', 'ngay', 'gio'];

    // --- TRÁNH ---
    const tranhKeys = ['nguhoang', 'tuepha', 'tamsat', 'batsat', 'xungtoa', 'xungtuoi'];
    tranhKeys.forEach(key => {
        P.forEach(p => {
            if (key === 'nguhoang') {
                set(`tranh-${key}-${p}-can`, tranhData[key]?.[p]?.can || '');
                set(`tranh-${key}-${p}-chi`, tranhData[key]?.[p]?.chi || '');
            } else {
                set(`tranh-${key}-${p}-chi`, tranhData[key]?.[p] || '');
            }
        });
    });

    // --- CHỌN ---
    ['tuhop', 'sinhhop', 'tamhop'].forEach(key => {
        P.forEach(p => {
            set(`chon-${key}-${p}-can`, chonData[key]?.[p]?.can || '');
            set(`chon-${key}-${p}-chi`, chonData[key]?.[p]?.chi || '');
        });
    });

    // --- THBL ---
    ['ancuc', 'taicuc', 'vuongcuc'].forEach(key => {
        P.forEach(p => {
            set(`thbl-${key}-${p}-can`, thblData[key]?.[p]?.can || '');
            set(`thbl-${key}-${p}-chi`, thblData[key]?.[p]?.chi || '');
        });
    });

    // --- KẾT LUẬN ---
    P.forEach(p => {
        set(`ketluan-tranh-${p}-can`, ketLuan.tranh[p]?.can || '');
        set(`ketluan-tranh-${p}-chi`, ketLuan.tranh[p]?.chi || '');
        set(`ketluan-chon-${p}-can`, ketLuan.chon[p]?.can || '');
        set(`ketluan-chon-${p}-chi`, ketLuan.chon[p]?.chi || '');
    });

    // --- THÁI DƯƠNG / THÁI ÂM ---
    if (tdtaData) {
        set('tdta-son-value', tdtaData.sonName || '');
        set('tdta-td-daotoa', tdtaData.thaiDuong?.daoTao || '');
        set('tdta-td-daohuong', tdtaData.thaiDuong?.daoHuong || '');
        set('tdta-ta-daotoa', tdtaData.thaiAm?.daoTao || '');
        set('tdta-ta-daohuong', tdtaData.thaiAm?.daoHuong || '');
    }
}

/* ---- Helper compute functions ---- */
function computeTranhSummary(birthCC, yearCC, toaDo) {
    const chiTuoi = birthCC.chiIdx; // 0-11
    const chiNam = yearCC.chiIdx;
    const toaDoIdx = Math.floor(((toaDo % 360) + 360) % 360 / 15); // sơn index 0-23

    // Xung: cách nhau 6
    const xungTuoi = (chiTuoi + 6) % 12;
    const xungNam = (chiNam + 6) % 12;
    const xungToa = (toaDoIdx + 12) % 24;

    // Tam Sát: dựa vào tam hợp của chi năm
    const tamHopGroups = [[2,6,10],[0,4,8],[1,5,9],[3,7,11]]; // Dần-Ngọ-Tuất, Hợi-Mão-Mùi, Thân-Tý-Thìn, Tỵ-Dậu-Sửu
    let tamHopGroup = tamHopGroups.find(g => g.includes(chiNam));
    let tamSat = '';
    if (tamHopGroup) {
        if (tamHopGroup[0] === 2) tamSat = 'Hợi-Tý-Sửu';
        else if (tamHopGroup[0] === 0) tamSat = 'Dần-Mão-Thìn';
        else if (tamHopGroup[0] === 1) tamSat = 'Tỵ-Ngọ-Mùi';
        else tamSat = 'Thân-Dậu-Tuất';
    }

    // Bát Sát: dựa vào tọa sơn
    const batSatMap = {0:'?', 1:'?', 2:'?', 3:'?', 4:'?', 5:'?', 6:'?', 7:'?', 8:'?', 9:'?', 10:'?', 11:'?', 12:'?', 13:'?', 14:'?', 15:'?', 16:'?', 17:'?', 18:'?', 19:'?', 20:'?', 21:'?', 22:'?', 23:'?'};
    const batSat = batSatMap[toaDoIdx] || '';

    const chiNames = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];

    return {
        nguhoang: {
            nam: { can: '', chi: '' },
            thang: { can: '', chi: '?' },
            ngay: { can: '', chi: '?' },
            gio: { can: '', chi: '?' }
        },
        tuepha: {
            nam: chiNames[xungNam] || '',
            thang: '',
            ngay: '',
            gio: ''
        },
        tamsat: {
            nam: tamSat,
            thang: '',
            ngay: '',
            gio: ''
        },
        batsat: {
            nam: '',
            thang: batSat,
            ngay: batSat,
            gio: ''
        },
        xungtoa: {
            nam: '',
            thang: '',
            ngay: getSonName ? getSonName((toaDoIdx + 12) % 24 * 15) : '',
            gio: ''
        },
        xungtuoi: {
            nam: '',
            thang: '',
            ngay: chiNames[xungTuoi] || '',
            gio: chiNames[xungTuoi] || ''
        }
    };
}

function computeChonSummary(birthCC, yearCC) {
    const chiTuoi = birthCC.chiIdx;
    const chiNames = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];

    // Tam Hợp
    const tamHopGroups = [[2,6,10],[0,4,8],[1,5,9],[3,7,11]];
    let tamHopGroup = tamHopGroups.find(g => g.includes(chiTuoi));
    let tamHopStrs = [];
    if (tamHopGroup) tamHopStrs = tamHopGroup.map(i => chiNames[i]);

    // Lục Hợp (Tự Hợp): cặp (0-1, 2-11, 3-10, 4-9, 5-8, 6-7)
    const lucHopMap = {0:1,1:0,2:11,11:2,3:10,10:3,4:9,9:4,5:8,8:5,6:7,7:6};
    const lucHop = chiNames[lucHopMap[chiTuoi]] || '';

    return {
        tuhop: {
            nam: { can: '', chi: '' },
            thang: { can: '', chi: '' },
            ngay: { can: '', chi: lucHop },
            gio: { can: '', chi: lucHop }
        },
        sinhhop: {
            nam: { can: '', chi: '' },
            thang: { can: '', chi: '' },
            ngay: { can: '', chi: '' },
            gio: { can: '', chi: '' }
        },
        tamhop: {
            nam: { can: '', chi: '' },
            thang: { can: '', chi: '' },
            ngay: { can: '', chi: tamHopStrs.join('/') },
            gio: { can: '', chi: tamHopStrs.join('/') }
        }
    };
}

function computeTHBLSummary(birthCC, toaDo) {
    return {
        ancuc: { nam:{can:'',chi:''}, thang:{can:'',chi:''}, ngay:{can:'',chi:''}, gio:{can:'',chi:''} },
        taicuc: { nam:{can:'',chi:''}, thang:{can:'',chi:''}, ngay:{can:'',chi:''}, gio:{can:'',chi:''} },
        vuongcuc: { nam:{can:'',chi:''}, thang:{can:'',chi:''}, ngay:{can:'',chi:''}, gio:{can:'',chi:''} }
    };
}

function computeThaiDuongThaiAmSummary(toaDo, viewYear) {
    return {
        sonName: getSonName ? getSonName(toaDo) : `${toaDo}°`,
        thaiDuong: { daoTao: '?', daoHuong: '?' },
        thaiAm: { daoTao: '?', daoHuong: '?' }
    };
}

function computeKetLuanSummary(tranh, chon) {
    const P = ['nam', 'thang', 'ngay', 'gio'];
    const tranhResult = {}, chonResult = {};
    P.forEach(p => {
        tranhResult[p] = { can: '', chi: '' };
        chonResult[p] = { can: '', chi: '' };
    });
    return { tranh: tranhResult, chon: chonResult };
}

/* =============================================
   RENDER NGŨ HOÀNG / NHỊ HẮC DẠNG CARD GRID
   ============================================= */
function renderNguHoangCards(inputData) {
    const grid = document.getElementById('nguhoang-grid');
    const card = document.getElementById('card-nguhoang-thang');
    if (!grid || !card) return;

    card.style.display = 'block';
    grid.innerHTML = '';

    // Sinh dữ liệu mẫu 12 tháng
    const thangNames = ['Giêng','Hai','Ba','Tư','Năm','Sáu','Bảy','Tám','Chín','Mười','Một','Chạp'];
    const data = [];
    for (let i = 0; i < 12; i++) {
        const isNguHoang = (i % 5 === 0);
        const isNhiHac = (i % 4 === 0 && !isNguHoang);
        const type = isNguHoang ? 'Ngũ Hoàng' : (isNhiHac ? 'Nhị Hắc' : '');
        const dir = isNguHoang ? 'Trung Cung' : (isNhiHac ? 'Tây Nam' : '');
        data.push({
            thang: thangNames[i],
            nhiemVu: type,
            direction: dir ? `⚠️ ${dir}` : '',
            isNguHoang,
            isNhiHac
        });
    }

    data.forEach(m => {
        const div = document.createElement('div');
        div.className = 'm-nguhoang-card';
        if (m.isNguHoang) div.classList.add('card-danger');
        else if (m.isNhiHac) div.classList.add('card-warning');

        div.innerHTML = `
            <div class="card-month">Tháng ${m.thang} (ÂL)</div>
            <div class="card-nhiemvu">${m.nhiemVu || '—'}</div>
            ${m.direction ? `<div class="card-direction">${m.direction}</div>` : ''}
        `;
        grid.appendChild(div);
    });
}

/* =============================================
   CREATE FILTER UI
   ============================================= */
function createFilterUI() {
    createTietKhiChips();
    createCanChiChips();
    createFilterHanhVanPairs();
    createFilterHanhVanPillar();
    createFilterVaiTro();
    createFilterGiaDinh();
    createFilterThatTinh();
    createFilterHuynhDe();

    MOBILE_STATE.filterUIInitialized = true;
}

/* ---- 1E. TIẾT KHÍ ---- */
function createTietKhiChips() {
    const container = document.getElementById('filter-tietkhi');
    if (!container) return;
    container.innerHTML = '';

    const tietKhiNames = [
        'Lập Xuân','Vũ Thủy','Kinh Trập','Xuân Phân','Thanh Minh','Cốc Vũ',
        'Lập Hạ','Tiểu Mãn','Mang Chủng','Hạ Chí','Tiểu Thử','Đại Thử',
        'Lập Thu','Xử Thử','Bạch Lộ','Thu Phân','Hàn Lộ','Sương Giáng',
        'Lập Đông','Tiểu Tuyết','Đại Tuyết','Đông Chí','Tiểu Hàn','Đại Hàn'
    ];

    tietKhiNames.forEach((name, idx) => {
        const chip = document.createElement('span');
        chip.className = 'm-chip';
        chip.textContent = name;
        chip.dataset.value = idx;
        chip.dataset.type = 'tietkhi';
        chip.addEventListener('click', function() {
            this.classList.toggle('active');
            updateFilterBadge();
        });
        container.appendChild(chip);
    });
}

/* ---- 1G. CAN CHI ---- */
function createCanChiChips() {
    const canContainer = document.getElementById('filter-can');
    const chiContainer = document.getElementById('filter-chi');
    if (!canContainer || !chiContainer) return;

    const canNames = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
    const chiNames = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];

    canContainer.innerHTML = '';
    chiContainer.innerHTML = '';

    canNames.forEach((name, idx) => {
        const chip = document.createElement('span');
        chip.className = 'm-chip';
        chip.textContent = name;
        chip.dataset.value = idx;
        chip.dataset.type = 'can';
        chip.addEventListener('click', function() {
            this.classList.toggle('active');
            updateFilterBadge();
        });
        canContainer.appendChild(chip);
    });

    chiNames.forEach((name, idx) => {
        const chip = document.createElement('span');
        chip.className = 'm-chip';
        chip.textContent = name;
        chip.dataset.value = idx;
        chip.dataset.type = 'chi';
        chip.addEventListener('click', function() {
            this.classList.toggle('active');
            updateFilterBadge();
        });
        chiContainer.appendChild(chip);
    });
}

/* ---- 2B/2C. HÀNH/VẬN PAIRS ---- */
function createFilterHanhVanPairs() {
    const hanhContainer = document.getElementById('filter-hanh-pairs');
    const vanContainer = document.getElementById('filter-van-pairs');
    if (!hanhContainer && !vanContainer) return;

    const pillarNames = ['Tuổi','Tọa','Giờ','Ngày','Tháng','Năm'];
    const hanhRelations = ['Tương Sinh','Tương Khắc','Bình Hòa'];
    const vanRelations = ['Sinh Khí','Phúc Đức','Thiên Y','Phục Vị','Diên Niên','Tuyệt Mệnh','Ngũ Quỷ','Lục Sát','Họa Hại'];

    function createPairGroup(container, relations, prefix) {
        if (!container) return;
        container.innerHTML = '';

        // Tạo grid: mỗi row là 1 cặp trụ
        for (let i = 0; i < pillarNames.length; i++) {
            for (let j = i + 1; j < pillarNames.length; j++) {
                const pairLabel = `${pillarNames[i]}↔${pillarNames[j]}`;
                const groupDiv = document.createElement('div');
                groupDiv.className = 'm-filter-group';
                groupDiv.style.marginBottom = '8px';

                const label = document.createElement('p');
                label.style.cssText = 'font-size:10px;color:var(--text-muted);margin:0 0 4px;font-weight:600;';
                label.textContent = pairLabel;
                groupDiv.appendChild(label);

                const chipsDiv = document.createElement('div');
                chipsDiv.className = 'm-filter-chips';

                relations.forEach(rel => {
                    const chip = document.createElement('span');
                    chip.className = 'm-pair-chip';
                    chip.textContent = rel;
                    chip.dataset.pair = `${i}-${j}`;
                    chip.dataset.value = rel;
                    chip.dataset.type = prefix;
                    chip.addEventListener('click', function() {
                        this.classList.toggle('active');
                        updateFilterBadge();
                    });
                    chipsDiv.appendChild(chip);
                });

                groupDiv.appendChild(chipsDiv);
                container.appendChild(groupDiv);
            }
        }
    }

    createPairGroup(hanhContainer, hanhRelations, 'hanh');
    createPairGroup(vanContainer, vanRelations, 'van');
}

/* ---- 2D. HÀNH/VẬN THEO TRỤ ---- */
function createFilterHanhVanPillar() {
    const container = document.getElementById('filter-hanhvan-pillar');
    if (!container) return;
    container.innerHTML = '';

    const pillars = ['Tuổi','Tọa','Giờ','Ngày','Tháng','Năm'];
    const hanhNames = ['Kim','Thủy','Mộc','Hỏa','Thổ'];
    const vanNames = ['1','2','3','4','5','6','7','8','9'];

    pillars.forEach(p => {
        const group = document.createElement('div');
        group.className = 'm-filter-group';

        const title = document.createElement('h5');
        title.textContent = `Trụ ${p}`;
        group.appendChild(title);

        const hanhDiv = document.createElement('div');
        hanhDiv.className = 'm-filter-chips';
        hanhDiv.style.marginBottom = '4px';
        hanhNames.forEach(h => {
            const chip = document.createElement('span');
            chip.className = 'm-chip';
            chip.textContent = h;
            chip.dataset.pillar = p;
            chip.dataset.value = h;
            chip.dataset.type = 'hanhpillar';
            chip.addEventListener('click', function() {
                this.classList.toggle('active');
                updateFilterBadge();
            });
            hanhDiv.appendChild(chip);
        });
        group.appendChild(hanhDiv);

        const vanDiv = document.createElement('div');
        vanDiv.className = 'm-filter-chips';
        vanNames.forEach(v => {
            const chip = document.createElement('span');
            chip.className = 'm-chip';
            chip.textContent = v;
            chip.dataset.pillar = p;
            chip.dataset.value = v;
            chip.dataset.type = 'vanpillar';
            chip.addEventListener('click', function() {
                this.classList.toggle('active');
                updateFilterBadge();
            });
            vanDiv.appendChild(chip);
        });
        group.appendChild(vanDiv);

        container.appendChild(group);
    });
}

/* ---- 3A. VAI TRÒ ---- */
function createFilterVaiTro() {
    const container = document.getElementById('filter-vaitro');
    if (!container) return;
    container.innerHTML = '';

    const roles = ['Phụ Mẫu','Huynh Đệ','Thê Tài','Quan Quỷ','Tử Tôn'];
    roles.forEach(r => {
        const item = createCheckboxItem(r, 'vaitro');
        container.appendChild(item);
    });
}

/* ---- 3B. GIA ĐÌNH ---- */
function createFilterGiaDinh() {
    const container = document.getElementById('filter-giadinh');
    if (!container) return;
    container.innerHTML = '';

    const members = ['Cha','Mẹ','Trưởng Nam','Trưởng Nữ','Trung Nam','Trung Nữ','Thiếu Nam','Thiếu Nữ'];
    const div = document.createElement('div');
    div.className = 'm-filter-grid';
    members.forEach(m => {
        const item = createCheckboxItem(m, 'giadinh');
        div.appendChild(item);
    });
    container.appendChild(div);
}

/* ---- 3C. THẤT TINH ---- */
function createFilterThatTinh() {
    const container = document.getElementById('filter-thattinh');
    if (!container) return;
    container.innerHTML = '';

    const stars = ['Tham Lang','Cự Môn','Lộc Tồn','Văn Khúc','Liêm Trinh','Vũ Khúc','Phá Quân'];
    stars.forEach(s => {
        const item = createCheckboxItem(s, 'thattinh');
        container.appendChild(item);
    });
}

/* ---- 3E. HUYNH ĐỆ ---- */
function createFilterHuynhDe() {
    const container = document.getElementById('filter-huynhde');
    if (!container) return;
    container.innerHTML = '';

    const items = ['Huynh Đệ hòa hợp','Huynh Đệ tương sinh','Huynh Đệ bất hòa'];
    items.forEach(s => {
        const item = createCheckboxItem(s, 'huynhde');
        container.appendChild(item);
    });
}

/* ---- Checkbox item helper ---- */
function createCheckboxItem(label, type) {
    const div = document.createElement('div');
    div.className = 'm-filter-item';
    div.dataset.type = type;
    div.dataset.value = label;

    const checkbox = document.createElement('div');
    checkbox.className = 'm-checkbox-custom';

    const text = document.createElement('span');
    text.textContent = label;

    div.appendChild(checkbox);
    div.appendChild(text);

    div.addEventListener('click', function() {
        this.classList.toggle('active');
        updateFilterBadge();
    });

    return div;
}

/* =============================================
   "TẤT CẢ" – CHỌN HẾT QUAN HỆ TỐT
   ============================================= */
function selectAllPairRelations(type) {
    const containerId = type === 'van' ? 'filter-van-pairs' : 'filter-hanh-pairs';
    const container = document.getElementById(containerId);
    if (!container) return;

    // Quan hệ tốt
    const goodRelations = type === 'van'
        ? ['Sinh Khí','Phúc Đức','Thiên Y','Phục Vị','Diên Niên']
        : ['Tương Sinh','Bình Hòa'];

    const chips = container.querySelectorAll('.m-pair-chip');
    chips.forEach(chip => {
        if (goodRelations.includes(chip.dataset.value)) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });

    updateFilterBadge();
    showToast(`✅ Đã chọn tất cả quan hệ ${type === 'van' ? 'Vận' : 'Hành'} tốt`);
}

/* =============================================
   FILTER STATE
   ============================================= */
function getFilterState() {
    const state = {
        tietKhi: [],
        can: [],
        chi: [],
        hanhPairs: {},
        vanPairs: {},
        hanhVanPillar: {},
        vaiTro: [],
        giaDinh: [],
        thatTinh: [],
        huynhDe: []
    };

    // Tiết khí
    document.querySelectorAll('#filter-tietkhi .m-chip.active').forEach(c => {
        state.tietKhi.push(parseInt(c.dataset.value));
    });

    // Can
    document.querySelectorAll('#filter-can .m-chip.active').forEach(c => {
        state.can.push(parseInt(c.dataset.value));
    });

    // Chi
    document.querySelectorAll('#filter-chi .m-chip.active').forEach(c => {
        state.chi.push(parseInt(c.dataset.value));
    });

    // Hành pairs
    document.querySelectorAll('#filter-hanh-pairs .m-pair-chip.active').forEach(c => {
        const key = c.dataset.pair;
        if (!state.hanhPairs[key]) state.hanhPairs[key] = [];
        state.hanhPairs[key].push(c.dataset.value);
    });

    // Vận pairs
    document.querySelectorAll('#filter-van-pairs .m-pair-chip.active').forEach(c => {
        const key = c.dataset.pair;
        if (!state.vanPairs[key]) state.vanPairs[key] = [];
        state.vanPairs[key].push(c.dataset.value);
    });

    // Hành/Vận theo trụ
    document.querySelectorAll('#filter-hanhvan-pillar .m-chip.active').forEach(c => {
        const pillar = c.dataset.pillar;
        if (!state.hanhVanPillar[pillar]) state.hanhVanPillar[pillar] = [];
        state.hanhVanPillar[pillar].push(c.dataset.value);
    });

    // Vai trò
    document.querySelectorAll('#filter-vaitro .m-filter-item.active').forEach(c => {
        state.vaiTro.push(c.dataset.value);
    });

    // Gia đình
    document.querySelectorAll('#filter-giadinh .m-filter-item.active').forEach(c => {
        if (!state.giaDinh[c.dataset.value]) state.giaDinh[c.dataset.value] = true;
    });

    // Thất tinh
    document.querySelectorAll('#filter-thattinh .m-filter-item.active').forEach(c => {
        state.thatTinh.push(c.dataset.value);
    });

    // Huynh đệ
    document.querySelectorAll('#filter-huynhde .m-filter-item.active').forEach(c => {
        state.huynhDe.push(c.dataset.value);
    });

    MOBILE_STATE.filterState = state;
    return state;
}

function countActiveFilters() {
    const state = getFilterState();
    let count = 0;
    if (state.tietKhi.length) count++;
    if (state.can.length) count++;
    if (state.chi.length) count++;
    Object.values(state.hanhPairs).forEach(arr => { if (arr.length) count++; });
    Object.values(state.vanPairs).forEach(arr => { if (arr.length) count++; });
    Object.values(state.hanhVanPillar).forEach(arr => { if (arr.length) count++; });
    if (state.vaiTro.length) count++;
    if (Object.keys(state.giaDinh).length) count++;
    if (state.thatTinh.length) count++;
    if (state.huynhDe.length) count++;
    return count;
}

function updateFilterBadge() {
    const totalBadge = document.getElementById('filter-badge-total');
    const l1Badge = document.getElementById('badge-layer1');
    const l2Badge = document.getElementById('badge-layer2');
    const l3Badge = document.getElementById('badge-layer3');

    const total = countActiveFilters();

    if (totalBadge) {
        if (total > 0) {
            totalBadge.style.display = 'inline-flex';
            totalBadge.textContent = total;
        } else {
            totalBadge.style.display = 'none';
        }
    }

    // Count per layer
    const state = getFilterState();
    const l1 = (state.tietKhi.length ? 1 : 0) + (state.can.length ? 1 : 0) + (state.chi.length ? 1 : 0);
    const l2 = Object.keys(state.hanhPairs).filter(k => state.hanhPairs[k].length).length
        + Object.keys(state.vanPairs).filter(k => state.vanPairs[k].length).length
        + Object.keys(state.hanhVanPillar).filter(k => state.hanhVanPillar[k].length).length;
    const l3 = (state.vaiTro.length ? 1 : 0) + (Object.keys(state.giaDinh).length ? 1 : 0)
        + (state.thatTinh.length ? 1 : 0) + (state.huynhDe.length ? 1 : 0);

    [l1Badge, l2Badge, l3Badge].forEach((badge, i) => {
        if (!badge) return;
        const val = [l1, l2, l3][i];
        if (val > 0) {
            badge.style.display = 'inline-flex';
            badge.textContent = val;
        } else {
            badge.style.display = 'none';
        }
    });
}

/* =============================================
   APPLY ALL FILTERS
   ============================================= */
function applyAllFilters() {
    if (!MOBILE_STATE.inputData) {
        showToast('⚠️ Vui lòng nhập thông tin và nhấn "XEM KẾT QUẢ" trước');
        return;
    }

    const filterState = getFilterState();
    let days = [...MOBILE_STATE.allDays];

    // --- TẦNG 1 ---
    // Tiết khí
    if (filterState.tietKhi.length > 0) {
        days = days.filter(day => {
            return filterState.tietKhi.some(tkIdx => {
                return day.tietKhiIdx !== undefined && day.tietKhiIdx === tkIdx;
            });
        });
    }

    // Can
    if (filterState.can.length > 0) {
        days = days.filter(day => {
            const dayCanIdx = day.canIdx !== undefined ? day.canIdx : (day.canChi ? day.canChi.canIdx : -1);
            return filterState.can.includes(dayCanIdx);
        });
    }

    // Chi
    if (filterState.chi.length > 0) {
        days = days.filter(day => {
            const dayChiIdx = day.chiIdx !== undefined ? day.chiIdx : (day.canChi ? day.canChi.chiIdx : -1);
            return filterState.chi.includes(dayChiIdx);
        });
    }

    // --- TẦNG 2 ---
    // Mức độ tối ưu
    if (MOBILE_STATE.optLevel === 'cao') {
        days = days.filter(day => (day.score || 0) >= 80);
    } else if (MOBILE_STATE.optLevel === 'trungbinh') {
        days = days.filter(day => (day.score || 0) >= 50);
    }

    // --- TẦNG 3 ---
    // (Placeholder – sẽ mở rộng khi có dữ liệu HKĐQ đầy đủ)

    MOBILE_STATE.filteredDays = days;
    MOBILE_STATE.renderedCount = Math.min(MOBILE_STATE.pageSize, days.length);

    renderResults();

    // Update stats
    const statNgay = document.getElementById('stat-ngay');
    const statGio = document.getElementById('stat-gio');
    const statFilters = document.getElementById('stat-filters');
    const resultBadge = document.getElementById('result-count-badge');

    if (statNgay) statNgay.textContent = `${days.length} ngày`;
    if (statGio) {
        const totalHours = days.reduce((sum, d) => sum + (d.hours ? d.hours.length : 0), 0);
        statGio.textContent = `${totalHours} giờ`;
    }
    if (statFilters) statFilters.textContent = `${countActiveFilters()} filter`;
    if (resultBadge) {
        resultBadge.style.display = 'inline-flex';
        resultBadge.textContent = days.length;
    }

    // Scroll to results (only if user triggered)
    if (window._userTriggeredApply) {
        setTimeout(() => {
            document.getElementById('section-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
            window._userTriggeredApply = false;
        }, 300);
    }

    updateSelectedCount();
}

/* =============================================
   CLEAR ALL FILTERS
   ============================================= */
function clearAllFilters() {
    document.querySelectorAll('.m-chip.active, .m-pair-chip.active, .m-filter-item.active').forEach(el => {
        el.classList.remove('active');
    });

    // Reset range & opt
    document.querySelectorAll('.m-range-btn[data-range="3"]').forEach(b => {
        b.click();
    });
    document.querySelectorAll('.m-range-btn[data-opt-level="cao"]').forEach(b => {
        b.click();
    });

    MOBILE_STATE.filterState = {
        tietKhi: [], can: [], chi: [],
        hanhPairs: {}, vanPairs: {}, hanhVanPillar: {},
        vaiTro: [], giaDinh: {}, thatTinh: [], huynhDe: []
    };

    updateFilterBadge();
    applyAllFilters();
    showToast('🗑️ Đã xóa tất cả bộ lọc');
}

/* =============================================
   RENDER RESULTS
   ============================================= */
function renderResults() {
    const container = document.getElementById('results-container');
    if (!container) return;

    const days = MOBILE_STATE.filteredDays;
    const count = MOBILE_STATE.renderedCount;

    container.innerHTML = '';

    if (!days.length) {
        container.innerHTML = '<div class="m-empty-state"><span style="font-size:48px;">😔</span><p>Không tìm thấy ngày phù hợp</p><p style="font-size:11px;">Thử giảm bộ lọc hoặc mở rộng phạm vi</p></div>';
        document.getElementById('btn-load-more').style.display = 'none';
        return;
    }

    for (let i = 0; i < count; i++) {
        const day = days[i];
        const card = renderDayCard(day, i);
        container.appendChild(card);
    }

    // Load more button
    const loadMoreBtn = document.getElementById('btn-load-more');
    if (loadMoreBtn) {
        if (count < days.length) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = `📥 TẢI THÊM (${days.length - count} ngày còn lại)`;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

function renderDayCard(day, index) {
    const card = document.createElement('div');
    card.className = 'm-day-card';
    card.dataset.index = index;
    card.dataset.dateKey = day.dateKey || day.date || index;

    const isSelected = MOBILE_STATE.selectedDays[card.dataset.dateKey];

    if (isSelected) card.classList.add('selected');

    // Score
    let scoreClass = 'score-low';
    if ((day.score || 0) >= 80) scoreClass = 'score-high';
    else if ((day.score || 0) >= 50) scoreClass = 'score-mid';

    // Can Chi string
    const canChiStr = day.canChi
        ? `${day.canChi.can} ${day.canChi.chi}`
        : (day.can && day.chi ? `${day.can} ${day.chi}` : '');

    // Date string
    const dateStr = day.date || day.solarDate || '';

    card.innerHTML = `
        <div class="m-day-card-header" onclick="toggleDayExpand(this.parentElement)">
            <div class="m-day-select ${isSelected ? 'active' : ''}" onclick="event.stopPropagation();toggleDaySelect('${card.dataset.dateKey}', this)">
                ${isSelected ? '✓' : ''}
            </div>
            <div class="m-day-date">
                ${dateStr}
                <div class="date-detail">${canChiStr} · ${day.tietKhi || ''}</div>
            </div>
            <div class="m-day-score ${scoreClass}">${day.score || 0}%</div>
        </div>
        <div class="m-day-card-body">
            ${renderTrigramDisplay(day)}
            ${renderHourGrid(day, card.dataset.dateKey)}
        </div>
    `;

    return card;
}

/* =============================================
   TRIGRAM DISPLAY (QUẺ HKĐQ)
   ============================================= */
function renderTrigramDisplay(day) {
    if (!day.trigram && !day.hkdq) return '';

    const t = day.trigram || day.hkdq || {};
    const upperName = t.upperName || t.thuongQuai || '?';
    const lowerName = t.lowerName || t.haQuai || '?';
    const hanh = t.hanh || t.nguHanh || '?';
    const van = t.van || t.soVan || '?';
    const upperLines = t.upperLines || t.thuongLines || [1,1,1];
    const lowerLines = t.lowerLines || t.haLines || [1,1,1];

    function renderLine(isYang) {
        if (isYang) {
            return '<div class="line-segment" style="width:24px;"></div>';
        }
        return '<div class="line-segment broken"><span style="width:10px;"></span><span style="width:10px;"></span></div>';
    }

    return `
        <div class="m-trigram-container">
            <div class="m-trigram-block">
                <div class="m-trigram-stack">
                    ${upperLines.map(l => renderLine(l)).join('')}
                </div>
                <div class="m-trigram-meta">
                    <span class="meta-hanh">${upperName}</span>
                </div>
            </div>
            <div class="m-trigram-meta" style="text-align:center;">
                <span class="meta-hanh" style="font-size:11px;">${hanh}</span>
                <span class="meta-van" style="font-size:13px;">${van}</span>
            </div>
            <div class="m-trigram-block">
                <div class="m-trigram-stack">
                    ${lowerLines.map(l => renderLine(l)).join('')}
                </div>
                <div class="m-trigram-meta">
                    <span class="meta-hanh">${lowerName}</span>
                </div>
            </div>
        </div>
    `;
}

/* =============================================
   HOUR GRID
   ============================================= */
function renderHourGrid(day, dateKey) {
    const hours = day.hours || day.gioTot || [];
    if (!hours.length) return '<p style="font-size:10px;color:var(--text-muted);padding:8px 0;">Không có dữ liệu giờ</p>';

    let html = '<div class="m-hour-grid">';

    hours.forEach(h => {
        const hourKey = `${dateKey}_${h.name || h.gio || h.index}`;
        const isActive = MOBILE_STATE.selectedHours[hourKey];
        const hName = h.name || h.gio || `Giờ ${h.index}`;
        const hScore = h.score !== undefined ? `${h.score}%` : '';

        html += `
            <div class="m-hour-cell ${isActive ? 'active' : ''}"
                 onclick="toggleHourSelect('${hourKey}', '${dateKey}', this)">
                <span class="hour-name">${hName}</span>
                <span class="hour-score">${hScore}</span>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

/* =============================================
   DAY / HOUR TOGGLE
   ============================================= */
function toggleDayExpand(card) {
    card.classList.toggle('expanded');
}

function toggleDaySelect(dateKey, selectEl) {
    if (MOBILE_STATE.selectedDays[dateKey]) {
        delete MOBILE_STATE.selectedDays[dateKey];
        if (selectEl) {
            selectEl.classList.remove('active');
            selectEl.textContent = '';
        }
        // Also deselect all hours of this day
        Object.keys(MOBILE_STATE.selectedHours).forEach(k => {
            if (k.startsWith(dateKey + '_')) delete MOBILE_STATE.selectedHours[k];
        });
    } else {
        MOBILE_STATE.selectedDays[dateKey] = true;
        if (selectEl) {
            selectEl.classList.add('active');
            selectEl.textContent = '✓';
        }
    }

    // Update card border
    const card = selectEl ? selectEl.closest('.m-day-card') : null;
    if (card) {
        if (MOBILE_STATE.selectedDays[dateKey]) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    }

    updateSelectedCount();
}

function toggleHourSelect(hourKey, dateKey, cellEl) {
    if (MOBILE_STATE.selectedHours[hourKey]) {
        delete MOBILE_STATE.selectedHours[hourKey];
        if (cellEl) cellEl.classList.remove('active');
    } else {
        MOBILE_STATE.selectedHours[hourKey] = true;
        if (cellEl) cellEl.classList.add('active');
        MOBILE_STATE.selectedDays[dateKey] = true;

        // Update day card select icon
        const card = cellEl ? cellEl.closest('.m-day-card') : null;
        if (card) {
            card.classList.add('selected');
            const selectEl = card.querySelector('.m-day-select');
            if (selectEl) {
                selectEl.classList.add('active');
                selectEl.textContent = '✓';
            }
        }
    }

    updateSelectedCount();
}

function updateSelectedCount() {
    const dayCount = Object.keys(MOBILE_STATE.selectedDays).length;
    const hourCount = Object.keys(MOBILE_STATE.selectedHours).length;
    const countEl = document.getElementById('selected-count');
    if (countEl) countEl.textContent = hourCount || dayCount;
}

/* =============================================
   LOAD MORE
   ============================================= */
function loadMoreResults() {
    const days = MOBILE_STATE.filteredDays;
    const current = MOBILE_STATE.renderedCount;
    const next = Math.min(current + MOBILE_STATE.pageSize, days.length);

    // Render only new cards
    const container = document.getElementById('results-container');
    for (let i = current; i < next; i++) {
        const day = days[i];
        const card = renderDayCard(day, i);
        container.appendChild(card);
    }

    MOBILE_STATE.renderedCount = next;

    const btn = document.getElementById('btn-load-more');
    if (btn) {
        if (next >= days.length) {
            btn.style.display = 'none';
        } else {
            btn.textContent = `📥 TẢI THÊM (${days.length - next} ngày còn lại)`;
        }
    }
}

/* =============================================
   DETAIL MODAL
   ============================================= */
function showDetailModal(dateKey) {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('detail-modal-title');
    const content = document.getElementById('detail-modal-content');

    if (!modal || !title || !content) return;

    const day = MOBILE_STATE.allDays.find(d => (d.dateKey || d.date) === dateKey);
    if (!day) {
        showToast('⚠️ Không tìm thấy thông tin ngày');
        return;
    }

    title.textContent = `📋 Chi tiết: ${day.date || day.solarDate || dateKey}`;

    content.innerHTML = `
        <p><strong>Ngày:</strong> ${day.date || '?'}</p>
        <p><strong>Can Chi:</strong> ${day.canChi ? day.canChi.can + ' ' + day.canChi.chi : '?'}</p>
        <p><strong>Tiết Khí:</strong> ${day.tietKhi || '—'}</p>
        <p><strong>Điểm tối ưu:</strong> ${day.score || 0}%</p>
        <hr style="border-color:var(--cherry-border);margin:12px 0;">
        <p style="font-size:11px;color:var(--text-muted);">Tính năng chi tiết đang được phát triển...</p>
    `;

    modal.style.display = 'flex';
}

function closeDetailModal() {
    const modal = document.getElementById('detail-modal');
    if (modal) modal.style.display = 'none';
}

/* =============================================
   SELECTED SHEET
   ============================================= */
function showSelectedList() {
    const sheet = document.getElementById('selected-sheet');
    const content = document.getElementById('selected-list-content');

    if (!sheet || !content) return;

    const selectedDays = Object.keys(MOBILE_STATE.selectedDays);
    const selectedHours = Object.keys(MOBILE_STATE.selectedHours);

    if (!selectedDays.length && !selectedHours.length) {
        content.innerHTML = '<p class="m-empty-text">Chưa có ngày/giờ nào được chọn</p>';
    } else {
        let html = '<div style="display:flex;flex-direction:column;gap:8px;">';
        selectedDays.forEach(dateKey => {
            const day = MOBILE_STATE.allDays.find(d => (d.dateKey || d.date) === dateKey);
            const dateStr = day ? (day.date || day.solarDate || dateKey) : dateKey;
            html += `
                <div style="display:flex;align-items:center;justify-content:space-between;background:var(--cherry-surface2);padding:10px 12px;border-radius:8px;">
                    <span>📅 ${dateStr}</span>
                    <button class="m-btn m-btn--sm m-btn--outline" onclick="deselectDay('${dateKey}')" style="color:var(--danger);border-color:var(--danger);">✕</button>
                </div>
            `;
        });
        html += '</div>';
        content.innerHTML = html;
    }

    sheet.style.display = 'flex';
}

function hideSelectedList() {
    const sheet = document.getElementById('selected-sheet');
    if (sheet) sheet.style.display = 'none';
}

function deselectDay(dateKey) {
    delete MOBILE_STATE.selectedDays[dateKey];
    Object.keys(MOBILE_STATE.selectedHours).forEach(k => {
        if (k.startsWith(dateKey + '_')) delete MOBILE_STATE.selectedHours[k];
    });
    updateSelectedCount();

    // Update UI
    const card = document.querySelector(`.m-day-card[data-date-key="${dateKey}"]`);
    if (card) {
        card.classList.remove('selected');
        const selectEl = card.querySelector('.m-day-select');
        if (selectEl) {
            selectEl.classList.remove('active');
            selectEl.textContent = '';
        }
    }

    showSelectedList(); // refresh
}

/* =============================================
   PRINT
   ============================================= */
function printSelected() {
    const selectedDays = Object.keys(MOBILE_STATE.selectedDays);
    const selectedHours = Object.keys(MOBILE_STATE.selectedHours);

    if (!selectedDays.length && !selectedHours.length) {
        showToast('⚠️ Chưa chọn ngày/giờ nào để in');
        return;
    }

    const printContent = document.getElementById('print-selected-content');
    if (!printContent) return;

    let html = '<h3>📅 NGÀY ĐÃ CHỌN:</h3><ul>';
    selectedDays.forEach(dateKey => {
        const day = MOBILE_STATE.allDays.find(d => (d.dateKey || d.date) === dateKey);
        const dateStr = day ? (day.date || day.solarDate || dateKey) : dateKey;
        html += `<li>${dateStr}</li>`;
    });
    html += '</ul>';

    if (selectedHours.length) {
        html += '<h3>⏰ GIỜ ĐÃ CHỌN:</h3><ul>';
        selectedHours.forEach(hourKey => {
            html += `<li>${hourKey}</li>`;
        });
        html += '</ul>';
    }

    printContent.innerHTML = html;
    window.print();
}

/* =============================================
   UPDATE DAY CARD UI (after filter re-apply)
   ============================================= */
function updateDayCardUI(dateKey) {
    const card = document.querySelector(`.m-day-card[data-date-key="${dateKey}"]`);
    if (!card) return;

    if (MOBILE_STATE.selectedDays[dateKey]) {
        card.classList.add('selected');
        const selectEl = card.querySelector('.m-day-select');
        if (selectEl) {
            selectEl.classList.add('active');
            selectEl.textContent = '✓';
        }
    } else {
        card.classList.remove('selected');
        const selectEl = card.querySelector('.m-day-select');
        if (selectEl) {
            selectEl.classList.remove('active');
            selectEl.textContent = '';
        }
    }
}

/* =============================================
   CHIP TOGGLE (for inline onclick)
   ============================================= */
function toggleChip(el) {
    el.classList.toggle('active');
    updateFilterBadge();
}

function togglePairChip(el) {
    el.classList.toggle('active');
    updateFilterBadge();
}

/* =============================================
   HELPER: Get Can Chi from year
   ============================================= */
function getCanChiFromYear(year) {
    const canNames = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
    const chiNames = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
    const canIdx = (year - 4) % 10;
    const chiIdx = (year - 4) % 12;
    return {
        can: canNames[canIdx >= 0 ? canIdx : canIdx + 10],
        chi: chiNames[chiIdx >= 0 ? chiIdx : chiIdx + 12],
        canIdx: canIdx >= 0 ? canIdx : canIdx + 10,
        chiIdx: chiIdx >= 0 ? chiIdx : chiIdx + 12
    };
}

function getMenhFromYear(year) {
    const menhList = ['Hải Trung Kim','Lô Trung Hỏa','Đại Lâm Mộc','Lộ Bàng Thổ','Kiếm Phong Kim',
        'Sơn Đầu Hỏa','Giản Hạ Thủy','Thành Đầu Thổ','Bạch Lạp Kim','Trường Lưu Thủy',
        'Dương Liễu Mộc','Tuyền Trung Thủy','Ốc Thượng Thổ','Tích Lịch Hỏa','Tùng Bách Mộc',
        'Lưu Niên Thủy','Sa Trung Kim','Sơn Hạ Hỏa','Bình Địa Mộc','Bích Thượng Thổ',
        'Kim Bạc Kim','Phúc Đăng Hỏa','Thiên Hà Thủy','Đại Trạch Thổ','Thoa Xuyến Kim',
        'Tang Đố Mộc','Đại Khê Thủy','Sa Trung Thổ','Thiên Thượng Hỏa','Thạch Lựu Mộc','Đại Hải Thủy'];
    const idx = (year - 1924) % 30;
    return menhList[idx >= 0 ? idx : idx + 30] || '?';
}

function getSonName(degree) {
    const sonNames = ['Tý','Quý','Sửu','Cấn','Dần','Giáp','Mão','Ất','Thìn','Tốn','Tỵ','Bính',
        'Ngọ','Đinh','Mùi','Khôn','Thân','Canh','Dậu','Tân','Tuất','Càn','Hợi','Nhâm'];
    const idx = Math.floor(((degree % 360) + 360) % 360 / 15);
    return sonNames[idx] || '?';
}

function getHuongFromToa(degree) {
    const sonName = getSonName(degree);
    const sonIdx = Math.floor(((degree % 360) + 360) % 360 / 15);
    const huongIdx = (sonIdx + 12) % 24;
    return getSonName(huongIdx * 15);
}

/* =============================================
   EXPORT TO WINDOW
   ============================================= */
window.MOBILE_STATE = MOBILE_STATE;
window.toggleSection = toggleSection;
window.toggleAccordion = toggleAccordion;
window.setRange = setRange;
window.setOptLevel = setOptLevel;
window.handleViewResult = handleViewResult;
window.toggleChip = toggleChip;
window.togglePairChip = togglePairChip;
window.updateFilterBadge = updateFilterBadge;
window.applyAllFilters = applyAllFilters;
window.clearAllFilters = clearAllFilters;
window.toggleDayExpand = toggleDayExpand;
window.toggleDaySelect = toggleDaySelect;
window.toggleHourSelect = toggleHourSelect;
window.loadMoreResults = loadMoreResults;
window.showDetailModal = showDetailModal;
window.closeDetailModal = closeDetailModal;
window.showSelectedList = showSelectedList;
window.hideSelectedList = hideSelectedList;
window.deselectDay = deselectDay;
window.printSelected = printSelected;
window.updateSelectedCount = updateSelectedCount;
window.showToast = showToast;
window.renderInputCards = renderInputCards;
window.getFilterState = getFilterState;
window.countActiveFilters = countActiveFilters;
window.renderResults = renderResults;
window.renderDayCard = renderDayCard;
window.updateDayCardUI = updateDayCardUI;
window.selectAllPairRelations = selectAllPairRelations;
window.renderSummaryTable = renderSummaryTable;
window.renderNguHoangCards = renderNguHoangCards;
window.createFilterUI = createFilterUI;
