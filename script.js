// Initialize Lenis
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 0.8,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Custom Magnetic Cursor
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const magneticElements = document.querySelectorAll('[data-magnetic], a, button');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let followerX = mouseX;
let followerY = mouseY;
let isHovering = false;
let hoverTarget = null;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate cursor dot update
    gsap.to(cursor, {
        x: mouseX - 3,
        y: mouseY - 3,
        duration: 0,
        ease: "none"
    });
});

gsap.ticker.add(() => {
    if (isHovering && hoverTarget) {
        // Magnetic snapping logic
        const rect = hoverTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Pull the follower slightly towards the center of the element
        const distX = (mouseX - centerX) * 0.3;
        const distY = (mouseY - centerY) * 0.3;
        
        followerX += ((centerX + distX) - followerX) * 0.1;
        followerY += ((centerY + distY) - followerY) * 0.1;
        
        // Pull the element itself slightly
        gsap.to(hoverTarget, {
            x: distX,
            y: distY,
            duration: 0.6,
            ease: "power2.out"
        });
    } else {
        // Normal lag
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
    }
    
    gsap.set(follower, {
        x: followerX,
        y: followerY
    });
});

magneticElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        isHovering = true;
        hoverTarget = el;
        follower.classList.add('magnetic-hover');
    });
    
    el.addEventListener('mouseleave', () => {
        isHovering = false;
        hoverTarget = null;
        follower.classList.remove('magnetic-hover');
        
        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "power3.out"
        });
    });
});

// 2.5D Mouse Parallax
const depthElements = document.querySelectorAll('[data-depth]');
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5);
    const y = (e.clientY / window.innerHeight - 0.5);
    
    depthElements.forEach(el => {
        const depth = parseFloat(el.getAttribute('data-depth'));
        gsap.to(el, {
            x: x * depth * -150,
            y: y * depth * -150,
            duration: 2,
            ease: "power3.out"
        });
    });
});

// Page Transitions
const pageTransition = document.querySelector('.page-transition');
const pageLinks = document.querySelectorAll('.page-link');

// Entrance Animation
window.addEventListener('load', () => {
    const tl = gsap.timeline();
    
    tl.to(pageTransition, {
        scaleY: 0,
        transformOrigin: "top",
        duration: 1.5,
        ease: "power4.inOut"
    })
    .to('.preloader-text .word', {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "power4.out"
    }, "-=0.5")
    .to('.preloader-text .word', {
        y: -30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.in"
    }, "+=0.5")
    .to('.preloader', {
        opacity: 0,
        duration: 1,
        onComplete: () => {
            document.querySelector('.preloader').style.display = 'none';
            document.body.classList.remove('loading');
            initScrollAnimations();
        }
    })
    .from('.hero-img', {
        scale: 1.1,
        duration: 2.5,
        ease: "power3.out"
    }, "-=1")
    .from('.hero-title .line-inner', {
        yPercent: 120,
        duration: 1.5,
        stagger: 0.2,
        ease: "expo.out"
    }, "-=2")
    .from('.hero-story', {
        opacity: 0,
        y: 30,
        duration: 1.5,
        ease: "power3.out"
    }, "-=1.5");
});

// Exit Animation
pageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Only prevent default if it's an internal link
        if(link.getAttribute('href').startsWith('#')) return;
        
        e.preventDefault();
        const target = link.getAttribute('href');
        
        gsap.to(pageTransition, {
            scaleY: 1,
            transformOrigin: "bottom",
            duration: 1.2,
            ease: "power4.inOut",
            onComplete: () => {
                window.location.href = target;
            }
        });
    });
});

// Scroll Animations
function initScrollAnimations() {
    // Parallax Images
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

    // Image Reveals
    gsap.utils.toArray('.img-mask').forEach(mask => {
        gsap.to(mask, {
            scaleY: 0,
            duration: 1.8,
            ease: "expo.inOut",
            scrollTrigger: {
                trigger: mask.parentElement,
                start: "top 85%"
            }
        });
    });

    // Text Block Reveals
    gsap.utils.toArray('.ed-text-block, .info-block, .ed-section-header').forEach(block => {
        gsap.from(block, {
            y: 60,
            opacity: 0,
            duration: 1.5,
            ease: "expo.out",
            scrollTrigger: {
                trigger: block,
                start: "top 85%",
            }
        });
    });
}

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Modal Logic
const modal = document.querySelector('.modal');
const modalOverlay = document.querySelector('.modal-overlay');
const reserveBtns = document.querySelectorAll('.reserve-btn');
const closeBtn = document.querySelector('.modal-close');

function openModal() {
    modal.classList.add('active');
    modalOverlay.classList.add('active');
    lenis.stop(); 
    
    gsap.fromTo('.modal-content > *', 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "expo.out", delay: 0.3 }
    );
}

function closeModal() {
    modal.classList.remove('active');
    modalOverlay.classList.remove('active');
    lenis.start();
}

reserveBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
}));

closeBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

const form = document.querySelector('.reserve-form');
if(form) {
    form.addEventListener('submit', (e) => {
        const btn = form.querySelector('.submit-btn');
        const originalText = btn.innerText;
        
        btn.innerText = 'Confirmed';
        
        setTimeout(() => {
            closeModal();
            setTimeout(() => {
                btn.innerText = originalText;
                form.reset();
            }, 800);
        }, 1500);
    });
}
