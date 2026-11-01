const QUESTIONS = [
    {
        q: "Mild dehydration is generally defined as losing what percentage of body water?",
        opts: ["0.5%", "1–2%", "5–6%", "10%+"],
        correct: 1,
        explain: "Losing just 1–2% of body water can trigger fatigue and reduced concentration."
    },
    {
        q: "Eating smaller, more frequent meals measurably speeds up your metabolism.",
        opts: ["True", "False"],
        correct: 1,
        explain: "False. Total calorie and macronutrient intake matter more than meal frequency."
    },
    {
        q: "Which of these is a complete protein containing all nine essential amino acids?",
        opts: ["Rice", "Quinoa", "Peanuts", "Wheat"],
        correct: 1,
        explain: "Quinoa is one of the few plant foods that is a complete protein on its own."
    },
    {
        q: "Sleeping in on weekends fully reverses the effects of sleep debt from the workweek.",
        opts: ["True", "False"],
        correct: 1,
        explain: "False. Catch-up sleep can help, but it does not fully restore every effect of sleep debt."
    },
    {
        q: "How many minutes of vigorous activity is roughly equivalent to 150 minutes of moderate activity?",
        opts: ["50 minutes", "75 minutes", "100 minutes", "150 minutes"],
        correct: 1,
        explain: "Vigorous activity counts roughly double, so about 75 minutes is commonly recommended."
    },
    {
        q: "Blue light from screens is the primary cause of digital eye strain.",
        opts: ["True", "False"],
        correct: 1,
        explain: "False. Reduced blinking and focusing distance are bigger contributors to eye strain."
    },
    {
        q: "Which has more fibre per typical serving?",
        opts: ["An apple with skin", "A cup of white rice", "They are roughly equal", "Neither contains fibre"],
        correct: 0,
        explain: "An apple with skin has roughly 4g of fibre, while white rice contains much less."
    },
    {
        q: "Cortisol, the body's main stress hormone, is lowest right after waking up.",
        opts: ["True", "False"],
        correct: 1,
        explain: "False. Cortisol naturally peaks shortly after waking and gradually declines through the day."
    },
    {
        q: "How many minutes of midday sun exposure is often cited for vitamin D synthesis in fair-skinned people?",
        opts: ["2–3 minutes", "10–15 minutes", "45–60 minutes", "2+ hours"],
        correct: 1,
        explain: "Around 10–15 minutes is a commonly cited estimate, but needs vary widely."
    },
    {
        q: "Blood pressure readings taken at home are typically higher than those taken in a doctor's office.",
        opts: ["True", "False"],
        correct: 1,
        explain: "False. White coat syndrome often makes office readings higher than home readings."
    }
];

const BEST_KEY = 'health-quiz-cover-best';
let answers = new Array(QUESTIONS.length).fill(null);
let submitted = false;
let best = 0;
let timeLeft = 90;
let timerId = null;

function answeredCount() {
    return answers.filter(answer => answer !== null).length;
}

function beginQuiz() {
    clearTimer();
    answers = new Array(QUESTIONS.length).fill(null);
    submitted = false;
    timeLeft = 90;
    document.getElementById('cover').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    renderList();
    updateTimer();
    timerId = setInterval(() => {
        timeLeft -= 1;
        updateTimer();
        if (timeLeft <= 0) {
            clearTimer();
            submitQuiz(true);
        }
    }, 1000);
}

function clearTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
}

function updateTimer() {
    const timerValue = document.getElementById('timerValue');
    if (!timerValue) return;
    timerValue.textContent = `${String(Math.floor(Math.max(timeLeft, 0) / 60)).padStart(2, '0')}:${String(Math.max(timeLeft, 0) % 60).padStart(2, '0')}`;
    timerValue.classList.toggle('urgent', timeLeft <= 10);
}

function renderList() {
    const done = answeredCount();
    document.getElementById('answerLbl').textContent = `${done} of ${QUESTIONS.length} answered`;
    document.getElementById('bestLbl').textContent = `Best score: ${best}/${QUESTIONS.length}`;
    const submitButton = document.getElementById('submitBtn');
    submitButton.disabled = done < QUESTIONS.length;
    submitButton.textContent = done < QUESTIONS.length ? `Answer all questions (${done}/${QUESTIONS.length})` : 'Submit answers';

    document.getElementById('qlist').innerHTML = QUESTIONS.map((item, questionIndex) => `
        <div class="qcard" id="q${questionIndex}">
            <div class="qnum">QUESTION ${questionIndex + 1} OF ${QUESTIONS.length}</div>
            <p class="q">${item.q}</p>
            ${item.opts.map((option, optionIndex) => `<button class="opt${answers[questionIndex] === optionIndex ? ' picked' : ''}" onclick="pick(${questionIndex},${optionIndex})">${option}</button>`).join('')}
        </div>`).join('');
}

function pick(questionIndex, optionIndex) {
    if (submitted) return;
    answers[questionIndex] = optionIndex;
    renderList();
    document.getElementById(`q${questionIndex}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function submitQuiz(fromTimer = false) {
    if (submitted) return;
    submitted = true;
    clearTimer();
    let score = 0;

    QUESTIONS.forEach((item, questionIndex) => {
        const card = document.getElementById(`q${questionIndex}`);
        const options = card.querySelectorAll('.opt');
        options.forEach((button, optionIndex) => {
            button.disabled = true;
            button.onclick = null;
            if (optionIndex === item.correct) button.classList.add('correct');
            else if (optionIndex === answers[questionIndex]) button.classList.add('wrong');
        });
        const explanation = document.createElement('div');
        explanation.className = 'explain';
        const correct = answers[questionIndex] === item.correct;
        explanation.innerHTML = `<strong>${correct ? 'Correct!' : 'Not quite.'}</strong> ${correct ? '' : `Correct answer: <b>${item.opts[item.correct]}</b>. `}${item.explain}`;
        card.appendChild(explanation);
        if (correct) score += 1;
    });

    const submitButton = document.getElementById('submitBtn');
    submitButton.textContent = fromTimer ? 'Time is up' : 'Answers submitted';
    submitButton.disabled = true;
    if (score > best) {
        best = score;
        await saveBest();
    }

    const percentage = Math.round(score / QUESTIONS.length * 100);
    const message = percentage >= 85 ? 'Excellent! You really know your habits.' : percentage >= 60 ? 'Solid work — a few gaps to brush up on.' : 'Good start — retake it to lock in the basics.';
    document.getElementById('results-slot').innerHTML = `
        <div class="results">
            <div class="big-score">${score} / ${QUESTIONS.length} correct</div>
            <p class="sub" style="margin-top:6px">${message}</p>
            <div class="stat-row2">
                <div class="stat2"><b>${percentage}%</b><span>This attempt</span></div>
                <div class="stat2"><b>${best}</b><span>Best score</span></div>
            </div>
            <button class="btn2" onclick="openLeaderboard(${score})">View leaderboard</button>
            <button class="btn2 outline-btn" onclick="restart()">Retake quiz</button>
            <button class="btn2 text-btn" onclick="backToCover()">Back to menu</button>
        </div>`;
    document.getElementById('results-slot').scrollIntoView({ behavior: 'smooth' });
}

function openLeaderboard(score) {
    sessionStorage.setItem('healthQuizLastScore', String(score));
    sessionStorage.setItem('healthQuizBestScore', String(best));
    window.location.href = 'leaderboard.html';
}

function restart() {
    clearTimer();
    answers = new Array(QUESTIONS.length).fill(null);
    submitted = false;
    timeLeft = 90;
    document.getElementById('results-slot').innerHTML = '';
    renderList();
    updateTimer();
    timerId = setInterval(() => {
        timeLeft -= 1;
        updateTimer();
        if (timeLeft <= 0) {
            clearTimer();
            submitQuiz(true);
        }
    }, 1000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToCover() {
    clearTimer();
    window.location.href = 'quizmenu.html';
}

function backToGameCategory() {
    window.location.href = 'gamecategory.html';
}

async function saveBest() {
    try {
        if (window.storage) await window.storage.set(BEST_KEY, JSON.stringify({ best }));
    } catch (error) {
        localStorage.setItem(BEST_KEY, String(best));
    }
}

async function loadBest() {
    try {
        if (window.storage) {
            const result = await window.storage.get(BEST_KEY);
            if (result && result.value) best = JSON.parse(result.value).best || 0;
        } else {
            best = Number(localStorage.getItem(BEST_KEY)) || 0;
        }
    } catch (error) {
        best = Number(localStorage.getItem(BEST_KEY)) || 0;
    }
    document.getElementById('coverCount').textContent = QUESTIONS.length;
    document.getElementById('coverBest').textContent = best;
}

loadBest();

if (new URLSearchParams(window.location.search).get('start') === '1') beginQuiz();
