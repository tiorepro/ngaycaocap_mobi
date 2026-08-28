// ==========================================
// MOBILE-MAIN.JS – Khởi tạo & Điều phối Mobile
// ==========================================
// File cuối cùng được load.
// Điều phối toàn bộ ứng dụng mobile.

// ==================== GLOBAL INIT ====================
(function () {
    'use strict';

    // ---------- ĐẶT NĂM MẶC ĐỊNH ----------
    const viewYearInput = document.getElementById('m-view-year');
    if (viewYearInput && !viewYearInput.value) {
        viewYearInput.value = new Date().getFullYear();
    }

    // ---------- INFINITE SCROLL ----------
    let scrollObserver = null;

    function setupInfiniteScroll() {
        if (scrollObserver) {
            scrollObserver.disconnect();
            scrollObserver = null;
        }

        const sentinel = document.getElementById('btn-load-more');
        if (!sentinel) return;

        scrollObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const btn = document.getElementById('btn-load-more');
                        if (btn && btn.style.display !== 'none') {
                            loadMoreResults();
                        }
                    }
                });
            },
            { root: null, rootMargin: '200px', threshold: 0.1 }
        );

        scrollObserver.observe(sentinel);
    }

    // Gọi setup sau mỗi lần render results
    const originalRenderResults = window.renderResults;
    if (typeof originalRenderResults === 'function') {
        window.renderResults = function () {
            originalRenderResults.apply(this, arguments);
            setTimeout(setupInfiniteScroll, 150);
        };
    }

    // ---------- DEBOUNCE FILTER AUTO-APPLY ----------
    // [FIXED] Tăng delay để inline onclick kịp hoàn thành
    let filterDebounceTimer = null;
    const FILTER_DEBOUNCE_MS = 1500;

    function debouncedApplyFilters() {
    if (filterDebounceTimer) clearTimeout(filterDebounceTimer);
    filterDebounceTimer = setTimeout(() => {
        if (MOBILE_STATE && MOBILE_STATE.inputData && typeof applyAllFilters === 'function') {
            window._userTriggeredApply = false;
            applyAllFilters();
        }
    }, FILTER_DEBOUNCE_MS);
}


    function attachFilterDebounce() {
        // Checkbox trigger debounce
        document.querySelectorAll('#section-filter input[type="checkbox"]').forEach((cb) => {
            // Remove old listener trước để tránh duplicate khi re-init
            cb.removeEventListener('change', debouncedApplyFilters);
            cb.addEventListener('change', debouncedApplyFilters);
        });

        // Chips trigger debounce sau khi toggle hoàn tất
        document.querySelectorAll('#section-filter .m-chip, #section-filter .m-pair-chip').forEach((chip) => {
            chip.removeEventListener('click', onChipDebounce);
            chip.addEventListener('click', onChipDebounce);
        });
    }

    // [FIXED] Tách riêng handler cho chip để dùng 100ms delay, đảm bảo classList đã toggle xong
    function onChipDebounce() {
        setTimeout(debouncedApplyFilters, 100);
    }

    // ---------- KEYBOARD SHORTCUTS ----------
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (typeof applyAllFilters === 'function' && MOBILE_STATE.inputData) {
                    applyAllFilters();
                    showToast('⚡ Đã áp dụng bộ lọc (Ctrl+Enter)');
                }
            }

            if (e.key === 'Escape') {
                const modal = document.getElementById('detail-modal');
                const sheet = document.getElementById('selected-sheet');
                if (modal && modal.style.display === 'flex') closeDetailModal();
                if (sheet && sheet.style.display === 'flex') hideSelectedList();
            }
        });
    }

    // ---------- TOUCH / SWIPE HANDLING (Modal) ----------
    function setupModalSwipe() {
        const modalBody = document.querySelector('.m-modal-body');
        if (!modalBody) return;

        let touchStartY = 0;
        let touchCurrentY = 0;
        let isDragging = false;

        modalBody.addEventListener('touchstart', (e) => {
            if (modalBody.scrollTop <= 0) {
                touchStartY = e.touches[0].clientY;
                isDragging = true;
            }
        }, { passive: true });

        modalBody.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            touchCurrentY = e.touches[0].clientY;
            const diff = touchCurrentY - touchStartY;
            if (diff > 0) {
                modalBody.style.transform = `translateY(${diff}px)`;
                modalBody.style.transition = 'none';
            }
        }, { passive: true });

        modalBody.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            const diff = touchCurrentY - touchStartY;
            modalBody.style.transition = 'transform 0.3s ease';
            if (diff > 100) closeDetailModal();
            modalBody.style.transform = '';
        });
    }

    // ---------- AUTO-SAVE SELECTED TO LOCALSTORAGE ----------
    // [FIXED] Clear localStorage khi inputData thay đổi
    function setupAutoSave() {
        const saveInterval = setInterval(() => {
            if (MOBILE_STATE && MOBILE_STATE.selectedHours) {
                const data = {
                    selectedDays: MOBILE_STATE.selectedDays,
                    selectedHours: MOBILE_STATE.selectedHours,
                    inputHash: MOBILE_STATE.inputData
                        ? `${MOBILE_STATE.inputData.birthYear}_${MOBILE_STATE.inputData.toaDo}_${MOBILE_STATE.inputData.viewYear}`
                        : '',
                    timestamp: Date.now(),
                };
                try {
                    localStorage.setItem('xemngay_mobile_selected', JSON.stringify(data));
                } catch (e) {
                    // localStorage full
                }
            }
        }, 3000);

        // Restore khi load — chỉ nếu inputData khớp
        try {
            const saved = localStorage.getItem('xemngay_mobile_selected');
            if (saved) {
                const data = JSON.parse(saved);
                if (Date.now() - data.timestamp < 86400000) {
                    MOBILE_STATE.selectedDays = data.selectedDays || {};
                    MOBILE_STATE.selectedHours = data.selectedHours || {};
                    // [FIXED] Lưu hash để check sau này
                    MOBILE_STATE._savedInputHash = data.inputHash || '';
                }
            }
        } catch (e) {
            // Ignore
        }
    }

    // [FIXED] Override handleViewResult để clear localStorage khi input thay đổi
    if (typeof window.handleViewResult === 'function') {
        const originalHandleViewResult = window.handleViewResult;
        window.handleViewResult = async function () {
            // Clear saved selections khi input thay đổi
            try { localStorage.removeItem('xemngay_mobile_selected'); } catch (e) {}
            MOBILE_STATE._savedInputHash = '';
            return originalHandleViewResult.apply(this, arguments);
        };
    }

    // ---------- HANDLE ORIENTATION CHANGE ----------
    function setupOrientationHandler() {
        let orientationDebounce;
        window.addEventListener('orientationchange', () => {
            clearTimeout(orientationDebounce);
            orientationDebounce = setTimeout(() => {
                setupInfiniteScroll();
                // Re-attach filter listeners (phòng trường hợp re-render)
                attachFilterDebounce();
            }, 500);
        });

        // Cũng listen resize cho desktop debug
        window.addEventListener('resize', () => {
            clearTimeout(orientationDebounce);
            orientationDebounce = setTimeout(setupInfiniteScroll, 300);
        });
    }

    // ---------- PREVENT DOUBLE TAP ZOOM ----------
    function setupTouchOptimization() {
        // [FIXED] Chỉ ngăn pinch-zoom, không ngăn scroll
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // Double tap prevention — chỉ trên interactive elements
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300 && e.target.closest('button, .m-chip, .m-pair-chip, .m-hour-cell, .m-filter-item')) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    // ---------- HANDLE BACK BUTTON (Android) ----------
    function setupBackButton() {
        // [FIXED] Chỉ push state nếu chưa có state nào
        if (!window.history.state || !window.history.state._xemngay) {
            history.pushState({ _xemngay: true }, '', window.location.href);
        }

        window.addEventListener('popstate', (e) => {
            const modal = document.getElementById('detail-modal');
            const sheet = document.getElementById('selected-sheet');

            if (sheet && sheet.style.display === 'flex') {
                hideSelectedList();
                e.preventDefault();
                history.pushState({ _xemngay: true }, '', window.location.href);
            } else if (modal && modal.style.display === 'flex') {
                closeDetailModal();
                e.preventDefault();
                history.pushState({ _xemngay: true }, '', window.location.href);
            }
        });
    }

    // ---------- VISIBILITY CHANGE (App resume) ----------
    function setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                if (typeof updateSelectedCount === 'function') updateSelectedCount();
                if (typeof updateFilterBadge === 'function') updateFilterBadge();
            }
        });
    }

    // ---------- PRINT BEFORE/AFTER HOOKS ----------
    function setupPrintHooks() {
        window.addEventListener('beforeprint', () => {
            document.querySelectorAll('.m-day-body').forEach((body) => {
                body.classList.add('open');
            });
            document.querySelectorAll('.m-day-chevron').forEach((chevron) => {
                chevron.classList.add('open');
            });
        });

        window.addEventListener('afterprint', () => {
            document.querySelectorAll('.m-day-body.open').forEach((body) => {
                const jdnMatch = body.id.match(/day-body-(\d+)/);
                if (jdnMatch) {
                    const isSelected = MOBILE_STATE.selectedDays[parseInt(jdnMatch[1])];
                    if (!isSelected) body.classList.remove('open');
                }
            });
            document.querySelectorAll('.m-day-chevron.open').forEach((chevron) => {
                chevron.classList.remove('open');
            });
        });
    }

    // ---------- INIT SEQUENCE ----------
    async function initApp() {
        try {
            // 1. Create filter UI
            if (typeof createFilterUI === 'function') {
                createFilterUI();
                MOBILE_STATE.filterUIInitialized = true;
            }

            // 2. Update initial badge
            if (typeof updateFilterBadge === 'function') updateFilterBadge();

            // 3. Setup interactions
            setupInfiniteScroll();
            setupKeyboardShortcuts();
            setupModalSwipe();
            setupAutoSave();
            setupOrientationHandler();
            setupTouchOptimization();
            setupBackButton();
            setupVisibilityHandler();
            setupPrintHooks();
            attachFilterDebounce();

            // 4. Focus first input
            setTimeout(() => {
                const firstInput = document.getElementById('m-birth-year');
                if (firstInput) firstInput.focus();
            }, 400);

            console.log('✅ Xem Ngày Cao Cấp Mobile - Sẵn sàng!');
            console.log('   🍒 Phiên bản Cherry Mobile');
            console.log('   📱 Tối ưu cho điện thoại');
            console.log('   👤 By TIEN.TQN');

        } catch (error) {
            console.error('❌ Lỗi khởi tạo:', error);
            if (typeof showToast === 'function') {
                showToast('Lỗi khởi tạo ứng dụng. Vui lòng tải lại trang.');
            }
        }
    }

    // ---------- DOM READY ----------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

    // ---------- EXPORT GLOBAL HELPERS ----------
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

})();
