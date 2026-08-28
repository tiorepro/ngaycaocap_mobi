// ==========================================
// OPTIMIZER.JS - Tối ưu Hành / Vận
// ==========================================
// Tính bảng điểm trọng số, tối ưu 4 trụ,
// tối ưu 6 trụ toàn diện.

// ---------- BẢNG ĐIỂM TRỌNG SỐ ----------
const SCORE_MAP = {
    "Hợp Thập": 10, "Hợp Ngũ": 8, "Hợp Thập Ngũ": 8,
    "Cùng Quái": 8, "Hà Đồ": 6, "Điên Đảo Ai Tinh": 6,
    "Sinh Nhập": 5, "Khắc Nhập": 3
};

function getBestScore(rels) {
    return rels.length > 0 ? Math.max(...rels.map(r => SCORE_MAP[r] || 0)) : 0;
}

function getBestRelName(rels) {
    return rels.length > 0 ? rels.reduce((a, b) => (SCORE_MAP[a] || 0) > (SCORE_MAP[b] || 0) ? a : b) : '';
}

// ---------- PHÂN TÍCH CẶP ----------
function analyzeHanhPair(hanhArr1, hanhArr2, isDirected = false) {
    if (!hanhArr1 || hanhArr1.length === 0 || !hanhArr2 || hanhArr2.length === 0) return "-";
    const allRelations = new Set();
    for (const h1 of hanhArr1) {
        for (const h2 of hanhArr2) {
            const relations = isDirected
                ? checkDirectedRelations(h1, h2)
                : [...checkHanhRelations(h1, h2), ...checkDirectedRelations(h1, h2)];
            relations.forEach(r => allRelations.add(r));
        }
    }
    return allRelations.size > 0 ? [...allRelations].join(', ') : "-";
}

function analyzeVanPair(vanArr1, vanArr2) {
    if (!vanArr1 || vanArr1.length === 0 || !vanArr2 || vanArr2.length === 0) return "-";
    const allRelations = new Set();
    for (const v1 of vanArr1) {
        for (const v2 of vanArr2) {
            checkVanRelations(v1, v2).forEach(r => allRelations.add(r));
        }
    }
    return allRelations.size > 0 ? [...allRelations].join(', ') : "-";
}

// ---------- TỐI ƯU HÀNH TRỤ NGÀY ----------
function solveToiUu(hanhTuoiArr, hanhToaArr) {
    const hasTuoi = hanhTuoiArr && hanhTuoiArr.length > 0;
    const hasToa = hanhToaArr && hanhToaArr.length > 0;

    let results = [];
    for (let h_ngay = 1; h_ngay <= 9; h_ngay++) {
        let bestPrio = 2, bestTotalScore = -1, bestScoreTuoi = -1, bestReasons = [];

        if (hasTuoi && hasToa) {
            for (const t of hanhTuoiArr) {
                for (const to of hanhToaArr) {
                    const rel_t_to = [...checkHanhRelations(t, to), ...checkDirectedRelations(t, to)];
                    if (rel_t_to.length === 0) continue;
                    const rel_ng_to = [...checkHanhRelations(to, h_ngay), ...checkDirectedRelations(to, h_ngay)];
                    const rel_ng_t = [...checkHanhRelations(t, h_ngay), ...checkDirectedRelations(t, h_ngay)];
                    if (rel_ng_to.length > 0 && rel_ng_t.length > 0) {
                        const isPrio1 = (h_ngay === t || h_ngay === to) ? 1 : 2;
                        const total = getBestScore(rel_ng_t) + getBestScore(rel_ng_to) + getBestScore(rel_t_to);
                        const reason = `To(${to})-Tu(${t}):${rel_t_to.join(',')}\nNg(${h_ngay})-To(${to}):${rel_ng_to.join(',')}\nNg(${h_ngay})-Tu(${t}):${rel_ng_t.join(',')}`;
                        if (isPrio1 < bestPrio || (isPrio1 === bestPrio && total > bestTotalScore)) {
                            bestPrio = isPrio1; bestTotalScore = total; bestScoreTuoi = getBestScore(rel_ng_t);
                            bestReasons = [reason];
                        }
                    }
                }
            }
        } else if (hasTuoi) {
            for (const t of hanhTuoiArr) {
                const rel = [...checkHanhRelations(t, h_ngay), ...checkDirectedRelations(t, h_ngay)];
                if (rel.length > 0) {
                    const isPrio1 = (h_ngay === t) ? 1 : 2;
                    const score = getBestScore(rel);
                    const reason = `Ng(${h_ngay})-Tu(${t}):${rel.join(',')}`;
                    if (isPrio1 < bestPrio || (isPrio1 === bestPrio && score > bestTotalScore)) {
                        bestPrio = isPrio1; bestTotalScore = score; bestReasons = [reason];
                    }
                }
            }
        } else if (hasToa) {
            for (const to of hanhToaArr) {
                const rel = [...checkHanhRelations(to, h_ngay), ...checkDirectedRelations(to, h_ngay)];
                if (rel.length > 0) {
                    const isPrio1 = (h_ngay === to) ? 1 : 2;
                    const score = getBestScore(rel);
                    const reason = `Ng(${h_ngay})-To(${to}):${rel.join(',')}`;
                    if (isPrio1 < bestPrio || (isPrio1 === bestPrio && score > bestTotalScore)) {
                        bestPrio = isPrio1; bestTotalScore = score; bestReasons = [reason];
                    }
                }
            }
        }

        if (bestReasons.length > 0) {
            results.push({ ngay: h_ngay, prio: bestPrio, totalScore: bestTotalScore, scoreTuoi: bestScoreTuoi, reasons: bestReasons });
        }
    }

    results.sort((a, b) => {
        if (a.prio !== b.prio) return a.prio - b.prio;
        if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
        return b.scoreTuoi - a.scoreTuoi;
    });

    return results;
}

// ---------- TỐI ƯU VẬN TRỤ NGÀY ----------
function solveToiUuVan(vanTuoiArr, vanToaArr) {
    const hasTuoi = vanTuoiArr && vanTuoiArr.length > 0;
    const hasToa = vanToaArr && vanToaArr.length > 0;

    let results = [];
    for (let v_ngay = 1; v_ngay <= 9; v_ngay++) {
        let bestPrio = 2, bestTotalScore = -1, bestScoreTuoi = -1, bestReasons = [];

        if (hasTuoi && hasToa) {
            for (const t of vanTuoiArr) {
                for (const to of vanToaArr) {
                    const rel_t_to = checkVanRelations(t, to);
                    if (rel_t_to.length === 0) continue;
                    const rel_ng_to = checkVanRelations(to, v_ngay);
                    const rel_ng_t = checkVanRelations(t, v_ngay);
                    if (rel_ng_to.length > 0 && rel_ng_t.length > 0) {
                        const isPrio1 = (v_ngay === t || v_ngay === to || v_ngay + t === 10 || v_ngay + to === 10) ? 1 : 2;
                        const total = getBestScore(rel_ng_t) + getBestScore(rel_ng_to) + getBestScore(rel_t_to);
                        const reason = `To(${to})-Tu(${t}):${rel_t_to.join(',')}\nNg(${v_ngay})-To(${to}):${rel_ng_to.join(',')}\nNg(${v_ngay})-Tu(${t}):${rel_ng_t.join(',')}`;
                        if (isPrio1 < bestPrio || (isPrio1 === bestPrio && total > bestTotalScore)) {
                            bestPrio = isPrio1; bestTotalScore = total; bestScoreTuoi = getBestScore(rel_ng_t);
                            bestReasons = [reason];
                        }
                    }
                }
            }
        } else if (hasTuoi) {
            for (const t of vanTuoiArr) {
                const rel = checkVanRelations(t, v_ngay);
                if (rel.length > 0) {
                    const isPrio1 = (v_ngay === t || v_ngay + t === 10) ? 1 : 2;
                    const score = getBestScore(rel);
                    const reason = `Ng(${v_ngay})-Tu(${t}):${rel.join(',')}`;
                    if (isPrio1 < bestPrio || (isPrio1 === bestPrio && score > bestTotalScore)) {
                        bestPrio = isPrio1; bestTotalScore = score; bestReasons = [reason];
                    }
                }
            }
        } else if (hasToa) {
            for (const to of vanToaArr) {
                const rel = checkVanRelations(to, v_ngay);
                if (rel.length > 0) {
                    const isPrio1 = (v_ngay === to || v_ngay + to === 10) ? 1 : 2;
                    const score = getBestScore(rel);
                    const reason = `Ng(${v_ngay})-To(${to}):${rel.join(',')}`;
                    if (isPrio1 < bestPrio || (isPrio1 === bestPrio && score > bestTotalScore)) {
                        bestPrio = isPrio1; bestTotalScore = score; bestReasons = [reason];
                    }
                }
            }
        }

        if (bestReasons.length > 0) {
            results.push({ ngay: v_ngay, prio: bestPrio, totalScore: bestTotalScore, scoreTuoi: bestScoreTuoi, reasons: bestReasons });
        }
    }

    results.sort((a, b) => {
        if (a.prio !== b.prio) return a.prio - b.prio;
        if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
        return b.scoreTuoi - a.scoreTuoi;
    });

    return results;
}

// ---------- TỐI ƯU CHUỖI 4 TRỤ (GIỜ → NGÀY → THÁNG → NĂM) ----------
function solveChainedHanhOptimization(optimalHanhNgay, hanhNamArr) {
    const chains = [];
    for (const { ngay: h_ngay } of optimalHanhNgay) {
        for (let h_thang = 1; h_thang <= 9; h_thang++) {
            const s_ngay_thang = getBestScore([...checkHanhRelations(h_ngay, h_thang), ...checkDirectedRelations(h_ngay, h_thang)]);
            if (s_ngay_thang === 0) continue;

            for (const h_nam of hanhNamArr) {
                const s_thang_nam = getBestScore([...checkHanhRelations(h_thang, h_nam), ...checkDirectedRelations(h_thang, h_nam)]);
                if (s_thang_nam === 0) continue;

                for (let h_gio = 1; h_gio <= 9; h_gio++) {
                    const s_gio_ngay = getBestScore([...checkHanhRelations(h_gio, h_ngay), ...checkDirectedRelations(h_ngay, h_gio)]);
                    if (s_gio_ngay === 0) continue;

                    const totalScore = s_ngay_thang + s_thang_nam + s_gio_ngay;
                    chains.push({
                        chainName: `G(${h_gio})→Ng(${h_ngay})→Th(${h_thang})→N(${h_nam})`,
                        relDesc: `G-Ng:${getBestRelName([...checkHanhRelations(h_gio,h_ngay),...checkDirectedRelations(h_gio,h_ngay)])}|Ng-Th:${getBestRelName([...checkHanhRelations(h_ngay,h_thang),...checkDirectedRelations(h_ngay,h_thang)])}|Th-N:${getBestRelName([...checkHanhRelations(h_thang,h_nam),...checkDirectedRelations(h_thang,h_nam)])}`,
                        totalScore
                    });
                }
            }
        }
    }
    chains.sort((a, b) => b.totalScore - a.totalScore);
    return chains.slice(0, 10);
}

function solveChainedVanOptimization(optimalVanNgay, vanNamArr) {
    const chains = [];
    for (const { ngay: v_ngay } of optimalVanNgay) {
        for (let v_thang = 1; v_thang <= 9; v_thang++) {
            const s_ngay_thang = getBestScore(checkVanRelations(v_ngay, v_thang));
            if (s_ngay_thang === 0) continue;

            for (const v_nam of vanNamArr) {
                const s_thang_nam = getBestScore(checkVanRelations(v_thang, v_nam));
                if (s_thang_nam === 0) continue;

                for (let v_gio = 1; v_gio <= 9; v_gio++) {
                    const s_gio_ngay = getBestScore(checkVanRelations(v_gio, v_ngay));
                    if (s_gio_ngay === 0) continue;

                    const totalScore = s_ngay_thang + s_thang_nam + s_gio_ngay;
                    chains.push({
                        chainName: `G(${v_gio})→Ng(${v_ngay})→Th(${v_thang})→N(${v_nam})`,
                        relDesc: `G-Ng:${getBestRelName(checkVanRelations(v_gio,v_ngay))}|Ng-Th:${getBestRelName(checkVanRelations(v_ngay,v_thang))}|Th-N:${getBestRelName(checkVanRelations(v_thang,v_nam))}`,
                        totalScore
                    });
                }
            }
        }
    }
    chains.sort((a, b) => b.totalScore - a.totalScore);
    return chains.slice(0, 10);
}

// ---------- TỐI ƯU 6 TRỤ (TUỔI-TỌA-GIỜ-NGÀY-THÁNG-NĂM) ----------
function solveFull6PillarOptimization(opts) {
    const { hanhTuoiArr, hanhToaArr, hanhNamArr, vanTuoiArr, vanToaArr, vanNamArr,
            hasTuoi, hasToa, hasNam } = opts;

    const getChains = (isHanh) => {
        const chains = [];
        const checkRels = isHanh
            ? (a, b) => [...checkHanhRelations(a, b), ...checkDirectedRelations(a, b)]
            : (a, b) => checkVanRelations(a, b);

        const tArr = hasTuoi ? (isHanh ? hanhTuoiArr : vanTuoiArr) : [null];
        const toArr = hasToa ? (isHanh ? hanhToaArr : vanToaArr) : [null];
        const nArr = isHanh ? hanhNamArr : vanNamArr;

        for (const t of tArr) {
            for (const to of toArr) {
                let s_to_t = 0, rel_to_t_name = '';
                if (t && to) {
                    const rels = checkRels(t, to);
                    s_to_t = getBestScore(rels);
                    if (s_to_t === 0) continue;
                    rel_to_t_name = getBestRelName(rels);
                }

                for (let ng = 1; ng <= 9; ng++) {
                    let s_ng_to = 0, s_ng_t = 0, validNgay = true;
                    let rel_ng_to_name = '', rel_ng_t_name = '';

                    if (to) {
                        const rels = checkRels(to, ng);
                        s_ng_to = getBestScore(rels);
                        if (s_ng_to === 0) validNgay = false;
                        rel_ng_to_name = getBestRelName(rels);
                    }
                    if (t) {
                        const rels = checkRels(t, ng);
                        s_ng_t = getBestScore(rels);
                        if (s_ng_t === 0) validNgay = false;
                        rel_ng_t_name = getBestRelName(rels);
                    }
                    if (!validNgay) continue;

                    for (let th = 1; th <= 9; th++) {
                        const s_ng_th = getBestScore(checkRels(ng, th));
                        if (s_ng_th === 0) continue;

                        for (const n of nArr) {
                            const s_th_n = getBestScore(checkRels(th, n));
                            if (s_th_n === 0) continue;

                            for (let g = 1; g <= 9; g++) {
                                const s_g_ng = getBestScore(checkRels(g, ng));
                                if (s_g_ng === 0) continue;

                                const totalScore = s_to_t + s_ng_to + s_ng_t + s_ng_th + s_th_n + s_g_ng;
                                let parts = [];
                                if (t) parts.push(`Tu(${t})`);
                                if (to) parts.push(`To(${to})`);
                                parts.push(`G(${g})`, `Ng(${ng})`, `Th(${th})`, `N(${n})`);
                                chains.push({
                                    chainName: parts.join('→'),
                                    relDesc: [t&&to&&`To-Tu:${rel_to_t_name}`,to&&`Ng-To:${rel_ng_to_name}`,t&&`Ng-Tu:${rel_ng_t_name}`,`G-Ng:${getBestRelName(checkRels(g,ng))}`,`Ng-Th:${getBestRelName(checkRels(ng,th))}`,`Th-N:${getBestRelName(checkRels(th,n))}`].filter(Boolean).join('|'),
                                    totalScore
                                });
                            }
                        }
                    }
                }
            }
        }
        return chains;
    };

    const hanhChains = getChains(true);
    const vanChains = getChains(false);

    hanhChains.sort((a, b) => b.totalScore - a.totalScore);
    vanChains.sort((a, b) => b.totalScore - a.totalScore);

    return {
        hanh: hanhChains.slice(0, 15),
        van: vanChains.slice(0, 15)
    };
}
