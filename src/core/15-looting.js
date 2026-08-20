//  15. 掠夺
        // ================================================================

        function checkLooting() {
            if (bankAssets >= LOOT_THRESHOLD) return;
            addLog(`⚡ 银行告急！触发掠夺模式 (银行 ${fmt(bankAssets)})`, 'highlight');
            showBanner(`银行告急！触发掠夺模式`, 'warning', null, '⚡ 掠夺');
            let activePlayers = players.filter(p => !p.bankrupt);
            if (activePlayers.length === 0) return;
            let totalWealth = activePlayers.reduce((s, p) => s + p.totalAssets(), 0);
            if (totalWealth < 100) return;
            let needed = Math.round((LOOT_THRESHOLD - bankAssets) * 1.12);
            let collected = 0;
            let sorted = [...activePlayers].sort((a, b) => b.totalAssets() - a.totalAssets());
            let avgWealth = totalWealth / activePlayers.length;
            for (let p of sorted) {
                if (collected >= needed) break;
                let wealth = p.totalAssets();
                if (wealth < avgWealth * 0.25) {
                    addLog(`${p.name} 资产微薄，免于掠夺`);
                    continue;
                }
                let wealthRatio = wealth / avgWealth;
                let baseRate = 0.10 + 0.07 * Math.min(wealthRatio - 1, 3);
                if (wealthRatio > 3) baseRate += 0.05;
                if (wealthRatio > 5) baseRate += 0.05;
                let maxPay = Math.round(wealth * baseRate);
                let ratio = wealth / totalWealth;
                let amount = Math.round(Math.min(maxPay, needed * ratio * 0.85));
                amount = Math.max(100, amount);
                amount = Math.min(amount, maxPay);
                if (amount < 100) continue;
                if (p.cash >= amount) {
                    p.cash -= amount;
                    bankAssets += amount;
                    collected += amount;
                    addLog(`${p.name} 缴纳掠夺税 ${fmt(amount)} (税率${(baseRate*100).toFixed(0)}%)`);
                    showBanner(`${p.name} 缴纳掠夺税 ${fmt(amount)}`, 'warning', null, '⚡ 掠夺');
                } else {
                    let remaining = amount - p.cash;
                    p.cash = 0;
                    let assets = [];
                    ['C', 'B', 'A', 'D'].forEach(k => {
                        let shares = p[`shares${k}`] || 0;
                        if (shares > 0) {
                            let val = shares * stocks[k].price;
                            assets.push({ key: k, value: val, shares: shares, price: stocks[k].price });
                        }
                    });
                    if (p.customStockInvestments) {
                        Object.entries(p.customStockInvestments).forEach(([cid, val]) => {
                            if (val > 0) assets.push({ key: `custom_${cid}`, value: val, isCustom: true,
                                cid: parseInt(cid) });
                        });
                    }
                    assets.sort((a, b) => (a.key === 'C' ? 1 : 0) - (b.key === 'C' ? 1 : 0));
                    for (let a of assets) {
                        if (remaining <= 0) break;
                        if (a.value <= 0) continue;
                        let sellValue = Math.round(Math.min(a.value, remaining));
                        if (sellValue > 0) {
                            if (a.isCustom) {
                                let cur = p.customStockInvestments[a.cid] || 0;
                                let sellAmount = Math.min(cur, sellValue);
                                p.customStockInvestments[a.cid] -= sellAmount;
                                if (p.customStockInvestments[a.cid] <= 0) delete p.customStockInvestments[a.cid];
                                remaining -= sellAmount;
                                bankAssets += sellAmount;
                                collected += sellAmount;
                            } else {
                                let price = stocks[a.key].price;
                                let sellShares = Math.floor(sellValue / price);
                                if (sellShares > 0) {
                                    p[`shares${a.key}`] -= sellShares;
                                    let actual = Math.round(sellShares * price);
                                    remaining -= actual;
                                    bankAssets += actual;
                                    collected += actual;
                                }
                            }
                        }
                    }
                    if (remaining > 0) {
                        let minSurvival = Math.round(avgWealth * 0.12);
                        if (p.totalAssets() < 100) {
                            p.bankrupt = true;
                            p.cash = 0;
                            ['A', 'B', 'C', 'D'].forEach(k => p[`shares${k}`] = 0);
                            p.customStockInvestments = {};
                            if (p.achievementStats) p.achievementStats.hasBankrupted = true;
                            addLog(`${p.name} 破产！`, 'loss');
                            showBanner(`${p.name} 破产！`, 'error', null, '💀 破产');
                        } else {
                            addLog(`${p.name} 变卖资产缴税 ${fmt(amount - remaining)}（已尽力）`);
                            showBanner(`${p.name} 变卖资产缴税 ${fmt(amount - remaining)}`, 'warning', null, '⚡ 掠夺');
                        }
                    } else {
                        addLog(`${p.name} 变卖资产缴税 ${fmt(amount)} (税率${(baseRate*100).toFixed(0)}%)`);
                        showBanner(`${p.name} 变卖资产缴税 ${fmt(amount)}`, 'warning', null, '⚡ 掠夺');
                    }
                }
            }
            bankAssets = Math.round(bankAssets);
            if (bankAssets < 0) bankAssets = 0;
        }

        // ================================================================
