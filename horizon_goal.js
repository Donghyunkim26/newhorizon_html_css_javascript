
  let filter = "all";
  requireAuthentication();
  let goals = getUserGoals();

  function recordGoalAchievement(goal) {
    const account = getStoredAccount();
    const username = account?.username?.toLowerCase() || 'guest';
    const key = `new-horizon-achievements:${encodeURIComponent(username)}`;
    let achievements;
    try {
      achievements = JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      achievements = [];
    }
    if (!Array.isArray(achievements)) achievements = [];
    if (achievements.some((achievement) => achievement.goalId === goal.id)) return;
    achievements.push({
      id: `goal-${goal.id}`,
      goalId: goal.id,
      title: goal.title,
      type: 'Goal completed',
      completedAt: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(achievements));
  }

  function saveProgressSnapshot() {
    const today = new Date().toISOString().slice(0, 10);
    const recordsKey = 'new-horizon-progress-records';
    let records;

    try {
      records = JSON.parse(localStorage.getItem(recordsKey) || '{}');
    } catch {
      records = {};
    }

    records.goals = Array.isArray(records.goals) ? records.goals : [];
    records.streak = Array.isArray(records.streak) ? records.streak : [];
    records.achievements = Array.isArray(records.achievements) ? records.achievements : [];

    const snapshot = {
      goals: goals.filter((goal) => !goal.done).length,
      streak: Number.parseInt(localStorage.getItem('new-horizon-streak') || '0', 10) || 0,
      achievements: goals.filter((goal) => goal.done).length
    };

    Object.entries(snapshot).forEach(([metric, value]) => {
      const existing = records[metric].find((entry) => entry.date === today);
      if (existing) existing.value = value;
      else records[metric].push({ date: today, value });
      records[metric] = records[metric].slice(-7);
    });

    localStorage.setItem(recordsKey, JSON.stringify(records));
  }

  function render(){
    const list = document.getElementById("goalList");
    const empty = document.getElementById("emptyState");
    list.innerHTML = "";

    const visible = goals.filter(g=>{
      if(filter==="active") return !g.done;
      if(filter==="done") return g.done;
      return true;
    });

    empty.style.display = visible.length ? "none" : "block";

    visible.forEach(g=>{
      const el = document.createElement("div");
      el.className = "goal" + (g.done ? " done" : "");
      el.innerHTML = `
        <div class="goal-top">
          <button class="goal-check" aria-label="Mark complete"></button>
          <div class="goal-title"></div>
          <button class="goal-delete" aria-label="Delete goal">&times;</button>
        </div>
        <div class="progress-row">
          <input type="range" class="progress-slider" min="0" max="100" step="5" value="${g.progress}" aria-label="Progress for ${g.title.replace(/"/g,'&quot;')}">
          <div class="progress-label">${g.progress}%</div>
        </div>
        <div class="goal-status" aria-live="polite"></div>
      `;
      el.querySelector(".goal-title").textContent = g.title;
      el.querySelector(".goal-status").textContent = g.done
        ? "Complete"
        : g.progress > 0
          ? "Processing"
          : "Ready to track";

      el.querySelector(".goal-check").addEventListener("click", ()=>{
        g.done = !g.done;
        if(g.done) {
          g.progress = 100;
          recordGoalAchievement(g);
        }
        saveUserGoals(goals);
        saveProgressSnapshot();
        render();
      });
      el.querySelector(".goal-delete").addEventListener("click", ()=>{
        goals = goals.filter(x=>x.id!==g.id);
        saveUserGoals(goals);
        saveProgressSnapshot();
        render();
      });
      el.querySelector(".progress-slider").addEventListener("input", (e)=>{
        g.progress = parseInt(e.currentTarget.value, 10);
        g.done = g.progress>=100;
        if(g.done) recordGoalAchievement(g);
        saveUserGoals(goals);
        saveProgressSnapshot();
        render();
      });

      list.appendChild(el);
    });
  }

  document.getElementById("goalForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    const input = document.getElementById("goalInput");
    const title = input.value.trim();
    if(!title) return;
    goals.push({ id: Date.now(), title, done:false, progress:0 });
    saveUserGoals(goals);
    saveProgressSnapshot();
    window.addCalendarEvent?.(title);
    input.value = "";
    render();
  });

  document.querySelectorAll(".filters button").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelector(".filters button.active").classList.remove("active");
      btn.classList.add("active");
      filter = btn.dataset.filter;
      render();
    });
  });

  render();
