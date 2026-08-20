//  21. 日志系统
        // ================================================================

        function addLog(msg, type = 'normal') {
            if (!logsByRound[round]) logsByRound[round] = [];
            let cls = type === 'profit' ? 'log-profit' : type === 'loss' ? 'log-loss' : type === 'event' ? 'log-event' :
                type === 'highlight' ? 'log-highlight' : type === 'external' ? 'log-external' : type === 'achievement' ?
                'log-achievement' : '';
            logsByRound[round].push({ message: msg, className: cls });
            rebuildLogs();
        }

        function rebuildLogs() {
            let el = document.getElementById('history-log');
            el.innerHTML = '';
            let rounds = Object.keys(logsByRound).sort((a, b) => b - a);
            rounds.forEach(r => {
                let group = document.createElement('div');
                group.className = `round-group ${allLogsExpanded ? 'expanded' : ''}`;
                let hdr = document.createElement('div');
                hdr.className = 'round-group-header';
                hdr.innerHTML = `<span>📌 第${r}轮</span><span>${allLogsExpanded ? '▼' : '▶'}</span>`;
                hdr.onclick = () => group.classList.toggle('expanded');
                let content = document.createElement('div');
                content.className = 'round-group-content';
                logsByRound[r].forEach(log => {
                    let entry = document.createElement('div');
                    entry.className = `log-entry ${log.className}`;
                    entry.textContent = log.message;
                    content.appendChild(entry);
                });
                group.appendChild(hdr);
                group.appendChild(content);
                el.appendChild(group);
            });
            if (el.children.length === 0) {
                el.innerHTML = '<div class="log-entry">🎮 游戏已启动</div>';
            }
        }

        // ================================================================
