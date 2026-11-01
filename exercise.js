const movementInputs = Array.from(document.querySelectorAll('#movementChecklist input[type="checkbox"]'));
const movementStatus = document.getElementById('movementStatus');
const progressBar = document.querySelector('.reading-progress');
const backToTop = document.querySelector('.back-to-top');
const tocLinks = Array.from(document.querySelectorAll('.toc a[href^="#"]'));
const sections = tocLinks
	.map((link) => document.querySelector(link.getAttribute('href')))
	.filter((section) => section instanceof HTMLElement);

const updateMovementStatus = () => {
	if (!movementStatus) return;

	const completed = movementInputs.filter((input) => input.checked).length;
	movementStatus.textContent = `${completed} of ${movementInputs.length} steps complete`;
};

movementInputs.forEach((input) => input.addEventListener('change', updateMovementStatus));
updateMovementStatus();

const updateScrollState = () => {
	const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
	const progress = pageHeight > 0 ? (window.scrollY / pageHeight) * 100 : 0;

	if (progressBar) progressBar.style.width = `${progress}%`;
	if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
};

window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

backToTop?.addEventListener('click', () => {
	window.scrollTo({ top: 0, behavior: 'smooth' });
});

const setActiveSection = (sectionId) => {
	tocLinks.forEach((link) => {
		const isActive = link.hash === `#${sectionId}`;
		link.classList.toggle('active', isActive);

		if (isActive) {
			link.setAttribute('aria-current', 'location');
		} else {
			link.removeAttribute('aria-current');
		}
	});
};

tocLinks.forEach((link) => {
	link.addEventListener('click', () => setActiveSection(link.hash.slice(1)));
});

if ('IntersectionObserver' in window) {
	const sectionObserver = new IntersectionObserver((entries) => {
		const visibleSections = entries
			.filter((entry) => entry.isIntersecting)
			.sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);

		if (visibleSections.length) {
			setActiveSection(visibleSections[0].target.id);
		}
	}, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });

	sections.forEach((section) => sectionObserver.observe(section));
} else {
	const updateActiveSection = () => {
		const activationPoint = window.innerHeight * 0.3;
		let activeSection = sections[0];

		sections.forEach((section) => {
			if (section.getBoundingClientRect().top <= activationPoint) {
				activeSection = section;
			}
		});

		if (activeSection) setActiveSection(activeSection.id);
	};

	window.addEventListener('scroll', updateActiveSection, { passive: true });
	window.addEventListener('resize', updateActiveSection);
}

const initialSection = sections.find((section) => `#${section.id}` === window.location.hash);
if (initialSection) {
	setActiveSection(initialSection.id);
} else if (sections[0]) {
	setActiveSection(sections[0].id);
}
