const senseInputs = Array.from(document.querySelectorAll('#senseList input[type="checkbox"]'));
const checklistStatus = document.getElementById('checklistStatus');
const tocLinks = Array.from(document.querySelectorAll('.toc a[href^="#"]'));
const sections = tocLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter((section) => section instanceof HTMLElement);

const updateChecklist = () => {
    if (!checklistStatus) return;

    const completed = senseInputs.filter((input) => input.checked).length;
    checklistStatus.textContent = `${completed} of ${senseInputs.length} noticed`;
};

senseInputs.forEach((input) => input.addEventListener('change', updateChecklist));
updateChecklist();

const setActiveSection = (sectionId) => {
    tocLinks.forEach((link) => {
        const isActive = link.hash === `#${sectionId}`;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    });
};

if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        const visibleSections = entries
            .filter((entry) => entry.isIntersecting)
            .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);

        if (visibleSections.length) setActiveSection(visibleSections[0].target.id);
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });

    sections.forEach((section) => sectionObserver.observe(section));
}

const initialSection = sections.find((section) => `#${section.id}` === window.location.hash);
if (initialSection) setActiveSection(initialSection.id);
else if (sections[0]) setActiveSection(sections[0].id);
