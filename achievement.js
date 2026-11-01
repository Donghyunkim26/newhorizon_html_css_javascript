requireAuthentication();

const account = getStoredAccount();
const username = account?.username?.toLowerCase() || 'guest';
const achievementKey = `new-horizon-achievements:${encodeURIComponent(username)}`;
let achievements = [];

try {
  achievements = JSON.parse(localStorage.getItem(achievementKey) || '[]');
} catch {
  achievements = [];
}

if (!Array.isArray(achievements)) achievements = [];

const list = document.getElementById('achievementList');
const empty = document.getElementById('emptyAchievements');
const count = document.getElementById('achievementCount');

function renderAchievements() {
  count.textContent = String(achievements.length);
  empty.hidden = achievements.length > 0;
  list.replaceChildren();

  achievements.slice().reverse().forEach((achievement) => {
    const item = document.createElement('article');
    item.className = 'achievement-card';
    item.dataset.achievementId = achievement.id;

    const icon = document.createElement('span');
    icon.className = 'achievement-icon';
    icon.textContent = '\u2713';
    icon.setAttribute('aria-hidden', 'true');

    const content = document.createElement('div');
    const type = document.createElement('p');
    type.className = 'achievement-type';
    type.textContent = achievement.type || 'Achievement unlocked';
    const title = document.createElement('h2');
    title.textContent = achievement.title;
    const date = document.createElement('p');
    date.className = 'achievement-date';
    date.textContent = new Date(achievement.completedAt).toLocaleDateString(undefined, { dateStyle: 'medium' });
    content.append(type, title, date);
    const remove = document.createElement('button');
    remove.className = 'remove-achievement';
    remove.type = 'button';
    remove.dataset.achievementId = achievement.id;
    remove.setAttribute('aria-label', `Remove achievement: ${achievement.title}`);
    remove.textContent = 'Remove';
    item.append(icon, content, remove);
    list.appendChild(item);
  });
}

list.addEventListener('click', (event) => {
  const remove = event.target.closest('.remove-achievement');
  if (!remove) return;
  achievements = achievements.filter((achievement) => achievement.id !== remove.dataset.achievementId);
  localStorage.setItem(achievementKey, JSON.stringify(achievements));
  renderAchievements();
});

renderAchievements();