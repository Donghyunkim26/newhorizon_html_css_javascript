const nameInput = document.getElementById('name');
const ageInput = document.getElementById('age');
const sexInput = document.getElementById('sex');
const weightInput = document.getElementById('weightInput');
const heightInput = document.getElementById('heightInput');
const resultNumber = document.getElementById('resultNumber');
const resultCategory = document.getElementById('resultCategory');
const indicator = document.getElementById('indicator');
const calcButton = document.getElementById('calcBtn');
const resetButton = document.getElementById('resetBtn');

function getCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', className: 'cat-under', position: 12 };
  if (bmi < 25) return { label: 'Healthy range', className: 'cat-normal', position: 38 };
  if (bmi < 30) return { label: 'Overweight', className: 'cat-over', position: 63 };
  return { label: 'Obese range', className: 'cat-obese', position: 88 };
}

function calculateProfile() {
  const weight = Number.parseFloat(weightInput.value);
  const heightCm = Number.parseFloat(heightInput.value);

  if (!Number.isFinite(weight) || !Number.isFinite(heightCm) || weight <= 0 || heightCm <= 0) {
    resultNumber.textContent = '--';
    resultCategory.textContent = 'Enter a valid height and weight';
    resultCategory.className = 'result-category';
    indicator.style.left = '0%';
    return;
  }

  const heightMetres = heightCm / 100;
  const bmi = weight / (heightMetres * heightMetres);
  const roundedBmi = Math.round(bmi * 10) / 10;
  const category = getCategory(bmi);

  resultNumber.textContent = roundedBmi;
  resultCategory.textContent = category.label;
  resultCategory.className = `result-category ${category.className}`;
  indicator.style.left = `${Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100))}%`;

  localStorage.setItem('new-horizon-health-profile', JSON.stringify({
    name: nameInput.value.trim(),
    age: ageInput.value,
    sex: sexInput.value,
    weight,
    heightCm,
    bmi: roundedBmi,
    category: category.label
  }));
}

function resetProfile() {
  nameInput.value = '';
  ageInput.value = '';
  sexInput.value = 'male';
  weightInput.value = '';
  heightInput.value = '';
  resultNumber.textContent = '--';
  resultCategory.textContent = '\u00a0';
  resultCategory.className = 'result-category';
  indicator.style.left = '25%';
  localStorage.removeItem('new-horizon-health-profile');
}

calcButton.addEventListener('click', calculateProfile);
resetButton.addEventListener('click', resetProfile);

[nameInput, ageInput, weightInput, heightInput].forEach(input => {
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') calculateProfile();
  });
});
