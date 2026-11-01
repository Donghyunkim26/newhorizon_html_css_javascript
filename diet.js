
  function bmiCategory(bmi) {
    if (bmi < 18.5) return { label: 'Underweight', cls: 'cat-under' };
    if (bmi < 25) return { label: 'Healthy range', cls: 'cat-normal' };
    if (bmi < 30) return { label: 'Overweight', cls: 'cat-over' };
    return { label: 'Obese range', cls: 'cat-obese' };
  }

  try {
    const savedProfile = JSON.parse(localStorage.getItem('new-horizon-health-profile') || 'null');
    if (savedProfile) {
      document.getElementById('age').value = savedProfile.age || '';
      document.getElementById('sex').value = savedProfile.sex || 'male';
      document.getElementById('height').value = savedProfile.heightCm || '';
      document.getElementById('weight').value = savedProfile.weight || '';
    }
  } catch {
    // Keep the form empty if saved profile data is unavailable or invalid.
  }

  document.getElementById('buildBtn').addEventListener('click', () => {
    const age = parseFloat(document.getElementById('age').value);
    const sex = document.getElementById('sex').value;
    const activityMult = parseFloat(document.getElementById('activity').value);
    const heightCm = parseFloat(document.getElementById('height').value);
    const weightKg = parseFloat(document.getElementById('weight').value);

    if (!age || !heightCm || !weightKg) {
      alert('Please fill in age, height, and weight.');
      return;
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const bmiRounded = Math.round(bmi * 10) / 10;
    const cat = bmiCategory(bmi);

    // Mifflin-St Jeor BMR
    let bmr;
    if (sex === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    const tdee = Math.round(bmr * activityMult);
    const minSafe = sex === 'male' ? 1500 : 1200;

    const resultsDiv = document.getElementById('results');
    let html = `
      <div class="card">
        <div class="bmi-strip">
          <div><div class="bmi-num">${bmiRounded}</div><div style="font-size:12px;color:var(--ink-soft);">Your BMI</div></div>
          <div class="bmi-cat ${cat.cls}">${cat.label}</div>
        </div>
    `;

    if (cat.label === 'Underweight') {
      html += `
        <div class="plan-message caution">
          Your BMI is in the underweight range, so a weight-loss plan isn't appropriate here. Focus on nutrient-dense meals to reach a healthy weight, and check in with a doctor if this is new or unexplained.
        </div>
      </div>`;
      resultsDiv.innerHTML = html;
      resultsDiv.classList.add('show');
      resultsDiv.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // deficit: 500 kcal/day (~0.5kg/week), never below safe minimum
    let target = tdee - 500;
    let deficitNote = 'a steady ~0.5kg (1lb) per week';
    if (target < minSafe) {
      target = minSafe;
      deficitNote = 'a smaller, safer deficit — your TDEE is on the lower side';
    }

    if (cat.label === 'Healthy range') {
      html += `
        <div class="plan-message">
          Your BMI is already in the healthy range. If you still want to lean out slightly, use a modest calorie target below — but consider whether maintenance, not further loss, is the better goal.
        </div>
      </div>`;
    } else {
      html += `
        <div class="plan-message">
          Based on your details, a target of about <b>${target} kcal/day</b> supports ${deficitNote}, which is considered a sustainable pace.
        </div>
      </div>`;
    }

    // macros: 30% protein, 40% carbs, 30% fat
    const proteinG = Math.round((target * 0.30) / 4);
    const carbsG = Math.round((target * 0.40) / 4);
    const fatG = Math.round((target * 0.30) / 9);

    html += `
      <div class="card">
        <h2>Daily targets</h2>
        <div class="calorie-grid">
          <div class="cal-box"><div class="cal-num">${tdee}</div><div class="cal-label">Maintenance calories</div></div>
          <div class="cal-box"><div class="cal-num">${target}</div><div class="cal-label">Target calories</div></div>
          <div class="cal-box"><div class="cal-num">~0.5kg</div><div class="cal-label">Est. weekly loss</div></div>
        </div>

        <div class="macro-row">
          <div class="macro-chip protein"><div class="m-val">${proteinG}g</div><div class="m-label">Protein</div></div>
          <div class="macro-chip carbs"><div class="m-val">${carbsG}g</div><div class="m-label">Carbs</div></div>
          <div class="macro-chip fat"><div class="m-val">${fatG}g</div><div class="m-label">Fat</div></div>
        </div>

        <h2>Sample day at ${target} kcal</h2>
        <div class="meal-plan">
          <div class="meal">
            <div class="meal-top"><span>Breakfast</span><span class="meal-cal">${Math.round(target * 0.25)} kcal</span></div>
            <p>Eggs or Greek yogurt with berries and whole grain toast — protein up front curbs mid-morning cravings.</p>
          </div>
          <div class="meal">
            <div class="meal-top"><span>Lunch</span><span class="meal-cal">${Math.round(target * 0.35)} kcal</span></div>
            <p>Grilled chicken, fish, or tofu with a large vegetable side and a whole grain like rice or quinoa.</p>
          </div>
          <div class="meal">
            <div class="meal-top"><span>Dinner</span><span class="meal-cal">${Math.round(target * 0.30)} kcal</span></div>
            <p>Lean protein with roasted vegetables and a small portion of healthy fat, like olive oil or avocado.</p>
          </div>
          <div class="meal">
            <div class="meal-top"><span>Snack</span><span class="meal-cal">${Math.round(target * 0.10)} kcal</span></div>
            <p>Fruit, nuts, or plain yogurt — something with protein or fiber to hold you over.</p>
          </div>
        </div>

        <div class="tips">
          <h3>Keep it sustainable</h3>
          <ul>
            <li>A deficit of 500 kcal/day is a proven, sustainable pace — bigger cuts often backfire.</li>
            <li>Protein at each meal helps preserve muscle and keeps you fuller for longer.</li>
            <li>Weigh yourself weekly, not daily — day-to-day swings are mostly water, not fat.</li>
            <li>Re-check this plan every 5–7kg lost, since your calorie needs change as weight drops.</li>
          </ul>
        </div>
      </div>
    `;

    resultsDiv.innerHTML = html;
    resultsDiv.classList.add('show');
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
  });
