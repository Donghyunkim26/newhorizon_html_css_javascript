const backToTopButton = document.querySelector('.back-to-top');
const contentTop = document.querySelector('#content-top');
const progressBar = document.querySelector('.reading-progress');
const tocLinks = document.querySelectorAll('.toc a');
const sections = document.querySelectorAll('section[id]');

const updateBackToTopVisibility = () => {
	backToTopButton?.classList.toggle('is-visible', window.scrollY > 500);
	const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
	const progress = pageHeight > 0 ? (window.scrollY / pageHeight) * 100 : 0;
	if (progressBar) progressBar.style.width = `${progress}%`;
};

window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
updateBackToTopVisibility();

backToTopButton?.addEventListener('click', () => {
	contentTop?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

if ('IntersectionObserver' in window) {
	const sectionObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			tocLinks.forEach((link) => {
				link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
			});
		});
	}, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });

	sections.forEach((section) => sectionObserver.observe(section));
}
