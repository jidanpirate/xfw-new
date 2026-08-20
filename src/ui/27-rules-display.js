//  27. 规则显示（帮助用，隐藏高级设置）
        // ================================================================

        function updateGameRulesDisplay() {
            let getRange = (key) => {
                let s = stocks[key];
                if (s && s.maxUp !== undefined && s.maxDown !== undefined) {
                    return { up: s.maxUp, down: s.maxDown };
                }
                let cfgMap = {
                    A: { up: ADMIN_CONFIG.aMaxUp || 0.18, down: 0 },
                    B: { up: ADMIN_CONFIG.bMaxUp || 0.80, down: ADMIN_CONFIG.bMaxDown || -0.40 },
                    C: { up: ADMIN_CONFIG.cMaxUp || 1.20, down: ADMIN_CONFIG.cMaxDown || -0.60 },
                    D: { up: ADMIN_CONFIG.dMaxUp || 0.10, down: ADMIN_CONFIG.dMaxDown || -0.05 }
                };
                return cfgMap[key] || { up: 0.10, down: -0.05 };
            };
            let helpGrid = document.getElementById('help-stock-grid');
            if (helpGrid) {
                let cards = ['A', 'B', 'C', 'D'].map(k => {
                    let r = getRange(k);
                    let upPct = (r.up * 100).toFixed(0);
                    let downPct = (r.down * 100).toFixed(0);
                    let cls = `stock-info-${k.toLowerCase()}`;
                    let extra = k === 'A' ? '只涨不跌' : `${downPct}%~+${upPct}%`;
                    return `<div class="stock-info-card ${cls}"><h4 style="color:var(--text-primary);">${stocks[k].name}</h4><p>${extra}</p></div>`;
                }).join('');
                helpGrid.innerHTML = cards;
            }
        }

        // ================================================================
