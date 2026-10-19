// 测测你最像哪个 AI：答题流程、计分与结果渲染

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];
const LETTERS = "ABCDEFGH";
const AI_KEYS = Object.keys(AIS);
// 某个 AI 的满分：每道题都被选为主 AI
const MAX_SCORE = QUESTIONS.length * SCORE_MAIN;

const state = {
  order: [],   // 每道题打乱后的选项顺序（存原始下标）
  answers: [], // 每道题选中的原始选项下标
  current: 0,
  locked: false,
  shareText: "",
};

const $ = (id) => document.getElementById(id);

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function show(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === `screen-${name}`));
  window.scrollTo(0, 0);
  const heading = { start: "home-title", quiz: "quiz-question", result: "result-name" }[name];
  $(heading)?.focus({ preventScroll: true });
}

// 像素 logo：同一张图叠成几层做出厚度，整体再绕 Y 轴转。
// size 要取 LOGO_GRID 的整数倍，像素才不会糊。
function logo3d(key, size) {
  const depth = Math.round((size / LOGO_GRID) * 3); // 厚度 = 3 个像素
  const mono = LOGOS[key].mono ? " mono" : "";
  const layers = [];
  for (let z = 0; z <= depth; z++) {
    const core = z > 0 && z < depth ? " core" : "";
    layers.push(`<img class="pixel-logo${mono}${core}" src="${LOGOS[key].src}" alt="" draggable="false" style="transform: translateZ(${z - depth / 2}px)">`);
  }
  return `
    <div class="logo3d" role="img" aria-label="${esc(AIS[key].name)} logo" style="--size: ${size}px">
      <div class="logo3d-spin">${layers.join("")}</div>
    </div>`;
}

function logoImg(key) {
  return `<img class="pixel-logo logo-small${LOGOS[key].mono ? " mono" : ""}" src="${LOGOS[key].src}" alt="" draggable="false">`;
}

// 所有 3D logo 共用一个动画循环：平时自己匀速转，也可以按住拖着转、甩一下
const REDUCE_MOTION = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MAX_FLING = 1500; // 甩出去的最大角速度（度/秒）
let spinners = [];

function registerSpinners(root, speed) {
  spinners = spinners.filter((s) => s.el.isConnected);
  root.querySelectorAll(".logo3d").forEach((box, i) => {
    const base = REDUCE_MOTION ? 0 : speed;
    const s = { el: box.firstElementChild, angle: REDUCE_MOTION ? 0 : i * 40, tilt: 0, base, vel: base, drag: null };

    box.addEventListener("pointerdown", (e) => {
      s.drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      s.vel = 0;
      box.setPointerCapture(e.pointerId);
    });
    box.addEventListener("pointermove", (e) => {
      if (!s.drag) return;
      const dx = e.clientX - s.drag.x;
      const dy = e.clientY - s.drag.y;
      const dt = Math.max(1, e.timeStamp - s.drag.t) / 1000;
      s.angle += dx * 0.9;
      s.tilt = Math.max(-35, Math.min(35, s.tilt - dy * 0.5));
      s.vel = Math.max(-MAX_FLING, Math.min(MAX_FLING, (dx * 0.9) / dt));
      s.drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    });
    const release = (e) => {
      // 停住一会儿再松手就不算甩
      if (s.drag && e.timeStamp - s.drag.t > 80) s.vel = 0;
      s.drag = null;
    };
    box.addEventListener("pointerup", release);
    box.addEventListener("pointercancel", release);

    spinners.push(s);
  });
}

let lastTick = performance.now();
function tick(now) {
  const dt = Math.min(0.05, (now - lastTick) / 1000);
  lastTick = now;
  for (const s of spinners) {
    if (!s.drag) {
      s.angle = (s.angle + s.vel * dt) % 360;
      s.vel += (s.base - s.vel) * Math.min(1, dt * 1.5); // 甩完慢慢回到匀速
      s.tilt *= 1 - Math.min(1, dt * 3);
    }
    s.el.style.transform = `rotateX(${s.tilt}deg) rotateY(${s.angle}deg)`;
  }
  requestAnimationFrame(tick);
}

function renderStart() {
  $("ai-chips").innerHTML = AI_KEYS.map((k) => `
    <li class="ai-chip" style="--ai: var(--ai-${k})">
      ${logo3d(k, LOGO_GRID * 2)}
      <span>${esc(AIS[k].name)}</span>
    </li>`).join("");
  registerSpinners($("ai-chips"), 45);
}

function startQuiz() {
  // 选项顺序每次随机，避免“A 永远是 ChatGPT”
  state.order = QUESTIONS.map((q) => shuffle(q.options.map((_, i) => i)));
  state.answers = QUESTIONS.map(() => null);
  state.current = 0;
  state.locked = false;
  renderQuestion();
  show("quiz");
}

function renderQuestion() {
  const qi = state.current;
  const q = QUESTIONS[qi];
  $("back-btn").textContent = qi === 0 ? "← 返回首页" : "← 上一题";
  $("quiz-step").textContent = `${qi + 1} / ${QUESTIONS.length}`;
  $("quiz-progress").style.width = `${(qi / QUESTIONS.length) * 100}%`;
  $("quiz-progress-track").setAttribute("aria-valuemax", QUESTIONS.length);
  $("quiz-progress-track").setAttribute("aria-valuenow", qi);
  $("quiz-progress-track").setAttribute("aria-valuetext", `已完成 ${qi} 题，共 ${QUESTIONS.length} 题`);
  $("quiz-dimension").textContent = `${CIRCLED[qi]} ${q.dimension}`;
  $("quiz-question").textContent = q.text;
  $("quiz-options").innerHTML = state.order[qi].map((oi, pos) => `
    <button class="option${state.answers[qi] === oi ? " selected" : ""}" data-index="${oi}">
      <span class="option-letter">${LETTERS[pos]}</span>
      <span class="option-text">${esc(q.options[oi].text)}</span>
    </button>`).join("");

  // 重新触发入场动画
  const card = $("quiz-card");
  card.classList.remove("enter");
  void card.offsetWidth;
  card.classList.add("enter");

  if ($("screen-quiz").classList.contains("active")) {
    window.scrollTo(0, 0);
    $("quiz-question").focus({ preventScroll: true });
  }
}

function choose(btn) {
  if (state.locked) return;
  state.locked = true;
  state.answers[state.current] = Number(btn.dataset.index);
  $("quiz-options").querySelectorAll(".option").forEach((b) => b.classList.toggle("selected", b === btn));

  setTimeout(() => {
    state.locked = false;
    if (state.current < QUESTIONS.length - 1) {
      state.current += 1;
      renderQuestion();
    } else {
      renderResult();
    }
  }, 320);
}

function goBack() {
  if (state.locked) return;
  if (state.current === 0) {
    show("start");
    return;
  }
  state.current -= 1;
  renderQuestion();
}

function computeResult(answers) {
  const scores = {};
  const mainCount = {};
  const lastMain = {};
  AI_KEYS.forEach((k) => {
    scores[k] = 0;
    mainCount[k] = 0;
    lastMain[k] = -1;
  });

  answers.forEach((oi, qi) => {
    const opt = QUESTIONS[qi].options[oi];
    scores[opt.main] += SCORE_MAIN;
    scores[opt.sub] += SCORE_SUB;
    mainCount[opt.main] += 1;
    lastMain[opt.main] = qi;
  });

  // 平局时：被选为主 AI 次数多的优先，再平就看谁最近一次被选中
  const ranking = AI_KEYS.slice().sort((a, b) =>
    scores[b] - scores[a] || mainCount[b] - mainCount[a] || lastMain[b] - lastMain[a]);

  const dimensions = answers.map((oi, qi) => ({
    dimension: QUESTIONS[qi].dimension,
    ai: QUESTIONS[qi].options[oi].main,
  }));

  return { scores, ranking, dimensions };
}

function similarity(score) {
  return Math.round((score / MAX_SCORE) * 100);
}

function buildShareText(key, dimensions) {
  const ai = AIS[key];
  const link = location.protocol.startsWith("http") ? ` ${location.origin}${location.pathname}` : "";
  return [
    `我测出来最像 ${ai.emoji} ${ai.name}：「${ai.title}」`,
    `口头禅：“${ai.catchphrase}”`,
    `六维度：${dimensions.map((d) => `${d.dimension}像${AIS[d.ai].name}`).join("，")}`,
    `你最像哪个 AI？来测测${link}`,
  ].join("\n");
}

function renderResult() {
  const { scores, ranking, dimensions } = computeResult(state.answers);
  const topKey = ranking[0];
  const top = AIS[topKey];

  $("screen-result").style.setProperty("--ai", `var(--ai-${topKey})`);
  $("result-logo").innerHTML = logo3d(topKey, LOGO_GRID * 4);
  registerSpinners($("result-logo"), 70);
  $("result-name").textContent = top.name;
  $("result-title").textContent = `「${top.title}」`;
  $("result-catchphrase").textContent = `“${top.catchphrase}”`;
  $("result-desc").textContent = top.desc;
  $("result-tags").innerHTML = top.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  $("result-buddy").textContent = top.buddy;
  $("result-nemesis").textContent = top.nemesis;

  $("result-dimensions").innerHTML = dimensions.map((d, i) => `
    <li style="--ai: var(--ai-${d.ai})">
      <span class="dim-name">${CIRCLED[i]} ${esc(d.dimension)}</span>
      <span class="dim-ai">${logoImg(d.ai)}${esc(AIS[d.ai].name)}</span>
    </li>`).join("");

  $("result-bars").innerHTML = ranking.map((k) => {
    const p = similarity(scores[k]);
    return `
    <li style="--ai: var(--ai-${k})">
      <span class="bar-label">${logoImg(k)}${esc(AIS[k].name)}</span>
      <span class="bar-track"><span class="bar-fill" data-p="${p}"></span></span>
      <span class="bar-value">${p}%</span>
    </li>`;
  }).join("");

  state.shareText = buildShareText(topKey, dimensions);
  show("result");

  // 先让结果页按 0 宽度完成布局，再设置目标宽度，条形图才有动画
  void $("result-bars").offsetWidth;
  $("result-bars").querySelectorAll(".bar-fill").forEach((f) => {
    f.style.width = `${f.dataset.p}%`;
  });
}

async function copyShare(btn) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(state.shareText);
    ok = true;
  } catch {
    // 本地 file:// 打开时剪贴板 API 可能不可用，退回老办法
    const ta = document.createElement("textarea");
    ta.value = state.shareText;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
  }
  btn.textContent = ok ? "已复制 ✓" : "复制失败，截图分享吧";
  setTimeout(() => {
    btn.textContent = "复制分享文案";
  }, 1600);
}

$("start-btn").addEventListener("click", startQuiz);
$("back-btn").addEventListener("click", goBack);
$("restart-btn").addEventListener("click", startQuiz);
$("share-btn").addEventListener("click", (e) => copyShare(e.currentTarget));
$("quiz-options").addEventListener("click", (e) => {
  const btn = e.target.closest(".option");
  if (btn) choose(btn);
});

// 答题时可以按 1-6 或 A-F 直接选
document.addEventListener("keydown", (e) => {
  if (!$("screen-quiz").classList.contains("active") || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
  const key = e.key.toLowerCase();
  const pos = Math.max("123456".indexOf(key), "abcdef".indexOf(key));
  const btn = $("quiz-options").children[pos];
  if (pos >= 0 && btn) choose(btn);
});

renderStart();
requestAnimationFrame(tick);
