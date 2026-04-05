/*
 * File: script.js
 */
// Configuration
const CONFIG = {
    targetAmount: 100000,
    currentAmount: 45670,
    supporters: 342,
    animationDuration: 2000
};

// Particle Network Effect
class ParticleNetwork {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 150;
        this.connectionDistance = 180;
        this.mouse = { x: null, y: null, radius: 250 };
        
        this.resize();
        this.init();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
        this.animate();
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.radius * 3
            );
            gradient.addColorStop(0, 'rgba(0, 255, 136, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 136, 255, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
    }
    
    connectParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.connectionDistance) {
                    const opacity = (1 - distance / this.connectionDistance) * 0.5;
                    this.ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse interaction
            if (this.mouse.x != null && this.mouse.y != null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    particle.vx -= Math.cos(angle) * force * 0.2;
                    particle.vy -= Math.sin(angle) * force * 0.2;
                }
            }
            
            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // Keep minimum velocity
            if (Math.abs(particle.vx) < 0.1) particle.vx = (Math.random() - 0.5) * 0.2;
            if (Math.abs(particle.vy) < 0.1) particle.vy = (Math.random() - 0.5) * 0.2;
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawParticles();
        this.connectParticles();
        this.updateParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// Shield Matrix Effect
class ShieldMatrix {
    constructor() {
        this.canvas = document.getElementById('shield-matrix');
        this.ctx = this.canvas.getContext('2d');
        this.chars = '01';
        this.fontSize = 12;
        this.columns = 0;
        this.drops = [];
        this.shieldPath = null;
        this.fillHeight = 240;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createShieldPath();
        this.init();
    }
    
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(1).map(() => Math.floor(Math.random() * -20));
    }
    
    createShieldPath() {
        // Create shield clipping path (scaled to canvas size)
        // Using inner border coordinates to prevent text overflow on outer border
        this.shieldPath = new Path2D();
        const scale = this.canvas.width / 200; // Original viewBox width=200
        this.shieldPath.moveTo(100 * scale, 12 * scale);
        this.shieldPath.lineTo(178 * scale, 41 * scale);
        this.shieldPath.lineTo(178 * scale, 100 * scale);
        this.shieldPath.quadraticCurveTo(178 * scale, 179 * scale, 100 * scale, 228 * scale);
        this.shieldPath.quadraticCurveTo(22 * scale, 179 * scale, 22 * scale, 100 * scale);
        this.shieldPath.lineTo(22 * scale, 41 * scale);
        this.shieldPath.closePath();
    }
    
    setFillHeight(percentage) {
        this.fillHeight = this.canvas.height - (this.canvas.height * (percentage / 100));
    }
    
    init() {
        setInterval(() => this.draw(), 50);
    }
    
    draw() {
        // Clear with transparency
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply shield clipping
        this.ctx.save();
        this.ctx.clip(this.shieldPath);
        
        // Draw matrix only in filled area
        this.ctx.fillStyle = '#00aa44';
        this.ctx.font = this.fontSize + 'px monospace';
        
        for (let i = 0; i < this.drops.length; i++) {
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            
            // Only draw if in filled water area
            if (y > this.fillHeight) {
                const opacity = Math.min((y - this.fillHeight) / 50, 0.7);
                this.ctx.fillStyle = `rgba(0, 100, 40, ${opacity})`;
                this.ctx.fillText(char, x, y);
            }
            
            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = Math.floor(this.fillHeight / this.fontSize);
            }
            this.drops[i]++;
        }
        
        this.ctx.restore();
    }
}

// Progress bar animation
class DonationProgress {
    constructor(shieldMatrix) {
        this.percentage = 0;
        this.targetPercentage = (CONFIG.currentAmount / CONFIG.targetAmount) * 100;
        this.waterFill = document.getElementById('water-fill');
        this.percentageText = document.getElementById('percentage-text');
        this.progressPercent = document.getElementById('progress-percent');
        this.shieldMatrix = shieldMatrix;
        this.waves = [
            document.getElementById('wave1'),
            document.getElementById('wave2'),
            document.getElementById('wave3')
        ];
        
        this.init();
    }
    
    init() {
        this.animateProgress();
        this.animateWaves();
    }
    
    animateProgress() {
        const startTime = Date.now();
        const duration = CONFIG.animationDuration;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            this.percentage = this.targetPercentage * this.easeOutCubic(progress);
            this.updateDisplay();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    updateDisplay() {
        const fillHeight = 240 - (240 * (this.percentage / 100));
        this.waterFill.setAttribute('y', fillHeight);
        this.waterFill.setAttribute('height', 240 - fillHeight);
        
        const roundedPercent = Math.round(this.percentage);
        this.percentageText.textContent = roundedPercent + '%';
        this.progressPercent.textContent = roundedPercent;
        
        // Update wave positions
        this.waves.forEach((wave, index) => {
            const waveY = fillHeight + (index * 5);
            const d = `M0,${waveY} Q50,${waveY - 10} 100,${waveY} T200,${waveY} L200,240 L0,240 Z`;
            wave.setAttribute('d', d);
        });
        
        // Update shield matrix fill height (scale from SVG coords to canvas coords)
        if (this.shieldMatrix) {
            this.shieldMatrix.setFillHeight(this.percentage);
        }
    }
    
    animateWaves() {
        let time = 0;
        
        setInterval(() => {
            time += 0.05;
            const fillHeight = 240 - (240 * (this.percentage / 100));
            
            this.waves.forEach((wave, index) => {
                const offset = index * (Math.PI * 2 / 3);
                const waveY = fillHeight + (index * 5);
                const amplitude = 8;
                const frequency = 0.02;
                
                let path = `M0,${waveY}`;
                for (let x = 0; x <= 200; x += 10) {
                    const y = waveY + Math.sin(x * frequency + time + offset) * amplitude;
                    path += ` L${x},${y}`;
                }
                path += ` L200,240 L0,240 Z`;
                
                wave.setAttribute('d', path);
            });
        }, 50);
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}

// Counter animation
class Counter {
    constructor(elementId, target, prefix = '', suffix = '') {
        this.element = document.getElementById(elementId);
        this.target = target;
        this.current = 0;
        this.prefix = prefix;
        this.suffix = suffix;
        this.duration = CONFIG.animationDuration;
        
        this.animate();
    }
    
    animate() {
        const startTime = Date.now();
        
        const update = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            
            this.current = Math.floor(this.target * this.easeOutCubic(progress));
            this.element.textContent = this.prefix + this.formatNumber(this.current) + this.suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }
    
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Start particle network
    new ParticleNetwork();
    
    // Start shield matrix
    const shieldMatrix = new ShieldMatrix();
    
    // Animate progress
    new DonationProgress(shieldMatrix);
    
    // Animate counters
    new Counter('current-amount', CONFIG.currentAmount, '₺');
    new Counter('target-amount', CONFIG.targetAmount, '₺');
    new Counter('supporter-count', CONFIG.supporters);
    
    // Scrolling donors ticker
    const scrollingDonors = document.querySelector('.scrolling-donors');
    const donors = [
        { name: 'Ahmet Y.', amount: 5000, amountStr: '5,000₺' },
        { name: 'Mehmet K.', amount: 1000, amountStr: '1,000₺' },
        { name: 'Ayşe D.', amount: 250, amountStr: '250₺' },
        { name: 'Fatma S.', amount: 750, amountStr: '750₺' },
        { name: 'Ali R.', amount: 2000, amountStr: '2,000₺' },
        { name: 'Zeynep T.', amount: 300, amountStr: '300₺' },
        { name: 'Can B.', amount: 1500, amountStr: '1,500₺' },
        { name: 'Elif M.', amount: 400, amountStr: '400₺' },
        { name: 'Burak A.', amount: 600, amountStr: '600₺' },
        { name: 'Selin P.', amount: 900, amountStr: '900₺' },
        { name: 'Onur C.', amount: 100, amountStr: '100₺' },
        { name: 'Hasan Y.', amount: 150, amountStr: '150₺' },
        { name: 'Kemal N.', amount: 50, amountStr: '50₺' }
    ];
    
    const pieChart = document.getElementById('donors-pie-chart');
    const pieLegend = document.getElementById('donors-legend');
    
    if (pieChart) {
        if(pieLegend) pieLegend.style.display = 'none'; // Sakla
        const totalAmount = donors.reduce((sum, d) => sum + d.amount, 0);
        
        let mainSlices = [];
        let otherSlices = [];
        
        donors.forEach(d => {
            const pct = d.amount / totalAmount;
            if(pct < 0.025) {
                otherSlices.push(d);
            } else {
                mainSlices.push(d);
            }
        });
        
        mainSlices.sort((a, b) => b.amount - a.amount);
        
        if(otherSlices.length > 0) {
            let othersTotal = otherSlices.reduce((s,d)=>s+d.amount, 0);
            mainSlices.push({
                name: 'Diğer (Küçük Bağışlar)',
                amount: othersTotal,
                amountStr: othersTotal + '₺',
                isOthers: true,
                list: otherSlices
            });
        }
        
        const svgNs = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNs, 'svg');
        svg.setAttribute('viewBox', '-110 -110 220 220');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.overflow = 'visible';
        
        let currentAngle = -Math.PI / 2; // Start at top
        
        pieChart.innerHTML = '';
        pieChart.appendChild(svg);
        
        pieChart.style.background = 'none';
        pieChart.style.border = 'none';
        pieChart.style.boxShadow = 'none';
        pieChart.classList.add('svg-pie-container');
        
        mainSlices.forEach((slice, idx) => {
            const angle = (slice.amount / totalAmount) * Math.PI * 2;
            const color = slice.isOthers ? '#445566' : `hsl(${(idx * 360 / (mainSlices.length-1 || 1)) % 360}, 80%, 60%)`;
            
            const x1 = Math.cos(currentAngle) * 100;
            const y1 = Math.sin(currentAngle) * 100;
            const x2 = Math.cos(currentAngle + angle) * 100;
            const y2 = Math.sin(currentAngle + angle) * 100;
            const largeArc = angle > Math.PI ? 1 : 0;
            
            const pathData = `M 0 0 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;
            
            const g = document.createElementNS(svgNs, 'g');
            g.classList.add('pie-g-slice');
            
            const path = document.createElementNS(svgNs, 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', color);
            path.setAttribute('stroke', '#0a141e');
            path.setAttribute('stroke-width', '0.5');
            
            const tooltipHTML = document.createElement('div');
            tooltipHTML.classList.add('pie-tooltip');
            if (slice.isOthers) {
                let listHtml = slice.list.map(d=>`<div>${d.name}: ${d.amountStr}</div>`).join('');
                tooltipHTML.innerHTML = `<strong>${slice.name}</strong><br/>${slice.amountStr}<hr/>${listHtml}`;
            } else {
                tooltipHTML.innerHTML = `<strong>${slice.name}</strong><br/>${slice.amountStr}`;
            }
            
            g.appendChild(path);
            svg.appendChild(g);
            
            g.addEventListener('mouseenter', (e) => {
                g.classList.add('active');
                tooltipHTML.style.display = 'block';
                tooltipHTML.style.left = e.pageX + 20 + 'px';
                tooltipHTML.style.top = e.pageY - 20 + 'px';
            });
            g.addEventListener('mousemove', (e) => {
                tooltipHTML.style.left = e.pageX + 20 + 'px';
                tooltipHTML.style.top = e.pageY - 20 + 'px';
            });
            g.addEventListener('mouseleave', () => {
                g.classList.remove('active');
                tooltipHTML.style.display = 'none';
            });
            
            document.body.appendChild(tooltipHTML);
            
            currentAngle += angle;
        });
    }

    const donorHTML = donors.map(d => 
        `<span class="donor-item"><span class="name">${d.name}</span><span class="amount">${d.amountStr}</span></span>`
    ).join('');
    
    scrollingDonors.innerHTML = `
        <div class="donor-scroll-content">
            ${donorHTML}${donorHTML}
        </div>
    `;
    
    // Modal functionality
    const navBtns = document.querySelectorAll('.nav-btn');
    const statCards = document.querySelectorAll('.stat-card[data-modal]');
    const modals = document.querySelectorAll('.modal');
    const modalCloses = document.querySelectorAll('.modal-close');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    
    // Open modal from nav buttons
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = 'modal-' + btn.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
            }
        });
    });
    
    // Open modal from stat cards
    statCards.forEach(card => {
        card.addEventListener('click', () => {
            const modalId = 'modal-' + card.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
            }
        });
    });
    
    const closeModal = (modal) => {
        modal.classList.remove('active');
    };
    
    modalCloses.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.closest('.modal'));
        });
    });
    
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            closeModal(overlay.closest('.modal'));
        });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('active')) {
                    closeModal(modal);
                }
            });
        }
    });
    
    // Update current amount periodically (simulating real-time donations)
    setInterval(() => {
        if (Math.random() > 0.7) {
            const randomDonation = Math.floor(Math.random() * 500) + 100;
            CONFIG.currentAmount += randomDonation;
            CONFIG.supporters += 1;
            
            // Update display
            document.getElementById('current-amount').textContent = '₺' + CONFIG.currentAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            document.getElementById('supporter-count').textContent = CONFIG.supporters;
        }
    }, 10000); // Check every 10 seconds
});

// Global copy function for the How To Donate modal
window.copyToClipboard = function(elementId, button) {
    const textToCopy = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => {
            button.innerHTML = originalHTML;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};
