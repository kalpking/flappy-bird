document.addEventListener('DOMContentLoaded', () => {
    const bird = document.getElementById('bird');
    const gameContainer = document.querySelector('.game-container');
    const pipe = document.getElementById('pipe');
    const pipeBottom = document.getElementById('pipeBottom');
    const scoreDisplay = document.getElementById('score');
    const highscoreDisplay = document.getElementById('highscore');
    const startOverBtn = document.getElementById('startOver');
    const startAgainBtn = document.getElementById('startAgain');
    const difficultySelector = document.getElementById('difficultySelector');
    const tutorial = document.getElementById('tutorial');
    const startTutorialBtn = document.getElementById('startTutorial');

    let birdY;
    let birdVelocity = 0;
    let gravity = 0.5;
    let isGameOver = false;
    let score = 0;
    let highscore = localStorage.getItem('highscore') || 0;
    let animationFrameId;
    let lastTime = 0;
    let pipeX;
    let pipeGap;
    let pipeSpeed;
    let difficulty;

    const jumpSound = new Audio('jump.mp3');
    const scoreSound = new Audio('score.mp3');
    const gameOverSound = new Audio('gameover.mp3');

    function setDifficulty(level) {
        switch (level) {
            case 'easy':
                pipeGap = 200;
                pipeSpeed = 2;
                gravity = 0.4;
                break;
            case 'medium':
                pipeGap = 170;
                pipeSpeed = 3;
                gravity = 0.5;
                break;
            case 'hard':
                pipeGap = 140;
                pipeSpeed = 4;
                gravity = 0.6;
                break;
        }
        difficulty = level;
    }

    function startGame() {
        isGameOver = false;
        score = 0;
        birdY = gameContainer.clientHeight / 2;
        birdVelocity = 0;
        pipeX = gameContainer.clientWidth;
        updateScore();
        resetPipes();
        startOverBtn.style.display = 'none';
        startAgainBtn.style.display = 'none';
        difficultySelector.style.display = 'none';

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        lastTime = 0;
        gameLoop(0);
    }

    function gameLoop(currentTime) {
        if (isGameOver) return;

        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        updateBird(deltaTime);
        updatePipes(deltaTime);
        checkCollision();

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function updateBird(deltaTime) {
        birdVelocity += gravity;
        birdY += birdVelocity;

        // Clamp bird position
        birdY = Math.max(0, Math.min(birdY, gameContainer.clientHeight - bird.clientHeight));

        bird.style.top = `${birdY}px`;
        updateBirdRotation();
    }

    function updatePipes(deltaTime) {
        pipeX -= pipeSpeed;

        if (pipeX <= -pipe.clientWidth) {
            pipeX = gameContainer.clientWidth;
            resetPipes();
            score++;
            updateScore();
            scoreSound.play();
        }

        pipe.style.left = `${pipeX}px`;
        pipeBottom.style.left = `${pipeX}px`;
    }

    function resetPipes() {
        const pipeHeight = Math.random() * (gameContainer.clientHeight / 2) + 50;
        pipe.style.height = `${pipeHeight}px`;
        pipeBottom.style.height = `${gameContainer.clientHeight - pipeHeight - pipeGap}px`;
        pipeBottom.style.top = `${pipeHeight + pipeGap}px`;
    }

    function checkCollision() {
        const birdRect = bird.getBoundingClientRect();
        const pipeRect = pipe.getBoundingClientRect();
        const pipeBottomRect = pipeBottom.getBoundingClientRect();

        if (birdRect.bottom >= gameContainer.clientHeight ||
            (birdRect.right > pipeRect.left && birdRect.left < pipeRect.right &&
             (birdRect.top < pipeRect.bottom || birdRect.bottom > pipeBottomRect.top))) {
            gameOver();
        }
    }

    function gameOver() {
        isGameOver = true;
        cancelAnimationFrame(animationFrameId);
        gameOverSound.play();
        if (score > highscore) {
            highscore = score;
            localStorage.setItem('highscore', highscore);
            updateHighscore();
        }
        startAgainBtn.style.display = 'block';
        difficultySelector.style.display = 'flex';
    }

    function updateBirdRotation() {
        const rotation = Math.min(Math.max(-45, birdVelocity * 3), 45);
        bird.style.transform = `rotate(${rotation}deg)`;
    }

    function jump() {
        if (!isGameOver) {
            birdVelocity = -8;
            jumpSound.play();
        }
    }

    function updateScore() {
        scoreDisplay.innerText = `Score: ${score}`;
    }

    function updateHighscore() {
        highscoreDisplay.innerText = `Highscore: ${highscore}`;
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') jump();
    });

    gameContainer.addEventListener('click', jump);

    startOverBtn.addEventListener('click', startGame);
    startAgainBtn.addEventListener('click', startGame);

    difficultySelector.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            setDifficulty(e.target.getAttribute('data-level'));
            startGame();
        }
    });

    startTutorialBtn.addEventListener('click', () => {
        tutorial.style.display = 'none';
        startGame();
    });

    // Show tutorial on first visit
    if (!localStorage.getItem('tutorialShown')) {
        tutorial.style.display = 'block';
        localStorage.setItem('tutorialShown', 'true');
    }

    // Initialize
    setDifficulty('easy');
    updateHighscore();
});