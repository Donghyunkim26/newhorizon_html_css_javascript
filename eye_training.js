const dot = document.getElementById('movingDot');
const arcs = document.querySelectorAll('.progress');
const statusText = document.getElementById('status');
const startButton = document.getElementById('startBtn');
const pauseButton = document.getElementById('pauseBtn');
const resetButton = document.getElementById('resetBtn');

const center = 150;
const radius = 112;
const circumference = 2 * Math.PI * radius;
const lapDuration = 12000; // One clockwise lap every 12 seconds.
let progress = 0.465; // Starting position resembles the reference image.
let running = false;
let lastFrame = null;
let frameId = null;

function draw() {
  // Start at the top of the circle and move clockwise.
  const angle = -Math.PI / 2 + progress * 2 * Math.PI;
  dot.setAttribute('cx', center + radius * Math.cos(angle));
  dot.setAttribute('cy', center + radius * Math.sin(angle));
  // Highlight the travelled section, starting at 12 o'clock.
  const dashOffset = circumference * (1 - progress);
  arcs.forEach(arc => {
    arc.style.strokeDasharray = circumference;
    arc.style.strokeDashoffset = dashOffset;
  });
}

function animate(timestamp) {
  if (!running) return;
  if (lastFrame !== null) {
    progress = (progress + (timestamp - lastFrame) / lapDuration) % 1;
  }
  lastFrame = timestamp;
  draw();
  frameId = requestAnimationFrame(animate);
}

startButton.addEventListener('click', () => {
  if (running) return;
  running = true;
  lastFrame = null;
  statusText.textContent = 'Follow the moving white dot.';
  frameId = requestAnimationFrame(animate);
});

pauseButton.addEventListener('click', () => {
  running = false;
  cancelAnimationFrame(frameId);
  lastFrame = null;
  statusText.textContent = 'Paused';
});

resetButton.addEventListener('click', () => {
  running = false;
  cancelAnimationFrame(frameId);
  lastFrame = null;
  progress = 0.465;
  draw();
  statusText.textContent = 'Follow the white dot with your eyes.';
});

draw();
