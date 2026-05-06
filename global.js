// --- LIBRARIES ---
let lenis;
if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
        duration: 2.0, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 0.8,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    } else {
        requestAnimationFrame(function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        });
    }
}

// --- MAGNETIC CURSOR ---
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const magneticElements = document.querySelectorAll('[data-magnetic], a, button');

let mouseX = -100;
let mouseY = -100;
let cursorX = -100;
let cursorY = -100;
let followerX = -100;
let followerY = -100;
let followerScale = 1;
let isHovering = false;
let hoverTarget = null;

// Touch detection for mobile safety
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia("(pointer: coarse)").matches;

if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant dot follow without GSAP overhead
        if (cursor && typeof gsap === 'undefined') {
            cursor.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;
        }
    });

    if (typeof gsap !== 'undefined') {
        gsap.ticker.add(() => {
            if (!cursor || !follower) return;

            // Dot follows instantly but is managed in RAF for sync
            cursorX += (mouseX - cursorX) * 0.9;
            cursorY += (mouseY - cursorY) * 0.9;
            
            let targetScale = 1;
            let speed = 0.25; // Faster interpolation for lower latency

            if (isHovering && hoverTarget) {
                const rect = hoverTarget.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // Pull follower towards center
                const distX = (mouseX - centerX) * 0.15;
                const distY = (mouseY - centerY) * 0.15;
                
                followerX += ((centerX + distX) - followerX) * speed;
                followerY += ((centerY + distY) - followerY) * speed;
                targetScale = 1.6;

                gsap.to(hoverTarget, {
                    x: distX * 0.4, y: distY * 0.4, duration: 0.5, ease: "power2.out"
                });
            } else {
                followerX += (mouseX - followerX) * speed;
                followerY += (mouseY - followerY) * speed;
            }
            
            followerScale += (targetScale - followerScale) * 0.15;

            // Direct hardware-accelerated DOM assignment is fastest
            cursor.style.transform = `translate3d(${cursorX - 3}px, ${cursorY - 3}px, 0)`;
            follower.style.transform = `translate3d(${followerX - 20}px, ${followerY - 20}px, 0) scale(${followerScale})`;
        });

        magneticElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                isHovering = true; hoverTarget = el;
                if(follower) follower.classList.add('magnetic-hover');
            });
            el.addEventListener('mouseleave', () => {
                isHovering = false; hoverTarget = null;
                if(follower) follower.classList.remove('magnetic-hover');
                gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "power3.out" });
            });
        });
    } else {
        // Ultimate fallback
        function updateFallback() {
            if (!follower) return;
            followerX += (mouseX - followerX) * 0.2;
            followerY += (mouseY - followerY) * 0.2;
            follower.style.transform = `translate3d(${followerX - 20}px, ${followerY - 20}px, 0)`;
            requestAnimationFrame(updateFallback);
        }
        updateFallback();
    }
}

// --- 2.5D PARALLAX DEPTH ---
const depthElements = document.querySelectorAll('[data-depth]');
if (typeof gsap !== 'undefined') {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5);
        const y = (e.clientY / window.innerHeight - 0.5);
        
        depthElements.forEach(el => {
            const depth = parseFloat(el.getAttribute('data-depth'));
            gsap.to(el, {
                x: x * depth * -80,
                y: y * depth * -80,
                duration: 3,
                ease: "expo.out"
            });
        });
    });
}

// --- PAGE TRANSITION & PRELOADER ---
const pageTransition = document.querySelector('.page-transition');
const preloader = document.querySelector('.preloader');
const pageLinks = document.querySelectorAll('.page-link');

function unlockPage() {
    document.body.classList.remove('loading');
    if (pageTransition) {
        pageTransition.style.display = 'none';
        pageTransition.style.opacity = '0';
    }
    if (preloader) {
        preloader.style.display = 'none';
        preloader.style.opacity = '0';
    }
}

// Failsafe unlock after 3 seconds in case GSAP load event gets permanently blocked
setTimeout(unlockPage, 3500);

window.addEventListener('load', () => {
    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline({
            onComplete: () => {
                unlockPage();
                initScrollAnimations();
            }
        });
        
        if (preloader) {
            tl.to('.preloader-text .word', {
                y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power4.out"
            })
            .to('.preloader-text .word', {
                y: -30, opacity: 0, duration: 0.8, stagger: 0.05, ease: "power3.in"
            }, "+=0.3")
            .to(preloader, { opacity: 0, duration: 1 }, "-=0.2");
        }
        
        if (pageTransition && !preloader) {
            tl.to(pageTransition, {
                opacity: 0, duration: 2.5, ease: "power3.inOut"
            });
        } else if (pageTransition) {
            tl.to(pageTransition, {
                opacity: 0, duration: 1.5, ease: "power3.inOut"
            }, "-=1");
        }
        
        gsap.from('.hero-img, .page-hero-img', {
            scale: 1.05, filter: "brightness(0.5)", duration: 3, ease: "power2.out"
        });

        gsap.from('.ed-title, .hero-title', {
            y: 40, opacity: 0, duration: 2, ease: "expo.out", delay: 0.5, stagger: 0.1
        });

        gsap.from('.hero-story, .page-desc', {
            y: 20, opacity: 0, duration: 2, ease: "expo.out", delay: 0.8
        });

    } else {
        unlockPage();
        initScrollAnimations();
    }
});

pageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        if(link.getAttribute('href').startsWith('#')) return;
        
        e.preventDefault();
        const target = link.getAttribute('href');
        
        if (pageTransition && typeof gsap !== 'undefined') {
            pageTransition.style.display = 'block';
            gsap.to(pageTransition, {
                opacity: 1,
                duration: 1.5,
                ease: "power3.inOut",
                onComplete: () => window.location.href = target
            });
        } else {
            window.location.href = target;
        }
    });
});

// --- NAVBAR SCROLL ---
const navbar = document.querySelector('.navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// --- SCROLL ANIMATIONS ---
function initScrollAnimations() {
    if (typeof ScrollTrigger === 'undefined' || typeof gsap === 'undefined') return;

    gsap.utils.toArray('.parallax-img').forEach(img => {
        const wrap = img.parentElement;
        const speed = parseFloat(wrap.parentElement.getAttribute('data-speed') || 1);
        
        gsap.to(img, {
            yPercent: (1 - speed) * 50,
            ease: "none",
            scrollTrigger: {
                trigger: wrap,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    gsap.utils.toArray('.img-mask').forEach(mask => {
        gsap.to(mask, {
            scaleY: 0,
            duration: 2.5,
            ease: "expo.inOut",
            scrollTrigger: {
                trigger: mask.parentElement,
                start: "top 85%"
            }
        });
    });

    gsap.utils.toArray('.ed-text-block, .info-block, .ed-section-header').forEach(block => {
        gsap.from(block, {
            y: 60,
            opacity: 0,
            duration: 2,
            ease: "expo.out",
            scrollTrigger: {
                trigger: block,
                start: "top 85%",
            }
        });
    });
}
