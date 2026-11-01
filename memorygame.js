const foods = [
    String.fromCodePoint(0x1f34e), String.fromCodePoint(0x1f34c), String.fromCodePoint(0x1f951),
    String.fromCodePoint(0x1f955), String.fromCodePoint(0x1f966), String.fromCodePoint(0x1f34a),
    String.fromCodePoint(0x1f353), String.fromCodePoint(0x1f348), String.fromCodePoint(0x1f95d)
];
const board = document.getElementById('board');
const timeLabel = document.getElementById('time');
const movesLabel = document.getElementById('moves');
const pairsLabel = document.getElementById('pairs');
const message = document.getElementById('message');
let firstCard = null;
let secondCard = null;
let locked = false;
let moves = 0;
let matched = 0;
let time = 60;
let timerId = null;
let gameFinished = false;

function shuffle(list) { return [...list].sort(() => Math.random() - 0.5); }
function updateStats() { timeLabel.textContent = time; movesLabel.textContent = moves; pairsLabel.textContent = `${matched}/${foods.length}`; }
function startGame() {
    clearInterval(timerId);
    firstCard = null; secondCard = null; locked = false; moves = 0; matched = 0; time = 60; gameFinished = false;
    board.innerHTML = '';
    shuffle([...foods, ...foods]).forEach(value => {
        const card = document.createElement('button');
        card.className = 'card'; card.type = 'button'; card.dataset.value = value; card.setAttribute('aria-label', 'Hidden card');
        card.addEventListener('click', () => reveal(card)); board.appendChild(card);
    });
    message.textContent = 'Match the healthy food cards.';
    updateStats();
    timerId = setInterval(() => { time -= 1; updateStats(); if (time <= 0) finish(false); }, 1000);
}
function reveal(card) {
    if (locked || card === firstCard || card.classList.contains('matched')) return;
    card.classList.add('open');
    if (!firstCard) { firstCard = card; return; }
    secondCard = card; moves += 1; updateStats();
    if (firstCard.dataset.value === secondCard.dataset.value) {
        firstCard.classList.add('matched'); secondCard.classList.add('matched'); matched += 1; resetTurn(); updateStats();
        if (matched === foods.length) finish(true);
        return;
    }
    locked = true;
    setTimeout(() => { firstCard.classList.remove('open'); secondCard.classList.remove('open'); resetTurn(); }, 650);
}
function resetTurn() { firstCard = null; secondCard = null; locked = false; }
function finish(won) {
    if (gameFinished) return;
    clearInterval(timerId); locked = true;
    gameFinished = true;
    const score = won ? Math.max(100, 1000 + (time * 10) - (moves * 15)) : matched * 100;
    sessionStorage.setItem('memoryGameLastResult', JSON.stringify({ won, score, moves, time, matched }));
    message.textContent = won ? `You found every pair in ${moves} moves! Loading your results...` : 'Time is up. Loading your results...';
    setTimeout(() => { window.location.href = 'memoryleaderboard.html'; }, 700);
}
startGame();
