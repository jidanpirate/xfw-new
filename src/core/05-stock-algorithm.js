//  5. 股票算法（含黑马股）
        // ================================================================

        function calcStockMultiplier(stockKey, isCustom = false, darkHorseMult = 1) {
            let s = isCustom ? null : stocks[stockKey];
            let volScale = ADMIN_CONFIG.volatilityScale || 1.0;
            let mode = ADMIN_CONFIG.algoMode || '标准';

            if (!isCustom) {
                let trend = s.trend || 0;
                let histLen = s.history ? s.history.length : 0;
                let realizedVol = 0;
                if (histLen > 2) {
                    let recent = s.history.slice(-6);
                    let sumSq = recent.reduce((acc, h) => acc + Math.pow((h.multiplier || h) - 1, 2), 0);
                    realizedVol = Math.sqrt(sumSq / Math.max(recent.length, 1));
                }
                let garchVol = 0.08 + 0.5 * realizedVol + 0.3 * Math.abs(trend);
                let modeMult = 1.0;
                if (mode === '平稳') modeMult = 0.55;
                else if (mode === '剧烈') modeMult = 1.6;
                garchVol *= modeMult * volScale;
                let flowImpact = 0;
                if (s.netFlow !== undefined && s.value > 0) {
                    flowImpact = 0.018 * Math.tanh(s.netFlow / Math.max(s.value, 1000) * 5);
                }
                let meanRevStrength = 0.08 + 0.12 * Math.min(Math.abs(trend) * 5, 0.5);
                let meanReversion = -meanRevStrength * trend;
                let momentumBoost = trend * 0.35 * Math.exp(-Math.abs(trend) * 4);
                let skew = trend < -0.02 ? 1.3 : trend > 0.02 ? 0.85 : 1.0;
                let shock = rand(-garchVol * skew, garchVol);
                let raw = 1 + trend + meanReversion + momentumBoost + flowImpact + shock;
                let capped = clamp(raw, 1 + s.maxDown, 1 + s.maxUp);
                if (stockKey === 'A') capped = Math.max(1, capped);

                if (darkHorseMult > 1) {
                    let base = capped - 1;
                    capped = 1 + base * darkHorseMult;
                    capped = clamp(capped, 1 + s.maxDown * darkHorseMult, 1 + s.maxUp * darkHorseMult);
                    if (stockKey === 'A') capped = Math.max(1, capped);
                }

                s.trend = 0.6 * s.trend + 0.4 * (capped - 1);
                s.netFlow = 0;
                return capped;
            } else {
                let cs = stockKey;
                let upRange = cs.maxUp;
                let downRange = Math.abs(cs.downRatio);
                let csTrend = cs.trend || 0;
                let baseVol = (upRange + downRange) * 0.25;
                let vol = baseVol * (1 + 0.4 * Math.abs(csTrend) * 5);
                let r = Math.random();
                let mult;
                let upProb = 0.52 + csTrend * 3;
                upProb = clamp(upProb, 0.35, 0.65);
                if (r < upProb) {
                    mult = 1 + rand(0, Math.min(upRange * 0.9, vol));
                } else {
                    mult = 1 - rand(0, Math.min(downRange * 0.9, vol * 1.1));
                }
                let result = clamp(mult, 1 + cs.downRatio, 1 + cs.maxUp);
                if (darkHorseMult > 1) {
                    let base = result - 1;
                    result = 1 + base * darkHorseMult;
                    result = clamp(result, 1 + cs.downRatio * darkHorseMult, 1 + cs.maxUp * darkHorseMult);
                }
                cs.trend = 0.5 * (cs.trend || 0) + 0.5 * (result - 1);
                return result;
            }
        }

        function calcAllMultipliers(eventMult, darkHorseInfo) {
            eventMult = eventMult || { A: 1, B: 1, C: 1, D: 1 };
            let mults = {};

            let darkHorseKey = null;
            let darkHorseMult = 1;
            if (darkHorseInfo && darkHorseInfo.active) {
                darkHorseKey = darkHorseInfo.key;
                darkHorseMult = darkHorseInfo.multiplier || DARK_HORSE_MULTIPLIER;
            }

            Object.keys(stocks).forEach(k => {
                let isDark = (darkHorseKey === k);
                let dhMult = isDark ? darkHorseMult : 1;
                let base = calcStockMultiplier(k, false, dhMult);
                let combined = base * (eventMult[k] || 1);
                if (k === 'A') combined = Math.max(1, combined);
                mults[k] = combined;
                stocks[k].recentMultiplier = combined;
                stocks[k].price = Math.round(stocks[k].price * combined);
                if (stocks[k].price < 1) stocks[k].price = 1;
            });

            customStocks.forEach((cs, idx) => {
                let isDark = (darkHorseKey === `custom_${idx}`);
                let dhMult = isDark ? darkHorseMult : 1;
                let mult = calcStockMultiplier(cs, true, dhMult);
                cs.recentMultiplier = mult;
                mults[`custom_${idx}`] = mult;
            });

            return mults;
        }

        // ================================================================
