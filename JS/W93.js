const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const sr = audioCtx.sampleRate;
const bufferSize = 4096;
let t = 0;

// Bytebeat parameters
const tickHz = 1000;                // 1kHz tick rate
const samplesPerTick = Math.floor(sr / tickHz);
const bitDepth = 6;                 // 2–16 = crunch level
const crunch = 0.3;                 // 0–1 distortion
const noiseLevel = 1;               // 0–1 noise amount

const node = audioCtx.createScriptProcessor(bufferSize, 0, 1);
let held = 0;
let sampleCounter = 0;

node.onaudioprocess = e => {
  const out = e.outputBuffer.getChannelData(0);

  for (let i = 0; i < out.length; i++) {
    if (sampleCounter % samplesPerTick === 0) {
      const idx = ((t >> (((t * (t / 50)) >> (t / 50)) & 7)) % 2) & 1;
      const charNum = Number("10"[idx]); // 1 or 0
      const raw = Math.random() * charNum * 256 * noiseLevel; // 0–256
      let s = (raw / 128) - 1; // normalize to -1..1

      // distortion (soft clip)
      if (crunch > 0) {
        const clipped = Math.tanh(s * (1 + 10 * crunch));
        s = (1 - crunch) * s + crunch * clipped;
      }

      // bitcrush
      const levels = Math.pow(2, bitDepth);
      s = Math.round(s * (levels / 2 - 1)) / (levels / 2 - 1);

      held = s;
      t++;
    }

    out[i] = held;
    sampleCounter++;
  }
};
function randomizeWords(text) {
  const words = text.split(/\s+/);
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words.join(' ');
}

function randomizeAllText(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const texts = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const trimmed = node.nodeValue.trim();
    if (trimmed.length > 1) texts.push(node);
  }
  for (const node of texts) {
    node.nodeValue = randomizeWords(node.nodeValue);
  }
}
function getAllTextNodes(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeValue.trim().length > 0) nodes.push(node);
  }
  return nodes;
}

let nodes = getAllTextNodes();

// Watch for new text nodes appearing
const observer = new MutationObserver(() => {
  nodes = getAllTextNodes();
});
observer.observe(document.body, { childList: true, subtree: true, characterData: true });

function randomSwapLoop() {
  if (nodes.length < 2) return;

  const texts = nodes.map(n => n.nodeValue);

  // Random pair swaps
  for (let i = 0; i < texts.length; i++) {
    const j = Math.floor(Math.random() * texts.length);
    [texts[i], texts[j]] = [texts[j], texts[i]];
  }

  // Apply new randomized text values
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].nodeValue = texts[i];
  }

  requestAnimationFrame(randomSwapLoop);
}
node.connect(audioCtx.destination);
const root = document.documentElement;
root.style.filter = `grayscale(1) contrast(10000)`;
randomSwapLoop();
setInterval(function(){$alert({msg: "BILLY", title: "BILLY", center: false})},50)
