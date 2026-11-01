const TOTAL_QUESTIONS = 7;
const lastScore = Number(sessionStorage.getItem('healthQuizLastScore'));
const bestScore = Number(sessionStorage.getItem('healthQuizBestScore')) || lastScore || 0;

const players = [
    { name: 'Maya', score: 7 },
    { name: 'Liam', score: 6 },
    { name: 'Aria', score: 5 }
];

if (Number.isFinite(lastScore) && lastScore >= 0 && lastScore <= TOTAL_QUESTIONS) {
    players.push({ name: 'You', score: lastScore, current: true });
}

players.sort((first, second) => second.score - first.score);
const yourRank = players.findIndex(player => player.current) + 1;

const podiumPlayers = [...players].slice(0, 3);
const podiumOrder = [podiumPlayers[1], podiumPlayers[0], podiumPlayers[2]].filter(Boolean);
document.getElementById('podium').innerHTML = podiumOrder.map((player, index) => {
    const rank = player === podiumPlayers[0] ? 1 : player === podiumPlayers[1] ? 2 : 3;
    const placeClass = rank === 1 ? 'first' : rank === 2 ? 'second' : 'third';
    return `<div class="podium-card ${placeClass}">
        <span class="podium-rank">${rank}</span>
        <span class="podium-name">${player.name}${player.current ? ' · You' : ''}</span>
        <span class="podium-score">${player.score}/${TOTAL_QUESTIONS}</span>
    </div>`;
}).join('');

const scorePanel = document.getElementById('yourScore');
if (yourRank) {
    scorePanel.innerHTML = `
        <div>
            <div class="score-kicker">YOUR LATEST ATTEMPT</div>
            <p class="score-message">You placed ${yourRank}${yourRank === 1 ? 'st' : yourRank === 2 ? 'nd' : yourRank === 3 ? 'rd' : 'th'} this week.</p>
        </div>
        <div class="score-number">${lastScore}<span> / ${TOTAL_QUESTIONS}</span></div>`;
} else {
    scorePanel.innerHTML = `
        <div>
            <div class="score-kicker">READY TO PLAY?</div>
            <p class="score-message">Take the quiz to join this week's rankings.</p>
        </div>
        <div class="score-number">--<span> / ${TOTAL_QUESTIONS}</span></div>`;
}

document.getElementById('boardList').innerHTML = players.map((player, index) => `
    <div class="board-row${player.current ? ' is-you' : ''}">
        <span class="rank">${index + 1}</span>
        <span class="player">${player.name}${player.current ? '<em>You</em>' : ''}</span>
        <span class="score-track"><i class="score-fill" style="width:${Math.max(12, player.score / TOTAL_QUESTIONS * 100)}%"></i><b class="score-value">${player.score}/${TOTAL_QUESTIONS}</b></span>
    </div>`).join('');
