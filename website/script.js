// Simple script for landing page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Handle download button click
    const downloadBtn = document.getElementById('downloadBtn');

    downloadBtn.addEventListener('click', function(e) {
        e.preventDefault();

        // Check if iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (isIOS) {
            // TODO: Replace with actual App Store link when available
            alert('De app is binnenkort beschikbaar in de App Store!');
            // window.location.href = 'https://apps.apple.com/app/your-app-id';
        } else {
            alert('Mommy Milk Bar is momenteel alleen beschikbaar voor iPhone. Bezoek deze pagina op je iPhone om de app te downloaden!');
        }
    });

    // Add smooth scrolling for any future anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Add fade-in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards and steps
    document.querySelectorAll('.feature-card, .step').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
