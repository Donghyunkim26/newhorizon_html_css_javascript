const result = JSON.parse(sessionStorage.getItem('memoryGameLastResult') || 'null');
const players = [
    { name: 'Maya', score: 920 },
    { name: 'Liam', score: 790 },
    { name: 'Aria', score: 650 }
];

if (result && Number.isFinite(result.score)) {
    players.push({ name: 'You', score: result.score, current: true });
}

players.sort((first, second) => second.score - first.score);
const highestScore = Math.max(...players.map(player => player.score));
document.getElementById('leaderboardList').innerHTML = players.map((player, index) => `<div class="leader-row${player.current ? ' current' : ''}"><span class="rank">${index + 1}</span><span class="player">${player.name}${player.current ? '<em>You</em>' : ''}</span><span class="score-track"><i class="score-fill" style="width:${Math.max(12, player.score / highestScore * 100)}%"></i><b class="score-value">${player.score}</b></span></div>`).join('');
