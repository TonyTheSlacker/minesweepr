// Simple Minesweeper starter implementation
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('start');
const restartBtn = document.getElementById('restart');
const difficultyLabel = document.getElementById('currentDifficulty');
const smileyBtn = startBtn; // alias for clarity

// difficulty presets will set rows/cols/mines
let preset = {name: 'Beginner', rows: 9, cols: 9, mines: 10};

let rows = 9, cols = 9, mines = 10;
let board = []; // cells: {mine, revealed, flagged, count}
let gameOver = false;
let timer = null;
let startTime = null;
let elapsed = 0;
let flagsPlaced = 0;

function init() {
  let hitMine = null; // {r,c} of the mine clicked when game over
  rows = preset.rows;
  cols = preset.cols;
  mines = Math.min(preset.mines, rows * cols - 1);
  board = Array.from({length: rows}, () => Array.from({length: cols}, () => ({mine: false, revealed: false, flagged: false, count: 0, hit: false})));
  gameOver = false;
  clearTimer();
  elapsed = 0;
  flagsPlaced = 0;
  updateMinesLeft();
  updateTimeDisplay();
  updateBestDisplay();
  statusEl.textContent = 'Playing';
  renderBoard();
  placeMines();
  computeCounts();
  setSmileyState('neutral');
}

function restart() {
  // reset revealed/flagged but keep same size and mine count
  board.forEach(r => r.forEach(c => Object.assign(c, {mine:false,revealed:false,flagged:false,count:0,hit:false})));
  gameOver = false;
  statusEl.textContent = 'Playing';
  clearTimer();
  elapsed = 0;
  flagsPlaced = 0;
  updateMinesLeft();
  updateTimeDisplay();
  placeMines();
  computeCounts();
  renderBoard();
  setSmileyState('neutral');
}

// Smiley face state management
let smileyState = 'neutral';
function setSmileyState(s) {
  smileyState = s;
  // apply class on the button to switch visible face
  smileyBtn.classList.remove('face-neutral','face-pressed','face-surprised','face-dead','face-win');
  smileyBtn.classList.add(`face-${s}`);
}

// When clicking smiley, restart game
smileyBtn.addEventListener('click', () => { restart(); });

// Visual feedback when pressing anywhere on the board
document.addEventListener('mousedown', (e)=>{
  // if click inside board, show pressed smiley
  if (e.target.closest && e.target.closest('#board')) setSmileyState('pressed');
});
document.addEventListener('mouseup', (e)=>{
  // restore to neutral if not ended
  if (!gameOver) setSmileyState('neutral');
});

function placeMines() {
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) { board[r][c].mine = true; placed++; }
  }
}

function computeCounts() {
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    if (board[r][c].mine) { board[r][c].count = -1; continue; }
    let cnt = 0;
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      if (dr===0 && dc===0) continue;
      const nr=r+dr, nc=c+dc;
      if (nr>=0 && nr<rows && nc>=0 && nc<cols && board[nr][nc].mine) cnt++;
    }
    board[r][c].count = cnt;
  }
}

function renderBoard() {
  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`;
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    const cell = board[r][c];
    const el = document.createElement('div');
    el.className = 'cell';
    el.setAttribute('tabindex', '0'); // make focusable for keyboard
    el.dataset.r = r; el.dataset.c = c;
    if (cell.revealed) el.classList.add('revealed');
    if (cell.flagged) el.classList.add('flagged');
    if (cell.revealed && cell.mine) el.classList.add('mine');
    if (cell.hit) el.classList.add('mine-hit');

    // Content: flag icon for flagged (when not revealed), bomb for revealed mines, number for revealed counts
    if (cell.flagged && !cell.revealed) {
      el.innerHTML = '<span class="icon flag">🚩</span>';
    } else if (cell.revealed && cell.mine) {
      el.innerHTML = '<span class="icon bomb">💣</span>';
    } else if (cell.revealed && !cell.mine && cell.count>0) {
      el.textContent = cell.count;
    }

    el.addEventListener('click', onLeftClick);
    el.addEventListener('contextmenu', onRightClick);
    // mouse pressed visual
    el.addEventListener('mousedown', () => el.classList.add('pressed'));
    // keyboard: Space/Enter should show pressed and trigger click
    el.addEventListener('keydown', (ev) => {
      if (ev.code === 'Space' || ev.key === ' ') { ev.preventDefault(); el.classList.add('pressed'); }
      if (ev.code === 'Enter') { ev.preventDefault(); el.classList.add('pressed'); el.click(); }
    });
    el.addEventListener('keyup', (ev) => {
      if (ev.code === 'Space' || ev.key === ' ') { ev.preventDefault(); el.classList.remove('pressed'); el.click(); }
    });
    boardEl.appendChild(el);
  }
}

function onLeftClick(e) {
  if (gameOver) return;
  const r = Number(this.dataset.r), c = Number(this.dataset.c);
  openCell(r,c);
  renderBoard();
  checkWin();
}

function onRightClick(e) {
  e.preventDefault();
  if (gameOver) return;
  const r = Number(this.dataset.r), c = Number(this.dataset.c);
  const cell = board[r][c];
  if (cell.revealed) return;
  cell.flagged = !cell.flagged;
  flagsPlaced += cell.flagged ? 1 : -1;
  updateMinesLeft();
  renderBoard();
}

function openCell(r,c) {
  const cell = board[r][c];
  if (cell.revealed || cell.flagged) return;
  // start timer on first reveal
  if (!startTime) startTimer();
  cell.revealed = true;
  if (cell.mine) {
    gameOver = true;
    statusEl.textContent = 'Game Over';
    // mark the hit mine
    cell.hit = true;
    revealAllMines();
    stopTimer();
    setSmileyState('dead');
    return;
  }
  if (cell.count === 0) {
    // flood fill
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      const nr=r+dr, nc=c+dc;
      if (nr>=0 && nr<rows && nc>=0 && nc<cols && !(dr===0 && dc===0)) openCell(nr,nc);
    }
  }
}

function revealAllMines() {
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    if (board[r][c].mine) board[r][c].revealed = true;
  }
}

// Timer helpers
function startTimer(){
  startTime = Date.now() - (elapsed*1000);
  timer = setInterval(()=>{
    elapsed = Math.floor((Date.now()-startTime)/1000);
    updateTimeDisplay();
  }, 250);
}
function stopTimer(){
  if (timer) clearInterval(timer);
  timer = null;
  startTime = null;
}
function clearTimer(){ stopTimer(); elapsed = 0; }
function updateTimeDisplay(){
  const mm = Math.floor(elapsed/60);
  const ss = elapsed%60;
  document.getElementById('timeDisplay').textContent = `${mm}:${ss.toString().padStart(2,'0')}`;
}

// Mines left
function updateMinesLeft(){
  const left = Math.max(0, mines - flagsPlaced);
  document.getElementById('minesLeft').textContent = left;
}

// Best score per difficulty (in seconds)
function updateBestDisplay(){
  const key = `minesweeper_best_${preset.name}`;
  const best = localStorage.getItem(key);
  document.getElementById('bestDisplay').textContent = best ? formatTime(Number(best)) : '—';
}
function formatTime(sec){
  const mm = Math.floor(sec/60);
  const ss = sec%60;
  return `${mm}:${ss.toString().padStart(2,'0')}`;
}

function recordBestIfNeeded(){
  const key = `minesweeper_best_${preset.name}`;
  const prev = Number(localStorage.getItem(key) || 0);
  if (prev === 0 || elapsed < prev) {
    localStorage.setItem(key, String(elapsed));
    updateBestDisplay();
  }
}

function checkWin() {
  let unrevealed = 0;
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    if (!board[r][c].revealed) unrevealed++;
  }
  if (unrevealed === mines) {
    gameOver = true;
    statusEl.textContent = 'You Win!';
    // auto-flag mines
    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) if (board[r][c].mine) board[r][c].flagged = true;
    renderBoard();
    stopTimer();
    recordBestIfNeeded();
    setSmileyState('win');
  }
}

startBtn.addEventListener('click', () => {
  // mark todo progress: we'll do that via manage_todo_list when finished scaffolding
  init();
});
restartBtn.addEventListener('click', () => {
  restart();
});

// difficulty buttons
document.querySelectorAll('.diff').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    preset = {name: btn.dataset.name, rows: Number(btn.dataset.rows), cols: Number(btn.dataset.cols), mines: Number(btn.dataset.mines)};
    difficultyLabel.textContent = preset.name;
    // start immediately with new preset
    init();
  });
});

// set default active diff
const defaultBtn = document.querySelector('.diff[data-name="Beginner"]');
if (defaultBtn) defaultBtn.classList.add('active');

// initialize immediately
init();

// global mouseup to clear pressed class from any cell
document.addEventListener('mouseup', () => {
  document.querySelectorAll('.cell.pressed').forEach(el => el.classList.remove('pressed'));
});

// keyboard support: space to reveal focused cell
boardEl.addEventListener('keydown', (e)=>{
  const focus = document.activeElement;
  if (!focus || !focus.classList.contains('cell')) return;
  if (e.code === 'Space') { focus.click(); e.preventDefault(); }
});

// focus on clicked cell to allow keyboard
boardEl.addEventListener('click', (e)=>{ if (e.target.classList.contains('cell')) e.target.focus(); });
