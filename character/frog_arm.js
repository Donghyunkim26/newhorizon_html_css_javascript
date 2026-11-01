import 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js';

const model = document.querySelector('#frog');
const status = document.querySelector('#status');
const buttons = ['play','pause','reset'].map(id => document.getElementById(id));
let ready = false;

model.addEventListener('load', () => {
  console.log('Available animations:', model.availableAnimations);
  if (!model.availableAnimations.length) {
    status.textContent = 'Model loaded, but no animations were found.';
    return;
  }
  model.animationName = model.availableAnimations.includes('mixamo.com')
    ? 'mixamo.com' : model.availableAnimations[0];
  model.loop = true;
  model.pause();
  model.currentTime = 0;
  ready = true;
  buttons.forEach(button => button.disabled = false);
  status.textContent = 'Frog arm animation ready.';
});

model.addEventListener('error', event => {
  console.error('3D model loading error:', event);
  status.textContent = 'Could not load the 3D model. Check the file path and browser console.';
});

document.getElementById('play').addEventListener('click', () => {
  if (!ready) return;
  model.play();
  status.textContent = 'Animation playing.';
});
document.getElementById('pause').addEventListener('click', () => {
  if (!ready) return;
  model.pause();
  status.textContent = 'Animation paused.';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!ready) return;
  model.pause();
  model.currentTime = 0;
  status.textContent = 'Animation reset.';
});
