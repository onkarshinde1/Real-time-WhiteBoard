const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight - 120;

// Tool states
let currentTool = 'pen';
let isDrawing = false;
let color = '#000000';
let lineWidth = 3;
let opacity = 1;

// History for undo/redo
let history = [];
let historyStep = -1;

// Get toolbar elements
const penBtn = document.getElementById('penBtn');
const highlighterBtn = document.getElementById('highlighterBtn');
const eraserBtn = document.getElementById('eraserBtn');
const pointerBtn = document.getElementById('pointerBtn');
const colorPicker = document.getElementById('colorPicker');
const sizeSlider = document.getElementById('sizeSlider');
const sizeDisplay = document.getElementById('sizeDisplay');
const opacitySlider = document.getElementById('opacitySlider');
const opacityDisplay = document.getElementById('opacityDisplay');
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Tool buttons
const toolButtons = [penBtn, highlighterBtn, eraserBtn, pointerBtn];

function setActiveTool(button) {
    toolButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

penBtn.addEventListener('click', () => {
    currentTool = 'pen';
    setActiveTool(penBtn);
    canvas.style.cursor = 'crosshair';
    ctx.globalCompositeOperation = 'source-over';
});

highlighterBtn.addEventListener('click', () => {
    currentTool = 'highlighter';
    setActiveTool(highlighterBtn);
    canvas.style.cursor = 'crosshair';
    ctx.globalCompositeOperation = 'source-over';
});

eraserBtn.addEventListener('click', () => {
    currentTool = 'eraser';
    setActiveTool(eraserBtn);
    canvas.style.cursor = 'grab';
    ctx.globalCompositeOperation = 'destination-out';
});

pointerBtn.addEventListener('click', () => {
    currentTool = 'pointer';
    setActiveTool(pointerBtn);
    canvas.style.cursor = 'default';
});

colorPicker.addEventListener('input', (e) => {
    color = e.target.value;
});

sizeSlider.addEventListener('input', (e) => {
    lineWidth = e.target.value;
    sizeDisplay.textContent = lineWidth + 'px';
});

opacitySlider.addEventListener('input', (e) => {
    opacity = e.target.value;
    opacityDisplay.textContent = Math.round(opacity * 100) + '%';
});

clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
});

undoBtn.addEventListener('click', () => {
    if (historyStep > 0) {
        historyStep--;
        const img = new Image();
        img.src = history[historyStep];
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
});

redoBtn.addEventListener('click', () => {
    if (historyStep < history.length - 1) {
        historyStep++;
        const img = new Image();
        img.src = history[historyStep];
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
});

function saveState() {
    historyStep++;
    if (historyStep < history.length) {
        history.length = historyStep;
    }
    history.push(canvas.toDataURL());
}

// Drawing functions
function startDrawing(e) {
    if (currentTool === 'pointer') return;
    
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (currentTool === 'highlighter') {
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = lineWidth * 2;
    } else {
        ctx.globalAlpha = opacity;
        ctx.lineWidth = lineWidth;
    }
    
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function draw(e) {
    if (!isDrawing || currentTool === 'pointer') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        ctx.closePath();
        saveState();
    }
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
});

// Initialize history
saveState();

// Handle window resize
window.addEventListener('resize', () => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);

    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight - 120;
    ctx.drawImage(tempCanvas, 0, 0);
});