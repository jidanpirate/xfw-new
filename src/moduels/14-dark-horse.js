//  14. 黑马股系统
        // ================================================================

        function getDarkHorse() {
            currentDarkHorse = null;
            if (Math.random() > DARK_HORSE_PROB) {
                return { active: false };
            }
            let candidates = [];
            Object.keys(stocks).forEach(k => {
                candidates.push({ key: k, name: stocks[k].name, type: 'stock' });
            });
            customStocks.forEach(cs => {
                candidates.push({ key: `custom_${cs.id}`, name: cs.name, type: 'custom', id: cs.id });
            });
            if (candidates.length === 0) {
                return { active: false };
            }
            let pick = candidates[randInt(0, candidates.length - 1)];
            currentDarkHorse = {
                key: pick.key,
                name: pick.name,
                type: pick.type,
                id: pick.id || null,
                multiplier: DARK_HORSE_MULTIPLIER,
                active: true
            };
            addLog(`🐴 本轮黑马股：${currentDarkHorse.name}（倍率 ${DARK_HORSE_MULTIPLIER}x）`, 'highlight');
            showBanner(`🐴 黑马股出现！${currentDarkHorse.name} 涨跌幅 ${DARK_HORSE_MULTIPLIER}x`, 'info', null, '🐴 黑马来袭');
            return currentDarkHorse;
        }

        function updateMarketSentiment() {
            let avgChange = 0;
            let count = 0;
            Object.keys(stocks).forEach(k => {
                let m = stocks[k].recentMultiplier || 1;
                avgChange += (m - 1);
                count++;
            });
            if (count > 0) {
                avgChange /= count;
            }
            let target = 0.5 + avgChange * 2.5;
            target = clamp(target, 0.1, 0.9);
            marketSentiment = 0.7 * marketSentiment + 0.3 * target;
            marketSentiment = clamp(marketSentiment, 0.1, 0.9);
        }

        function updateDarkHorseDisplay() {
            let el = document.getElementById('dark-horse-display');
            if (!el) return;
            if (currentDarkHorse && currentDarkHorse.active) {
                el.innerHTML = `🐴 黑马股：${currentDarkHorse.name}（倍率 ${currentDarkHorse.multiplier}x）`;
                el.style.color = 'var(--dark-horse-color)';
                el.style.fontWeight = 'bold';
            } else {
                el.innerHTML = '';
            }
        }

        // ================================================================
