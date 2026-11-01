
// ─── Knowledge base ───────────────────────────────────────────
const KB = [
    {
        keys: ['hello','hi','hey','kia ora','start','begin'],
        reply: 'Kia ora! 👋 I\'m the New Horizon assistant. How can I help you today?'
    },
    {
        keys: ['what','who','about','new horizon','horizon'],
        reply: 'New Horizon is a free healthy-lifestyle platform with educational resources, interactive quizzes, and mini games designed to help you build better habits every day.'
    },
    {
        keys: ['smok','cigarette','quit','tobacco','nicotine','vape'],
        reply: 'Quitting smoking is one of the best things you can do for your health. New Horizon provides guidance, tips, and interactive activities to support your smoke-free journey. 💪'
    },
    {
        keys: ['habit','healthy','wellbeing','wellness','lifestyle'],
        reply: 'We offer articles, videos, and hands-on challenges to help you build healthier daily habits — from better sleep and nutrition to stress management and exercise.'
    },
    {
        keys: ['game','quiz','interactive','activity','play'],
        reply: 'Our interactive mini games make learning fun! Try health quizzes, habit-tracker challenges, and lifestyle activities — all completely free.'
    },
    {
        keys: ['free','cost','pay','price','subscription'],
        reply: 'Everything on New Horizon is completely free — no sign-up fees, no subscriptions. Just open the site and start exploring! 🎉'
    },
    {
        keys: ['contact','email','phone','reach','support','help'],
        reply: 'You can reach us at <a href="mailto:support@newhorizon.org">support@newhorizon.org</a> or visit our <a href="contact.html">Contact page</a>. We aim to reply within one business day.'
    },
    {
        keys: ['faq','question','answer','common'],
        reply: 'Great question! Head over to our <a href="faq.html">FAQ page</a> for answers to the most common questions about New Horizon.'
    },
    {
        keys: ['privacy','policy','data','personal'],
        reply: 'Your privacy is important to us. Read our full <a href="privacy-policy.html">Privacy Policy</a> to understand how we handle your information.'
    },
    {
        keys: ['learn','resource','article','information'],
        reply: 'Check out our <a href="Learnmore.html">Learn More</a> section for in-depth articles, guides, and educational resources on living a healthier life.'
    },
    {
        keys: ['thanks','thank you','cheers','awesome','great'],
        reply: 'You\'re welcome! 😊 Is there anything else I can help you with on your wellness journey?'
    },
    {
        keys: ['bye','goodbye','later','exit','done'],
        reply: 'Take care! Remember, every small healthy choice counts. Come back anytime. 🌿'
    },
];

const QUICK_REPLIES = [
    { label: '🌿 Healthy habits', text: 'healthy habits' },
    { label: '🎮 Mini games', text: 'games and quizzes' },
    { label: '📋 FAQ', text: 'faq' },
    { label: '📧 Contact us', text: 'contact' },
];

// ─── DOM refs ─────────────────────────────────────────────────
const trigger  = document.getElementById('cbTrigger');
const win      = document.getElementById('cbWindow');
const closeBtn = document.getElementById('cbClose');
const messages = document.getElementById('cbMessages');
const quick    = document.getElementById('cbQuick');
const form     = document.getElementById('cbForm');
const input    = document.getElementById('cbInput');
const badge    = document.getElementById('cbBadge');
const bubble   = document.getElementById('cbBubble');
const bubbleX  = document.getElementById('cbBubbleClose');

let opened = false;

// ─── Helpers ──────────────────────────────────────────────────
function addMsg(text, from) {
    const row = document.createElement('div');
    row.className = `cb-msg cb-msg--${from}`;
    if (from === 'bot') {
        row.innerHTML = `<div class="cb-avatar-sm" aria-hidden="true"><img src="images/Horizon_logo.jpg" alt=""></div><div class="cb-bubble-msg">${text}</div>`;
    } else {
        row.innerHTML = `<div class="cb-bubble-msg">${text}</div>`;
    }
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
}

function botTyping() {
    const row = document.createElement('div');
    row.className = 'cb-msg cb-msg--bot cb-typing';
    row.id = 'cbTyping';
    row.innerHTML = `<div class="cb-avatar-sm" aria-hidden="true"><img src="images/Horizon_logo.jpg" alt=""></div><div class="cb-bubble-msg"><span></span><span></span><span></span></div>`;
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
    const t = document.getElementById('cbTyping');
    if (t) t.remove();
}

function getReply(text) {
    const lower = text.toLowerCase();
    for (const entry of KB) {
        if (entry.keys.some(k => lower.includes(k))) return entry.reply;
    }
    return 'I\'m not sure about that, but our team can help! Visit the <a href="contact.html">Contact page</a> or check the <a href="faq.html">FAQ</a>.';
}

function renderQuickReplies() {
    quick.innerHTML = '';
    QUICK_REPLIES.forEach(({ label, text }) => {
        const btn = document.createElement('button');
        btn.className = 'cb-chip';
        btn.textContent = label;
        btn.addEventListener('click', () => sendMessage(text));
        quick.appendChild(btn);
    });
}

function sendMessage(text) {
    const msg = text.trim();
    if (!msg) return;
    addMsg(msg, 'user');
    input.value = '';
    quick.innerHTML = '';
    botTyping();
    setTimeout(() => {
        removeTyping();
        addMsg(getReply(msg), 'bot');
        renderQuickReplies();
    }, 800);
}

// ─── Open / close ─────────────────────────────────────────────
function openChat() {
    win.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    badge.hidden = true;
    bubble.hidden = true;
    if (!opened) {
        opened = true;
        setTimeout(() => {
            addMsg('Hey there, welcome to <strong>New Horizon</strong>! 👋<br>I can help with healthy habits, resources, quizzes, and more.', 'bot');
            renderQuickReplies();
        }, 300);
    }
    setTimeout(() => input.focus(), 50);
}

function closeChat() {
    win.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
}

trigger.addEventListener('click', () => win.hidden ? openChat() : closeChat());
closeBtn.addEventListener('click', closeChat);

// Dismiss bubble with fade-out before hiding
bubbleX.addEventListener('click', () => dismissBubble());

function dismissBubble() {
    bubble.classList.add('is-hiding');
    setTimeout(() => {
        bubble.hidden = true;
        bubble.classList.remove('is-hiding');
    }, 240);
}

form.addEventListener('submit', e => {
    e.preventDefault();
    sendMessage(input.value);
});

// Keyboard: Escape closes chat or dismisses bubble
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (!win.hidden) closeChat();
        else if (!bubble.hidden) dismissBubble();
    }
});

// Auto-show bubble after 2 s if not yet opened
setTimeout(() => { if (!opened) bubble.hidden = false; }, 2000);
