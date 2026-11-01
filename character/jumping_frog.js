import 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js';

const model = document.querySelector('#frogModel');
const status = document.querySelector('#status');
const playBtn = document.querySelector('#playBtn');
const pauseBtn = document.querySelector('#pauseBtn');
const resetBtn = document.querySelector('#resetBtn');
let ready = false;

model.addEventListener('load', () => {
  const animations = model.availableAnimations || [];
  console.log('Available animations:', animations);
  if (animations.length === 0) {
    status.textContent = 'Model loaded, but no animation was found.';
    return;
  }
  model.animationName = animations.includes('mixamo.com') ? 'mixamo.com' : animations[0];
  model.pause();
  model.currentTime = 0;
  ready = true;
  playBtn.disabled = pauseBtn.disabled = resetBtn.disabled = false;
  status.textContent = 'Animation ready!';
});

model.addEventListener('error', (event) => {
  console.error('Failed to load the 3D model:', event);
  status.textContent = 'Could not load the model. Check the GLB path and browser Console (F12).';
});

playBtn.addEventListener('click', () => {
  if (!ready) return;
  model.play();
  status.textContent = 'Animation playing';
});
pauseBtn.addEventListener('click', () => {
  if (!ready) return;
  model.pause();
  status.textContent = 'Animation paused';
});
resetBtn.addEventListener('click', () => {
  if (!ready) return;
  model.pause();
  model.currentTime = 0;
  status.textContent = 'Animation reset';
});
