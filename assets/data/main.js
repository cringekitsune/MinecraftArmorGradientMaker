const minecraftDyes = [
    { name: "White", hex: "#f9ffff" },
    { name: "Orange", hex: "#f9801d" },
    { name: "Magenta", hex: "#c64fbd" },
    { name: "Light Blue", hex: "#3ab3da" },
    { name: "Yellow", hex: "#ffd83d" },
    { name: "Lime", hex: "#80c71f" },
    { name: "Pink", hex: "#f38caa" },
    { name: "Dark Gray", hex: "#474f52" },
    { name: "Light Gray", hex: "#9c9d97" },
    { name: "Cyan", hex: "#169c9d" },
    { name: "Purple", hex: "#8932b7" },
    { name: "Blue", hex: "#3c44a9" },
    { name: "Brown", hex: "#825432" },
    { name: "Green", hex: "#5d7c15" },
    { name: "Red", hex: "#b02e26" },
    { name: "Black", hex: "#1d1c21" },
];

// Function to convert hex color to RGB
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

// Function to calculate the distance between two colors
function colorDistance(color1, color2) {
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );
}

// Function to find the best dye combination for a target color
function findBestDyeCombination(targetHex) {
    const targetColor = hexToRgb(targetHex);
    let bestCombination = [];
    let smallestDistance = Infinity;
    let bestAccuracy = 0;

    const combinations = (arr, k) => {
        const result = [];
        const f = (start, curr) => {
            if (curr.length === k) {
                result.push(curr);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                f(i + 1, [...curr, arr[i]]);
            }
        };
        f(0, []);
        return result;
    };

    for (let i = 1; i <= minecraftDyes.length; i++) {
        const dyeCombinations = combinations(minecraftDyes, i);
        for (const combo of dyeCombinations) {
            let totalRed = 0, totalGreen = 0, totalBlue = 0;
            let numberOfColors = combo.length;

            for (const dye of combo) {
                const dyeColor = hexToRgb(dye.hex);
                totalRed += dyeColor.r;
                totalGreen += dyeColor.g;
                totalBlue += dyeColor.b;
            }

            const averageRed = totalRed / numberOfColors;
            const averageGreen = totalGreen / numberOfColors;
            const averageBlue = totalBlue / numberOfColors;

            const averageColor = { r: averageRed, g: averageGreen, b: averageBlue };
            const distance = colorDistance(averageColor, targetColor);
            const accuracy = calculateAccuracy(averageColor, targetColor);

            if (distance < smallestDistance) {
                smallestDistance = distance;
                bestCombination = combo.map(dye => dye.name);
                bestAccuracy = accuracy;
            }
        }
    }

    return [...bestCombination, Math.round(bestAccuracy), targetHex];
}

function calculateAccuracy(color1, color2) {
    const maxDistance = Math.sqrt(Math.pow(255, 2) * 3);
    const distance = colorDistance(color1, color2);
    const accuracy = ((maxDistance - distance) / maxDistance) * 100;
    return accuracy.toFixed(2);
}

function interpolateColor(color1, color2, percentage) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * (percentage / 100));
    const g = Math.round(g1 + (g2 - g1) * (percentage / 100));
    const b = Math.round(b1 + (b2 - b1) * (percentage / 100));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function addImages(id, dyes) {
    const element = document.getElementById(id);
    element.innerHTML = '';
    for (let i = 0; i < dyes.length - 2; i++) {
        let image = document.createElement('img');
        image.src = './assets/media/dye/' + dyes[i].toLowerCase().replace(' ', '_') + '.webp';
        image.className = 'dye';
        element.appendChild(image);
    }
}

function easeIn(t) {
    return t * (2 - t);
}

function animateAccuracy(element, target) {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    function updateAccuracy(currentTime) {
        const elapsedTime = currentTime - startTime;
        let progress = Math.min(elapsedTime / duration, 1);
        progress = easeIn(progress);

        const value = Math.floor(start + (target - start) * progress);
        element.innerText = value + "%";

        if (progress < 1) {
            requestAnimationFrame(updateAccuracy);
        }
    }

    requestAnimationFrame(updateAccuracy);
}

function update() {
    let first_color = document.getElementById('first_color_input').value;
    let last_color = document.getElementById('last_color_input').value;

    const helmetBestDyes = findBestDyeCombination(first_color);
    const chestplateBestDyes = findBestDyeCombination(interpolateColor(first_color, last_color, 33));
    const legginsBestDyes = findBestDyeCombination(interpolateColor(first_color, last_color, 66));
    const bootsBestDyes = findBestDyeCombination(last_color);

    let color_gradient_element = document.getElementById('color-gradient');
    color_gradient_element.style.background = `linear-gradient(to bottom, ${first_color}, ${interpolateColor(first_color, last_color, 25)}, ${interpolateColor(first_color, last_color, 75)}, ${last_color})`;

    animateAccuracy(document.getElementById('accuracy_container_helmet'), helmetBestDyes[helmetBestDyes.length - 2]);
    animateAccuracy(document.getElementById('accuracy_container_chestplate'), chestplateBestDyes[chestplateBestDyes.length - 2]);
    animateAccuracy(document.getElementById('accuracy_container_leggins'), legginsBestDyes[legginsBestDyes.length - 2]);
    animateAccuracy(document.getElementById('accuracy_container_boots'), bootsBestDyes[bootsBestDyes.length - 2]);

    const helmetElem = document.getElementById('hex_container_helmet');
    const chestplateElem = document.getElementById('hex_container_chestplate');
    const legginsElem = document.getElementById('hex_container_leggins');
    const bootsElem = document.getElementById('hex_container_boots');

    helmetElem.innerText = helmetBestDyes[helmetBestDyes.length - 1];
    helmetElem.style.color = helmetBestDyes[helmetBestDyes.length - 1];

    chestplateElem.innerText = chestplateBestDyes[chestplateBestDyes.length - 1];
    chestplateElem.style.color = chestplateBestDyes[chestplateBestDyes.length - 1];

    legginsElem.innerText = legginsBestDyes[legginsBestDyes.length - 1];
    legginsElem.style.color = legginsBestDyes[legginsBestDyes.length - 1];

    bootsElem.innerText = bootsBestDyes[bootsBestDyes.length - 1];
    bootsElem.style.color = bootsBestDyes[bootsBestDyes.length - 1];

    addImages('dye_container_helmet', helmetBestDyes);
    addImages('dye_container_chestplate', chestplateBestDyes);
    addImages('dye_container_leggins', legginsBestDyes);
    addImages('dye_container_boots', bootsBestDyes);
}


function updateDisplays() {
    document.getElementById('first_color_input').addEventListener('input', function () {
        let first_color = this.value;
        document.getElementById('first_color_input_hex').value = first_color;
        document.getElementById('first_color_preview').style.backgroundColor = first_color;
    });

    document.getElementById('last_color_input').addEventListener('input', function () {
        let last_color = this.value;
        document.getElementById('last_color_input_hex').value = last_color;
        document.getElementById('last_color_preview').style.backgroundColor = last_color;
    });

    document.getElementById('first_color_input_hex').addEventListener('input', function () {
        let first_color = this.value;
        document.getElementById('first_color_input').value = first_color;
        document.getElementById('first_color_preview').style.backgroundColor = first_color;
    });

    document.getElementById('last_color_input_hex').addEventListener('input', function () {
        let last_color = this.value;
        document.getElementById('last_color_input').value = last_color;
        document.getElementById('last_color_preview').style.backgroundColor = last_color;
    });
}

function getRandomColor() {
    const randomHex = Math.floor(Math.random()*16777215).toString(16);
    return `#${randomHex.padStart(6, '0')}`;
}

function makeRandomGradient() {
    const firstColor = getRandomColor();
    const lastColor = getRandomColor();

    document.getElementById('first_color_input_hex').value = firstColor;
    document.getElementById('first_color_input').value = firstColor;
    document.getElementById('first_color_preview').style.backgroundColor = firstColor;

    document.getElementById('last_color_input_hex').value = lastColor;
    document.getElementById('last_color_input').value = lastColor;
    document.getElementById('last_color_preview').style.backgroundColor = lastColor;
}

function screenshot() {
    var element = document.getElementById("to-screenshot");

    html2canvas(element, {
        backgroundColor: "#000000",
        scale: 2
    }).then(function (canvas) {
        var link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = 'armor-'+Math.random(1)+'.png';
        link.click();
    });
}

makeRandomGradient();
update();

setInterval(updateDisplays, 100);

console.log("Nuclear reactor explosion in t-300 (That's a joke you silly javascript hacker)")