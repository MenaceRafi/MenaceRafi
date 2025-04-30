let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let bird, obstacles = [], score = 0, speed = 2, highestScore = 0;
let gameInterval, obstacleInterval, gravity = 0.5, birdY = 150, birdVelocity = 0;
let isGameOver = false;
let lastScoreUpdateTime = 0;
let level = 1;  // Initial level
let passedPillars = 0;  // Track how many pillars have been passed

// Brown color for pillars
const pillarColor = "#8B4513";  // Brown color for both top and bottom pillars

canvas.width = 480;  // Make the canvas wider
canvas.height = 480;

// Background Image (using the provided URL)
let backgroundImage = new Image();
backgroundImage.src = 'https://i.postimg.cc/1zqWDSpr/Green-Modern-Welcome-To-The-Jungle-Video.png';  // New jungle background URL

// Ensure the image is loaded before rendering
backgroundImage.onload = function() {
    startGame();  // Start the game once the background image is loaded
};

// Bird object (with hosted GIF and wing images)
function Bird() {
    this.width = 40;  // Slightly increase the width of the bird
    this.height = 40; // Slightly increase the height of the bird
    this.x = 50;
    this.y = birdY;
    this.image_up = new Image();  // Bird image with wings up
    this.image_down = new Image();  // Bird image with wings down
    this.image_up.src = 'https://i.postimg.cc/RFxHy52d/wings-up.png';  // Image with wings up
    this.image_down.src = 'https://i.postimg.cc/VNnSjZ5C/wings-down.png';  // Image with wings down
    this.isFlapping = true; // Control if the bird is flapping (used for toggling images)
    this.jump = function() {
        birdVelocity = -6;  // Shorter jump height
        this.isFlapping = true; // Start the flap when the bird jumps
    };
    this.update = function() {
        birdVelocity += gravity;
        this.y += birdVelocity;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            if (!isGameOver) endGame();
        }

        // If the bird is falling, use the "wings down" image
        if (this.y > birdY && birdVelocity > 0) {
            this.isFlapping = false;
        } else {
            this.isFlapping = true;
        }
    };
    this.draw = function() {
        // Alternate between "wings up" and "wings down" based on the jump or fall
        if (this.isFlapping) {
            ctx.drawImage(this.image_up, this.x, this.y, this.width, this.height);  // Flap wings up
        } else {
            ctx.drawImage(this.image_down, this.x, this.y, this.width, this.height);  // Flap wings down
        }
    };
}

// Obstacle object
function Obstacle() {
    this.width = 40;  // Revert back to original width for top pillar (rope)
    this.height = Math.random() * 200 + 50;  // Random height for the top pillar
    this.x = canvas.width;
    this.gap = 150 - level * 10;  // Shrink gap slightly with each level
    if (this.gap < 50) this.gap = 50;  // Ensure gap doesn't get too small
    this.passed = false;

    this.update = function() {
        this.x -= speed;
        if (this.x + this.width < 0) {
            obstacles.shift();
        }
    };

    this.draw = function() {
        // Draw the top pillar (rope) - a narrow brown rectangle
        ctx.fillStyle = pillarColor;
        ctx.fillRect(this.x, 0, this.width, this.height);  // Rope-like top pillar

        // Draw the bottom pillar (tree trunk) - a wider brown rectangle
        ctx.fillRect(this.x, this.height + this.gap, this.width + 10, canvas.height - (this.height + this.gap));  // Tree trunk-like bottom pillar
    };
}

// Start the game
function startGame() {
    document.getElementById("homepage").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    bird = new Bird();
    obstacles = [];
    score = 0;
    passedPillars = 0;  // Reset passed pillars
    level = 1;  // Start from level 1
    speed = 2;  // Set speed back to original value
    birdY = 150;
    birdVelocity = 0;
    isGameOver = false;
    gameInterval = setInterval(gameLoop, 1000 / 60);
    obstacleInterval = setInterval(generateObstacles, 1500); // Increase frequency of obstacles
}

// Game loop
function gameLoop() {
    if (isGameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image (fixed position)
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);  // Draw the background image

    bird.update();
    bird.draw();  // Redraw the bird every frame to animate the GIF

    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].update();
        obstacles[i].draw();
        
        // Check if the bird has passed an obstacle
        if (bird.x + bird.width > obstacles[i].x && bird.x < obstacles[i].x + obstacles[i].width) {
            if (!obstacles[i].passed) {
                obstacles[i].passed = true;
                passedPillars++;  // Increment when a pillar is passed
                if (Date.now() - lastScoreUpdateTime >= 1000) { // Update score slower
                    score += 10; // 10 points for passing each obstacle
                    lastScoreUpdateTime = Date.now();
                }
                if (passedPillars % 3 === 0) {
                    showCompliment();  // Show compliment every 3 pillars
                }
            }
        }

        // Updated collision detection: Only collide if the bird touches the obstacles' height or exceeds the gap
        if (bird.x + bird.width > obstacles[i].x && bird.x < obstacles[i].x + obstacles[i].width) {
            if (bird.y < obstacles[i].height || bird.y + bird.height > obstacles[i].height + obstacles[i].gap) {
                endGame(); // End the game if it collides with the obstacle
            }
        }
    }

    // Increase level after every 100 points
    if (score >= level * 100) {
        level++;
        document.getElementById("level").innerText = "Level: " + level;  // Display current level
    }

    document.getElementById("score").innerText = "Score: " + score;
}

// Generate obstacles
function generateObstacles() {
    let obstacle = new Obstacle();
    obstacles.push(obstacle);
}

// Show compliment pop-up around the bird
function showCompliment() {
    let randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    let compliment = document.getElementById("compliment");

    // Position the compliment relative to the bird
    compliment.style.top = bird.y - 40 + 'px';  // Place compliment above the bird
    compliment.style.left = bird.x + bird.width / 2 - compliment.offsetWidth / 2 + 'px';  // Center compliment over the bird

    compliment.textContent = randomCompliment;
    compliment.style.display = "block";  // Show the compliment
    setTimeout(() => {
        compliment.style.display = "none";  // Hide it after 2 seconds
    }, 2000);
}

// End game
function endGame() {
    clearInterval(gameInterval);
    clearInterval(obstacleInterval);
    if (score > highestScore) highestScore = score;
    alert("Game Over! Your score: " + score);
    document.getElementById("homepage").style.display = "block";
    document.getElementById("gameScreen").style.display = "none";
}

// View highest score
function viewHighScore() {
    alert("Highest Score: " + highestScore);
}

// Event listener for bird jump
document.addEventListener("click", () => {
    if (!isGameOver) bird.jump();
});
