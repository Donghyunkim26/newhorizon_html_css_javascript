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
            tocLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
        });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
}

backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));