//  12. 成就系统（v9.1 移除 bankrupt 成就）
        // ================================================================

        function initPlayerAchievements(player) {
            if (!player.achievements) {
                player.achievements = {};
                ACHIEVEMENT_IDS.forEach(id => {
                    player.achievements[id] = { unlocked: false, unlockedAt: null };
                });
            }
            if (!player.achievementStats) {
                player.achievementStats = {
                    totalInvested: 0,
                    tradeCount: 0,
                    maxHolding: 0,
                    hasWonLottery: false,
                    hasBeenScammed: false,
                    hasBankrupted: false,
                    totalTrades: 0,
                    onlyADHoldings: true,
                    maxCHolding: 0
                };
            }
        }

        function getUnlockedAchievements(player) {
            if (!player.achievements) return [];
            const result = [];
            ACHIEVEMENT_IDS.forEach(id => {
                if (player.achievements[id] && player.achievements[id].unlocked) {
                    result.push({ id, ...ACHIEVEMENT_DEFS[id], rewardRatio: achievementRewardRatios[id] });
                }
            });
            return result;
        }

        function getLockedAchievements(player) {
            if (!player.achievements) return ACHIEVEMENT_IDS.map(id => ({ id, ...ACHIEVEMENT_DEFS[id], rewardRatio: achievementRewardRatios[
                    id] }));
            const result = [];
            ACHIEVEMENT_IDS.forEach(id => {
                if (!player.achievements[id] || !player.achievements[id].unlocked) {
                    result.push({ id, ...ACHIEVEMENT_DEFS[id], rewardRatio: achievementRewardRatios[id] });
                }
            });
            return result;
        }

        function unlockAchievement(playerId, achievementId) {
            const p = players[playerId];
            if (!p || p.bankrupt) return false;
            if (!p.achievements) initPlayerAchievements(p);
            if (p.achievements[achievementId] && p.achievements[achievementId].unlocked) return false;
            const def = ACHIEVEMENT_DEFS[achievementId];
            if (!def) return false;
            const totalAssets = p.totalAssets();
            const reward = Math.round(totalAssets * (achievementRewardRatios[achievementId] || 0.10));
            p.achievements[achievementId] = { unlocked: true, unlockedAt: round };
            p.cash += reward;
            addLog(`🏅 ${p.name} 解锁成就「${def.name}」获得 ${fmt(reward)} 奖励！(总资产 ${fmt(totalAssets)})`, 'achievement');
            showBanner(`「${def.name}」${def.desc} 奖励 ${fmt(reward)}`, 'achievement', null, `🏅 ${p.name} 解锁成就！`);
            updatePlayersDisplay();
            updateLeaderboard();
            return true;
        }

        function checkAchievements(playerId) {
            const p = players[playerId];
            if (!p || p.bankrupt) return;
            if (!p.achievements) initPlayerAchievements(p);
            const stats = p.achievementStats;
            if (!stats) return;

            if (!p.achievements.first_invest?.unlocked && stats.totalInvested > 0) {
                unlockAchievement(playerId, 'first_invest');
            }
            if (!p.achievements.invest_master?.unlocked && stats.totalInvested >= 10000) {
                unlockAchievement(playerId, 'invest_master');
            }
            if (!p.achievements.stock_god?.unlocked) {
                let maxVal = 0;
                ['A', 'B', 'C', 'D'].forEach(k => {
                    let val = (p[`shares${k}`] || 0) * stocks[k].price;
                    if (val > maxVal) maxVal = val;
                });
                if (maxVal >= 5000) {
                    unlockAchievement(playerId, 'stock_god');
                }
            }
            if (!p.achievements.lottery_win?.unlocked && stats.hasWonLottery) {
                unlockAchievement(playerId, 'lottery_win');
            }
            if (!p.achievements.lottery_scam?.unlocked && stats.hasBeenScammed) {
                unlockAchievement(playerId, 'lottery_scam');
            }
            if (!p.achievements.millionaire?.unlocked && p.totalAssets() >= 100000) {
                unlockAchievement(playerId, 'millionaire');
            }
            // v9.1: 移除 bankrupt 成就检测
            if (!p.achievements.trade_freak?.unlocked && stats.totalTrades >= 20) {
                unlockAchievement(playerId, 'trade_freak');
            }
            if (!p.achievements.steady_investor?.unlocked) {
                const hasB = (p.sharesB || 0) > 0;
                const hasC = (p.sharesC || 0) > 0;
                const total = p.totalAssets();
                if (!hasB && !hasC && total > 5000) {
                    unlockAchievement(playerId, 'steady_investor');
                }
            }
            if (!p.achievements.adventurer?.unlocked) {
                let cVal = (p.sharesC || 0) * stocks.C.price;
                if (cVal >= 3000) {
                    unlockAchievement(playerId, 'adventurer');
                }
            }
        }

        function updateAchievementStats(playerId, action, amount, stockType) {
            const p = players[playerId];
            if (!p || p.bankrupt) return;
            if (!p.achievementStats) initPlayerAchievements(p);
            const stats = p.achievementStats;
            if (action === 'buy') {
                stats.totalInvested += amount;
                stats.totalTrades += 1;
            } else if (action === 'sell') {
                stats.totalTrades += 1;
            } else if (action === 'lottery') {
                stats.totalTrades += 1;
            }
        }

        function renderAchievementModal(playerId) {
            const p = players[playerId];
            if (!p) return;
            if (!p.achievements) initPlayerAchievements(p);
            const unlocked = getUnlockedAchievements(p);
            const locked = getLockedAchievements(p);
            const total = ACHIEVEMENT_IDS.length;
            const count = unlocked.length;
            document.getElementById('achievement-stats').textContent =
                `🏅 ${p.name} · 已解锁 ${count} / ${total} 个成就`;
            const grid = document.getElementById('achievement-grid');
            grid.innerHTML = '';
            const all = [...unlocked, ...locked];
            all.forEach(a => {
                const isUnlocked = unlocked.some(u => u.id === a.id);
                const div = document.createElement('div');
                div.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
                div.innerHTML = `
                        <div style="display:flex;align-items:center;gap:4px;">
                            <span class="ach-icon">${a.icon || '🏅'}</span>
                            <span class="ach-name">${a.name} ${isUnlocked ? '<span class="ach-badge">✅</span>' : ''}</span>
                            <span class="ach-status">${isUnlocked ? '✨' : '🔒'}</span>
                        </div>
                        <div class="ach-desc">${a.desc}</div>
                        <div class="ach-reward">🎁 奖励：总资产 × ${((a.rewardRatio||0.10)*100).toFixed(0)}%</div>
                        ${isUnlocked ? `<div class="ach-progress">✅ 第 ${p.achievements[a.id].unlockedAt} 轮解锁</div>` : '<div class="ach-progress">⏳ 未解锁</div>'}
                    `;
                grid.appendChild(div);
            });
            document.querySelector('.achievement-content').dataset.playerId = playerId;
        }

        // ================================================================
