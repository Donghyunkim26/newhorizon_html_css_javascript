document.addEventListener('DOMContentLoaded', () => {
  const account = getStoredAccount() || {};

  const getValue = (key, fallback = 'Not provided') =>
    localStorage.getItem(`new-horizon-${key}`) || fallback;

  const getInitials = (name) => name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'U';

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    if (hour < 22) return 'Good evening';
    return 'Good night';
  };

  const updateTimeGreeting = () => {
    document.getElementById('greetingTime')?.replaceChildren(getTimeGreeting());
  };

  const getMetric = (key, fallback = 0) => {
    const value = localStorage.getItem(`new-horizon-${key}`);
    if (value === null) return fallback;

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.length;
      if (typeof parsed === 'object' && parsed !== null) return Object.keys(parsed).length;
      return Number.isFinite(Number(parsed)) ? Number(parsed) : fallback;
    } catch {
      return Number.isFinite(Number(value)) ? Number(value) : fallback;
    }
  };

  const getCompletedActivityCount = () => {
    try {
      const activities = JSON.parse(localStorage.getItem('new-horizon-activity-completions') || '[]');
      return Array.isArray(activities) ? activities.length : 0;
    } catch {
      return 0;
    }
  };

  const formatMemberSince = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? 'This month'
      : date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };

  let records;
  try {
    records = JSON.parse(localStorage.getItem('new-horizon-progress-records') || 'null');
  } catch {
    records = null;
  }
  records = records || {
    goals: [{ date: '2025-09-01', value: 0 }, { date: '2025-09-08', value: 1 }, { date: '2025-09-15', value: 2 }],
    streak: [{ date: '2025-09-01', value: 3 }, { date: '2025-09-08', value: 1 }, { date: '2025-09-15', value: 0 }],
    achievements: [{ date: '2025-09-01', value: 0 }, { date: '2025-09-08', value: 0 }, { date: '2025-09-15', value: 1 }]
  };

  function getLastSevenDays() {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      days.push(date.toISOString().slice(0, 10));
    }

    return days;
  }

  function getLastSevenDaysRecords() {
    const lastSevenDays = new Set(getLastSevenDays());
    return Object.fromEntries(Object.entries(records).map(([metric, entries]) => [
      metric,
      entries.filter((entry) => lastSevenDays.has(entry.date))
    ]));
  }

  function logProgress(metric, value) {
    if (!records[metric]) return;
    const date = new Date().toISOString().slice(0, 10);
    const existing = records[metric].find((entry) => entry.date === date);
    if (existing) existing.value = value;
    else records[metric].push({ date, value });
    const lastSevenDays = new Set(getLastSevenDays());
    records[metric] = records[metric].filter((entry) => lastSevenDays.has(entry.date));
    localStorage.setItem('new-horizon-progress-records', JSON.stringify(records));
    renderAllCharts();
  }

  function renderAllCharts() {
    const chart = document.getElementById('progressChart');
    if (!chart) return;

    const recentRecords = getLastSevenDaysRecords();
    const series = Object.values(recentRecords).flat();
    const maxValue = Math.max(1, ...series.map((entry) => Number(entry.value) || 0));
    const currentGoals = getUserGoals();
    const liveValues = {
      goals: currentGoals.filter((goal) => !goal.done).length,
      achievements: currentGoals.filter((goal) => goal.done).length + getCompletedActivityCount()
    };
    const latestValue = (metric) => {
      if (Object.prototype.hasOwnProperty.call(liveValues, metric)) return liveValues[metric];
      const latestEntry = (recentRecords[metric] || []).reduce(
        (latest, entry) => (!latest || entry.date > latest.date ? entry : latest),
        null
      );
      return Number(latestEntry?.value) || 0;
    };
    const metrics = [
      ['goals', 'Goals', 'active'],
      ['streak', 'Streak', 'days'],
      ['achievements', 'Achievements', 'earned']
    ];
    const circumference = 2 * Math.PI * 48;
    metrics.forEach(([metric, label, unit]) => {
      const value = latestValue(metric);
      const percentage = Math.min(100, Math.round((value / maxValue) * 100));
      const wheel = document.getElementById(`${metric}Wheel`);
      const wheelValue = document.getElementById(`${metric}WheelValue`);
      const detail = document.getElementById(`${metric}WheelDetail`);
      if (wheel) {
        wheel.style.strokeDasharray = String(circumference);
        wheel.style.strokeDashoffset = String(circumference - (circumference * percentage / 100));
      }
      if (wheelValue) wheelValue.textContent = metric === 'achievements' ? String(value) : `${percentage}%`;
      if (detail) detail.textContent = `${value} ${unit}`;
      const card = document.querySelector(`.progress-wheel-${metric}`);
      if (card) card.querySelector('.progress-wheel').setAttribute('aria-label', `${label}: ${value} ${unit}, ${percentage}% of combined progress`);
    });

    const summary = document.getElementById('progressTrendSummary');
    if (summary) {
      const trackedDays = new Set(series.map((entry) => entry.date)).size;
      summary.textContent = `${trackedDays} of 7 days tracked for goals and achievements.`;
    }
  }

  const updateHealthOverview = () => {
    const goals = getUserGoals();
    const activeGoals = goals.filter((goal) => !goal.done).length;
    const streak = getMetric('streak');
    const achievements = goals.filter((goal) => goal.done).length + getCompletedActivityCount();
    const memberSince = localStorage.getItem('new-horizon-memberSince')
      || account.createdAt;

    document.getElementById('activeGoalsValue')?.replaceChildren(String(activeGoals));
    document.getElementById('streakValue')?.replaceChildren(String(streak));
    document.getElementById('achievementValue')?.replaceChildren(String(achievements));
    document.getElementById('memberSinceValue')?.replaceChildren(formatMemberSince(memberSince));

    const activeGoalsNote = document.getElementById('activeGoalsNote');
    if (activeGoalsNote) activeGoalsNote.textContent = activeGoals ? 'Keep your momentum' : 'Ready to get started';

    const streakNote = document.getElementById('streakNote');
    if (streakNote) streakNote.textContent = streak ? 'Consistency is building' : 'Build your healthy habit';

    const achievementNote = document.getElementById('achievementNote');
    if (achievementNote) achievementNote.textContent = achievements ? 'Great work so far' : 'Your progress will appear here';

    document.getElementById('dashboardGoalsValue')?.replaceChildren(String(activeGoals));
    document.getElementById('dashboardStreakValue')?.replaceChildren(String(streak));
    document.getElementById('dashboardAchievementValue')?.replaceChildren(String(achievements));

    const goalList = document.getElementById('dashboardGoalList');
    if (goalList) {
      const visibleGoals = goals.filter((goal) => !goal.done).slice(0, 4);
      goalList.replaceChildren();
      if (visibleGoals.length) {
        visibleGoals.forEach((goal) => {
          const row = document.createElement('div');
          row.className = 'dashboard-goal-row';

          const marker = document.createElement('span');
          marker.className = 'dashboard-goal-marker';
          marker.setAttribute('aria-hidden', 'true');

          const title = document.createElement('span');
          title.className = 'dashboard-goal-title';
          title.textContent = goal.title;

          const progress = document.createElement('span');
          progress.className = 'dashboard-goal-progress';
          progress.textContent = `${Number(goal.progress) || 0}%`;

          row.append(marker, title, progress);
          goalList.appendChild(row);
        });
      } else {
        const empty = document.createElement('p');
        empty.className = 'dashboard-goals-empty';
        empty.textContent = 'No active goals yet. Add one to start tracking.';
        goalList.appendChild(empty);
      }
    }

    const dashboardDate = document.getElementById('dashboardDate');
    if (dashboardDate) {
      dashboardDate.textContent = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }

    logProgress('goals', activeGoals);
    logProgress('streak', streak);
    logProgress('achievements', achievements);
  };

  let progressStatusTimer;
  document.getElementById('recordProgressButton')?.addEventListener('click', () => {
    updateHealthOverview();
    const status = document.getElementById('progressRecordStatus');
    if (!status) return;
    status.textContent = `Progress recorded for ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    window.clearTimeout(progressStatusTimer);
    progressStatusTimer = window.setTimeout(() => {
      status.textContent = '';
    }, 3500);
  });

  const updateProfile = () => {
    const name = (account.username || getValue('fullName', '')).trim() || 'User';
    const profileValues = {
      profileName: name,
      profileEmail: getValue('email', account.email || 'Not provided'),
      profilePhone: getValue('phone', account.phone || 'Not provided'),
      profileLocation: getValue('location', account.location || 'Not provided')
    };

    Object.entries(profileValues).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });

    const greeting = document.getElementById('greetingName');
    if (greeting) greeting.textContent = name.split(/\s+/)[0];
    updateTimeGreeting();

    const initials = document.getElementById('profileInitials');
    if (initials) initials.textContent = getInitials(name);

    const profilePhoto = document.getElementById('profilePhoto');
    const profilePhotoInitials = document.getElementById('profilePhotoInitials');
    const savedPhoto = localStorage.getItem('new-horizon-profile-photo');
    if (profilePhoto && profilePhotoInitials) {
      profilePhotoInitials.textContent = getInitials(name);
      profilePhoto.hidden = !savedPhoto;
      profilePhotoInitials.hidden = Boolean(savedPhoto);
      if (savedPhoto) profilePhoto.src = savedPhoto;
    }

    const avatar = document.getElementById('topbarAvatar');
    if (avatar) avatar.setAttribute('aria-label', `${name} profile`);

    const personalValues = {
      fullName: name,
      dob: getValue('dob'),
      gender: getValue('gender'),
      height: getValue('height'),
      weight: getValue('weight'),
      activityLevel: getValue('activityLevel')
    };

    Object.entries(personalValues).forEach(([field, value]) => {
      const element = document.querySelector(`[data-field="${field}"]`);
      if (element) element.textContent = value;
    });

    updateHealthOverview();
  };

  updateProfile();
  window.setInterval(updateTimeGreeting, 60000);

  const profilePhotoInput = document.getElementById('profilePhotoInput');
  profilePhotoInput?.addEventListener('change', () => {
    const file = profilePhotoInput.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      localStorage.setItem('new-horizon-profile-photo', String(reader.result));
      updateProfile();
    });
    reader.readAsDataURL(file);
  });

  window.addEventListener('storage', updateProfile);
  window.addEventListener('profile-updated', updateProfile);

  const editButton = document.getElementById('editProfileBtn');
  if (editButton) {
    editButton.addEventListener('click', () => {
        window.location.href = 'setting.html#account';
    });
  }

  document.querySelector('.sidebar-link[data-key="profile"]')?.addEventListener('click', (event) => {
    if (event.currentTarget.getAttribute('href') === '#profile') {
      event.preventDefault();
      document.getElementById('profile')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
