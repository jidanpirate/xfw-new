//  20. 模态框：创建自建股 & 购买彩票
        // ================================================================

        function showCreateStockModal(playerId) {
            let overlay = document.createElement('div');
            overlay.style.cssText =
                'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:1200;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(3px);';
            let box = document.createElement('div');
            box.style.cssText =
                'background:var(--bg-card);padding:24px 28px;border-radius:16px;max-width:420px;width:92%;border:2px solid var(--accent-gold);';
            box.innerHTML = `
                    <h3 style="color:var(--accent-gold);text-align:center;margin-bottom:14px;">✨ 创建自建股</h3>
                    <div style="margin-bottom:10px;">
                        <label style="color:var(--text-secondary);font-size:0.85rem;">股票名称</label>
                        <input type="text" id="cs-name" placeholder="如：新能源" style="width:100%;padding:8px 12px;background:var(--bg-dark);border:2px solid var(--border-color);color:var(--text-primary);border-radius:8px;font-size:0.95rem;margin-top:4px;">
                    </div>
                    <div style="margin-bottom:10px;">
                        <label style="color:var(--text-secondary);font-size:0.85rem;">上涨最大利率 (%)</label>
                        <input type="number" id="cs-maxup" value="30" min="1" max="80" style="width:100%;padding:8px 12px;background:var(--bg-dark);border:2px solid var(--border-color);color:var(--text-primary);border-radius:8px;font-size:0.95rem;margin-top:4px;">
                    </div>
                    <div style="margin-bottom:14px;">
                        <label style="color:var(--text-secondary);font-size:0.85rem;">利润留存比例 (%)</label>
                        <input type="number" id="cs-keep" value="50" min="10" max="90" style="width:100%;padding:8px 12px;background:var(--bg-dark);border:2px solid var(--border-color);color:var(--text-primary);border-radius:8px;font-size:0.95rem;margin-top:4px;">
                        <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:4px;">留存越高，下跌风险越小</div>
                    </div>
                    <div style="display:flex;gap:10px;justify-content:center;">
                        <button class="btn btn-success" id="cs-confirm">创建</button>
                        <button class="btn btn-warning" id="cs-cancel">取消</button>
                    </div>
                `;
            overlay.appendChild(box);
            document.body.appendChild(overlay);
            document.getElementById('cs-confirm').onclick = () => {
                let name = document.getElementById('cs-name').value.trim();
                let maxUp = parseFloat(document.getElementById('cs-maxup').value) || 30;
                let keep = parseFloat(document.getElementById('cs-keep').value) || 50;
                if (!name) { showBanner('请为自建股起一个名字', 'warning', null, '⚠️ 操作失败'); return; }
                createCustomStock(playerId, name, maxUp, keep);
                overlay.remove();
            };
            document.getElementById('cs-cancel').onclick = () => overlay.remove();
            overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        }

        function showBuyLotteryModal(playerId) {
            let p = players[playerId];
            if (!p || p.bankrupt) return;
            let overlay = document.createElement('div');
            overlay.style.cssText =
                'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:1200;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(3px);';
            let box = document.createElement('div');
            box.style.cssText =
                'background:var(--bg-card);padding:20px 24px;border-radius:16px;max-width:520px;width:92%;border:2px solid var(--accent-gold);max-height:80vh;overflow-y:auto;';
            let options = lotteries.map((l, i) => {
                let maxQ = Math.floor(p.cash / l.price);
                let winRate = (l.winProb * 100).toFixed(1);
                let scamRate = (l.scamRate * 100).toFixed(1);
                return `<div style="padding:4px 8px;background:var(--bg-dark);border-radius:6px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">
                        <span style="font-size:0.85rem;">
                            <strong>${l.name}</strong>
                            <span style="color:var(--text-secondary);font-size:0.75rem;">${fmt(l.price)}/张</span>
                            <span style="color:#81c784;font-size:0.7rem;background:rgba(46,125,50,0.15);padding:1px 8px;border-radius:10px;margin-left:4px;">中奖率 ${winRate}%</span>
                            <span style="color:#ef5350;font-size:0.7rem;background:rgba(198,40,40,0.15);padding:1px 8px;border-radius:10px;margin-left:4px;">诈骗率 ${scamRate}%</span>
                        </span>
                        <div style="display:flex;gap:3px;align-items:center;">
                            <button class="btn-sm btn-sm-gold dec-lot" data-lid="${i}" style="font-size:0.7rem;padding:1px 8px;">−</button>
                            <input type="text" id="lot-qty-${i}" placeholder="张数" autocomplete="off" style="width:46px;text-align:center;background:var(--bg-dark);border:1px solid var(--border-color);color:var(--text-primary);border-radius:4px;padding:2px;font-size:0.8rem;">
                            <button class="btn-sm btn-sm-gold inc-lot" data-lid="${i}" style="font-size:0.7rem;padding:1px 8px;">+</button>
                            <button class="btn-sm btn-sm-invest buy-lot" data-lid="${i}" data-pid="${p.id}" style="font-size:0.7rem;padding:2px 10px;">买</button>
                        </div>
                    </div>`;
            }).join('');
            box.innerHTML = `
                    <h3 style="color:var(--accent-gold);text-align:center;margin-bottom:10px;">🎫 购买彩票</h3>
                    <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:8px;">现金：${fmt(p.cash)}</p>
                    <p style="color:#ef5350;font-size:0.75rem;margin-bottom:10px;">⚠️ 彩票有诈骗风险，可能导致罚款甚至破产！</p>
                    <div style="margin-bottom:12px;">${options}</div>
                    <div style="display:flex;gap:10px;justify-content:center;">
                        <button class="btn btn-warning" id="lot-close" style="font-size:0.85rem;padding:6px 20px;">关闭</button>
                    </div>
                `;
            overlay.appendChild(box);
            document.body.appendChild(overlay);
            lotteries.forEach((l, i) => {
                let input = document.getElementById(`lot-qty-${i}`);
                if (!input) return;
                let maxQ = Math.floor(p.cash / l.price);

                function getInputNumber() {
                    let v = parseInt(input.value.trim());
                    if (input.value.trim() === '') return NaN;
                    return isNaN(v) ? NaN : v;
                }

                function setInputValue(v) {
                    if (isNaN(v) || v < 0) { input.value = ''; } else { input.value = v; }
                }

                function handleBlur() {
                    let v = getInputNumber();
                    if (isNaN(v)) { input.value = ''; }
                }
                input.onchange = handleBlur;
                input.onblur = handleBlur;
                let dec = box.querySelector(`.dec-lot[data-lid="${i}"]`);
                let inc = box.querySelector(`.inc-lot[data-lid="${i}"]`);
                let buy = box.querySelector(`.buy-lot[data-lid="${i}"]`);
                if (dec) dec.onclick = function(e) {
                    e.stopPropagation();
                    let v = getInputNumber();
                    if (isNaN(v)) v = 0;
                    v = Math.max(0, v - 1);
                    setInputValue(v);
                    input.focus();
                    input.select();
                };
                if (inc) inc.onclick = function(e) {
                    e.stopPropagation();
                    let v = getInputNumber();
                    if (isNaN(v)) v = 0;
                    v = Math.min(maxQ, v + 1);
                    setInputValue(v);
                    input.focus();
                    input.select();
                };
                if (buy) buy.onclick = function(e) {
                    e.stopPropagation();
                    let raw = input.value.trim();
                    if (raw === '') { showBanner('请输入数量', 'warning', null, '⚠️ 操作失败'); return; }
                    let qty = parseInt(raw);
                    if (isNaN(qty) || qty < 0) { showBanner('请输入有效整数', 'warning', null, '⚠️ 操作失败'); return; }
                    if (qty < 1) { showBanner('至少购买1张', 'warning', null, '⚠️ 操作失败'); return; }
                    if (qty > maxQ) { showBanner(`最多购买 ${maxQ} 张`, 'warning', null, '⚠️ 操作失败'); return; }
                    buyLottery(p.id, i, qty);
                    setInputValue(0);
                    overlay.remove();
                };
            });
            document.getElementById('lot-close').onclick = () => overlay.remove();
            overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        }

        // ================================================================
