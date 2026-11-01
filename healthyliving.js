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

  // Maps each card to where its button should take the user.
  // Replace these paths with your real page/section URLs.
  const cardDestinations = {
        'healthy-food': 'healthyfood.html',
        'stress-management': 'stress.html',
        'physical-activity': 'physicalactivity.html',
    'healthy-living': 'about.html#healthy-living',
    'interactive-learning': 'learning.html',      // e.g. a page with the quizzes/mini games
    'community-support': 'community.html'         // e.g. a page/section for support groups
  };

  function goTo(cardKey) {
    const destination = cardDestinations[cardKey];
    if (destination) {
      window.location.href = destination;
    }
  }