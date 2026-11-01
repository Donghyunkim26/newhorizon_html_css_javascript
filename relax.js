const releaseInputs = document.querySelectorAll("#releaseList input");
const releaseStatus = document.getElementById("releaseStatus");

function updateReleaseStatus() {
	const completed = [...releaseInputs].filter((input) => input.checked).length;
	releaseStatus.textContent = `${completed} of 4 areas released`;
}

releaseInputs.forEach((input) => input.addEventListener("change", updateReleaseStatus));
