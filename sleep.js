const consistency = document.getElementById('consistency');
const pageSwitcher = document.getElementById('pageSwitcher');

function goBackToExplore() {
    window.location.href = 'explore.html';
}

document.getElementById('backToExploreButton')?.addEventListener('click', goBackToExplore);

pageSwitcher?.addEventListener('change', () => {
    if (pageSwitcher.value) window.location.href = pageSwitcher.value;
});

const consistVal = document.getElementById('consistVal');
const consistLabels = ['Varies a lot', 'Fairly consistent', 'Very consistent'];
consistency.addEventListener('input', () => consistVal.textContent = consistLabels[consistency.value]);

const wakeups = document.getElementById('wakeups');
const wakeupsVal = document.getElementById('wakeupsVal');
wakeups.addEventListener('input', () => wakeupsVal.textContent = wakeups.value);

const screen = document.getElementById('screen');
const screenVal = document.getElementById('screenVal');
const screenLabels = ['0h', '1h', '2h', '+3h'];
screen.addEventListener('input', () => screenVal.textContent = screenLabels[screen.value]);

const toggles = document.querySelectorAll('.toggle');
const activeToggles = new Set();
toggles.forEach(t => {
    t.addEventListener('click', () => {
        t.classList.toggle('active');
        const key = t.dataset.key;
        activeToggles.has(key) ? activeToggles.delete(key) : activeToggles.add(key);
    });
});

function statusFor(pct) {
    if (pct >= 75) return { label: 'Great', cls: 'great' };
    if (pct >= 45) return { label: 'Okay', cls: 'ok' };
    return { label: 'Low', cls: 'low' };
}

function buildRow(name, pct, note) {
    const s = statusFor(pct);
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <div class="row-top"><span>${name}</span><span class="status ${s.cls}">${s.label}</span></div>
      <div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div>
      <div style="font-size:12.5px;color:var(--text-soft);margin-top:8px;">${note}</div>
    `;
    return row;
}

document.getElementById('checkBtn').addEventListener('click', () => {
    const bedtime = document.getElementById('bedtime').value;
    const waketime = document.getElementById('waketime').value;

    // compute duration across midnight
    const [bh, bm] = bedtime.split(':').map(Number);
    const [wh, wm] = waketime.split(':').map(Number);
    let bedMinutes = bh * 60 + bm;
    let wakeMinutes = wh * 60 + wm;
    if (wakeMinutes <= bedMinutes) wakeMinutes += 24 * 60;
    const durationHrs = (wakeMinutes - bedMinutes) / 60;

    const durationPct = Math.max(0, Math.min(100, Math.round((durationHrs / 8) * 100)));
    const consistPct = [30, 65, 100][consistency.value];
    const wakeupsPct = Math.max(0, 100 - Number(wakeups.value) * 20);
    const screenPct = [100, 75, 45, 20][screen.value];

    let habitScore = 0;
    if (!activeToggles.has('caffeine')) habitScore += 25;
    if (activeToggles.has('wind')) habitScore += 25;
    if (activeToggles.has('dark')) habitScore += 25;
    if (!activeToggles.has('nap')) habitScore += 25;

    const overall = Math.round(
        durationPct * 0.35 + consistPct * 0.2 + wakeupsPct * 0.15 + screenPct * 0.15 + habitScore * 0.15
    );

    document.getElementById('ring').style.setProperty('--pct', overall);
    document.getElementById('scoreNum').textContent = overall;

    const scoreTitle = document.getElementById('scoreTitle');
    const scoreMsg = document.getElementById('scoreMsg');

    if (overall >= 80) {
        scoreTitle.textContent = "Well-rested rhythm";
        scoreMsg.textContent = "Your pattern is supporting real recovery. Keep this consistency going.";
    } else if (overall >= 55) {
        scoreTitle.textContent = "Decent, with room to improve";
        scoreMsg.textContent = "A few habits are working against you. One change below will make a real difference.";
    } else {
        scoreTitle.textContent = "Your sleep needs some attention";
        scoreMsg.textContent = "This pattern is likely affecting your energy and focus. Start with just one change tonight.";
    }

    const breakdown = document.getElementById('breakdown');
    breakdown.innerHTML = '';
    breakdown.appendChild(buildRow('Sleep duration', durationPct, `About ${durationHrs.toFixed(1)} hours · aim for 7–9`));
    breakdown.appendChild(buildRow('Schedule consistency', consistPct, `${consistLabels[consistency.value]} bed/wake times`));
    breakdown.appendChild(buildRow('Uninterrupted sleep', wakeupsPct, `${wakeups.value} wake-up${wakeups.value == 1 ? '' : 's'} per night`));
    breakdown.appendChild(buildRow('Wind-down quality', screenPct, `${screenLabels[screen.value]} screen use before bed`));
    breakdown.appendChild(buildRow('Evening habits', habitScore, `${activeToggles.size}/4 supportive habits checked`));

    const tips = [];
    if (durationPct < 75) tips.push('Shift bedtime 15–20 minutes earlier this week rather than all at once.');
    if (consistPct < 75) tips.push('Try waking at the same time every day, even on weekends — it anchors your rhythm.');
    if (wakeupsPct < 75) tips.push('Cut caffeine or alcohol in the evening if wake-ups are frequent.');
    if (screenPct < 75) tips.push('Put your phone outside arm\'s reach for the last 30 minutes before bed.');
    if (habitScore < 75) tips.push('Build a short wind-down routine — dim lights, stretch, or read for 10 minutes.');
    if (tips.length === 0) tips.push('Your habits are working well together — keep this routine going.');

    const tipsList = document.getElementById('tipsList');
    tipsList.innerHTML = '';
    tips.forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        tipsList.appendChild(li);
    });

    const results = document.getElementById('results');
    results.classList.add('show');
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
