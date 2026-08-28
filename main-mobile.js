// ==========================================
// MAIN-MOBILE.JS - Điều phối 3 bước
// ==========================================

const appState = {
    step: 1,
    input: { birthYear: '1993', toaDo: '120', viewYear: '', event: '', location: '' },
    computed: null,
    dataset: [],
    filters: createEmptyFilters(),
    results: [],
    selected: {},
    selectedOut: {},
    lastCount: null
};

function readInput() {
    return {
        birthYear: document.getElementById('birth-year').value,
        toaDo: document.getElementById('toa-do').value,
        viewYear: document.getElementById('view-year').value,
        event: document.getElementById('event-check').value,
        location: document.getElementById('location-check').value
    };
}

function saveInput() {
    try { localStorage.setItem('xncc-mobile-input', JSON.stringify(readInput())); } catch (e) {}
}
function loadInput() {
    try {
        const raw = localStorage.getItem('xncc-mobile-input');
        if (!raw) return;
        const o = JSON.parse(raw);
        if (o.birthYear) document.getElementById('birth-year').value = o.birthYear;
        if (o.toaDo) document.getElementById('toa-do').value = o.toaDo;
        if (o.viewYear) document.getElementById('view-year').value = o.viewYear;
        if (o.event) document.getElementById('event-check').value = o.event;
        if (o.location) document.getElementById('location-check').value = o.location;
    } catch (e) {}
}

function goStep(n) {
    if (n === 2 && !appState.computed) { toast('Hãy TÍNH TOÁN ở bước 1 trước'); return; }
    if (n === 3 && !appState.dataset.length) { toast('Hãy TÍNH TOÁN ở bước 1 trước'); return; }
    appState.step = n;
    document.querySelectorAll('.step-panel').forEach((p, i) => p.classList.toggle('on', i === n - 1));
    document.querySelectorAll('.stepper .step').forEach(b => {
        const s = Number(b.dataset.step);
        b.classList.toggle('on', s === n);
        b.classList.toggle('done', s < n);
    });
    document.getElementById('btn-back').disabled = n === 1;
    document.getElementById('btn-next').textContent = n === 3 ? 'Đã chọn' : 'Tiếp';
    if (n === 3) showResults(false);
}

function markSelectedOut() {
    appState.selectedOut = {};
    const matched = new Set();
    appState.results.forEach(r => r.hours.forEach(h => matched.add(hourKey(r.day, h))));
    Object.keys(appState.selected).forEach(k => {
        if (!matched.has(k)) appState.selectedOut[k] = true;
    });
}

function recount(includeGroup3) {
    if (!appState.dataset.length) return;
    const tooMany = includeGroup3 && appState.filters.group3On;
    let base = filterDays(appState.dataset, appState.filters, { includeGroup3: false });
    if (tooMany) {
        const nH = base.rows.reduce((n, r) => n + r.hours.length, 0);
        if (nH > 960) {
            toast('Còn ' + nH + ' giờ — siết nhóm 1–2 trước khi chạy quẻ');
            appState.results = base.rows;
            appState.lastCount = { days: base.rows.length, hours: nH, group3Pending: true, blocked: true };
            renderLiveCount(appState.lastCount);
            return appState.lastCount;
        }
        base = filterDays(appState.dataset, appState.filters, { includeGroup3: true });
    }
    appState.results = base.rows;
    const hours = base.rows.reduce((n, r) => n + r.hours.length, 0);
    appState.lastCount = { days: base.rows.length, hours, group3Pending: base.group3Pending };
    renderLiveCount(appState.lastCount);
    markSelectedOut();
    return appState.lastCount;
}

function showResults(runG3) {
    recount(runG3);
    const mode = document.getElementById('sort-select').value;
    const rows = sortRows(appState.results, mode);
    renderResults(rows, appState);
    document.getElementById('btn-selected-tray').textContent = 'Đã chọn ' + Object.keys(appState.selected).length;
}

async function tinhToan() {
    const input = readInput();
    appState.input = input;
    saveInput();
    setLoading(true, 'Đang tính toán, vui lòng chờ...');
    await new Promise(r => setTimeout(r, 30));
    try {
        const computed = computeAll(input);
        appState.computed = computed;
        appState.filters = createEmptyFilters();
        renderPart1(computed);
        renderFilterPanel(computed, appState.filters);
        const dataset = await buildYearDataset(computed, input.location);
        appState.dataset = dataset;
        recount(false);
        document.getElementById('calc-status').className = 'hint ok';
        document.getElementById('calc-status').textContent = `Đã tính ${dataset.length} ngày. Sẵn sàng lọc.`;
        toast('Tính xong — chuyển sang bộ lọc khi sẵn sàng');
    } catch (err) {
        console.error(err);
        document.getElementById('calc-status').className = 'hint err';
        document.getElementById('calc-status').textContent = err.message || 'Lỗi tính toán';
        toast(err.message || 'Lỗi tính toán');
    } finally {
        setLoading(false);
    }
}

function applyQuick(type) {
    if (!appState.computed) return;
    const f = appState.filters;
    f.profile = 'tuy-chinh';
    if (type === 'tranh-nghiem' || type === 'tranh-chon') setTranhNghiem(f.tranh, true);
    if (type === 'chon-chinh' || type === 'tranh-chon') {
        f.chon.tuHopNgayCan = f.chon.tuHopNgayChi = true;
        f.chon.sinhHopNgayCan = f.chon.sinhHopNgayChi = true;
        f.chon.tamHopNgayChi = true;
        f.chon.tuHopGioCan = f.chon.tuHopGioChi = true;
        f.chon.sinhHopGioCan = f.chon.sinhHopGioChi = true;
        f.chon.tamHopGioChi = true;
    }
    if (type === 'an') f.bolong.anCuc = true;
    if (type === 'tai') f.bolong.taiCuc = true;
    if (type === 'vuong') f.bolong.vuongCuc = true;
    if (type === 'tietkhi') {
        f.tietKhi.selected = (appState.computed.thaiDuong.items || []).map(i => i.value);
        f.tietKhi.prioritize = true;
    }
    if (type === 'ut1-hanh') {
        f.group2On = true; f.toiUu.applyHanh = true;
        f.toiUu.hanhNgay = (appState.computed.toiUu.hanhNgay || []).filter(x => x.prio === 1).map(x => x.ngay);
    }
    if (type === 'ut1-van') {
        f.group2On = true; f.toiUu.applyVan = true;
        f.toiUu.vanNgay = (appState.computed.toiUu.vanNgay || []).filter(x => x.prio === 1).map(x => x.ngay);
    }
    if (document.getElementById('filter-panel').innerHTML) syncFilterUI(f);
    goStep(2);
    recount(false);
    toast('Đã đưa vào bộ lọc');
}

function toggleSelect(key, on) {
    if (on) appState.selected[key] = true;
    else delete appState.selected[key];
    delete appState.selectedOut[key];
    document.getElementById('btn-selected-tray').textContent = 'Đã chọn ' + Object.keys(appState.selected).length;
}

function findHourByKey(key) {
    for (const d of appState.dataset) {
        for (const h of d.hours) if (hourKey(d, h) === key) return { day: d, hour: h };
    }
    return null;
}

function doPrint(khach) {
    if (!Object.keys(appState.selected).length) { toast('Chưa chọn giờ nào'); return; }
    document.getElementById('print-selected-list').innerHTML = buildPrintHtml(appState, appState.computed, appState.dataset, khach);
    document.body.classList.toggle('print-mode-khach', !!khach);
    const after = () => {
        document.body.classList.remove('print-mode-khach');
        window.removeEventListener('afterprint', after);
    };
    window.addEventListener('afterprint', after);
    window.print();
}

window.onload = () => {
    document.getElementById('view-year').value = new Date().getFullYear();
    loadInput();
    if (!document.getElementById('view-year').value) {
        document.getElementById('view-year').value = new Date().getFullYear();
    }

    document.getElementById('btn-calc').addEventListener('click', tinhToan);
    ['birth-year', 'toa-do', 'view-year'].forEach(id => {
        document.getElementById(id).addEventListener('keyup', e => { if (e.key === 'Enter') tinhToan(); });
    });
    document.getElementById('btn-clear-form').addEventListener('click', () => {
        document.getElementById('birth-year').value = '1993';
        document.getElementById('toa-do').value = '120';
        document.getElementById('view-year').value = new Date().getFullYear();
        document.getElementById('event-check').value = '';
        document.getElementById('location-check').value = '';
        document.getElementById('part1-results').innerHTML = '';
        appState.computed = null; appState.dataset = [];
        document.getElementById('calc-status').className = 'hint';
        document.getElementById('calc-status').textContent = 'Đã xóa form.';
    });

    document.querySelectorAll('.stepper .step').forEach(b => b.addEventListener('click', () => goStep(Number(b.dataset.step))));
    document.getElementById('btn-back').addEventListener('click', () => goStep(Math.max(1, appState.step - 1)));
    document.getElementById('btn-next').addEventListener('click', () => {
        if (appState.step === 3) {
            renderSelectedTray(appState, appState.dataset);
            openSheet('sheet-selected');
        } else goStep(appState.step + 1);
    });

    document.getElementById('part1-results').addEventListener('click', e => {
        const acc = e.target.closest('.acc-btn');
        if (acc) { acc.parentElement.classList.toggle('open'); return; }
        const q = e.target.closest('[data-quick]');
        if (q) applyQuick(q.dataset.quick);
    });

    document.getElementById('btn-reset-filter').addEventListener('click', () => {
        appState.filters = createEmptyFilters();
        if (appState.computed) { renderFilterPanel(appState.computed, appState.filters); recount(false); }
        toast('Đã đặt lại bộ lọc');
    });
    document.getElementById('profile-row').addEventListener('click', e => {
        const b = e.target.closest('[data-profile]');
        if (!b || !appState.computed) return;
        if (b.dataset.profile === 'tuy-chinh') appState.filters = createEmptyFilters();
        else appState.filters = applyProfile(b.dataset.profile, appState.computed);
        renderFilterPanel(appState.computed, appState.filters);
        recount(false);
        toast('Hồ sơ: ' + b.dataset.profile);
    });

    document.getElementById('filter-panel').addEventListener('click', e => {
        if (e.target.id === 'btn-add-que-must' || e.target.id === 'btn-add-que-ban') {
            const must = e.target.id === 'btn-add-que-must';
            const inp = document.getElementById(must ? 'que-must-input' : 'que-ban-input');
            const name = (inp.value || '').trim();
            if (!name || !HKDQ_DATABASE[name]) { toast('Không đúng tên quẻ'); return; }
            const arr = must ? appState.filters.que.truNgayQue : appState.filters.que.camQue;
            if (!arr.includes(name)) arr.push(name);
            appState.filters.profile = 'tuy-chinh';
            syncFilterUI(appState.filters); recount(false);
            return;
        }
        const chip = e.target.closest('[data-path], [data-arr]');
        if (!chip || chip.tagName !== 'BUTTON') return;
        appState.filters.profile = 'tuy-chinh';
        if (chip.dataset.path) {
            const cur = !!getPath(appState.filters, chip.dataset.path);
            setPath(appState.filters, chip.dataset.path, !cur);
        } else if (chip.dataset.arr) {
            const arrv = getPath(appState.filters, chip.dataset.arr);
            const raw = chip.dataset.val;
            const val = (arrv.length && typeof arrv[0] === 'number') || /^\d+$/.test(raw) ? Number(raw) : raw;
            const i = arrv.findIndex(x => String(x) === String(raw) || x === val);
            if (i >= 0) arrv.splice(i, 1); else arrv.push(/^\d+$/.test(raw) ? Number(raw) : raw);
        }
        syncFilterUI(appState.filters);
        recount(false);
    });
    document.getElementById('filter-panel').addEventListener('change', e => {
        const el = e.target;
        appState.filters.profile = 'tuy-chinh';
        if (el.dataset.bool) setPath(appState.filters, el.dataset.bool, el.checked);
        if (el.dataset.path && el.type === 'checkbox') setPath(appState.filters, el.dataset.path, el.checked);
        if (el.dataset.text) setPath(appState.filters, el.dataset.text, el.value);
        if (el.dataset.num) setPath(appState.filters, el.dataset.num, Number(el.value || 0));
        if (el.dataset.nullnum) setPath(appState.filters, el.dataset.nullnum, el.value === '' ? null : Number(el.value));
        syncFilterUI(appState.filters);
        recount(false);
    });

    document.getElementById('btn-apply-filter').addEventListener('click', () => {
        if (appState.filters.group3On) {
            setLoading(true, 'Đang phân tích quẻ, vui lòng chờ...');
            setTimeout(() => {
                const c = recount(true);
                setLoading(false);
                if (c && c.blocked) return;
                goStep(3);
            }, 40);
        } else {
            showResults(false);
            goStep(3);
        }
    });

    document.getElementById('result-list').addEventListener('click', e => {
        if (e.target.closest('[data-relax]')) {
            const p = e.target.closest('[data-relax]').dataset.relax;
            appState.filters = applyProfile(p, appState.computed);
            if (appState.computed) renderFilterPanel(appState.computed, appState.filters);
            goStep(2); recount(false); return;
        }
        if (e.target.id === 'btn-off-g3') {
            appState.filters.group3On = false; appState.filters.profile = 'tuy-chinh';
            showResults(false); return;
        }
        const card = e.target.closest('.day-card');
        if (!card) return;
        const row = sortRows(appState.results, document.getElementById('sort-select').value)[Number(card.dataset.row)];
        if (!row) return;
        if (e.target.closest('.sel-day')) {
            const on = e.target.closest('.sel-day').checked;
            row.hours.forEach(h => toggleSelect(hourKey(row.day, h), on));
            showResults(appState.filters.group3On && !appState.lastCount.group3Pending);
            return;
        }
        if (e.target.closest('[data-day-detail]')) {
            renderDaySheet(row.day); openSheet('sheet-day'); return;
        }
        const hc = e.target.closest('.hour-chip');
        if (hc) {
            const key = hc.dataset.hkey;
            const on = !appState.selected[key];
            toggleSelect(key, on);
            hc.classList.toggle('selected', on);
        }
    });

    let pressTimer = null;
    document.getElementById('result-list').addEventListener('pointerdown', e => {
        const hc = e.target.closest('.hour-chip');
        if (!hc) return;
        pressTimer = setTimeout(() => {
            const found = findHourByKey(hc.dataset.hkey);
            if (found) { renderHourSheet(found.day, found.hour); openSheet('sheet-hour'); }
        }, 450);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => {
        document.getElementById('result-list').addEventListener(ev, () => clearTimeout(pressTimer));
    });

    document.getElementById('sort-select').addEventListener('change', () => showResults(false));
    document.getElementById('group-by-month').addEventListener('change', () => showResults(false));
    document.getElementById('only-selected').addEventListener('change', () => showResults(false));

    document.getElementById('btn-notes').addEventListener('click', () => openSheet('sheet-notes'));
    document.getElementById('btn-selected-tray').addEventListener('click', () => {
        renderSelectedTray(appState, appState.dataset); openSheet('sheet-selected');
    });
    document.getElementById('backdrop').addEventListener('click', closeSheets);
    document.querySelectorAll('.close-sheet').forEach(b => b.addEventListener('click', closeSheets));

    document.getElementById('sheet-hour').addEventListener('click', e => {
        if (e.target.id === 'btn-pick-this-hour') {
            toggleSelect(e.target.dataset.hkey, true);
            toast('Đã chọn giờ');
            showResults(false);
        }
    });
    document.getElementById('sheet-selected-body').addEventListener('click', e => {
        const del = e.target.closest('[data-del-day]');
        if (!del) return;
        const jdn = Number(del.dataset.delDay);
        Object.keys(appState.selected).forEach(k => { if (k.startsWith(jdn + '|')) delete appState.selected[k]; });
        renderSelectedTray(appState, appState.dataset);
        document.getElementById('btn-selected-tray').textContent = 'Đã chọn ' + Object.keys(appState.selected).length;
    });
    document.getElementById('btn-clear-selected').addEventListener('click', () => {
        appState.selected = {}; appState.selectedOut = {};
        renderSelectedTray(appState, appState.dataset);
        document.getElementById('btn-selected-tray').textContent = 'Đã chọn 0';
        if (appState.step === 3) showResults(false);
    });
    document.getElementById('btn-print-view').addEventListener('click', () => doPrint(false));
    document.getElementById('btn-print-khach').addEventListener('click', () => doPrint(true));
};
