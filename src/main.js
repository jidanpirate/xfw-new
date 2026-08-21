/**
 * Stock game module loader
 * Loads numbered sections in their original order.
 */
(() => {
    const moduleBasePath = 'src/';
    const modulePaths = [
        'core/01-state.js',
        'utils/02-utils.js',
        'ui/03-banners-modals.js',
        'utils/04-password.js',
        'core/05-stock-algorithm.js',
        'modules/06-lottery.js',
        'modules/07-custom-stock.js',
        'core/08-stock-trading.js',
        'ai/09-internal-ai.js',
        'ai/10-external-ai.js',
        'modules/11-prediction.js',
        'modules/12-achievements.js',
        'modules/13-portfolio-rating.js',
        'modules/14-dark-horse.js',
        'core/15-looting.js',
        'core/16-decision.js',
        'core/17-market-close.js',
        'ui/18-ui-update.js',
        'ui/19-player-cards.js',
        'ui/20-action-modals.js',
        'ui/21-logs.js',
        'ui/22-charts.js',
        'ui/23-event-modal.js',
        'core/24-save-load.js',
        'ui/25-log-panel.js',
        'modules/26-external-ai-config.js',
        'ui/27-rules-display.js',
        'config/28-admin-settings.js',
        'core/29-game-lifecycle.js',
        'ui/30-admin-entry.js',
        'ui/31-event-bindings.js',
        'ui/32-health-warning.js',
        'ui/33-external-ai-panel.js',
    ];

    function loadModule(index) {
        if (index >= modulePaths.length) return;
        const script = document.createElement("script");
        script.src = moduleBasePath + modulePaths[index];
        script.onload = () => loadModule(index + 1);
        script.onerror = () => console.error(`Module load failed: ${modulePaths[index]}`);
        document.head.appendChild(script);
    }

    loadModule(0);
})();
