//  23. 事件模态框
        // ================================================================

        function showEventModal(evt) {
            return new Promise((resolve) => {
                let el = document.getElementById('event-modal');
                let content = document.getElementById('event-content');
                document.getElementById('event-icon').textContent = evt.icon;
                document.getElementById('event-title').textContent = evt.name;
                document.getElementById('event-description').textContent = evt.desc.replace('{stock}', evt.stockName ||
                    '市场');
                content.className = `event-content event-${evt.type}`;
                el.style.display = 'flex';
                document.body.classList.add('modal-open');
                let resolved = false;

                function doResolve() {
                    if (resolved) return;
                    resolved = true;
                    el.style.display = 'none';
                    document.body.classList.remove('modal-open');
                    resolve();
                }
                document.getElementById('event-close-btn').onclick = doResolve;
                setTimeout(() => {
                    if (!resolved) {
                        el.style.display = 'none';
                        document.body.classList.remove('modal-open');
                        resolved = true;
                        resolve();
                    }
                }, 8000);
            });
        }

        // ================================================================
