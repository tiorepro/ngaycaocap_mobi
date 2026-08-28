// ==========================================
// UI-MOBILE.JS - Render 3 bước, sheet, chip
// ==========================================

function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('on'), 2200);
}

function setLoading(on, text) {
    const el = document.getElementById('loading-overlay');
    if (text) el.innerHTML = '<span>' + esc(text) + '</span>';
    el.classList.toggle('on', !!on);
}

function openSheet(id) {
    document.getElementById('backdrop').classList.add('on');
    document.querySelectorAll('.sheet').forEach(s => s.classList.remove('on'));
    document.getElementById(id).classList.add('on');
}
function closeSheets() {
    document.getElementById('backdrop').classList.remove('on');
    document.querySelectorAll('.sheet').forEach(s => s.classList.remove('on'));
}

function infoRows(rows) {
    return '<table class="info-table">' + rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('') + '</table>';
}

function queBlock(canChi) {
    return `<div class="tru-pre">${esc(formatHccvAndQue(canChi))}</div>`;
}

function renderPart1(computed) {
    const t = computed.birthInfo, o = computed.toaInfo, y = computed.yearInfo, s = computed.satsInfo;
    const k = computed.ketLuan, td = computed.thaiDuong, pham = computed.pham;
    const nguHoangSon = palaceToSonMap[s.nguHoangNam] || [];
    const nhiHacSon = palaceToSonMap[s.nhiHacNam] || [];

    let months = '<div class="month-grid">';
    for (let i = 1; i <= 12; i++) {
        const p5 = s.monthlyStars[i].nguHoang, p2 = s.monthlyStars[i].nhiHac;
        months += `<div class="month-cell"><b>Th.${i}</b><div class="highlight-5">NH ${esc(p5)}</div><div class="highlight-2">2H ${esc(p2)}</div></div>`;
    }
    months += '</div>';

    const chip = (arr, cls) => arr.map(x => `<span class="chip ${cls || ''}">${esc(x)}</span>`).join(' ') || '<span class="hint">—</span>';

    let toiUu = '';
    const renderList = (list, label) => {
        if (!list || !list.length) return `<p class="hint">Không có ${label}.</p>`;
        return list.slice(0, 12).map(r => {
            if (r.ngay != null) {
                const ut = r.prio === 1 ? '<span style="color:#d32f2f">[ƯT1]</span>' : '<span style="color:#1976d2">[ƯT2]</span>';
                return `<div class="toi-uu-item">${ut} <b>${label} ${r.ngay}</b></div>`;
            }
            return `<div class="toi-uu-item"><b>[${r.totalScore}đ]</b> ${esc(r.chainName)}</div>`;
        }).join('');
    };

    toiUu = `
        <div class="sub-label">Hành trụ ngày</div>${renderList(computed.toiUu.hanhNgay, 'Hành')}
        <div class="sub-label">Vận trụ ngày</div>${renderList(computed.toiUu.vanNgay, 'Vận')}
        <div class="sub-label">Chuỗi Hành G→Ng→Th→N</div>${renderList(computed.toiUu.hanhChains, 'Hành')}
        <div class="sub-label">Chuỗi Vận</div>${renderList(computed.toiUu.vanChains, 'Vận')}
        <div class="sub-label">Hành 6 trụ</div>${renderList(computed.toiUu.hanh6, 'Hành')}
        <div class="sub-label">Vận 6 trụ</div>${renderList(computed.toiUu.van6, 'Vận')}
        <div class="btn-row" style="margin-top:8px">
            <button type="button" class="btn sm" data-quick="ut1-hanh">Đưa ƯT1 Hành vào lọc</button>
            <button type="button" class="btn sm" data-quick="ut1-van">Đưa ƯT1 Vận vào lọc</button>
        </div>`;

    document.getElementById('part1-results').innerHTML = `
        <article class="card acc open">
            <button type="button" class="acc-btn">A. Tuổi xem <small>${esc(t.canChi)}</small></button>
            <div class="acc-body">
                ${infoRows([
                    ['Can Chi', esc(t.canChi)],
                    ['Nạp Âm', `${esc(t.lacThuNapAm)}<br><small>(${esc(t.lucThapNapAm)})</small>`]
                ])}
                ${queBlock(t.canChi)}
            </div>
        </article>
        <article class="card acc">
            <button type="button" class="acc-btn">B. Tọa xem <small>${esc(o.huong)} · ${esc(o.son)} · ${computed.input.toaDo}°</small></button>
            <div class="acc-body">
                ${infoRows([
                    ['Phương', esc(o.phuong)], ['Hướng', esc(o.huong)], ['Sơn', esc(o.son)],
                    ['Can Chi', esc(o.canChi)],
                    ['Phạm năm xem', `<span class="${pham.className}">${esc(pham.text)}</span>`]
                ])}
                ${queBlock(o.canChi)}
            </div>
        </article>
        <article class="card acc">
            <button type="button" class="acc-btn">C. Năm xem <small>${esc(y.canChi)}</small></button>
            <div class="acc-body">
                ${infoRows([
                    ['Can Chi', esc(y.canChi)],
                    ['Nạp Âm', `${esc(y.lacThuNapAm)}<br><small>(${esc(y.lucThapNapAm)})</small>`],
                    ['Ngũ Hoàng', `<span class="highlight-5">${esc(s.nguHoangNam)} (${esc(nguHoangSon.join(', '))})</span>`],
                    ['Nhị Hắc', `<span class="highlight-2">${esc(s.nhiHacNam)} (${esc(nhiHacSon.join(', '))})</span>`],
                    ['Thái Tuế', esc(s.thaiTue)],
                    ['Xung Thái Tuế', esc(s.tuePha)],
                    ['Tam Sát', esc(getDetailedTamSatInfo(s.yearChi))],
                    ['Bát Sát', esc(BAT_SAT_NAM_CHI_MAP[s.yearChi] || 'Không có')]
                ])}
                ${queBlock(y.canChi)}
                <div class="sub-label">Ngũ Hoàng / Nhị Hắc 12 tháng</div>
                ${months}
            </div>
        </article>
        <article class="card acc">
            <button type="button" class="acc-btn">D. Kết luận TRÁNH / CHỌN</button>
            <div class="acc-body">
                <div class="sub-label">TRÁNH nghiêm</div>
                <div>Tháng Chi: ${chip(k.avoid_strict.thangChi, 'danger')}</div>
                <div>Ngày Chi: ${chip(k.avoid_strict.ngayChi, 'danger')}</div>
                <div>Giờ Chi: ${chip(k.avoid_strict.gioChi, 'danger')}</div>
                <div class="sub-label">Cảnh báo (Xung Tọa / Tuổi)</div>
                <div>${chip(k.avoid_warning.ngayChi, 'warn')}</div>
                <div class="sub-label">CHỌN chính</div>
                <div>Ngày Can: ${chip(k.chinh.ngayCan, 'good')}</div>
                <div>Ngày Chi: ${chip(k.chinh.ngayChi, 'good')}</div>
                <div>Giờ Can: ${chip(k.chinh.gioCan, 'good')}</div>
                <div>Giờ Chi: ${chip(k.chinh.gioChi, 'good')}</div>
                <div class="sub-label">PHÓ (Hóa Xung)</div>
                <div>${chip(k.pho.ngayChi, 'warn')}</div>
                <div class="btn-row" style="margin-top:10px">
                    <button type="button" class="btn sm danger" data-quick="tranh-nghiem">Đưa TRÁNH nghiêm vào lọc</button>
                    <button type="button" class="btn sm" data-quick="chon-chinh">Đưa CHỌN chính vào lọc</button>
                </div>
                <button type="button" class="btn sm block" style="margin-top:6px" data-quick="tranh-chon">Đưa cả hai</button>
            </div>
        </article>
        <article class="card acc">
            <button type="button" class="acc-btn">E. Tam Hợp Bổ Long</button>
            <div class="acc-body">
                <p>Can Bổ Long: <b>${esc(k.bolong.can || '—')}</b></p>
                <p>Ấn Cục: ${chip(k.bolong.an, 'good')}</p>
                <p>Tài Cục: ${chip(k.bolong.tai, 'good')}</p>
                <p>Vượng Cục: ${chip(k.bolong.vuong, 'good')}</p>
                <div class="btn-row">
                    <button type="button" class="btn sm" data-quick="an">Chọn Ấn</button>
                    <button type="button" class="btn sm" data-quick="tai">Chọn Tài</button>
                    <button type="button" class="btn sm" data-quick="vuong">Chọn Vượng</button>
                </div>
            </div>
        </article>
        <article class="card acc">
            <button type="button" class="acc-btn">F. Thái Dương / Thái Âm</button>
            <div class="acc-body">
                ${infoRows([
                    ['Sơn', esc(td.son || 'N/A')],
                    ['TD Đáo Tọa', esc((td.data && td.data.tdDaoToa) || '-')],
                    ['TD Đáo Hướng', esc((td.data && td.data.tdDaoHuong) || '-')],
                    ['TD Đáo Tam Hợp', esc((td.data && td.data.tdDaoTamHop) || '-').replace(/\n/g, '<br>')],
                    ['TA Đáo Tọa', esc((td.data && td.data.taDaoToa) || '-')],
                    ['TA Đáo Hướng', esc((td.data && td.data.taDaoHuong) || '-')]
                ])}
                <button type="button" class="btn sm" data-quick="tietkhi">Ưu tiên tiết khí Đáo Tọa/Hướng</button>
            </div>
        </article>
        <article class="card acc">
            <button type="button" class="acc-btn">G. Tối ưu Hành / Vận</button>
            <div class="acc-body">${toiUu}</div>
        </article>
        <article class="card acc">
            <button type="button" class="acc-btn">H. Việc &amp; địa điểm</button>
            <div class="acc-body">
                ${infoRows([
                    ['Việc xem', esc(computed.input.event || '—')],
                    ['Địa điểm', esc(computed.input.location || '—')],
                    ['Ghi chú', 'Chính Ngọ tính theo Nominatim khi có địa điểm.']
                ])}
            </div>
        </article>`;
}

function toggleChip(el, on) {
    el.classList.toggle('on', on);
    el.setAttribute('aria-pressed', on ? 'true' : 'false');
}

function chipBtn(path, label, extraCls, disabled) {
    return `<button type="button" class="chip ${extraCls || ''}" data-path="${esc(path)}" ${disabled ? 'disabled' : ''}>${label}</button>`;
}
function chipArr(arrPath, value, label, extraCls) {
    return `<button type="button" class="chip ${extraCls || ''}" data-arr="${esc(arrPath)}" data-val="${esc(value)}">${label}</button>`;
}

function renderFilterPanel(computed, filters) {
    const k = computed.ketLuan;
    const j = (a) => (a && a.length) ? ' (' + a.join(', ') + ')' : '';
    const nums = (n, arrPath) => {
        let h = '';
        for (let i = 1; i <= n; i++) h += chipArr(arrPath, i, String(i));
        return `<div class="chip-wrap">${h}</div>`;
    };
    const rels = ['Hợp Thập', 'Hợp Ngũ', 'Hợp Thập Ngũ', 'Cùng Quái', 'Hà Đồ', 'Điên Đảo Ai Tinh', 'Sinh Nhập', 'Khắc Nhập'];
    const pairs = [
        ['tuoi-toa', 'Tuổi–Tọa'], ['tuoi-ngay', 'Tuổi–Ngày'], ['toa-ngay', 'Tọa–Ngày'],
        ['ngay-gio', 'Ngày–Giờ'], ['ngay-thang', 'Ngày–Tháng'], ['ngay-nam', 'Ngày–Năm'], ['thang-nam', 'Tháng–Năm']
    ];
    const queNames = Object.keys(HKDQ_DATABASE || {}).sort();

    document.getElementById('filter-panel').innerHTML = `
        <article class="card group-card">
            <h3>Nhóm 1 · Tránh / Chọn / Bổ Long / Tiết khí
                <label class="check-inline"><input type="checkbox" data-bool="group1On"> Bật</label>
            </h3>
            <details open>
                <summary>1A. TRÁNH</summary>
                <div class="sub-label">Ngũ Hoàng</div>
                <div class="chip-wrap">
                    ${chipBtn('tranh.nguHoangThang', 'Tránh tháng Chi trục NH' + j(k.nguHoangThangChi), 'danger')}
                    ${chipBtn('tranh.nguHoangNgayChi', 'Tránh ngày Chi NH năm' + j(k.namChiNguHoang), 'danger')}
                    ${chipBtn('tranh.nguHoangGioChi', 'Tránh giờ Chi NH năm', 'danger')}
                </div>
                <div class="sub-label">Tuế Phá ${esc(k.tuePhaChi || '')}</div>
                <div class="chip-wrap">
                    ${chipBtn('tranh.tuePhaThang', 'Tháng', 'danger')}
                    ${chipBtn('tranh.tuePhaNgay', 'Ngày', 'danger')}
                    ${chipBtn('tranh.tuePhaGio', 'Giờ', 'danger')}
                </div>
                <div class="sub-label">Tam Sát ${j(k.tamSatChi)}</div>
                <div class="chip-wrap">
                    ${chipBtn('tranh.tamSatThang', 'Tháng', 'danger')}
                    ${chipBtn('tranh.tamSatNgay', 'Ngày', 'danger')}
                    ${chipBtn('tranh.tamSatGio', 'Giờ', 'danger')}
                </div>
                <div class="sub-label">Bát Sát ${esc(k.batSatChi || '')}</div>
                <div class="chip-wrap">
                    ${chipBtn('tranh.batSatThang', 'Tháng', 'danger')}
                    ${chipBtn('tranh.batSatNgay', 'Ngày', 'danger')}
                    ${chipBtn('tranh.batSatGio', 'Giờ', 'danger')}
                </div>
                <div class="sub-label">Xung Tọa ${esc(k.xungToaChi || '')} — mặc định LOẠI</div>
                <div class="chip-wrap">
                    ${chipBtn('tranh.xungToaThang', 'Tháng', 'warn')}
                    ${chipBtn('tranh.xungToaNgay', 'Ngày', 'warn')}
                    ${chipBtn('tranh.xungToaGio', 'Giờ', 'warn')}
                </div>
                <div class="sub-label">Xung Tuổi ${esc(k.xungTuoiChi || '')} — mặc định LOẠI</div>
                <div class="chip-wrap">
                    ${chipBtn('tranh.xungTuoiThang', 'Tháng', 'warn')}
                    ${chipBtn('tranh.xungTuoiNgay', 'Ngày', 'warn')}
                    ${chipBtn('tranh.xungTuoiGio', 'Giờ', 'warn')}
                </div>
            </details>
            <details>
                <summary>1B. CHỌN (OR giữa các loại)</summary>
                <div class="sub-label">Tự Hợp</div>
                <div class="chip-wrap">
                    ${chipBtn('chon.tuHopThangChi', 'Tháng Chi', 'good')}
                    ${chipBtn('chon.tuHopNgayCan', 'Ngày Can', 'good')}
                    ${chipBtn('chon.tuHopNgayChi', 'Ngày Chi', 'good')}
                    ${chipBtn('chon.tuHopGioCan', 'Giờ Can', 'good')}
                    ${chipBtn('chon.tuHopGioChi', 'Giờ Chi', 'good')}
                </div>
                <div class="sub-label">Sinh Hợp</div>
                <div class="chip-wrap">
                    ${chipBtn('chon.sinhHopThangChi', 'Tháng Chi', 'good')}
                    ${chipBtn('chon.sinhHopNgayCan', 'Ngày Can', 'good')}
                    ${chipBtn('chon.sinhHopNgayChi', 'Ngày Chi', 'good')}
                    ${chipBtn('chon.sinhHopGioCan', 'Giờ Can', 'good')}
                    ${chipBtn('chon.sinhHopGioChi', 'Giờ Chi', 'good')}
                </div>
                <div class="sub-label">Tam Hợp</div>
                <div class="chip-wrap">
                    ${chipBtn('chon.tamHopThangChi', 'Tháng Chi', 'good')}
                    ${chipBtn('chon.tamHopNgayChi', 'Ngày Chi', 'good')}
                    ${chipBtn('chon.tamHopGioChi', 'Giờ Chi', 'good')}
                </div>
                <label class="check-inline"><input type="checkbox" data-path="chon.thangPhaiChon"> Tháng cũng phải CHỌN</label>
            </details>
            <details>
                <summary>1C. Tam Hợp Bổ Long (OR giữa các cục)</summary>
                <div class="chip-wrap">
                    ${chipBtn('bolong.anCuc', 'Ấn Cục', 'good')}
                    ${chipBtn('bolong.taiCuc', 'Tài Cục', 'good')}
                    ${chipBtn('bolong.vuongCuc', 'Vượng Cục', 'good')}
                </div>
                <label class="check-inline"><input type="checkbox" data-path="bolong.matchCan"> Khớp Can</label>
                <label class="check-inline"><input type="checkbox" data-path="bolong.matchChi"> Khớp Chi</label>
                <label class="check-inline"><input type="checkbox" data-path="bolong.matchBoth"> AND Can lẫn Chi</label>
            </details>
            <details>
                <summary>1D. Thái Dương / Thái Âm / Tiết khí</summary>
                <div class="chip-wrap">
                    ${(computed.thaiDuong.items || []).map(it => chipArr('tietKhi.selected', it.value, esc(it.label) + ': ' + esc(it.value), 'good')).join('')}
                </div>
                <label class="check-inline"><input type="checkbox" data-path="tietKhi.onlyThoseDays"> Chỉ lấy đúng ngày tiết khí</label>
                <label class="check-inline"><input type="checkbox" data-path="tietKhi.prioritize"> Ưu tiên xếp trên</label>
            </details>
            <details>
                <summary>1E. Lọc lịch thô</summary>
                <label class="field"><span>Từ ngày dương</span><input type="date" data-text="lich.solarFrom"></label>
                <label class="field"><span>Đến ngày dương</span><input type="date" data-text="lich.solarTo"></label>
                <div class="sub-label">Tháng âm</div>
                <div class="chip-wrap">${[1,2,3,4,5,6,7,8,9,10,11,12].map(m => chipArr('lich.lunarMonths', m, 'Th.' + m)).join('')}</div>
                <div class="sub-label">Thứ</div>
                <div class="chip-wrap">${NGAY_TRONG_TUAN.map(w => chipArr('lich.weekdays', w, w)).join('')}</div>
                <div class="sub-label">Can ngày</div>
                <div class="chip-wrap">${THIEN_CAN.map(c => chipArr('lich.dayCans', c, c)).join('')}</div>
                <div class="sub-label">Chi ngày</div>
                <div class="chip-wrap">${DIA_CHI.map(c => chipArr('lich.dayChis', c, c)).join('')}</div>
                <div class="sub-label">Can giờ</div>
                <div class="chip-wrap">${THIEN_CAN.map(c => chipArr('lich.hourCans', c, c)).join('')}</div>
                <div class="sub-label">Chi giờ</div>
                <div class="chip-wrap">${DIA_CHI.map(c => chipArr('lich.hourChis', c, c)).join('')}</div>
            </details>
        </article>

        <article class="card group-card">
            <h3>Nhóm 2 · Tối ưu Hành / Vận
                <label class="check-inline"><input type="checkbox" data-bool="group2On"> Bật</label>
            </h3>
            <label class="check-inline"><input type="checkbox" data-path="toiUu.applyHanh"> Áp Hành</label>
            <label class="check-inline"><input type="checkbox" data-path="toiUu.applyVan"> Áp Vận</label>
            <label class="check-inline"><input type="checkbox" data-path="toiUu.gioPhaiKhopChain"> Giờ phải khớp chain</label>
            <details open>
                <summary>2A. Số tối ưu từ máy</summary>
                <div class="sub-label">Hành trụ ngày</div>
                <div class="chip-wrap">
                    ${(computed.toiUu.hanhNgay || []).map(r => chipArr('toiUu.hanhNgay', r.ngay, (r.prio === 1 ? 'ƯT1 ' : 'ƯT2 ') + r.ngay, r.prio === 1 ? 'danger' : '')).join('') || '<span class="hint">—</span>'}
                </div>
                <div class="sub-label">Vận trụ ngày</div>
                <div class="chip-wrap">
                    ${(computed.toiUu.vanNgay || []).map(r => chipArr('toiUu.vanNgay', r.ngay, (r.prio === 1 ? 'ƯT1 ' : 'ƯT2 ') + r.ngay, r.prio === 1 ? 'danger' : '')).join('') || '<span class="hint">—</span>'}
                </div>
                <div class="sub-label">Chuỗi Hành 4 trụ</div>
                <div class="chip-wrap">
                    ${(computed.toiUu.hanhChains || []).map(c => chipArr('toiUu.chainsHanh', c.chainName, c.chainName + ' ' + c.totalScore + 'đ')).join('') || '<span class="hint">—</span>'}
                </div>
                <div class="sub-label">Chuỗi Vận 4 trụ</div>
                <div class="chip-wrap">
                    ${(computed.toiUu.vanChains || []).map(c => chipArr('toiUu.chainsVan', c.chainName, c.chainName + ' ' + c.totalScore + 'đ')).join('') || '<span class="hint">—</span>'}
                </div>
                <div class="sub-label">Hành 6 trụ</div>
                <div class="chip-wrap">
                    ${(computed.toiUu.hanh6 || []).map(c => chipArr('toiUu.chains6Hanh', c.chainName, '[' + c.totalScore + 'đ] ' + c.chainName)).join('') || '<span class="hint">—</span>'}
                </div>
                <div class="sub-label">Vận 6 trụ</div>
                <div class="chip-wrap">
                    ${(computed.toiUu.van6 || []).map(c => chipArr('toiUu.chains6Van', c.chainName, '[' + c.totalScore + 'đ] ' + c.chainName)).join('') || '<span class="hint">—</span>'}
                </div>
            </details>
            <details>
                <summary>2B. Loại quan hệ</summary>
                <div class="chip-wrap">${rels.map(r => chipArr('quanHe.rels', r, r)).join('')}</div>
                <div class="chip-wrap">${pairs.map(p => chipArr('quanHe.pairs', p[0], p[1])).join('')}</div>
                <label class="check-inline"><input type="checkbox" data-path="quanHe.applyHanh"> Hành</label>
                <label class="check-inline"><input type="checkbox" data-path="quanHe.applyVan"> Vận</label>
                <label class="check-inline"><input type="checkbox" data-path="quanHe.allPairsMustMatch"> Mọi cặp đã tick phải thỏa</label>
                <label class="field"><span>Điểm tối thiểu Ngày–Giờ</span>
                    <input type="number" min="0" max="10" data-num="quanHe.minScoreNgayGio">
                </label>
            </details>
            <details>
                <summary>2C. Số Hành / Vận thủ công</summary>
                <div class="sub-label">Hành ngày</div>${nums(9, 'toiUu.hanhNgay')}
                <div class="sub-label">Vận ngày</div>${nums(9, 'toiUu.vanNgay')}
                <div class="sub-label">Hành giờ</div>${nums(9, 'toiUu.hanhGio')}
                <div class="sub-label">Vận giờ</div>${nums(9, 'toiUu.vanGio')}
                <div class="sub-label">Hành tháng</div>${nums(9, 'toiUu.hanhThang')}
                <div class="sub-label">Vận tháng</div>${nums(9, 'toiUu.vanThang')}
            </details>
        </article>

        <article class="card group-card">
            <h3>Nhóm 3 · Huyết thống quẻ
                <label class="check-inline"><input type="checkbox" data-bool="group3On"> Bật</label>
            </h3>
            <p class="hint">Mặc định tắt. Chỉ chạy khi Áp dụng. Nếu còn quá nhiều giờ, hãy siết nhóm 1–2 trước.</p>
            <details>
                <summary>3A. Vai trò</summary>
                <div class="chip-wrap">
                    ${chipBtn('que.batBuocPhuMau', 'Bắt buộc Phụ Mẫu', 'good')}
                    ${chipBtn('que.batBuocTuTuc', 'Bắt buộc Tử Tức', 'good')}
                    ${chipBtn('que.batBuocHuynhDe', 'Bắt buộc Huynh Đệ', 'good')}
                    ${chipBtn('que.camKXDTamTai', 'Cấm KXĐ Tam Tài', 'danger')}
                </div>
                <label class="field"><span>Số trụ KXĐ tối đa (trống = không giới hạn)</span>
                    <input type="number" min="0" max="6" placeholder="Không giới hạn" data-nullnum="que.maxKXD">
                </label>
            </details>
            <details>
                <summary>3B. Âm Dương</summary>
                <div class="chip-wrap">
                    ${chipBtn('que.khongCoDuong', 'Không Cô Dương 6 trụ', 'danger')}
                    ${chipBtn('que.khongCoAm', 'Không Cô Âm 6 trụ', 'danger')}
                    ${chipBtn('que.khongCoDuongTamTai', 'Không Cô Dương Tam Tài', 'warn')}
                    ${chipBtn('que.khongCoAmTamTai', 'Không Cô Âm Tam Tài', 'warn')}
                    ${chipBtn('que.canAmDuong', 'Phải có cả Âm và Dương', 'good')}
                </div>
            </details>
            <details>
                <summary>3C. Cảnh báo</summary>
                <div class="chip-wrap">
                    ${chipBtn('que.loaiLucXung', 'Loại Lục Xung', 'danger')}
                    ${chipBtn('que.loaiThatTinh', 'Loại Thất Tinh Đả Kiếp', 'danger')}
                    ${chipBtn('que.loaiKhongTheDung', 'Loại KHÔNG THỂ DÙNG', 'danger')}
                    ${chipBtn('que.chiTot', 'Chỉ lấy TỐT', 'good')}
                    ${chipBtn('que.totVaTb', 'TỐT + TRUNG BÌNH', 'good')}
                </div>
            </details>
            <details>
                <summary>3D. Họ quái</summary>
                <div class="chip-wrap">${HKDQ_FAMILIES.map(h => chipArr('que.hoUuTien', h, h)).join('')}</div>
                <div class="sub-label">Bắt buộc trụ Ngày thuộc họ</div>
                <div class="chip-wrap">${HKDQ_FAMILIES.map(h => chipArr('que.batBuocTruNgayHo', h, h)).join('')}</div>
                <div class="chip-wrap">
                    ${chipBtn('que.tuoiNgayCungHo', 'Tuổi & Ngày cùng họ', 'good')}
                    ${chipBtn('que.tamTaiCungHo', 'Tam Tài cùng họ', 'good')}
                </div>
            </details>
            <details>
                <summary>3E. Quẻ cụ thể</summary>
                <label class="field"><span>Thêm quẻ bắt buộc trụ Ngày</span>
                    <input class="search-box" list="que-list" id="que-must-input" placeholder="Tên quẻ">
                </label>
                <button type="button" class="btn sm" id="btn-add-que-must">Thêm bắt buộc</button>
                <div class="chip-wrap" id="que-must-chips"></div>
                <label class="field"><span>Thêm quẻ cấm</span>
                    <input class="search-box" list="que-list" id="que-ban-input" placeholder="Tên quẻ">
                </label>
                <button type="button" class="btn sm" id="btn-add-que-ban">Thêm cấm</button>
                <div class="chip-wrap" id="que-ban-chips"></div>
                <datalist id="que-list">${queNames.map(n => `<option value="${esc(n)}">`).join('')}</datalist>
            </details>
        </article>`;
    syncFilterUI(filters);
}

function getPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}
function setPath(obj, path, val) {
    const keys = path.split('.');
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = val;
}

function syncFilterUI(filters) {
    document.querySelectorAll('#filter-panel [data-bool]').forEach(el => {
        el.checked = !!getPath(filters, el.dataset.bool);
    });
    document.querySelectorAll('#filter-panel [data-path]').forEach(el => {
        const v = getPath(filters, el.dataset.path);
        if (el.type === 'checkbox') el.checked = !!v;
        else toggleChip(el, !!v);
    });
    document.querySelectorAll('#filter-panel [data-arr]').forEach(el => {
        const arrv = getPath(filters, el.dataset.arr) || [];
        const val = isNaN(el.dataset.val) ? el.dataset.val : (String(Number(el.dataset.val)) === el.dataset.val ? Number(el.dataset.val) : el.dataset.val);
        const on = arrv.some(x => String(x) === String(el.dataset.val) || x === val);
        toggleChip(el, on);
    });
    document.querySelectorAll('#filter-panel [data-text]').forEach(el => { el.value = getPath(filters, el.dataset.text) || ''; });
    document.querySelectorAll('#filter-panel [data-num]').forEach(el => { el.value = getPath(filters, el.dataset.num) ?? 0; });
    document.querySelectorAll('#filter-panel [data-nullnum]').forEach(el => {
        const v = getPath(filters, el.dataset.nullnum);
        el.value = (v === null || v === undefined) ? '' : v;
    });
    const must = document.getElementById('que-must-chips');
    const ban = document.getElementById('que-ban-chips');
    if (must) must.innerHTML = (filters.que.truNgayQue || []).map(q => `<span class="chip on">${esc(q)}</span>`).join('');
    if (ban) ban.innerHTML = (filters.que.camQue || []).map(q => `<span class="chip danger on">${esc(q)}</span>`).join('');
    document.querySelectorAll('#profile-row [data-profile]').forEach(b => {
        b.classList.toggle('on', b.dataset.profile === filters.profile);
    });
}

function renderLiveCount(stat) {
    const el = document.getElementById('live-count');
    if (!stat) { el.textContent = 'Khớp: —'; return; }
    let t = `Khớp: ${stat.days} ngày · ${stat.hours} giờ`;
    if (stat.group3Pending) t += ' · quẻ chưa chạy';
    el.textContent = t;
}

function renderResults(rows, state) {
    const box = document.getElementById('result-list');
    const meta = document.getElementById('result-meta');
    const hoursN = rows.reduce((n, r) => n + r.hours.length, 0);
    meta.textContent = `Khớp ${rows.length} ngày · ${hoursN} giờ`;
    if (!rows.length) {
        box.innerHTML = `<div class="card empty">
            <p>Không có ngày/giờ khớp.</p>
            <button type="button" class="btn sm" data-relax="lỏng">Dùng hồ sơ Lỏng</button>
            <button type="button" class="btn sm" data-relax="vừa">Dùng hồ sơ Vừa</button>
            <button type="button" class="btn sm" id="btn-off-g3">Tắt nhóm 3</button>
        </div>`;
        return;
    }
    const onlySel = document.getElementById('only-selected').checked;
    const groupMonth = document.getElementById('group-by-month').checked;
    let html = '';
    let lastMonth = '';
    rows.forEach((row, idx) => {
        const d = row.day;
        const keys = row.hours.map(h => hourKey(d, h));
        if (onlySel && !keys.some(k => state.selected[k])) return;
        const mkey = d.solarYear + '-' + pad2(d.solarMonth);
        if (groupMonth && mkey !== lastMonth) {
            lastMonth = mkey;
            html += `<h3 class="month-title">Tháng ${d.solarMonth}/${d.solarYear}</h3>`;
        }
        const dayChecked = keys.every(k => state.selected[k]);
        html += `<article class="card day-card" data-row="${idx}">
            <div class="day-head">
                <label><input type="checkbox" class="sel-day" ${dayChecked ? 'checked' : ''}></label>
                <div class="when">
                    <div class="solar">${fmtSolar(d)} · ${esc(d.weekday)}</div>
                    <div class="lunar">${fmtLunar(d)} · <span class="can-chi">${esc(d.dayCanChi)}</span></div>
                    <div class="lunar">Tháng TK: ${esc(d.thangCanChiTK)} · ${esc(d.tietKhi)} · Chính Ngọ ${esc(d.solarNoon)}</div>
                </div>
            </div>
            <div class="badge-row">${row.badges.map(b => `<span class="badge ${b.cls}">${esc(b.text)}</span>`).join('')}</div>
            <div class="hint">Giờ khớp (${row.hours.length}) — chạm để chọn, giữ để phân tích</div>
            <div class="hour-grid">
                ${row.hours.map(h => {
                    const k = hourKey(d, h);
                    const out = state.selected[k] && state.selectedOut[k];
                    return `<button type="button" class="hour-chip ${state.selected[k] ? 'selected' : ''} ${out ? 'dim' : ''}" data-hkey="${esc(k)}" data-hname="${esc(h.name)}">
                        <span class="hc-name">${esc(h.name)}</span>
                        <span class="hc-cc">${esc(h.canChi)}</span>
                        ${h.quyNhan ? `<span class="qn">${esc(h.quyNhan)}</span>` : ''}
                    </button>`;
                }).join('')}
            </div>
            <div class="day-actions">
                <button type="button" class="btn sm" data-day-detail="${idx}">Chi tiết ngày</button>
            </div>
        </article>`;
    });
    if (!html) html = '<div class="card empty">Không có mục nào trong chế độ đang xem.</div>';
    box.innerHTML = html;
}

function renderDaySheet(day) {
    document.getElementById('sheet-day-title').textContent = fmtSolar(day) + ' · ' + day.dayCanChi;
    document.getElementById('sheet-day-body').innerHTML = `
        ${infoRows([
            ['Dương lịch', fmtSolar(day)], ['Âm lịch', fmtLunar(day)],
            ['Thứ', esc(day.weekday)], ['Tiết khí', esc(day.tietKhi)],
            ['Tháng TK', esc(day.thangCanChiTK)], ['Năm TK', esc(day.namCanChiTK)],
            ['Chính Ngọ', esc(day.solarNoon)]
        ])}
        <div class="sub-label">Trụ Tuổi</div>${queBlock(day.canChiTuoi)}
        <div class="sub-label">Trụ Tọa</div>${queBlock(day.canChiToa)}
        <div class="sub-label">Trụ Ngày</div>${queBlock(day.dayCanChi)}
        <div class="sub-label">Trụ Tháng</div>${queBlock(day.thangCanChiTK)}
        <div class="sub-label">Trụ Năm</div>${queBlock(day.namCanChiTK)}
        <p class="hint">Chọn một giờ trên card ngày để phân tích 6 trụ.</p>`;
}

function renderHkdqMobile(ketQua) {
    const hd = ketQua.thongTinHuynhDe || {};
    let html = `<div class="hkdq-stats" style="margin-bottom:8px">Âm:${ketQua.thongKeAmDuong['Âm']} · Dương:${ketQua.thongKeAmDuong['Dương']} · PM:${ketQua.thongKeVaiTro['Phụ Mẫu']} · TT:${ketQua.thongKeVaiTro['Tử Tức']} · HĐ:${hd.tongHuynhDe || 0} · KXĐ:${ketQua.thongKeAmDuong['KXĐ']}</div>`;
    html += '<div class="hkdq-grid">';
    ['Trụ Tuổi', 'Trụ Tọa', 'Trụ Ngày', 'Trụ Tháng', 'Trụ Năm', 'Trụ Giờ'].forEach(tenTru => {
        const kq = ketQua.ketQuaCacTru[tenTru];
        html += `<div class="pillar"><div><b>${tenTru.replace('Trụ ', '')}</b></div>`;
        if (kq && kq.tenQue) {
            html += `<div>${esc(kq.tenQue)}</div>`;
            if (kq.thongTinDuocChon && kq.trangThai !== 'KXĐ' && kq.trangThai !== 'Không tìm thấy') {
                const ad = kq.thongTinDuocChon.amDuong === 'Dương' ? 'duong' : 'am';
                html += `<span class="${ad}">${esc(kq.thongTinDuocChon.amDuong)}</span><div>${esc(kq.trangThai)}</div><small>${esc(kq.thongTinDuocChon.giaDinh)}</small>`;
            } else {
                html += `<span class="kxd">KXĐ</span><div style="font-size:9px">${esc(kq.lyDoKXDLabel || '')}</div>`;
            }
        } else html += '—';
        html += '</div>';
    });
    html += '</div>';
    (ketQua.canhBao || []).forEach(cb => {
        html += `<div class="${cb.type === 'critical' ? 'warn-c' : 'warn-m'}">${esc(cb.message)}</div>`;
    });
    html += `<div class="final-rating ${esc(ketQua.ratingClass)}">${esc(ketQua.danhGia)}</div>`;
    if (hd.tongHuynhDe > 0) {
        html += '<p><b>Huynh Đệ:</b> ' + esc(hd.chiTiet || '') + '</p>';
    }
    if (ketQua.cacCapThatTinh && ketQua.cacCapThatTinh.length) {
        html += '<p><b>Thất Tinh:</b> ' + ketQua.cacCapThatTinh.map(c => `${c.que1} ↔ ${c.que2}`).join('; ') + '</p>';
    }
    return html;
}

function renderHourSheet(day, hour) {
    const an = analyzeHour(day, hour);
    const labels = [
        ['tuoi-toa', 'Tuổi-Tọa'], ['tuoi-ngay', 'Tuổi-Ngày'], ['toa-ngay', 'Tọa-Ngày'],
        ['ngay-gio', 'Ngày-Giờ'], ['ngay-thang', 'Ngày-Tháng'], ['ngay-nam', 'Ngày-Năm'], ['thang-nam', 'Tháng-Năm']
    ];
    document.getElementById('sheet-hour-title').textContent = hour.name + ' · ' + hour.canChi;
    document.getElementById('sheet-hour-body').innerHTML = `
        <p class="can-chi">${fmtSolar(day)} · ${esc(day.dayCanChi)} · giờ ${esc(hour.canChi)}</p>
        ${hour.quyNhan ? `<p class="qn">Thiên Ất Quý Nhân: ${esc(hour.quyNhan)}</p>` : ''}
        <div class="sub-label">Quan hệ Hành / Vận / Xung</div>
        <div class="pair-grid">
            ${labels.map(([k, lab]) => {
                const xung = an.lucXungList.find(x => x.indexOf(lab) === 0);
                return `<div class="pair-box"><b>${lab}</b><div>H: ${esc(an.hanhPairs[k])}</div><div>V: ${esc(an.vanPairs[k])}</div><div>${xung ? '<span style="color:#c62828">Xung</span>' : '-'}</div></div>`;
            }).join('')}
        </div>
        <div class="sub-label">Huyền Không 6 trụ</div>
        ${renderHkdqMobile(an.ketQua)}
        <p class="hint">Kỳ Môn Độn Giáp: (chưa tính)</p>
        <button type="button" class="btn primary block" id="btn-pick-this-hour" data-hkey="${esc(hourKey(day, hour))}">Chọn giờ này</button>
    `;
}

function renderSelectedTray(state, dataset) {
    const items = Object.keys(state.selected);
    const body = document.getElementById('sheet-selected-body');
    document.getElementById('btn-selected-tray').textContent = 'Đã chọn ' + items.length;
    if (!items.length) {
        body.innerHTML = '<p class="empty">Chưa tick ngày/giờ ưng ý.</p>';
        return;
    }
    const map = {};
    dataset.forEach(d => d.hours.forEach(h => { map[hourKey(d, h)] = { day: d, hour: h }; }));
    const groups = {};
    items.forEach(k => {
        const it = map[k]; if (!it) return;
        (groups[it.day.jdn] || (groups[it.day.jdn] = { day: it.day, hours: [] })).hours.push(it.hour);
    });
    body.innerHTML = Object.values(groups).sort((a, b) => a.day.jdn - b.day.jdn).map(g => {
        const out = g.hours.some(h => state.selectedOut[hourKey(g.day, h)]);
        return `<div class="sel-item ${out ? 'out' : ''}">
            <div style="flex:1">
                <b>${fmtSolar(g.day)}</b> · ${fmtLunar(g.day)} · ${esc(g.day.dayCanChi)}
                <div>${g.hours.map(h => `<span class="print-hour">${esc(h.name)} (${esc(h.canChi)})</span>`).join(' ')}</div>
                ${out ? '<small style="color:#ef6c00">Ngoài bộ lọc hiện tại</small>' : ''}
            </div>
            <button type="button" class="btn sm danger" data-del-day="${g.day.jdn}">Xóa</button>
        </div>`;
    }).join('');
}

function buildPrintHtml(state, computed, dataset, forKhach) {
    const map = {};
    dataset.forEach(d => d.hours.forEach(h => { map[hourKey(d, h)] = { day: d, hour: h }; }));
    const groups = {};
    Object.keys(state.selected).forEach(k => {
        const it = map[k]; if (!it) return;
        (groups[it.day.jdn] || (groups[it.day.jdn] = { day: it.day, hours: [] })).hours.push(it.hour);
    });
    const inp = computed.input;
    let html = `<h2>${forKhach ? 'Ngày giờ đã chọn' : 'Chi tiết ngày giờ đã chọn'}</h2>
        <p><b>Việc:</b> ${esc(inp.event || '—')} · <b>Tuổi:</b> ${esc(computed.birthInfo.canChi)} (${inp.birthYear})
        · <b>Tọa:</b> ${inp.toaDo}° ${esc(computed.toaInfo.son)} · <b>Năm:</b> ${inp.viewYear}
        · <b>Địa điểm:</b> ${esc(inp.location || '—')}</p><ol>`;
    Object.values(groups).sort((a, b) => a.day.jdn - b.day.jdn).forEach(g => {
        html += `<li><b>${fmtSolar(g.day)}</b> (${fmtLunar(g.day)}, ${esc(g.day.dayCanChi)}) — `;
        html += g.hours.map(h => `<span class="print-hour">${esc(h.name)} (${esc(h.canChi)})</span>`).join(', ');
        if (!forKhach) html += `<div class="print-detail">Tháng TK ${esc(g.day.thangCanChiTK)} · ${esc(g.day.tietKhi)} · Chính Ngọ ${esc(g.day.solarNoon)}</div>`;
        html += '</li>';
    });
    html += '</ol>';
    return html;
}
