
		document.getElementById('tabs').addEventListener('click', e => {
			const b = e.target.closest('.tab'); if (!b) return;
			document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
			b.classList.add('active');
			const f = b.dataset.f;
			document.querySelectorAll('.game').forEach(g => {
				g.style.display = (f === 'all' || g.dataset.cat === f) ? '' : 'none';
			});
		});

		document.querySelectorAll('.game:not(.locked) .play').forEach(btn => {
			btn.addEventListener('click', () => {
				btn.textContent = 'Loading…';
				setTimeout(() => {
					if (btn.dataset.page) window.location.href = btn.dataset.page;
				}, 300);
			});
		});
