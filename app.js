const scenes = [...document.querySelectorAll(".scene")];
const fill = document.getElementById("fill");
const clock = document.getElementById("clock");
const track = document.getElementById("track");
const DURATION = 19;
const HOLD = DURATION / scenes.length;

let index = 0;
let started = performance.now();
let playing = true;

const links = {
  websites: 2,
  marketing: 3,
  apps: 4,
  software: 5,
  design: 6
};

function show(i) {
  index = (i + scenes.length) % scenes.length;
  scenes.forEach((scene, n) => scene.classList.toggle("active", n === index));
  track.setAttribute("aria-valuenow", String(index));
  document.querySelectorAll(".topbar a").forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    a.style.color = links[id] === index ? "#fff" : "";
  });
}

function format(t) {
  const s = Math.min(DURATION, Math.max(0, t));
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${r}`;
}

function tick(now) {
  if (playing) {
    const elapsed = (now - started) / 1000;
    if (elapsed >= DURATION) {
      playing = false;
      show(scenes.length - 1);
      fill.style.width = "100%";
      clock.textContent = "0:19 / 0:19";
    } else {
      const next = Math.floor(elapsed / HOLD);
      if (next !== index) show(next);
      fill.style.width = `${(elapsed / DURATION) * 100}%`;
      clock.textContent = `${format(elapsed)} / 0:19`;
    }
  }
  requestAnimationFrame(tick);
}

function jump(i, play) {
  const next = (i + scenes.length) % scenes.length;
  show(next);
  started = performance.now() - next * HOLD * 1000;
  playing = play === true;
  const elapsed = next * HOLD;
  fill.style.width = `${(elapsed / DURATION) * 100}%`;
  clock.textContent = `${format(elapsed)} / 0:19`;
}

document.getElementById("next").onclick = () => jump(index + 1);
document.getElementById("prev").onclick = () => jump(index - 1);
document.getElementById("replay").onclick = () => jump(0, true);
document.getElementById("start").onclick = () => jump(scenes.length - 1);
document.getElementById("onward").onclick = () => jump(2);
document.getElementById("keep").onclick = () => jump(2);

track.addEventListener("click", (event) => {
  const rect = track.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  jump(Math.round(ratio * (scenes.length - 1)));
});

document.querySelectorAll(".topbar a").forEach((a) => {
  a.addEventListener("click", (event) => {
    event.preventDefault();
    const id = a.getAttribute("href").slice(1);
    if (links[id] != null) jump(links[id]);
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") jump(index + 1);
  if (event.key === "ArrowLeft") jump(index - 1);
  if (event.key === " ") {
    event.preventDefault();
    if (playing) playing = false;
    else {
      playing = true;
      started = performance.now() - index * HOLD * 1000;
    }
  }
});

let wheelLock = false;
window.addEventListener("wheel", (event) => {
  if (wheelLock) return;
  wheelLock = true;
  jump(index + (event.deltaY > 0 ? 1 : -1));
  setTimeout(() => { wheelLock = false; }, 700);
}, { passive: true });

document.getElementById("lead").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.querySelector(".thanks").hidden = false;
  event.currentTarget.reset();
});

function network(canvas) {
  const ctx = canvas.getContext("2d");
  const nodes = Array.from({ length: 42 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00045,
    vy: (Math.random() - 0.5) * 0.00045,
    r: 1.2 + Math.random() * 2.2
  }));

  function frame() {
    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > 1) n.vx *= -1;
      if (n.y < 0 || n.y > 1) n.vy *= -1;
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = (nodes[i].x - nodes[j].x) * canvas.width;
        const dy = (nodes[i].y - nodes[j].y) * canvas.height;
        const dist = Math.hypot(dx, dy);
        if (dist < 110) {
          ctx.strokeStyle = `rgba(120, 190, 255, ${1 - dist / 110})`;
          ctx.lineWidth = dist < 70 ? 1 : 0.6;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x * canvas.width, nodes[i].y * canvas.height);
          ctx.lineTo(nodes[j].x * canvas.width, nodes[j].y * canvas.height);
          ctx.stroke();
        }
      }
    }
    nodes.forEach((n, i) => {
      ctx.fillStyle = i % 7 === 0 ? "#f0b15a" : "#9ad7ff";
      ctx.beginPath();
      ctx.arc(n.x * canvas.width, n.y * canvas.height, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
}

network(document.getElementById("net"));
network(document.getElementById("net2"));
show(0);
requestAnimationFrame(tick);
