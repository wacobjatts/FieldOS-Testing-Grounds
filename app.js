const priceCanvas = document.getElementById("priceCanvas");
const volumeCanvas = document.getElementById("volumeCanvas");
const indicatorCanvas = document.getElementById("indicatorCanvas");

const instrumentSelect = document.getElementById("instrumentSelect");
const timeframeSelect = document.getElementById("timeframeSelect");

const currentValues = document.getElementById("currentValues");
const inputValues = document.getElementById("inputValues");
const formulaBox = document.getElementById("formulaBox");
const interpretationBox = document.getElementById("interpretationBox");
const instrumentTitle = document.getElementById("instrumentTitle");
const instrumentSub = document.getElementById("instrumentSub");
const activeInstrumentInfo = document.getElementById("activeInstrumentInfo");

const scoreKinetic = document.getElementById("scoreKinetic");
const scoreCompression = document.getElementById("scoreCompression");
const scoreConfidence = document.getElementById("scoreConfidence");

const barKinetic = document.getElementById("barKinetic");
const barCompression = document.getElementById("barCompression");
const barConfidence = document.getElementById("barConfidence");

const compassDot = document.getElementById("compassDot");
const cursorTime = document.getElementById("cursorTime");
const stateSentence = document.getElementById("stateSentence");
const kineticScore = document.getElementById("kineticScore");
const compressionScore = document.getElementById("compressionScore");
const confidenceScore = document.getElementById("confidenceScore");

document.querySelectorAll(".info-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.info;
    const panel = document.getElementById(id);
    if (panel) panel.classList.toggle("open");
  });
});

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function rand(min, max) {
  return min + Math.random() * (max - min);
}
function formatNum(v, digits = 4) {
  return Number(v).toFixed(digits);
}

function generateBars(count = 80) {
  const bars = [];
  let price = 42865;
  let now = Date.now() - count * 5 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const drift = Math.sin(i / 8) * 14 + (Math.random() - 0.5) * 22;
    const open = price;
    const close = open + drift;
    const high = Math.max(open, close) + rand(4, 18);
    const low = Math.min(open, close) - rand(4, 18);
    const volume = rand(180, 920);
    const buyWork = volume * rand(0.44, 0.58);
    const sellWork = volume - buyWork;
    const tradeCount = Math.floor(rand(2, 18));

    const bestBid = close - rand(0.2, 0.7);
    const bestAsk = close + rand(0.2, 0.7);
    const bestBidSize = rand(20, 140);
    const bestAskSize = rand(20, 140);

    const timestamp = now;
    const localUpdateTime = timestamp - rand(5, 180);

    bars.push({
      time: timestamp,
      open,
      high,
      low,
      close,
      volume,
      buyWork,
      sellWork,
      tradeCount,
      bestBid,
      bestAsk,
      bestBidSize,
      bestAskSize,
      isSynced: Math.random() > 0.03,
      localUpdateTime,
    });

    price = close;
    now += 5 * 60 * 1000;
  }

  return bars;
}

const bars = generateBars(84);

function deriveSeries(bars) {
  const force = [];
  const truth = [];
  const compression = [];
  const precision = [];
  const confidence = [];
  const absorptionPrecision = [];
  const entropyPrecision = [];
  const liarPrecision = [];
  const realityGapPrecision = [];
  const tensionPrecision = [];
  const metadata = [];

  let anchorMid = (bars[0].bestBid + bars[0].bestAsk) / 2;
  let previousMid = anchorMid;
  let rollingMaxDisplacement = 1;

  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];

    const currentMid = (b.bestBid + b.bestAsk) / 2;
    const displacement = Math.abs(currentMid - previousMid);
    rollingMaxDisplacement = Math.max(rollingMaxDisplacement * 0.995, displacement, 0.0001);
    const normalizedDisplacement = clamp01(displacement / (rollingMaxDisplacement || 1));

    const totalWork = b.buyWork + b.sellWork;
    const mismatch = totalWork > 0 ? (b.buyWork - b.sellWork) / totalWork : 0;
    const participation = clamp01(totalWork / 900);

    const frontierDensity = ((b.bestBid * b.bestBidSize) + (b.bestAsk * b.bestAskSize)) / 2;
    const slippageCost = displacement * frontierDensity;
    const absorption = totalWork > 0 && frontierDensity > 0
      ? clamp01(1 - (slippageCost / (totalWork + slippageCost)))
      : 0;

    const spread = Math.max(0, b.bestAsk - b.bestBid);
    const relativeSpread = currentMid > 0 ? spread / currentMid : 0;
    const normalizedSpread = clamp01(relativeSpread * 1000);
    const normalizedVolatility = clamp01(displacement / 8);
    const bookAgeMs = Math.abs(b.time - b.localUpdateTime);
    const syncDegradation = clamp01(bookAgeMs / 250);
    const entropy = clamp01((normalizedSpread + normalizedVolatility + syncDegradation) / 3);

    const realityGap = Math.max(0, Math.abs(currentMid - anchorMid));
    const liarIndex = displacement > 0 ? clamp01(realityGap / displacement) : 0;

    const pressure = Math.abs(mismatch);
    const trappedPressure = pressure * absorption;
    const releaseCapacity = 1 - absorption;
    const tensionDenominator = trappedPressure + releaseCapacity;
    const tension = tensionDenominator > 0 ? clamp01(trappedPressure / tensionDenominator) : 0;

    // Precision folder formulas
    const sampleSignificance = clamp01(b.tradeCount / 10);
    const temporalHonesty = Math.exp(-bookAgeMs / 100);
    const ap = b.isSynced && b.bestBidSize > 0 && b.bestAskSize > 0
      ? Math.max(1e-12, clamp01(sampleSignificance * temporalHonesty))
      : 1e-12;

    const entropySampleSignificance = clamp01(b.tradeCount / 8);
    const entropyTemporalHonesty = Math.exp(-bookAgeMs / 125);
    const ep = b.isSynced
      ? Math.max(1e-12, clamp01((entropySampleSignificance + entropyTemporalHonesty) / 2))
      : 1e-12;

    const rgp = b.isSynced && b.bestBid > 0 && b.bestAsk > 0
      ? Math.max(1e-12, clamp01(Math.exp(-bookAgeMs / 50) * 1.0))
      : 1e-12;

    const lip = Math.max(1e-12, clamp01(rgp * clamp01(b.tradeCount / 5)));
    const tp = Math.max(1e-12, clamp01(clamp01(Math.abs(mismatch)) * ap));

    const forceValue = mismatch * participation * 100;
    const truthValue = clamp01(ap * (1 - entropy) * (1 - liarIndex) * absorption) * 100;
    const compressionValue = (tension - normalizedDisplacement) * 100;
    const precisionValue = ap * 100;
    const confidenceValue = clamp01(ap * (truthValue / 100) * (1 - liarIndex)) * 100;

    force.push(forceValue);
    truth.push(truthValue);
    compression.push(compressionValue);
    precision.push(precisionValue);
    confidence.push(confidenceValue);
    absorptionPrecision.push(ap * 100);
    entropyPrecision.push(ep * 100);
    liarPrecision.push(lip * 100);
    realityGapPrecision.push(rgp * 100);
    tensionPrecision.push(tp * 100);

    metadata.push({
      time: b.time,
      displacement,
      mismatch,
      participation,
      absorption,
      entropy,
      liarIndex,
      tension,
      normalizedDisplacement,
      sampleSignificance,
      temporalHonesty,
      bookAgeMs,
      realityGap,
      forceValue,
      truthValue,
      compressionValue,
      precisionValue,
      confidenceValue,
      ap,
      ep,
      lip,
      rgp,
      tp,
      volume: b.volume,
      close: b.close,
      open: b.open,
      high: b.high,
      low: b.low
    });

    previousMid = currentMid;
    anchorMid = anchorMid * 0.98 + currentMid * 0.02;
  }

  return {
    force,
    truth,
    compression,
    precision,
    confidence,
    absorptionPrecision,
    entropyPrecision,
    liarPrecision,
    realityGapPrecision,
    tensionPrecision,
    metadata
  };
}

const series = deriveSeries(bars);

const instrumentMap = {
  kinetic: {
    title: "Kinetic Manifold",
    subtitle: "Force versus Truth over time. This is the primary relationship pane.",
    info: "Force is directional pressure. Truth is structural validity. When Force rises without Truth support, the move becomes hollow. When both rise together, the move is aligned.",
    formula: "Force = mismatch × participation\nTruth = absorptionPrecision × (1 - entropy) × (1 - liarIndex) × absorption",
    lines: [
      { key: "force", color: "#63dcff", width: 2.4, zeroCentered: true, label: "Force" },
      { key: "truth", color: "#bff6ff", width: 2.1, zeroCentered: false, label: "Truth" }
    ]
  },
  compression: {
    title: "Compression / Expansion",
    subtitle: "Centered state line showing whether energy is storing or releasing.",
    info: "Below zero = compression. Above zero = expansion. This pane compares trapped pressure against actual displacement, so users can feel whether movement is storing or releasing energy.",
    formula: "Compression State = tension - normalizedDisplacement",
    lines: [
      { key: "compression", color: "#ffc670", width: 2.4, zeroCentered: true, label: "Compression State" }
    ]
  },
  absorptionPrecision: {
    title: "Absorption Precision",
    subtitle: "Sensor integrity for the absorption observation.",
    info: "Absorption Precision measures whether the absorption reading itself should be trusted. It is driven by sample density and order-book freshness.",
    formula: "Absorption Precision = sampleSignificance × temporalHonesty",
    lines: [
      { key: "absorptionPrecision", color: "#63dcff", width: 2.4, zeroCentered: false, label: "Absorption Precision" },
      { key: "confidence", color: "#bff6ff", width: 1.8, zeroCentered: false, label: "Confidence" }
    ]
  },
  entropyPrecision: {
    title: "Entropy Precision",
    subtitle: "Reliability of the disorder reading.",
    info: "Entropy Precision measures whether the entropy / disorder reading is based on current, dense, synchronized data or on weak, stale conditions.",
    formula: "Entropy Precision = (sampleSignificance + temporalHonesty) / 2",
    lines: [
      { key: "entropyPrecision", color: "#63dcff", width: 2.4, zeroCentered: false, label: "Entropy Precision" }
    ]
  },
  liarPrecision: {
    title: "Liar Index Precision",
    subtitle: "Reliability of the distortion / liar reading.",
    info: "Liar Index Precision checks whether the reality-gap ratio is meaningful enough to trust. It combines gap integrity with current activity density.",
    formula: "Liar Precision = realityGapPrecision × activityFactor",
    lines: [
      { key: "liarPrecision", color: "#63dcff", width: 2.4, zeroCentered: false, label: "Liar Precision" }
    ]
  },
  realityGapPrecision: {
    title: "Reality Gap Precision",
    subtitle: "Structural integrity of the observed gap.",
    info: "Reality Gap Precision reflects whether the observed gap from anchor price is current and synchronized enough to treat as meaningful.",
    formula: "Reality Gap Precision = temporalHonesty × syncConfidence",
    lines: [
      { key: "realityGapPrecision", color: "#63dcff", width: 2.4, zeroCentered: false, label: "Reality Gap Precision" }
    ]
  },
  tensionPrecision: {
    title: "Tension Precision",
    subtitle: "Reliability of the trapped-pressure reading.",
    info: "Tension Precision combines mismatch integrity with absorption precision to determine whether the compression reading should be treated as trustworthy.",
    formula: "Tension Precision = mismatchPrecision × absorptionPrecision",
    lines: [
      { key: "tensionPrecision", color: "#63dcff", width: 2.4, zeroCentered: false, label: "Tension Precision" },
      { key: "compression", color: "#ffc670", width: 1.8, zeroCentered: true, label: "Compression State" }
    ]
  }
};

function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.height };
}

function drawGrid(ctx, w, h, rows = 5, cols = 10) {
  ctx.strokeStyle = "rgba(99,220,255,.08)";
  ctx.lineWidth = 1;
  for (let i = 1; i < rows; i++) {
    const y = (h / rows) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let i = 1; i < cols; i++) {
    const x = (w / cols) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
}

function drawPriceChart(canvas, bars) {
  const { ctx, w, h } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  drawGrid(ctx, w, h, 5, 12);

  const max = Math.max(...bars.map(b => b.high));
  const min = Math.min(...bars.map(b => b.low));
  const pad = 12;
  const usableH = h - pad * 2;
  const usableW = w - pad * 2;
  const candleW = usableW / bars.length;

  function mapY(v) {
    return pad + (1 - (v - min) / (max - min || 1)) * usableH;
  }

  bars.forEach((b, i) => {
    const x = pad + i * candleW + candleW * 0.5;
    const openY = mapY(b.open);
    const closeY = mapY(b.close);
    const highY = mapY(b.high);
    const lowY = mapY(b.low);
    const up = b.close >= b.open;

    ctx.strokeStyle = up ? "rgba(126,247,195,.8)" : "rgba(255,158,158,.85)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, highY);
    ctx.lineTo(x, lowY);
    ctx.stroke();

    ctx.fillStyle = up ? "rgba(126,247,195,.7)" : "rgba(255,158,158,.7)";
    const bodyTop = Math.min(openY, closeY);
    const bodyH = Math.max(2, Math.abs(closeY - openY));
    ctx.fillRect(x - candleW * 0.28, bodyTop, candleW * 0.56, bodyH);
  });
}

function drawVolumeChart(canvas, bars) {
  const { ctx, w, h } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  drawGrid(ctx, w, h, 3, 12);

  const max = Math.max(...bars.map(b => b.volume));
  const pad = 10;
  const usableH = h - pad * 2;
  const usableW = w - pad * 2;
  const barW = usableW / bars.length;

  bars.forEach((b, i) => {
    const x = pad + i * barW + 1;
    const barH = (b.volume / (max || 1)) * usableH;
    ctx.fillStyle = b.close >= b.open ? "rgba(99,220,255,.72)" : "rgba(99,220,255,.34)";
    ctx.fillRect(x, h - pad - barH, Math.max(2, barW - 2), barH);
  });
}

function drawIndicatorChart(canvas, lines, metadata, selectedIndex) {
  const { ctx, w, h } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  drawGrid(ctx, w, h, 4, 12);

  const pad = 12;
  const usableW = w - pad * 2;
  const usableH = h - pad * 2;

  let allValues = [];
  lines.forEach(line => {
    allValues = allValues.concat(line.values);
  });

  const zeroCentered = lines.some(l => l.zeroCentered);
  const max = zeroCentered
    ? Math.max(Math.abs(Math.max(...allValues)), Math.abs(Math.min(...allValues)), 1)
    : Math.max(...allValues, 1);
  const min = zeroCentered ? -max : Math.min(...allValues, 0);

  function mapX(i) {
    return pad + (i / (lines[0].values.length - 1)) * usableW;
  }

  function mapY(v) {
    return pad + (1 - (v - min) / ((max - min) || 1)) * usableH;
  }

  if (zeroCentered || min < 0) {
    const zeroY = mapY(0);
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pad, zeroY);
    ctx.lineTo(w - pad, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  lines.forEach(line => {
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.width;
    ctx.beginPath();

    line.values.forEach((v, i) => {
      const x = mapX(i);
      const y = mapY(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.shadowColor = line.color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  if (selectedIndex >= 0 && selectedIndex < metadata.length) {
    const x = mapX(selectedIndex);
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, pad);
    ctx.lineTo(x, h - pad);
    ctx.stroke();
  }
}

function metricRows(obj) {
  return Object.entries(obj).map(([label, value]) => {
    return `
      <div class="metric-row">
        <div class="metric-label">${label}</div>
        <div class="metric-value">${value}</div>
      </div>
    `;
  }).join("");
}

function setScores(meta) {
  const kinetic = clamp(Math.round((Math.abs(meta.forceValue) * 0.4) + (meta.truthValue * 0.4) + (meta.precisionValue * 0.2)), 0, 100);
  const compression = clamp(Math.round((meta.tension * 100)), 0, 100);
  const conf = clamp(Math.round(meta.confidenceValue), 0, 100);

  scoreKinetic.textContent = kinetic;
  scoreCompression.textContent = compression;
  scoreConfidence.textContent = conf;
  kineticScore.textContent = kinetic;
  compressionScore.textContent = compression;
  confidenceScore.textContent = conf;

  barKinetic.style.width = `${kinetic}%`;
  barCompression.style.width = `${compression}%`;
  barConfidence.style.width = `${conf}%`;
}

function setCompass(meta) {
  const x = clamp(meta.mismatch, -1, 1);
  const y = clamp((meta.truthValue / 100) * 2 - 1, -1, 1);

  const left = 50 + x * 28;
  const top = 50 - y * 28;

  compassDot.style.left = `${left}%`;
  compassDot.style.top = `${top}%`;
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function interpret(meta) {
  const up = meta.forceValue > 10;
  const down = meta.forceValue < -10;
  const truthStrong = meta.truthValue > 55;
  const compressed = meta.compressionValue < -8;
  const expanding = meta.compressionValue > 8;
  const lowTrust = meta.precisionValue < 35 || meta.confidenceValue < 25;

  if (up && truthStrong && !lowTrust) return "Upward pressure building with structural support.";
  if (down && truthStrong && !lowTrust) return "Downward pressure building with structural support.";
  if (compressed && truthStrong) return "Compression is building while movement remains contained.";
  if (expanding && truthStrong) return "Stored energy is releasing into expansion.";
  if (lowTrust) return "Sensor trust is degraded. Reading may be stale or under-sampled.";
  return "State remains active but unresolved. Watch force, truth, and compression together.";
}

function renderPanel(selectedKey) {
  const inst = instrumentMap[selectedKey];
  const selectedIndex = series.metadata.length - 1;
  const meta = series.metadata[selectedIndex];
  const currentTime = formatTime(meta.time);

  instrumentTitle.textContent = inst.title;
  instrumentSub.textContent = inst.subtitle;
  activeInstrumentInfo.textContent = inst.info;
  cursorTime.textContent = currentTime;
  stateSentence.textContent = interpret(meta);
  interpretationBox.textContent = interpret(meta);
  formulaBox.textContent = inst.formula;

  const lines = inst.lines.map(line => ({
    ...line,
    values: series[line.key]
  }));
  drawIndicatorChart(indicatorCanvas, lines, series.metadata, selectedIndex);

  let currentMetricMap = {};
  let inputMetricMap = {
    "Mismatch": formatNum(meta.mismatch, 4),
    "Participation": formatNum(meta.participation, 4),
    "Entropy": formatNum(meta.entropy, 4),
    "Liar Index": formatNum(meta.liarIndex, 4),
    "Tension": formatNum(meta.tension, 4),
    "Displacement": formatNum(meta.displacement, 4),
    "Book Age ms": Math.round(meta.bookAgeMs),
    "Sample Significance": formatNum(meta.sampleSignificance, 4),
    "Temporal Honesty": formatNum(meta.temporalHonesty, 4)
  };

  if (selectedKey === "kinetic") {
    currentMetricMap = {
      "Force": formatNum(meta.forceValue, 4),
      "Truth": formatNum(meta.truthValue, 4),
      "Compression": formatNum(meta.compressionValue, 4),
      "Precision": formatNum(meta.precisionValue, 4)
    };
  } else if (selectedKey === "compression") {
    currentMetricMap = {
      "Compression State": formatNum(meta.compressionValue, 4),
      "Tension": formatNum(meta.tension * 100, 4),
      "Norm. Displacement": formatNum(meta.normalizedDisplacement * 100, 4),
      "Truth": formatNum(meta.truthValue, 4)
    };
  } else if (selectedKey === "absorptionPrecision") {
    currentMetricMap = {
      "Absorption Precision": formatNum(meta.ap * 100, 4),
      "Confidence": formatNum(meta.confidenceValue, 4),
      "Sample Density": formatNum(meta.sampleSignificance * 100, 4),
      "Temporal Honesty": formatNum(meta.temporalHonesty * 100, 4)
    };
  } else if (selectedKey === "entropyPrecision") {
    currentMetricMap = {
      "Entropy Precision": formatNum(meta.ep * 100, 4),
      "Entropy": formatNum(meta.entropy * 100, 4),
      "Book Age ms": Math.round(meta.bookAgeMs),
      "Trade Count": Math.round(meta.sampleSignificance * 10)
    };
  } else if (selectedKey === "liarPrecision") {
    currentMetricMap = {
      "Liar Precision": formatNum(meta.lip * 100, 4),
      "Liar Index": formatNum(meta.liarIndex * 100, 4),
      "Reality Gap": formatNum(meta.realityGap, 4),
      "Activity Factor": formatNum(clamp01(meta.sampleSignificance * 2), 4)
    };
  } else if (selectedKey === "realityGapPrecision") {
    currentMetricMap = {
      "Reality Gap Precision": formatNum(meta.rgp * 100, 4),
      "Reality Gap": formatNum(meta.realityGap, 4),
      "Book Age ms": Math.round(meta.bookAgeMs),
      "Temporal Honesty": formatNum(Math.exp(-meta.bookAgeMs / 50) * 100, 4)
    };
  } else if (selectedKey === "tensionPrecision") {
    currentMetricMap = {
      "Tension Precision": formatNum(meta.tp * 100, 4),
      "Compression State": formatNum(meta.compressionValue, 4),
      "Mismatch |abs|": formatNum(Math.abs(meta.mismatch), 4),
      "Absorption Precision": formatNum(meta.ap * 100, 4)
    };
  }

  currentValues.innerHTML = metricRows(currentMetricMap);
  inputValues.innerHTML = metricRows(inputMetricMap);
  setScores(meta);
  setCompass(meta);
}

function renderAll() {
  drawPriceChart(priceCanvas, bars);
  drawVolumeChart(volumeCanvas, bars);
  renderPanel(instrumentSelect.value);
}

instrumentSelect.addEventListener("change", renderAll);
window.addEventListener("resize", renderAll);

renderAll();
