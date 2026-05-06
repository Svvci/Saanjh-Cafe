// Circular Menu Logic
const carousel = document.querySelector('.carousel');
const items = document.querySelectorAll('.carousel-item');
const ring = document.querySelector('.carousel-ring');
const detailsTitle = document.querySelector('.menu-item-title');
const detailsPrice = document.querySelector('.menu-item-price');
const detailsDesc = document.querySelector('.menu-item-desc');

// Position circle center on the far right
gsap.set([carousel, ring], { left: '80%', top: '50%' });

const radius = window.innerWidth * 0.35; // 35vw radius
let targetRotation = 0;
let currentRotation = 0;
let activeIndex = -1;

// Initialize positions
items.forEach((item, i) => {
    const angle = (i / items.length) * Math.PI * 2;
    // Active position is PI (left side of the circle)
    item.baseAngle = angle;
});

function updateCarousel() {
    currentRotation += (targetRotation - currentRotation) * 0.05; // smooth inertia
    
    let closestItem = 0;
    let minDistance = Math.PI * 2;
    
    items.forEach((item, i) => {
        const totalAngle = item.baseAngle + currentRotation;
        
        const x = Math.cos(totalAngle) * radius;
        const y = Math.sin(totalAngle) * radius;
        
        let normalizedAngle = totalAngle % (Math.PI * 2);
        if (normalizedAngle < 0) normalizedAngle += Math.PI * 2;
        
        const distToActive = Math.abs(normalizedAngle - Math.PI);
        if (distToActive < minDistance || Math.abs(distToActive - Math.PI*2) < minDistance) {
            minDistance = Math.min(distToActive, Math.abs(distToActive - Math.PI*2));
            closestItem = i;
        }
        
        const distRatio = Math.min(distToActive, Math.abs(distToActive - Math.PI*2)) / Math.PI;
        const scale = 1 - (distRatio * 0.4);
        const opacity = 1 - (distRatio * 0.8);
        const filter = `blur(${distRatio * 15}px) brightness(${1 - distRatio*0.5})`;
        const zIndex = Math.round(100 - distRatio * 100);
        
        gsap.set(item, {
            x: x - 150, 
            y: y - 200, 
            scale: scale,
            opacity: opacity,
            filter: filter,
            zIndex: zIndex
        });
    });
    
    if (activeIndex !== closestItem) {
        activeIndex = closestItem;
        updateDetails(items[activeIndex]);
    }
    
    requestAnimationFrame(updateCarousel);
}

function updateDetails(activeElement) {
    const title = activeElement.getAttribute('data-title');
    const price = activeElement.getAttribute('data-price');
    const desc = activeElement.getAttribute('data-desc');
    
    const tl = gsap.timeline();
    tl.to('.menu-details > div', {
        y: -20, opacity: 0, duration: 0.3, stagger: 0.05, ease: "power2.in"
    })
    .call(() => {
        detailsTitle.innerText = title;
        detailsPrice.innerText = price;
        detailsDesc.innerText = desc;
    })
    .to('.menu-details > div', {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "expo.out"
    });
}

// Interaction (Wheel)
window.addEventListener('wheel', (e) => {
    targetRotation += e.deltaY * 0.002;
});

// Drag
let isDragging = false;
let lastY = 0;
let velocity = 0;

window.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastY = e.clientY;
    velocity = 0;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaY = e.clientY - lastY;
    velocity = deltaY;
    targetRotation += deltaY * 0.005;
    lastY = e.clientY;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    targetRotation += velocity * 0.05;
});

// Start loop
updateCarousel();
