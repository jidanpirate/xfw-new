//  33. 外接AI面板切换辅助
        // ================================================================

        function switchEAITab(tab) {
            document.querySelectorAll('#eai-overlay .eai-tabs button').forEach(b => b.classList.remove('active'));
            document.querySelector(`#eai-overlay .eai-tabs button[data-tab="${tab}"]`)?.classList.add('active');
            document.getElementById('eai-tab-prompt').style.display = tab === 'prompt' ? 'block' : 'none';
            document.getElementById('eai-tab-response').style.display = tab === 'response' ? 'block' : 'none';
        }

        function closeExternalPanel() {
            let overlay = document.getElementById('eai-overlay');
            overlay.classList.remove('active');
            document.body.classList.remove('modal-open');
            let pid = overlay.dataset.currentPlayerId;
            if (pid) {
                let p = players[parseInt(pid)];
                if (p && p.isExternal && !p.bankrupt) {
                    addLog(`🌐 ${p.name} 跳过（指令面板关闭）`, 'loss');
                }
                if (playerDecisionStatus[pid] !== 'done') {
                    markPlayerDone(parseInt(pid));
                    checkAllDone();
                }
            }
            setAllControlsEnabled(false);
            updatePlayersDisplay();
        }
