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
        this.particleCount = 80;
        this.connectionDistance = 150;
        this.mouse = { x: null, y: null, radius: 200 };
        
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
        this.canvas.width = 300;
        this.canvas.height = 360;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(1).map(() => Math.floor(Math.random() * -20));
    }
    
    createShieldPath() {
        // Create shield clipping path (scaled to canvas size)
        this.shieldPath = new Path2D();
        const scale = 1.5; // 300/200 = 1.5
        this.shieldPath.moveTo(100 * scale, 10 * scale);
        this.shieldPath.lineTo(180 * scale, 40 * scale);
        this.shieldPath.lineTo(180 * scale, 100 * scale);
        this.shieldPath.quadraticCurveTo(180 * scale, 180 * scale, 100 * scale, 230 * scale);
        this.shieldPath.quadraticCurveTo(20 * scale, 180 * scale, 20 * scale, 100 * scale);
        this.shieldPath.lineTo(20 * scale, 40 * scale);
        this.shieldPath.closePath();
    }
    
    setFillHeight(percentage) {
        this.fillHeight = 360 - (360 * (percentage / 100));
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
        this.ctx.fillStyle = '#00ff41';
        this.ctx.font = this.fontSize + 'px monospace';
        
        for (let i = 0; i < this.drops.length; i++) {
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            
            // Only draw if in filled water area
            if (y > this.fillHeight) {
                const opacity = Math.min((y - this.fillHeight) / 50, 0.8);
                this.ctx.fillStyle = `rgba(0, 255, 136, ${opacity})`;
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
