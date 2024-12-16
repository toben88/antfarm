export class AntRacer {
    constructor() {
        this.canvas = document.getElementById('raceTrack');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1600;
        this.canvas.height = 1200;
        
        // Create grass pattern
        this.grassPattern = this.createGrassPattern();
        
        // Update zoom for 40% view (1/0.4 = 2.5)
        this.zoom = 2.5; // Changed from 5 to 2.5
        this.viewWidth = this.canvas.width / this.zoom;
        this.viewHeight = this.canvas.height / this.zoom;
        
        // Scale factors to convert from SVG coordinates to canvas coordinates
        const scaleX = 1600/1000;
        const scaleY = 1200/800;
        
        // Track points based on the SVG map, scaled to fit canvas
        this.trackPoints = [
            // Start/Finish
            {x: 500 * scaleX, y: 700 * scaleY, angle: 0},
            {x: 475 * scaleX, y: 675 * scaleY, angle: -30},
            
            // T1-T2 (snail section)
            {x: 450 * scaleX, y: 650 * scaleY, angle: -45},
            {x: 375 * scaleX, y: 650 * scaleY, angle: -75},
            {x: 300 * scaleX, y: 650 * scaleY, angle: -90},
            {x: 275 * scaleX, y: 575 * scaleY, angle: -110},
            {x: 250 * scaleX, y: 500 * scaleY, angle: -135},
            
            // T3-T4
            {x: 225 * scaleX, y: 400 * scaleY, angle: -160},
            {x: 200 * scaleX, y: 300 * scaleY, angle: -180},
            {x: 250 * scaleX, y: 275 * scaleY, angle: -200},
            {x: 300 * scaleX, y: 250 * scaleY, angle: -225},
            
            // T5-T7 (back straight section)
            {x: 400 * scaleX, y: 200 * scaleY, angle: -270},
            {x: 500 * scaleX, y: 250 * scaleY, angle: 0},
            {x: 600 * scaleX, y: 300 * scaleY, angle: 45},
            
            // T8-T10
            {x: 750 * scaleX, y: 250 * scaleY, angle: 90},
            {x: 800 * scaleX, y: 350 * scaleY, angle: 135},
            
            // T11-T13
            {x: 850 * scaleX, y: 450 * scaleY, angle: 180},
            {x: 750 * scaleX, y: 550 * scaleY, angle: 225},
            {x: 500 * scaleX, y: 600 * scaleY, angle: 270},
            
            // T14-T15 (final section)
            {x: 400 * scaleX, y: 630 * scaleY, angle: 315},
            {x: 300 * scaleX, y: 750 * scaleY, angle: 0},
            
            // Back to Start/Finish
            {x: 400 * scaleX, y: 700 * scaleY, angle: -15},
            {x: 500 * scaleX, y: 700 * scaleY, angle: 0}
        ];
        
        // Color filters for each ant
        this.antFilters = [
            'none',
            'hue-rotate(60deg)',
            'hue-rotate(120deg)',
            'hue-rotate(180deg)',
            'hue-rotate(240deg)',
            'sepia(100%)',
            'invert(100%)',
            'brightness(1.5)'
        ];

        this.ants = [];
        this.antImage = new Image();
        this.antImage.src = 'ant.gif';
        console.log('Loading ant image...');
        this.antImage.onload = () => {
            console.log('Ant image loaded successfully!');
            console.log('Ant image dimensions:', this.antImage.width, this.antImage.height);
            this.initializeAnts();
        };
        this.antImage.onerror = () => {
            console.error('Failed to load ant image!');
        };

        // Sample Solana NFT addresses for each ant
        this.nftAddresses = [
            'DYtrmH3hfNgxR6PGxAHx3nBYwEqgRKcj3qDS3mE1p5LZ',
            'H3vsafyFLWN8aTxqFMYxUwqXzaTmqyBZQw9AyXnmCvHy',
            'BKg5SYtfxEJ6NVtP5JgwGgHKzjRERzXwXVvgkY7XJWGL',
            'EZR8gqjqZHK8TnYaNdAwGXrxdY5Bv8dBt6RHhyzKUYkP',
            '9uhxBmKSYcRqRxd2FvxJqRL7DW8N1TbvZXbfvkLPxwYe',
            'Cx2TuVxzXrxM3ZVF6NRQxhqqR7UPJoCFzwmkLLB9MrKx',
            'AK5LzXbzgJwMXmZYj2VhL8Yqp6W8YfFCeyYHzXs2jScy',
            'GHNWuBqNx9KJeCvcJyogBqEBKTYUvYjH4kTrqkNcDVwR'
        ];

        // Add wavering properties
        this.waveAmplitude = 5; // Maximum pixels of side-to-side movement
        this.waveSpeed = 0.002;   // Speed of the wavering motion

        // Add camera smoothing properties
        this.cameraPosition = { x: 0, y: 0 };
        this.cameraSmoothingFactor = 0.1; // Adjust this to change smoothing amount

        // Add magnifying glass properties
        this.magnifyingGlass = {
            x: 0,
            y: 0,
            radius: 50,
            burnRadius: 8,  // Reduced from 20 to 8
            active: false
        };

        // Add mouse event listeners
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', () => this.magnifyingGlass.active = true);
        this.canvas.addEventListener('mouseup', () => this.magnifyingGlass.active = false);
        
        // Add burning effects properties
        this.burntAnts = new Set();

        // Add array to store scorch marks
        this.scorchMarks = [];
    }

    initializeAnts() {
        for (let i = 0; i < 8; i++) {
            this.ants.push({
                x: 100,
                y: 300 + (i * 15),
                currentWaypoint: 0,
                progress: 0,
                lap: 0,
                filter: this.antFilters[i],
                speed: 0.005 + Math.random() * 0.002,
                nftAddress: this.nftAddresses[i],
                waveOffset: Math.random() * Math.PI * 2, // Random starting phase
                lastWaveAmount: 0 // Store last wave amount for smooth angle calculation
            });
        }
        this.animate();
    }

    moveAnt(ant) {
        const current = this.trackPoints[ant.currentWaypoint];
        const next = this.trackPoints[(ant.currentWaypoint + 1) % this.trackPoints.length];
        
        ant.progress += ant.speed;
        
        if (ant.progress >= 1) {
            ant.progress = 0;
            ant.currentWaypoint = (ant.currentWaypoint + 1) % this.trackPoints.length;
            if (ant.currentWaypoint === 0) ant.lap++;
        }

        // Calculate base position
        const baseX = current.x + (next.x - current.x) * ant.progress;
        const baseY = current.y + (next.y - current.y) * ant.progress;

        // Calculate direction vector
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction vector
        const normalizedDx = dx / length;
        const normalizedDy = dy / length;

        // Calculate perpendicular vector
        const perpDx = -normalizedDy;
        const perpDy = normalizedDx;

        // Calculate wave amount
        const time = performance.now() * this.waveSpeed;
        const newWaveAmount = Math.sin(time + ant.waveOffset) * this.waveAmplitude;
        
        // Store last wave amount for angle calculation
        const waveChange = newWaveAmount - ant.lastWaveAmount;
        ant.lastWaveAmount = newWaveAmount;

        // Apply wavering motion
        ant.x = baseX + perpDx * newWaveAmount;
        ant.y = baseY + perpDy * newWaveAmount;

        // Calculate angle based on movement direction and wave change
        const baseAngle = Math.atan2(dy, dx) * 180 / Math.PI;
        const waveAngle = Math.atan2(waveChange, 5) * 180 / Math.PI; // '5' controls angle sensitivity
        
        return baseAngle + waveAngle;
    }

    drawAnt(ant, angle) {
        // Skip drawing if ant is burnt
        if (this.burntAnts.has(ant)) return;

        // Check if ant gets burnt
        if (this.checkBurning(ant)) {
            // Draw burning effect
            this.ctx.save();
            const cameraX = this.cameraPosition.x - this.viewWidth / 2;
            const cameraY = this.cameraPosition.y - this.viewHeight / 2;
            this.ctx.translate(-cameraX * this.zoom, -cameraY * this.zoom);
            this.ctx.scale(this.zoom, this.zoom);
            
            this.ctx.translate(ant.x, ant.y);
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 10 / this.zoom, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.fill();
            this.ctx.restore();
            return;
        }

        this.ctx.save();
        
        // Use smooth camera position
        const cameraX = this.cameraPosition.x - this.viewWidth / 2;
        const cameraY = this.cameraPosition.y - this.viewHeight / 2;

        // Apply camera transform
        this.ctx.translate(-cameraX * this.zoom, -cameraY * this.zoom);
        this.ctx.scale(this.zoom, this.zoom);

        // Draw the ant
        this.ctx.translate(ant.x, ant.y);
        
        // Draw NFT address above ant
        this.ctx.save();
        this.ctx.rotate(-angle * Math.PI / 180); // Unrotate for text
        this.ctx.font = `${12 / this.zoom}px monospace`;
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2 / this.zoom;
        this.ctx.textAlign = 'center';
        
        // Draw text background for better visibility
        const addressText = `${ant.nftAddress.slice(0, 4)}...${ant.nftAddress.slice(-4)}`;
        const textMetrics = this.ctx.measureText(addressText);
        const padding = 4 / this.zoom;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(
            -textMetrics.width / 2 - padding,
            -30 / this.zoom - padding,
            textMetrics.width + (padding * 2),
            20 / this.zoom
        );
        
        // Draw text
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(addressText, 0, -20 / this.zoom);
        this.ctx.restore();

        // Draw the ant
        this.ctx.rotate(angle * Math.PI / 180);
        this.ctx.filter = ant.filter;
        
        const antScale = 1 / this.zoom;
        this.ctx.drawImage(
            this.antImage,
            -this.antImage.width * antScale / 4,
            -this.antImage.height * antScale / 4,
            this.antImage.width * antScale / 2,
            this.antImage.height * antScale / 2
        );
        
        this.ctx.restore();

        // After drawing the NFT address, add position number
        this.ctx.save();
        this.ctx.rotate(-angle * Math.PI / 180); // Unrotate for text
        
        // Find position of this ant
        const position = [...this.ants]
            .sort((a, b) => {
                if (b.lap !== a.lap) return b.lap - a.lap;
                if (b.currentWaypoint !== a.currentWaypoint) return b.currentWaypoint - a.currentWaypoint;
                return b.progress - a.progress;
            })
            .indexOf(ant) + 1;

        // Draw position number
        const positionText = `P${position}`;
        this.ctx.font = `bold ${14 / this.zoom}px Arial`;
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3 / this.zoom;
        this.ctx.textAlign = 'center';
        this.ctx.strokeText(positionText, 0, -35 / this.zoom);
        this.ctx.fillText(positionText, 0, -35 / this.zoom);
        
        this.ctx.restore();
    }

    drawTrack() {
        this.ctx.save();
        
        // Use smooth camera position
        const cameraX = this.cameraPosition.x - this.viewWidth / 2;
        const cameraY = this.cameraPosition.y - this.viewHeight / 2;

        // Apply camera transform
        this.ctx.translate(-cameraX * this.zoom, -cameraY * this.zoom);
        this.ctx.scale(this.zoom, this.zoom);

        // Draw the main track with new color
        this.ctx.beginPath();
        this.ctx.moveTo(this.trackPoints[0].x, this.trackPoints[0].y);
        for (let i = 1; i < this.trackPoints.length - 2; i++) {
            const xc = (this.trackPoints[i].x + this.trackPoints[i + 1].x) / 2;
            const yc = (this.trackPoints[i].y + this.trackPoints[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(this.trackPoints[i].x, this.trackPoints[i].y, xc, yc);
        }
        this.ctx.lineTo(this.trackPoints[0].x, this.trackPoints[0].y);
        this.ctx.strokeStyle = '#adaaaa';  // Updated to new gray color
        this.ctx.lineWidth = 60 / this.zoom;
        this.ctx.stroke();

        // Draw black dashed lines on edges (keep same line width for edges)
        this.ctx.beginPath();
        this.ctx.moveTo(this.trackPoints[0].x, this.trackPoints[0].y);
        for (let i = 1; i < this.trackPoints.length - 2; i++) {
            const xc = (this.trackPoints[i].x + this.trackPoints[i + 1].x) / 2;
            const yc = (this.trackPoints[i].y + this.trackPoints[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(this.trackPoints[i].x, this.trackPoints[i].y, xc, yc);
        }
        this.ctx.lineTo(this.trackPoints[0].x, this.trackPoints[0].y);
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2 / this.zoom;
        this.ctx.setLineDash([10 / this.zoom, 10 / this.zoom]);
        this.ctx.stroke();

        // Draw inner edge
        this.ctx.beginPath();
        this.ctx.moveTo(this.trackPoints[0].x, this.trackPoints[0].y);
        for (let i = 1; i < this.trackPoints.length - 2; i++) {
            const xc = (this.trackPoints[i].x + this.trackPoints[i + 1].x) / 2;
            const yc = (this.trackPoints[i].y + this.trackPoints[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(this.trackPoints[i].x, this.trackPoints[i].y, xc, yc);
        }
        this.ctx.lineWidth = 2 / this.zoom;
        this.ctx.strokeStyle = '#000';
        this.ctx.setLineDash([10 / this.zoom, 10 / this.zoom]);
        this.ctx.stroke();

        // Reset line dash and restore context
        this.ctx.setLineDash([]);
        this.ctx.restore();
    }

    checkWinner() {
        for (let i = 0; i < this.ants.length; i++) {
            if (this.ants[i].lap >= 1) {
                const winner = document.getElementById('winner');
                winner.style.display = 'block';
                winner.textContent = `Ant ${i + 1} wins the race!`;
                return true;
            }
        }
        return false;
    }

    createGrassPattern() {
        // Create a small canvas for the pattern
        const patternCanvas = document.createElement('canvas');
        const patternContext = patternCanvas.getContext('2d');
        patternCanvas.width = 100;
        patternCanvas.height = 100;

        // Fill base color
        patternContext.fillStyle = '#2e5c1a'; // Dark grass green
        patternContext.fillRect(0, 0, 100, 100);

        // Add grass details
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const length = 2 + Math.random() * 4;
            const angle = Math.random() * Math.PI;

            patternContext.beginPath();
            patternContext.strokeStyle = Math.random() > 0.5 ? '#3a7021' : '#234515'; // Lighter and darker grass strokes
            patternContext.lineWidth = 1;
            patternContext.moveTo(x, y);
            patternContext.lineTo(
                x + Math.cos(angle) * length,
                y + Math.sin(angle) * length
            );
            patternContext.stroke();
        }

        return this.ctx.createPattern(patternCanvas, 'repeat');
    }

    drawBackground() {
        // Use smooth camera position
        const cameraX = this.cameraPosition.x - this.viewWidth / 2;
        const cameraY = this.cameraPosition.y - this.viewHeight / 2;

        // Save context and apply camera transform
        this.ctx.save();
        this.ctx.translate(-cameraX * this.zoom, -cameraY * this.zoom);
        this.ctx.scale(this.zoom, this.zoom);

        // Fill the visible area with grass pattern
        this.ctx.fillStyle = this.grassPattern;
        // Fill a larger area than the viewport to ensure coverage during movement
        this.ctx.fillRect(
            cameraX - 100,
            cameraY - 100,
            this.viewWidth + 200,
            this.viewHeight + 200
        );

        this.ctx.restore();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateCameraPosition();
        this.drawBackground();
        this.drawScorchMarks();  // Draw scorch marks before track
        this.drawTrack();
        
        // Add new scorch mark every few frames when burning
        if (this.magnifyingGlass.active && Math.random() < 0.3) {  // 30% chance each frame
            this.addScorchMark();
        }

        for (let ant of this.ants) {
            const angle = this.moveAnt(ant);
            this.drawAnt(ant, angle);
        }

        this.drawMagnifyingGlass();

        // Check if all ants are burnt or there's a winner
        const allBurnt = this.ants.every(ant => this.burntAnts.has(ant));
        if (allBurnt) {
            const winner = document.getElementById('winner');
            winner.style.display = 'block';
            winner.textContent = 'All ants have been burnt to a crisp!';
            return;
        }

        if (!this.checkWinner()) {
            requestAnimationFrame(() => this.animate());
        }
    }

    getAntInPosition(position) {
        // Sort ants by progress
        const sortedAnts = [...this.ants].sort((a, b) => {
            // Compare laps first
            if (b.lap !== a.lap) {
                return b.lap - a.lap;
            }
            // If same lap, compare waypoint
            if (b.currentWaypoint !== a.currentWaypoint) {
                return b.currentWaypoint - a.currentWaypoint;
            }
            // If same waypoint, compare progress
            return b.progress - a.progress;
        });

        return sortedAnts[position - 1]; // position 3 will get third place ant
    }

    // Calculate base position without wavering
    getAntBasePosition(ant) {
        const current = this.trackPoints[ant.currentWaypoint];
        const next = this.trackPoints[(ant.currentWaypoint + 1) % this.trackPoints.length];
        
        return {
            x: current.x + (next.x - current.x) * ant.progress,
            y: current.y + (next.y - current.y) * ant.progress
        };
    }

    updateCameraPosition() {
        const thirdPlaceAnt = this.getAntInPosition(3);
        if (!thirdPlaceAnt) return;

        // Get base position without wavering
        const targetPos = this.getAntBasePosition(thirdPlaceAnt);

        // Smooth camera movement
        this.cameraPosition.x += (targetPos.x - this.cameraPosition.x) * this.cameraSmoothingFactor;
        this.cameraPosition.y += (targetPos.y - this.cameraPosition.y) * this.cameraSmoothingFactor;
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / this.zoom + (this.cameraPosition.x - this.viewWidth / 2);
        const mouseY = (e.clientY - rect.top) / this.zoom + (this.cameraPosition.y - this.viewHeight / 2);
        
        this.magnifyingGlass.x = mouseX;
        this.magnifyingGlass.y = mouseY;
    }

    drawMagnifyingGlass() {
        this.ctx.save();
        
        // Apply camera transform
        const cameraX = this.cameraPosition.x - this.viewWidth / 2;
        const cameraY = this.cameraPosition.y - this.viewHeight / 2;
        this.ctx.translate(-cameraX * this.zoom, -cameraY * this.zoom);
        this.ctx.scale(this.zoom, this.zoom);

        // Draw magnifying glass circle with black ring
        this.ctx.beginPath();
        this.ctx.arc(this.magnifyingGlass.x, this.magnifyingGlass.y, this.magnifyingGlass.radius / this.zoom, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#000';  // Changed from #666 to black
        this.ctx.lineWidth = 6 / this.zoom;
        this.ctx.stroke();

        // Draw handle with brown color
        this.ctx.beginPath();
        this.ctx.moveTo(
            this.magnifyingGlass.x + (this.magnifyingGlass.radius / this.zoom) * Math.cos(Math.PI / 4),
            this.magnifyingGlass.y + (this.magnifyingGlass.radius / this.zoom) * Math.sin(Math.PI / 4)
        );
        this.ctx.lineTo(
            this.magnifyingGlass.x + (this.magnifyingGlass.radius * 1.5 / this.zoom) * Math.cos(Math.PI / 4),
            this.magnifyingGlass.y + (this.magnifyingGlass.radius * 1.5 / this.zoom) * Math.sin(Math.PI / 4)
        );
        this.ctx.strokeStyle = '#553311';  // Changed from #666 to brown
        this.ctx.lineWidth = 6 / this.zoom;
        this.ctx.stroke();

        // Draw burning effect when active
        if (this.magnifyingGlass.active) {
            this.ctx.beginPath();
            this.ctx.arc(this.magnifyingGlass.x, this.magnifyingGlass.y, this.magnifyingGlass.burnRadius / this.zoom, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    checkBurning(ant) {
        if (!this.magnifyingGlass.active || this.burntAnts.has(ant)) return false;

        const dx = ant.x - this.magnifyingGlass.x;
        const dy = ant.y - this.magnifyingGlass.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.magnifyingGlass.burnRadius / this.zoom) {
            this.burntAnts.add(ant);
            return true;
        }
        return false;
    }

    // Add new method to create scorch marks
    addScorchMark() {
        if (this.magnifyingGlass.active) {
            this.scorchMarks.push({
                x: this.magnifyingGlass.x,
                y: this.magnifyingGlass.y,
                radius: this.magnifyingGlass.burnRadius / this.zoom,
                alpha: 0.5  // Initial opacity
            });
        }
    }

    // Add new method to draw scorch marks
    drawScorchMarks() {
        this.ctx.save();
        
        // Apply camera transform
        const cameraX = this.cameraPosition.x - this.viewWidth / 2;
        const cameraY = this.cameraPosition.y - this.viewHeight / 2;
        this.ctx.translate(-cameraX * this.zoom, -cameraY * this.zoom);
        this.ctx.scale(this.zoom, this.zoom);

        // Draw each scorch mark
        for (let mark of this.scorchMarks) {
            this.ctx.beginPath();
            this.ctx.arc(mark.x, mark.y, mark.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 0, 0, ${mark.alpha})`;
            this.ctx.fill();
            
            // Gradually fade the scorch mark
            mark.alpha = Math.max(0.2, mark.alpha - 0.0001);
        }

        this.ctx.restore();
    }
}
    