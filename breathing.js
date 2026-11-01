const phases = [
	{ label: 'Breathe in', className: 'inhale' },
	{ label: 'Hold gently', className: 'hold' },
	{ label: 'Breathe out', className: 'exhale' },
	{ label: 'Rest', className: 'rest' }
];
const roundCount = 4;
const secondsPerPhase = 4;
const totalPhases = phases.length * roundCount;
const orb = document.getElementById('breathingOrb');
const phaseLabel = document.getElementById('phaseLabel');
const timeLabel = document.getElementById('timeLabel');
const progress = document.getElementById('practiceProgress');
const progressFill = document.getElementById('progressFill');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
let phaseIndex = 0;
let secondsLeft = secondsPerPhase;
let timerId = null;

const updateProgress = () => {
	const completed = phaseIndex;
	progress?.setAttribute('aria-valuenow', String(completed));
	if (progressFill) progressFill.style.width = `${(completed / totalPhases) * 100}%`;
};

const showPhase = () => {
	const phase = phases[phaseIndex % phases.length];
	if (orb) {
		orb.classList.remove('inhale', 'hold', 'exhale', 'rest');
		orb.classList.add(phase.className);
	}
	if (phaseLabel) phaseLabel.textContent = phase.label;
	if (timeLabel) timeLabel.textContent = `Round ${Math.floor(phaseIndex / phases.length) + 1} of ${roundCount} · ${secondsLeft} seconds`;
};

const finishPractice = () => {
	window.clearInterval(timerId);
	timerId = null;
	orb?.classList.remove('inhale', 'hold', 'exhale', 'rest');
	if (phaseLabel) phaseLabel.textContent = 'Practice complete';
	if (timeLabel) timeLabel.textContent = 'Take a moment before returning to your day.';
	if (progress) progress.setAttribute('aria-valuenow', String(totalPhases));
	if (progressFill) progressFill.style.width = '100%';
	startButton.hidden = true;
	pauseButton.hidden = true;
	resetButton.hidden = false;
};

const startPractice = () => {
	if (timerId !== null) return;
	startButton.hidden = true;
	pauseButton.hidden = false;
	resetButton.hidden = false;
	showPhase();

	timerId = window.setInterval(() => {
		secondsLeft -= 1;
		if (secondsLeft <= 0) {
			phaseIndex += 1;
			if (phaseIndex >= totalPhases) {
				finishPractice();
				return;
			}
			secondsLeft = secondsPerPhase;
			updateProgress();
		}
		showPhase();
	}, 1000);
};

const pausePractice = () => {
	if (timerId === null) return;
	window.clearInterval(timerId);
	timerId = null;
	orb?.classList.remove('inhale', 'hold', 'exhale', 'rest');
	if (phaseLabel) phaseLabel.textContent = 'Paused';
	if (timeLabel) timeLabel.textContent = 'Resume when you feel ready.';
	startButton.textContent = 'Resume practice';
	startButton.hidden = false;
	pauseButton.hidden = true;
};

const resetPractice = () => {
	window.clearInterval(timerId);
	timerId = null;
	phaseIndex = 0;
	secondsLeft = secondsPerPhase;
	orb?.classList.remove('inhale', 'hold', 'exhale', 'rest');
	if (phaseLabel) phaseLabel.textContent = 'Ready when you are';
	if (timeLabel) timeLabel.textContent = `A gentle four-count rhythm · ${roundCount} rounds`;
	if (progress) progress.setAttribute('aria-valuenow', '0');
	if (progressFill) progressFill.style.width = '0%';
	startButton.textContent = 'Start practice';
	startButton.hidden = false;
	pauseButton.hidden = true;
	resetButton.hidden = true;
};

startButton?.addEventListener('click', startPractice);
pauseButton?.addEventListener('click', pausePractice);
resetButton?.addEventListener('click', resetPractice);

const tocLinks = Array.from(document.querySelectorAll('.toc a[href^="#"]'));
const sections = tocLinks
	.map((link) => document.querySelector(link.getAttribute('href')))
	.filter((section) => section instanceof HTMLElement);

const setActiveSection = (sectionId) => {
	tocLinks.forEach((link) => {
		const isActive = link.hash === `#${sectionId}`;
		link.classList.toggle('active', isActive);
		if (isActive) link.setAttribute('aria-current', 'location');
		else link.removeAttribute('aria-current');
	});
};

if ('IntersectionObserver' in window) {
	const observer = new IntersectionObserver((entries) => {
		const visibleSections = entries
			.filter((entry) => entry.isIntersecting)
			.sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);
		if (visibleSections.length) setActiveSection(visibleSections[0].target.id);
	}, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
	sections.forEach((section) => observer.observe(section));
}

const initialSection = sections.find((section) => `#${section.id}` === window.location.hash);
if (initialSection) setActiveSection(initialSection.id);
else if (sections[0]) setActiveSection(sections[0].id);



