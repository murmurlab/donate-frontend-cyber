// Configuration
const CONFIG = {
    targetAmount: 100000,
    currentAmount: 45670, // Simulated current donation
    supporters: 342,
    animationDuration: 2000
};

// Matrix rain effect
class MatrixRain {
    constructor() {
        this.canvas = document.getElementById('matrix-bg');
        this.ctx = this.canvas.getContext('2d');
        this.chars = '01';
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.init();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(1);
    }
    
    init() {
        setInterval(() => this.draw(), 50);
    }
    
    draw() {
        this.ctx.fillStyle = 'rgba(13, 13, 13, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ff41';
        this.ctx.font = this.fontSize + 'px monospace';
        
        for (let i = 0; i < this.drops.length; i++) {
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            
            this.ctx.fillText(char, x, y);
            
            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
    }
}

// Progress bar animation
class DonationProgress {
    constructor() {
        this.percentage = 0;
        this.targetPercentage = (CONFIG.currentAmount / CONFIG.targetAmount) * 100;
        this.waterFill = document.getElementById('water-fill');
        this.percentageText = document.getElementById('percentage-text');
        this.progressPercent = document.getElementById('progress-percent');
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
        
        // Increase matrix intensity based on progress
        this.updateMatrixIntensity();
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
    
    updateMatrixIntensity() {
        const intensity = 0.15 + (this.percentage / 100) * 0.25;
        document.getElementById('matrix-bg').style.opacity = intensity;
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
    // Start matrix rain
    new MatrixRain();
    
    // Animate progress
    new DonationProgress();
    
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
