document.addEventListener('DOMContentLoaded', () => {
	const storageKey = (name) => `new-horizon-wellbeing-${name}`;
	const moodButtons = document.querySelectorAll('.mood-option');
	const selectedMood = document.getElementById('selectedMood');
	const rhythmButton = document.getElementById('rhythmButton');
	const reflection = document.getElementById('reflection');
	const reflectionCount = document.getElementById('reflectionCount');
	const saveReflection = document.getElementById('saveReflection');
	const saveMessage = document.getElementById('saveMessage');
	const checkInDate = document.getElementById('checkInDate');
	 const rhythmProgress = document.getElementById('rhythmProgress');
	 const rhythmProgressLabel = document.getElementById('rhythmProgressLabel');

	if (checkInDate) {
		checkInDate.textContent = new Date().toLocaleDateString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}

	const updateMood = (mood) => {
		moodButtons.forEach((button) => {
			const isSelected = button.dataset.mood === mood;
			button.classList.toggle('selected', isSelected);
			button.setAttribute('aria-pressed', String(isSelected));
		});

		if (selectedMood) {
			selectedMood.textContent = mood
				? `You marked today as ${mood.toLowerCase()}. Be gentle with yourself.`
				: 'Select a mood to begin your check-in.';
		}
	};

	moodButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const mood = button.dataset.mood || '';
			localStorage.setItem(storageKey('mood'), mood);
			updateMood(mood);
		});
	});

	const savedMood = localStorage.getItem(storageKey('mood')) || '';
	updateMood(savedMood);

	const rhythmItems = [
		['restStatus', 'rest'],
		['movementStatus', 'movement'],
		['hydrationStatus', 'hydration']
	];

	const updateRhythm = () => {
		const completedCount = rhythmItems.filter(([, key]) => localStorage.getItem(storageKey(key)) === 'true').length;
		const isComplete = completedCount === rhythmItems.length;
		rhythmItems.forEach(([id, key]) => {
			const status = document.getElementById(id);
			if (status) status.textContent = localStorage.getItem(storageKey(key)) === 'true' ? 'Complete' : 'Not checked';
		});
		if (rhythmProgress) rhythmProgress.value = completedCount;
		if (rhythmProgressLabel) rhythmProgressLabel.textContent = `${completedCount} of ${rhythmItems.length} complete`;
		if (rhythmButton) rhythmButton.textContent = isComplete ? "Reset today's rhythm" : "Mark today's rhythm";
	};

	rhythmButton?.addEventListener('click', () => {
		const isComplete = rhythmItems.every(([, key]) => localStorage.getItem(storageKey(key)) === 'true');
		rhythmItems.forEach(([, key]) => localStorage.setItem(storageKey(key), String(!isComplete)));
		updateRhythm();
	});

	updateRhythm();

	const updateReflectionCount = () => {
		if (reflectionCount && reflection) reflectionCount.textContent = `${reflection.value.length} / 500`;
	};

	if (reflection) {
		reflection.value = localStorage.getItem(storageKey('reflection')) || '';
		reflection.addEventListener('input', updateReflectionCount);
	}

	saveReflection?.addEventListener('click', () => {
		localStorage.setItem(storageKey('reflection'), reflection?.value.trim() || '');
		if (saveMessage) saveMessage.textContent = 'Reflection saved for you.';
		window.setTimeout(() => {
			if (saveMessage) saveMessage.textContent = '';
		}, 2500);
	});

	updateReflectionCount();
});
