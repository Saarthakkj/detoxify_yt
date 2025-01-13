const fs = require('fs');
const canvas = require('canvas');

const size = 128;
const c = canvas.createCanvas(size, size);
const ctx = c.getContext('2d');

// Draw background
ctx.fillStyle = '#FF0000';
ctx.beginPath();
ctx.roundRect(0, 0, size, size, 20);
ctx.fill();

// Draw text
ctx.fillStyle = 'white';
ctx.font = 'bold 80px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('YF', size/2, size/2);

// Save the image
const buffer = c.toBuffer('image/png');
fs.writeFileSync('icon.png', buffer); 