/* 背景波动控制器。
 * 用正弦叠加（波函数）+ 少量随机相位漂移驱动背景位置：
 * 只平移位置、不改颜色与透明度，因此整体亮度保持不变。
 * 尊重 prefers-reduced-motion：不动画；页面隐藏时暂停以省电。 */
(function () {
  var root = document.documentElement;
  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  var start = performance.now();
  var rafId = null;
  var running = false;

  // 随机初相，使每次加载略有不同。
  var phaseX = Math.random() * Math.PI * 2;
  var phaseY = Math.random() * Math.PI * 2;

  // 缓慢变化的随机相位漂移（"一点随机"）。
  var driftX = 0;
  var driftY = 0;
  var targetX = 0;
  var targetY = 0;
  var lastDrift = 0;

  // 小幅随机抖动（随机小波动）。
  var jitX = 0;
  var jitY = 0;
  var jitTX = 0;
  var jitTY = 0;
  var lastJit = 0;

  function clamp(v) {
    return v < 0 ? 0 : v > 100 ? 100 : v;
  }

  var PURPLE = "rgba(120, 60, 230, 0.5)";
  var CYAN = "rgba(30, 168, 188, 0.42)";

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  // 每次加载随机生成构图：两个光斑的位置、尺寸与紫青搭配。
  function randomizeComposition() {
    function ellipse() {
      return rand(30, 55).toFixed(1) + "% " + rand(38, 62).toFixed(1) + "%";
    }
    // 两个光斑分别落在相对的半区，避免完全重叠。
    var x1 = rand(6, 52);
    var y1 = rand(6, 52);
    var x2 = rand(48, 94);
    var y2 = rand(48, 94);

    root.style.setProperty("--g1", ellipse() + " at " + x1.toFixed(1) + "% " + y1.toFixed(1) + "%");
    root.style.setProperty("--g2", ellipse() + " at " + x2.toFixed(1) + "% " + y2.toFixed(1) + "%");

    if (Math.random() < 0.5) {
      root.style.setProperty("--glow-a", PURPLE);
      root.style.setProperty("--glow-b", CYAN);
    } else {
      root.style.setProperty("--glow-a", CYAN);
      root.style.setProperty("--glow-b", PURPLE);
    }
  }

  randomizeComposition();

  function frame(now) {
    if (!running) return;
    var t = (now - start) / 1000;

    // 两组不同频率的正弦叠加（波函数），映射到 0..100。
    var x =
      50 +
      35 * Math.sin(t * 0.11 + phaseX + driftX) +
      15 * Math.sin(t * 0.037 + phaseY);
    var y =
      50 +
      35 * Math.cos(t * 0.083 + phaseY + driftY) +
      15 * Math.cos(t * 0.052 + phaseX);

    // 小幅随机抖动：频繁取小随机目标，再平滑趋近，叠加在正弦之上。
    if (now - lastJit > 1100) {
      lastJit = now;
      jitTX = (Math.random() - 0.5) * 4;
      jitTY = (Math.random() - 0.5) * 4;
    }
    jitX += (jitTX - jitX) * 0.05;
    jitY += (jitTY - jitY) * 0.05;
    x += jitX;
    y += jitY;

    root.style.setProperty("--bg-x", clamp(x).toFixed(2) + "%");
    root.style.setProperty("--bg-y", clamp(y).toFixed(2) + "%");

    // 每隔数秒给相位一个新的随机漂移目标，再平滑趋近。
    if (now - lastDrift > 6000) {
      lastDrift = now;
      targetX += (Math.random() - 0.5) * 0.8;
      targetY += (Math.random() - 0.5) * 0.8;
    }
    driftX += (targetX - driftX) * 0.01;
    driftY += (targetY - driftY) * 0.01;

    rafId = requestAnimationFrame(frame);
  }

  function play() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }

  function pause() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) pause();
    else play();
  });

  play();
})();
