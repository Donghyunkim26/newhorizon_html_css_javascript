const checkInMessages = {
	light: 'A lighter day still deserves care. Keep one small thing that helps you feel steady.',
	busy: 'A busy day can use a pause. Choose one task, one breath, and one next step.',
	heavy: 'That sounds like a lot to carry. Consider reaching out to someone you trust for support.'
};

const checkInOptions = document.querySelectorAll('.check-in-options button');
const checkInResponse = document.querySelector('.check-in-response');
const savedCheckIn = localStorage.getItem('new-horizon-stress-check-in');

const selectCheckIn = (option) => {
	checkInOptions.forEach((button) => {
		button.classList.remove('selected', 'is-selected');
	});
	option.classList.add('selected');
	checkInResponse.textContent = checkInMessages[option.dataset.level] || '';
	localStorage.setItem('new-horizon-stress-check-in', option.dataset.level);
};

checkInOptions.forEach((option) => {
	option.addEventListener('click', () => {
		selectCheckIn(option);
	});
});

if (savedCheckIn) {
	const savedOption = document.querySelector(`[data-level="${savedCheckIn}"]`);
	if (savedOption) selectCheckIn(savedOption);
}

const progressBar = document.querySelector('.reading-progress');
const backToTop = document.querySelector('.back-to-top');
const tocLinks = document.querySelectorAll('.toc a');
const sections = document.querySelectorAll('section[id]');

const updateScrollState = () => {
	const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
	const progress = pageHeight > 0 ? (window.scrollY / pageHeight) * 100 : 0;
	if (progressBar) progressBar.style.width = `${progress}%`;
	if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
};

window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

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

backToTop?.addEventListener('click', () => {
	window.scrollTo({ top: 0, behavior: 'smooth' });
});
