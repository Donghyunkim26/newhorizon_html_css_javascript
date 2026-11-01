const CALENDAR_KEY = 'calendar-events-v1';
const CHECK_IN_EVENT = 'Daily streak check-in';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let calendarEvents = {};
let calendarView = new Date();
let selectedCalendarDate = todayString();

function todayString() {
  return formatDate(new Date());
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateFromKey(key) {
  return new Date(`${key}T00:00:00`);
}

function isFutureDate(key) {
  return key > todayString();
}

function getStreak() {
  let streak = 0;
  const date = new Date();
  while (calendarEvents[formatDate(date)]?.includes(CHECK_IN_EVENT)) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

function syncStreakMetric() {
  try {
    localStorage.setItem('new-horizon-streak', String(getStreak()));
  } catch {}
}

function saveCalendarEvents() {
  try {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(calendarEvents));
    syncStreakMetric();
  } catch {}
}

function addToGoogleCalendar(title, dateKey) {
  const start = dateKey.replaceAll('-', '');
  const endDate = dateFromKey(dateKey);
  endDate.setDate(endDate.getDate() + 1);
  const end = formatDate(endDate).replaceAll('-', '');
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', title);
  url.searchParams.set('dates', `${start}/${end}`);
  url.searchParams.set('details', 'Planned in New Horizon Goals calendar');
  window.open(url.toString(), '_blank', 'noopener,noreferrer');
}

window.addCalendarEvent = (title) => {
  const value = String(title || '').trim();
  if (!value) return;
  const today = todayString();
  calendarView = new Date();
  selectedCalendarDate = today;
  (calendarEvents[today] ||= []).push(value);
  saveCalendarEvents();
  renderCalendar();
  renderCalendarPanel();
};

function updateStreak() {
  document.getElementById('streakCount').textContent = String(getStreak());
  const checkInButton = document.getElementById('checkInBtn');
  const checkedIn = calendarEvents[selectedCalendarDate]?.includes(CHECK_IN_EVENT);
  const futureDate = isFutureDate(selectedCalendarDate);
  checkInButton.disabled = checkedIn || futureDate;
  checkInButton.textContent = checkedIn ? 'Day tracked' : futureDate ? 'Future date' : 'Track this day';
}

function renderCalendar() {
  const year = calendarView.getFullYear();
  const month = calendarView.getMonth();
  document.getElementById('monthLabel').textContent = `${MONTHS[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const cells = [];

  for (let index = firstDay - 1; index >= 0; index -= 1) {
    cells.push({ number: daysInPreviousMonth - index, other: true, date: new Date(year, month - 1, daysInPreviousMonth - index) });
  }
  for (let number = 1; number <= daysInMonth; number += 1) {
    cells.push({ number, other: false, date: new Date(year, month, number) });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const number = cells.length - (firstDay + daysInMonth) + 1;
    cells.push({ number, other: true, date: new Date(year, month + 1, number) });
  }

  const days = document.getElementById('days');
  days.replaceChildren();
  cells.forEach(({ number, other, date }) => {
    const key = formatDate(date);
    const day = document.createElement('button');
    day.type = 'button';
    day.className = `calendar-day${other ? ' other' : ''}${key === todayString() ? ' today' : ''}${key === selectedCalendarDate ? ' selected' : ''}`;
    day.setAttribute('aria-label', date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }));

    const numberLabel = document.createElement('span');
    numberLabel.className = 'day-number';
    numberLabel.textContent = String(number);
    day.appendChild(numberLabel);

    const entries = calendarEvents[key] || [];
    if (entries.length) {
      const dots = document.createElement('span');
      dots.className = 'event-dots';
      dots.setAttribute('aria-label', `${entries.length} event${entries.length === 1 ? '' : 's'}`);
      entries.slice(0, 4).forEach(() => dots.appendChild(document.createElement('i')));
      day.appendChild(dots);
    }

    day.addEventListener('click', () => {
      selectedCalendarDate = key;
      renderCalendar();
      renderCalendarPanel();
    });
    days.appendChild(day);
  });
}

function renderCalendarPanel() {
  const selectedDate = dateFromKey(selectedCalendarDate);
  document.getElementById('selLabel').textContent = selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const list = document.getElementById('evtList');
  const entries = calendarEvents[selectedCalendarDate] || [];
  list.replaceChildren();

  if (entries.length) {
    entries.forEach((entry, index) => {
      const row = document.createElement('div');
      row.className = 'calendar-event';
      const label = document.createElement('span');
      label.textContent = entry;
         const google = document.createElement('button');
         google.type = 'button';
         google.className = 'google-calendar';
         google.dataset.title = entry;
         google.textContent = 'Google Calendar';
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-event';
      remove.dataset.index = String(index);
      remove.setAttribute('aria-label', `Remove ${entry}`);
      remove.textContent = 'x';
         row.append(label, google, remove);
      list.appendChild(row);
    });
  }
  updateStreak();
}

document.getElementById('evtList').addEventListener('click', (event) => {
  const remove = event.target.closest('.remove-event');
  if (!remove) return;
  calendarEvents[selectedCalendarDate].splice(Number(remove.dataset.index), 1);
  if (!calendarEvents[selectedCalendarDate].length) delete calendarEvents[selectedCalendarDate];
  saveCalendarEvents();
  renderCalendar();
  renderCalendarPanel();
});

document.getElementById('evtList').addEventListener('click', (event) => {
  const google = event.target.closest('.google-calendar');
  if (!google) return;
  addToGoogleCalendar(google.dataset.title, selectedCalendarDate);
});

document.getElementById('checkInBtn').addEventListener('click', () => {
  if (isFutureDate(selectedCalendarDate) || calendarEvents[selectedCalendarDate]?.includes(CHECK_IN_EVENT)) return;
  (calendarEvents[selectedCalendarDate] ||= []).push(CHECK_IN_EVENT);
  saveCalendarEvents();
  renderCalendar();
  renderCalendarPanel();
});

document.getElementById('prev').addEventListener('click', () => {
  calendarView.setMonth(calendarView.getMonth() - 1);
  renderCalendar();
});
document.getElementById('next').addEventListener('click', () => {
  calendarView.setMonth(calendarView.getMonth() + 1);
  renderCalendar();
});
document.getElementById('todayBtn').addEventListener('click', () => {
  calendarView = new Date();
  selectedCalendarDate = todayString();
  renderCalendar();
  renderCalendarPanel();
});

try {
  calendarEvents = JSON.parse(localStorage.getItem(CALENDAR_KEY) || '{}') || {};
} catch {}
syncStreakMetric();
renderCalendar();
renderCalendarPanel();
