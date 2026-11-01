import 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js';

const model = document.querySelector('#frogModel');
const status = document.querySelector('#status');
const playBtn = document.querySelector('#playBtn');
const pauseBtn = document.querySelector('#pauseBtn');
const resetBtn = document.querySelector('#resetBtn');
const controls = [playBtn, pauseBtn, resetBtn];

model.addEventListener('load', () => {
  const animations = model.availableAnimations;
  console.log('Available animations:', animations);
  if (!animations.length) {
    status.textContent = 'Model loaded, but no animations were found.';
    return;
  }
  model.animationName = animations.includes('mixamo.com') ? 'mixamo.com' : animations[0];
  model.pause();
  model.currentTime = 0;
  controls.forEach(button => button.disabled = false);
  status.textContent = 'Shoulder rubbing animation ready!';
});

model.addEventListener('error', event => {
  console.error('3D model loading error:', event);
  controls.forEach(button => button.disabled = true);
  status.textContent = 'Could not load the 3D model. Check the file path and browser console.';
});

playBtn.addEventListener('click', () => {
  model.play();
  status.textContent = 'Animation playing';
});
pauseBtn.addEventListener('click', () => {
  model.pause();
  status.textContent = 'Animation paused';
});
resetBtn.addEventListener('click', () => {
  model.pause();
  model.currentTime = 0;
  status.textContent = 'Animation reset';
});
