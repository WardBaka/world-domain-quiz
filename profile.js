const username =
    localStorage.getItem("guessrUsername") || "Guest";

const xp =
    Number(localStorage.getItem("guessrXP") || 0);

const totalCorrect =
    Number(localStorage.getItem("guessrTotalCorrect") || 0);

const totalAnswered =
    Number(localStorage.getItem("guessrTotalAnswered") || 0);

const bestStreak =
    Number(localStorage.getItem("bestStreak") || 0);

const level =
    Math.floor(xp / 100) + 1;

const currentLevelXP =
    xp % 100;

const accuracy =
    totalAnswered > 0
        ? Math.round((totalCorrect / totalAnswered) * 100)
        : 0;

document.getElementById("username").textContent = username;
document.getElementById("level").textContent = "Level " + level;
document.getElementById("xp").textContent = xp + " XP";

document.getElementById("xpFill").style.width =
    currentLevelXP + "%";

document.getElementById("nextLevel").textContent =
    currentLevelXP + " / 100 XP to next level";

document.getElementById("totalCorrect").textContent =
    totalCorrect;

document.getElementById("totalAnswered").textContent =
    totalAnswered;

document.getElementById("accuracy").textContent =
    accuracy + "%";

document.getElementById("bestStreak").textContent =
    bestStreak;