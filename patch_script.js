const fs = require('fs');

let content = fs.readFileSync('script.js', 'utf8');

// Find the block from "const donors = [" to "pieLegend.innerHTML = legendHTML;\n    }"
let startString = "const donors = [";
let endString = "pieLegend.innerHTML = legendHTML;\n    }";

let startIndex = content.indexOf(startString);
let endIndex = content.indexOf(endString) + endString.length;

if(startIndex > -1 && endIndex > -1) {
    let pieChartLogic = `const donors = [
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
            const color = slice.isOthers ? '#445566' : \`hsl(\${(idx * 360 / (mainSlices.length-1 || 1)) % 360}, 80%, 60%)\`;
            
            const x1 = Math.cos(currentAngle) * 100;
            const y1 = Math.sin(currentAngle) * 100;
            const x2 = Math.cos(currentAngle + angle) * 100;
            const y2 = Math.sin(currentAngle + angle) * 100;
            const largeArc = angle > Math.PI ? 1 : 0;
            
            const pathData = \`M 0 0 L \${x1} \${y1} A 100 100 0 \${largeArc} 1 \${x2} \${y2} Z\`;
            
            const g = document.createElementNS(svgNs, 'g');
            g.classList.add('pie-g-slice');
            
            const path = document.createElementNS(svgNs, 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', color);
            path.setAttribute('stroke', '#0a141e');
            path.setAttribute('stroke-width', '2');
            
            const midAngle = currentAngle + angle / 2;
            const lineStartX = Math.cos(midAngle) * 100;
            const lineStartY = Math.sin(midAngle) * 100;
            const lineEndX = Math.cos(midAngle) * 130;
            const lineEndY = Math.sin(midAngle) * 130;
            const isRight = Math.cos(midAngle) > 0;
            const textX = isRight ? lineEndX + 10 : lineEndX - 10;
            
            const linePath = document.createElementNS(svgNs, 'path');
            linePath.setAttribute('d', \`M \${lineStartX} \${lineStartY} L \${lineEndX} \${lineEndY} L \${textX} \${lineEndY}\`);
            linePath.setAttribute('fill', 'none');
            linePath.setAttribute('stroke', color);
            linePath.setAttribute('stroke-width', '2');
            linePath.classList.add('pie-label-line');
            
            const tooltipHTML = document.createElement('div');
            tooltipHTML.classList.add('pie-tooltip');
            if (slice.isOthers) {
                let listHtml = slice.list.map(d=>\`<div>\${d.name}: \${d.amountStr}</div>\`).join('');
                tooltipHTML.innerHTML = \`<strong>\${slice.name}</strong><br/>\${slice.amountStr}<hr/>\${listHtml}\`;
            } else {
                tooltipHTML.innerHTML = \`<strong>\${slice.name}</strong><br/>\${slice.amountStr}\`;
            }
            
            g.appendChild(path);
            g.appendChild(linePath);
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
    }`;
    let newContent = content.substring(0, startIndex) + pieChartLogic + content.substring(endIndex);
    fs.writeFileSync('script.js', newContent);
    console.log("Updated script.js successfully.");
} else {
    console.log("Could not find target block in script.js");
}
