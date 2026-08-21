//  7. 自建股
        // ================================================================

        function createCustomStock(creatorId, name, maxUpPercent, keepPercent) {
            let creator = players[creatorId];
            if (!creator || !name.trim()) return;
            let maxUp = clamp(maxUpPercent / 100, 0.01, 0.8);
            let keepRatio = clamp(keepPercent / 100, 0.1, 0.9);
            let downRatio = -(maxUp * (1 - keepRatio) * 0.75);
            let newStock = {
                id: customStocks.length,
                name: name.trim(),
                creatorId: creatorId,
                maxUp: maxUp,
                keepRatio: keepRatio,
                downRatio: downRatio,
                value: 0,
                history: [],
                recentMultiplier: 1,
                color: '#ffb74d',
                trend: 0
            };
            customStocks.push(newStock);
            addLog(`${creator.name} 创建自建股「${name}」（涨+${(maxUp*100).toFixed(0)}%，留存${(keepRatio*100).toFixed(0)}%）`,
                'highlight');
            showBanner(`${creator.name} 创建自建股「${name}」`, 'success', null, '✨ 自建股');
            updatePlayersDisplay();
            updateStockStatus();
        }

        function investCustomStock(playerId, stockId, amount) {
            let p = players[playerId];
            let stock = customStocks[stockId];
            if (!stock || p.bankrupt) return;
            if (p.id === stock.creatorId) {
                showBanner('不能投资自己创建的股票', 'warning', null, '⚠️ 违规操作');
                return;
            }
            amount = Math.round(amount);
            if (amount <= 0 || amount > p.cash) return;
            p.cash -= amount;
            if (!p.customStockInvestments) p.customStockInvestments = {};
            p.customStockInvestments[stockId] = (p.customStockInvestments[stockId] || 0) + amount;
            stock.value += amount;
            addLog(`${p.name} 投资自建股「${stock.name}」${fmt(amount)}`, 'profit');
            showBanner(`${p.name} 投资自建股「${stock.name}」${fmt(amount)}`, 'success', null, '📈 投资');
            updateAchievementStats(playerId, 'buy', amount, 'custom');
            updateUI();
            updatePlayersDisplay();
            updateLeaderboard();
        }

        function withdrawCustomStock(playerId, stockId, amount) {
            let p = players[playerId];
            let stock = customStocks[stockId];
            if (!stock || p.bankrupt) return;
            let inv = p.customStockInvestments?.[stockId] || 0;
            let wd = amount ? Math.min(amount, inv) : inv;
            wd = Math.round(wd);
            if (wd <= 0) return;
            p.cash += wd;
            p.customStockInvestments[stockId] -= wd;
            if (p.customStockInvestments[stockId] <= 0) delete p.customStockInvestments[stockId];
            stock.value -= wd;
            addLog(`${p.name} 从「${stock.name}」取回 ${fmt(wd)}`);
            showBanner(`${p.name} 从「${stock.name}」取回 ${fmt(wd)}`, 'info', null, '💰 取回');
            updateAchievementStats(playerId, 'sell', wd, 'custom');
            updateUI();
            updatePlayersDisplay();
            updateLeaderboard();
        }

        function updateCustomStockValues(mults) {
            customStocks.forEach((stock, idx) => {
                let mult = mults[`custom_${idx}`] || 1;
                stock.value = Math.round(stock.value * mult);
                stock.recentMultiplier = mult;
                stock.history.push({ round, value: stock.value, multiplier: mult });
                stock.trend = 0.5 * (stock.trend || 0) + 0.5 * (mult - 1);
                players.forEach(p => {
                    if (p.customStockInvestments && p.customStockInvestments[idx]) {
                        p.customStockInvestments[idx] = Math.round(p.customStockInvestments[idx] * mult);
                    }
                });
            });
        }

        // ================================================================
