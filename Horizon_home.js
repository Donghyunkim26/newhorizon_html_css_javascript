document.addEventListener("DOMContentLoaded", () => {

    const navLinks = document.querySelectorAll(".navbar a, .nav-cta, .home-text .btn");
    const sections = document.querySelectorAll("section[id]");

    // Smooth Scroll
    navLinks.forEach(link => {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (!targetId || !targetId.startsWith("#")) return;

            const targetSection = document.querySelector(targetId);

            if (!targetSection) return;

            event.preventDefault();

            targetSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });

    // Active Navigation
    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            const activeId = "#" + entry.target.id;

            navLinks.forEach(link => {

                // Skip buttons
                if (link.classList.contains("btn")) return;

                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === activeId
                );

            });

        });

    }, {
        threshold: 0.55,
        rootMargin: "-20% 0px -35% 0px"
    });

    sections.forEach(section => observer.observe(section));

});


// Maps each feature button to a page that exists in this static website.
const cardDestinations = {
    'healthy-living': 'healthyliving.html',
    'interactive-learning': 'healthgame.html',
    'community-support': 'Horizon_community-support.html',
    'healthyliving.html': 'healthyliving.html',
    'stress-management.html': 'wellbeing.html',
    'physical-activity.html': 'healthyliving.html',
    'learnmore.html': 'learnmore.html',
    'Horizon_healthy-living.html': 'healthyliving.html',
    'Horizon_community-support.html': 'Horizon_community-support.html'
};

function goTo(cardKey) {
    const destination = cardDestinations[cardKey] || cardKey;
    if (destination) {
        window.location.href = destination;
    }
}

function switchLearningPage(page) {
    window.location.href = page === 'menu' ? 'quizmenu.html' : page === 'quiz' ? 'healthgame.html' : 'Horizon_home.html';
}

function switchGameCategory(page) {
    window.location.href = page === 'category' ? 'gamecategory.html' : 'Horizon_home.html';
}
