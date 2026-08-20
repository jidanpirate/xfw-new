//  13. 投资组合评级
        // ================================================================

        function calculatePortfolioRating(player) {
            if (player.bankrupt) return { rating: 'D', score: 0, reward: 0 };

            let holdings = [];
            ['A', 'B', 'C', 'D'].forEach(k => {
                let shares = player[`shares${k}`] || 0;
                let value = shares * stocks[k].price;
                if (value > 0) holdings.push({ key: k, value: value });
            });
            if (player.customStockInvestments) {
                Object.entries(player.customStockInvestments).forEach(([cid, val]) => {
                    if (val > 0) {
                        let cs = customStocks[parseInt(cid)];
                        holdings.push({ key: `custom_${cid}`, value: val, name: cs ? cs.name : '自建' });
                    }
                });
            }

            let positive = holdings.filter(h => h.value > 0);
            if (positive.length === 0) {
                return { rating: 'D', score: 0, reward: 0 };
            }

            let total = positive.reduce((s, h) => s + h.value, 0);
            let diversity = positive.length;
            let maxRatio = Math.max(...positive.map(h => h.value / total));

            let score = 0;
            if (diversity >= 4) score += 40;
            else if (diversity >= 3) score += 30;
            else if (diversity >= 2) score += 15;
            else score += 5;

            if (maxRatio < 0.3) score += 30;
            else if (maxRatio < 0.5) score += 20;
            else if (maxRatio < 0.7) score += 10;
            else score += 0;

            let totalAssets = player.totalAssets();
            if (totalAssets > 50000) score += 20;
            else if (totalAssets > 20000) score += 12;
            else if (totalAssets > 10000) score += 6;

            let rating, reward = 0;
            if (score >= 80) { rating = 'S';
                reward = Math.round(totalAssets * 0.15); } else if (score >= 65) { rating = 'A';
                reward = Math.round(totalAssets * 0.10); } else if (score >= 50) { rating = 'B';
                reward = Math.round(totalAssets * 0.06); } else if (score >= 35) { rating = 'C';
                reward = Math.round(totalAssets * 0.03); } else { rating = 'D';
                reward = 0; }

            return { rating, score, reward };
        }

        function calculateAndRewardPortfolioRatings() {
            players.forEach(p => {
                if (p.bankrupt) return;
                let result = calculatePortfolioRating(p);
                if (result.reward > 0) {
                    p.cash += result.reward;
                    addLog(`⭐ ${p.name} 获得投资组合评级 ${result.rating}，奖励 ${fmt(result.reward)} (总资产 ${fmt(p.totalAssets())})`,
                        'profit');
                    showBanner(`⭐ ${p.name} 组合评级 ${result.rating}，奖励 ${fmt(result.reward)}`, 'success', null,
                        '⭐ 评级奖励');
                }
                p._lastRating = result.rating;
            });
            updateUI();
            updatePlayersDisplay();
        }

        // ================================================================
