import { WhaleWatcher } from './core/services/WhaleWatcher';

// Mapping our Validation Suite to Data Inputs
const TEST_VECTORS = {
    VIRAL_BOT: { price: 150, priceChangeFraction: 0.50, orderBookDepth: 10 },        // High dV, Low W
    MUD_PIT: { price: 100, priceChangeFraction: 0.001, orderBookDepth: 1000000 },    // Low dV, High W
    ACTIVE_BARRIER: { price: 100, priceChangeFraction: 0.0001, orderBookDepth: 5000000 } // Near-0 dV, Massive W
};

(window as any).runSim = (vectorName: string) => {
    const evidence = TEST_VECTORS[vectorName];
    const analysis = WhaleWatcher.analyze(evidence);

    // Update UI
    const precisionEl = document.getElementById('precision-value');
    const ghostEl = document.getElementById('ghost-status');
    const logEl = document.getElementById('log');

    if (precisionEl) precisionEl.innerText = analysis.effectivePrecision.toFixed(2);
    
    if (ghostEl) {
        const isGhost = analysis.originalSignal.context.physics.isGhostCandidate;
        ghostEl.innerText = isGhost ? "!! GHOST_DETECTED !!" : "SIGNAL_VALIDATED";
        ghostEl.style.color = isGhost ? "red" : "#00ff00";
    }

    const logEntry = document.createElement('div');
    logEntry.innerText = `[${new Date().toLocaleTimeString()}] Executed ${vectorName}: Precision ${analysis.effectivePrecision.toFixed(2)}`;
    logEl?.prepend(logEntry);
};

