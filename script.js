const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const bestScoreEl = document.querySelector('#bestScore');
const overlay = document.querySelector('#overlay');
const startButton = document.querySelector('#startButton');
const flapButton = document.querySelector('#flapButton');
const restartButton = document.querySelector('#restartButton');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_HEIGHT = 96;
const PIPE_WIDTH = 76;
const PIPE_GAP = 178;
const PIPE_DISTANCE = 238;
const BIRD_X = 118;
const BEST_KEY = 'flapper-best-score';

const bird = {
  x: BIRD_X,
  y: HEIGHT * 0.42,
  radius: 21,
  velocity: 0,
  rotation: 0,
};

const game = {
  state: 'ready',
  gravity: 0.48,
  flapPower: -8.7,
  speed: 2.8,
  frame: 0,
  score: 0,
  best: Number(localStorage.getItem(BEST_KEY) || 0),
  pipes: [],
  groundOffset: 0,
  lastTime: 0,
};

bestScoreEl.textContent = game.best;

function resetGame() {
  bird.y = HEIGHT * 0.42;
  bird.velocity = 0;
  bird.rotation = 0;
  game.frame = 0;
  game.score = 0;
  game.pipes = [];
  game.groundOffset = 0;
  scoreEl.textContent = '0';
  addPipe(WIDTH + 80);
  addPipe(WIDTH + 80 + PIPE_DISTANCE);
}

function startGame() {
  if (game.state === 'playing') return;
  resetGame();
  game.state = 'playing';
  overlay.classList.add('hidden');
  flap();
}

function showOverlay(title, message, buttonText = 'Start Game') {
  overlay.querySelector('h1').textContent = title;
  overlay.querySelector('.tagline').innerHTML = message;
  startButton.textContent = buttonText;
  overlay.classList.remove('hidden');
}

function addPipe(x = WIDTH + PIPE_WIDTH) {
  const minTop = 96;
  const maxTop = HEIGHT - GROUND_HEIGHT - PIPE_GAP - 120;
  const topHeight = minTop + Math.random() * (maxTop - minTop);
  game.pipes.push({
    x,
    topHeight,
    passed: false,
  });
}

function flap() {
  if (game.state === 'ready' || game.state === 'gameover') {
    startGame();
    return;
  }

  bird.velocity = game.flapPower;
}

function update() {
  if (game.state !== 'playing') return;

  game.frame += 1;
  game.groundOffset = (game.groundOffset - game.speed) % 48;
  bird.velocity += game.gravity;
  bird.y += bird.velocity;
  bird.rotation = Math.max(-0.55, Math.min(1.25, bird.velocity / 12));

  for (const pipe of game.pipes) {
    pipe.x -= game.speed;

    if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x - bird.radius) {
      pipe.passed = true;
      game.score += 1;
      scoreEl.textContent = game.score;
    }
  }

  if (game.pipes[0] && game.pipes[0].x + PIPE_WIDTH < -20) {
    game.pipes.shift();
  }

  const lastPipe = game.pipes[game.pipes.length - 1];
  if (lastPipe && lastPipe.x < WIDTH - PIPE_DISTANCE) {
    addPipe();
  }

  if (bird.y + bird.radius > HEIGHT - GROUND_HEIGHT || bird.y - bird.radius < 0 || hitPipe()) {
    endGame();
  }
}

function hitPipe() {
  return game.pipes.some((pipe) => {
    const inPipeX = bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + PIPE_WIDTH;
    const inGapY = bird.y - bird.radius > pipe.topHeight && bird.y + bird.radius < pipe.topHeight + PIPE_GAP;
    return inPipeX && !inGapY;
  });
}

function endGame() {
  game.state = 'gameover';
  if (game.score > game.best) {
    game.best = game.score;
    localStorage.setItem(BEST_KEY, String(game.best));
    bestScoreEl.textContent = game.best;
  }

  showOverlay(
    'Ouch!',
    `Score <strong>${game.score}</strong> · Best <strong>${game.best}</strong><br />Tap, click, or press <kbd>Space</kbd> to try again.`,
    'Play Again',
  );
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, '#6ed4ff');
  gradient.addColorStop(0.72, '#dff8ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawCloud(68, 92, 1.05);
  drawCloud(318, 172, 0.85);
  drawCloud(210, 56, 0.62);
}

function drawCloud(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.beginPath();
  ctx.arc(0, 18, 24, Math.PI, 0);
  ctx.arc(24, 5, 28, Math.PI, 0);
  ctx.arc(58, 18, 22, Math.PI, 0);
  ctx.rect(-4, 18, 84, 25);
  ctx.fill();
  ctx.restore();
}

function drawPipe(pipe) {
  const bottomY = pipe.topHeight + PIPE_GAP;
  const bottomHeight = HEIGHT - GROUND_HEIGHT - bottomY;

  drawPipeSection(pipe.x, 0, PIPE_WIDTH, pipe.topHeight, true);
  drawPipeSection(pipe.x, bottomY, PIPE_WIDTH, bottomHeight, false);
}

function drawPipeSection(x, y, width, height, isTop) {
  const lipHeight = 26;
  const lipY = isTop ? y + height - lipHeight : y;
  const bodyY = isTop ? y : y + lipHeight;
  const bodyHeight = height - lipHeight;

  ctx.fillStyle = '#43c84a';
  ctx.strokeStyle = '#176e27';
  ctx.lineWidth = 4;
  ctx.fillRect(x + 8, bodyY, width - 16, bodyHeight);
  ctx.strokeRect(x + 8, bodyY, width - 16, bodyHeight);

  const shine = ctx.createLinearGradient(x, 0, x + width, 0);
  shine.addColorStop(0, 'rgba(255,255,255,0.38)');
  shine.addColorStop(0.45, 'rgba(255,255,255,0.06)');
  shine.addColorStop(1, 'rgba(0,0,0,0.16)');
  ctx.fillStyle = shine;
  ctx.fillRect(x + 12, bodyY + 4, width - 24, bodyHeight - 8);

  ctx.fillStyle = '#59df58';
  ctx.fillRect(x, lipY, width, lipHeight);
  ctx.strokeRect(x, lipY, width, lipHeight);
}

function drawGround() {
  const y = HEIGHT - GROUND_HEIGHT;
  ctx.fillStyle = '#78d65a';
  ctx.fillRect(0, y - 16, WIDTH, 16);
  ctx.fillStyle = '#d99a49';
  ctx.fillRect(0, y, WIDTH, GROUND_HEIGHT);

  for (let x = game.groundOffset - 48; x < WIDTH + 48; x += 48) {
    ctx.fillStyle = '#f1c36b';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 24, y + 22);
    ctx.lineTo(x + 48, y);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(97, 59, 21, 0.28)';
  for (let x = game.groundOffset; x < WIDTH; x += 34) {
    ctx.fillRect(x, y + 52, 18, 5);
  }
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rotation);

  ctx.fillStyle = '#ffcf31';
  ctx.strokeStyle = '#17324d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const wingFlap = Math.sin(game.frame / 5) * 0.28;
  ctx.fillStyle = '#f6a832';
  ctx.beginPath();
  ctx.ellipse(-8, 8, 14, 8, wingFlap, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(10, -8, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#17324d';
  ctx.beginPath();
  ctx.arc(13, -7, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff7d20';
  ctx.beginPath();
  ctx.moveTo(20, -1);
  ctx.lineTo(39, 5);
  ctx.lineTo(20, 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawReadyHint() {
  if (game.state !== 'ready') return;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#17324d';
  ctx.font = '900 26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Ready?', WIDTH / 2, HEIGHT * 0.33);
  ctx.restore();
}

function render() {
  drawSky();
  for (const pipe of game.pipes) drawPipe(pipe);
  drawGround();
  drawBird();
  drawReadyHint();
}

function loop(timestamp) {
  const elapsed = timestamp - game.lastTime;
  if (elapsed > 16) {
    update();
    render();
    game.lastTime = timestamp;
  }

  requestAnimationFrame(loop);
}

function handleAction(event) {
  event.preventDefault();
  flap();
}

startButton.addEventListener('click', startGame);
flapButton.addEventListener('click', handleAction);
restartButton.addEventListener('click', startGame);
canvas.addEventListener('pointerdown', handleAction);
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    handleAction(event);
  }
});

resetGame();
render();
requestAnimationFrame(loop);
