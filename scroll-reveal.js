document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 2. Inject Animation CSS
    const style = document.createElement('style');
    style.textContent = `
        .reveal-element {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s cubic-bezier(0.5, 0, 0, 1), transform 0.8s cubic-bezier(0.5, 0, 0, 1);
            will-change: opacity, transform;
        }
        .reveal-visible {
            opacity: 1;
            transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
            .reveal-element {
                opacity: 1;
                transform: none;
                transition: none;
            }
        }
    `;
    document.head.appendChild(style);

    // 3. Select Elements to Animate
    const elementsToAnimate = document.querySelectorAll(
        'section, main > div:not(.absolute), footer, .glass-card, .glass'
    );
    
    // 4. Apply Base Styles & Observe
    elementsToAnimate.forEach((el, index) => {
        // Skip navigation/header elements to keep them static
        if (el.closest('nav') || el.closest('header')) return;
        
        el.classList.add('reveal-element');
        
        // Stagger animations slightly if elements appear together
        el.style.transitionDelay = `${(index % 3) * 0.1}s`;
        
        observer.observe(el);
    });
});
