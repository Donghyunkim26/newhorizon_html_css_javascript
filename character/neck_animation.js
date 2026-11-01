import "https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js";

// Each card owns its own model-viewer, animation and controls.
document.querySelectorAll(".animation-card").forEach((card) => {
  const viewer = card.querySelector("model-viewer");
  const status = card.querySelector(".status");
  const play = card.querySelector(".play");
  const pause = card.querySelector(".pause");
  const reset = card.querySelector(".reset");
  const requestedName = card.dataset.animation;
  let ready = false;

  viewer.addEventListener("load", () => {
    // Blender export contains "Jumping Jacks " with a trailing space.
    const exactName = viewer.availableAnimations.find(
      name => name.trim().toLowerCase() === requestedName.trim().toLowerCase()
    );
    if (!exactName) {
      status.textContent = `Animation not found: ${requestedName}`;
      console.error("Available animations:", viewer.availableAnimations);
      return;
    }
    viewer.animationName = exactName;
    viewer.pause();
    viewer.currentTime = 0;
    ready = true;
    [play, pause, reset].forEach(button => button.disabled = false);
    status.textContent = "Ready — click Play";
  });

  viewer.addEventListener("error", event => {
    status.textContent = "Model failed to load. Check the GLB path and browser console.";
    console.error(`Error loading ${requestedName}:`, event);
  });

  play.addEventListener("click", () => {
    if (!ready) return;
    viewer.play();
    status.textContent = "Playing";
  });
  pause.addEventListener("click", () => {
    if (!ready) return;
    viewer.pause();
    status.textContent = "Paused";
  });
  reset.addEventListener("click", () => {
    if (!ready) return;
    viewer.pause();
    viewer.currentTime = 0;
    status.textContent = "Reset to beginning";
  });
});
