// Mommy Milk Bar - Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Interactive Countdown Functionality (Onboarding-style Demo)
    const demoSlider = document.getElementById('demoSlider');
    const mimiChar = document.getElementById('mimiChar');
    const statusCard = document.getElementById('statusCard');
    const statusCountdown = document.getElementById('statusCountdown');
    const sliderProgress = document.getElementById('sliderProgress');

    if (demoSlider && mimiChar && statusCard && statusCountdown && sliderProgress) {
        const pinkGradient = 'linear-gradient(135deg, #F49B9B 0%, #E47C7C 100%)';

        demoSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            const totalMinutes = 120; // Total time needed (2 hours)
            const remainingMinutes = Math.max(0, totalMinutes - value);

            // Calculate hours and minutes for countdown
            const hours = Math.floor(remainingMinutes / 60);
            const minutes = remainingMinutes % 60;
            const countdownText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

            // Update progress bar
            const percentage = (value / 180) * 100;
            sliderProgress.style.width = percentage + '%';

            // Update countdown display
            statusCountdown.textContent = countdownText;

            // Update Mimi character and status based on time
            if (value >= totalMinutes) {
                // Safe to feed - show open Mimi
                mimiChar.src = 'assets/images/open_mimi.png';
                mimiChar.alt = 'Open Mimi';

                // Status card stays pink
                statusCard.style.background = pinkGradient;
                statusCard.querySelector('.status-text').textContent = 'Open!';
                statusCard.querySelector('.status-subtext').textContent = 'Je kunt weer voeden';
            } else if (value >= totalMinutes * 0.75) {
                // Almost there - show sleeping Mimi
                mimiChar.src = 'assets/images/sleeping_mimi_2.png';
                mimiChar.alt = 'Sleeping Mimi';

                // Status card stays pink
                statusCard.style.background = pinkGradient;
                statusCard.querySelector('.status-text').textContent = 'Bijna daar';
                statusCard.querySelector('.status-subtext').textContent = 'Nog eventjes geduld';
            } else {
                // Not safe yet - show closed Mimi
                mimiChar.src = 'assets/images/closed_mimi.png';
                mimiChar.alt = 'Closed Mimi';

                // Status card stays pink
                statusCard.style.background = pinkGradient;
                statusCard.querySelector('.status-text').textContent = 'Nog niet open';
                statusCard.querySelector('.status-subtext').textContent = 'Even geduld nog';
            }
        });

        // Initialize slider position
        demoSlider.value = 95;
        demoSlider.dispatchEvent(new Event('input'));
    }

    // Handle download link clicks
    const downloadLinks = document.querySelectorAll('.download-link');

    downloadLinks.forEach(link => {
        link.addEventListener('click', function(e) {
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
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#download') {
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

    // Add fade-in animation on scroll for feature cards
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

    // Observe feature cards with fade-in animation
    document.querySelectorAll('.feature-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Observe values columns with fade-in animation
    document.querySelectorAll('.values-column').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add subtle animation to phone images on scroll
    const phoneObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'scale(1)';
                }, index * 100); // Stagger animation
            }
        });
    }, observerOptions);

    document.querySelectorAll('.phone-item').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.9)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        phoneObserver.observe(el);
    });

    // Parallax effect for hero background (optional, subtle effect)
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            heroBackground.style.transform = `matrix(1, 0.1, -0.11, 0.99, 0, ${rate}px)`;
        });
    }
});
