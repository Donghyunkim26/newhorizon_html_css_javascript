const tocLinks = Array.from(document.querySelectorAll('.toc a[href^="#"]'));
const sections = tocLinks
	.map((link) => document.querySelector(link.getAttribute('href')))
	.filter((section) => section instanceof HTMLElement);

if (tocLinks.length && sections.length) {
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

	const updateActiveSection = () => {
		const activationPoint = window.innerHeight * 0.3;
		let activeSection = sections[0];

		sections.forEach((section) => {
			if (section.getBoundingClientRect().top <= activationPoint) {
				activeSection = section;
			}
		});

		setActiveSection(activeSection.id);
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
		}, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });

		sections.forEach((section) => sectionObserver.observe(section));
	} else {
		window.addEventListener('scroll', updateActiveSection, { passive: true });
		window.addEventListener('resize', updateActiveSection);
	}

	const initialSection = sections.find((section) => `#${section.id}` === window.location.hash);
	setActiveSection(initialSection?.id ?? sections[0].id);
}