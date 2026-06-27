let data = [];
let remainingQuestions = [];
let current = null;
let correctAnswer = "";

let score = 0;
let streak = 0;
let unlockedAchievements =
    JSON.parse(localStorage.phoneAchievements || "[]");
let totalAnswered = 0;
let totalCorrect = 0;

fetch("phones.json")
    .then(response => response.json())
    .then(phoneData => {
        data = phoneData;
        remainingQuestions = [...data];
        nextQuestion();
    });

function getFilteredData() {
    const region = document.getElementById("region").value;
    const difficulty = document.getElementById("difficulty").value;

    let source = remainingQuestions;

    if (region !== "All") {
        source = source.filter(item => item.continent === region);
    }

    if (difficulty === "Easy") {
        source = source.filter(item => !item.hard);
    }

    if (difficulty === "Hard") {
        source = source.filter(item => item.hard || item.code.includes("-"));
    }

    return source;
}

function getAllOptionsPool() {
    const region = document.getElementById("region").value;

    if (region === "All") {
        return data;
    }

    return data.filter(item => item.continent === region);
}

function updateGlobalStats(correct) {
    let totalAnswered =
        Number(localStorage.getItem("guessrTotalAnswered") || 0);

    let totalCorrect =
        Number(localStorage.getItem("guessrTotalCorrect") || 0);

    totalAnswered++;

    if (correct) {
        updateDailyChallengeProgress("phones");
        totalCorrect++;
    }

    localStorage.setItem("guessrTotalAnswered", totalAnswered);
    localStorage.setItem("guessrTotalCorrect", totalCorrect);
}

function updateDailyChallengeProgress(type){
    const challenges = [
        {
            type:"domains",
            goal:20,
            reward:250
        },
        {
            type:"flags",
            goal:25,
            reward:250
        },
        {
            type:"phones",
            goal:15,
            reward:250
        }
    ];

    const dayNumber =
        Math.floor(Date.now() / 86400000);

    const challenge =
        challenges[dayNumber % challenges.length];

    if (challenge.type !== type) return;

    const today =
        new Date().toDateString();

    let daily =
        JSON.parse(localStorage.getItem("guessrDailyChallenge") || "{}");

    if (daily.date !== today) {
        daily = {
            date: today,
            progress: 0,
            completed: false,
            rewarded: false
        };
    }

    if (daily.completed) return;

    daily.progress++;

    if (daily.progress >= challenge.goal) {
        daily.completed = true;

        if (!daily.rewarded) {
           addXP(challenge.reward);

            daily.rewarded = true;

            showToast(
    "Daily Challenge Complete!",
    "+" + challenge.reward + " XP Awarded",
    "daily"
);
        }
    }

    localStorage.setItem(
        "guessrDailyChallenge",
        JSON.stringify(daily)
    );
}

function nextQuestion() {
    const filteredData = getFilteredData();

    if (filteredData.length === 0) {
    showCompletionScreen();
    return;
}

    current =
        filteredData[Math.floor(Math.random() * filteredData.length)];

    correctAnswer = current.country;

    document.getElementById("phoneCode").textContent = current.code;

    let answerCount =
        document.getElementById("difficulty").value === "Hard"
            ? 6
            : 4;

    const optionsPool = getAllOptionsPool();

    answerCount = Math.min(answerCount, optionsPool.length);

    let options = [correctAnswer];

    while (options.length < answerCount) {
        const randomCountry =
            optionsPool[Math.floor(Math.random() * optionsPool.length)].country;

        if (!options.includes(randomCountry)) {
            options.push(randomCountry);
        }
    }

    options.sort(() => Math.random() - 0.5);

    const answersBox = document.getElementById("answers");
    answersBox.innerHTML = "";

    options.forEach(option => {
        const button = document.createElement("button");

        button.textContent = option;

        button.onclick = () => {
            answer(button, option === correctAnswer);
        };

        answersBox.appendChild(button);
    });
}

function showToast(title, message, type = "achievement") {

    const toast =
        document.createElement("div");

    toast.className =
        "toast toast-" + type;

    let icon = "🏆";

    if (type === "daily")
        icon = "⭐";

    if (type === "level")
        icon = "⬆️";

    if (type === "mastered")
        icon = "🌍";

    toast.innerHTML = `
        <h3>${icon} ${title}</h3>
        <p>${message}</p>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-hide");
    }, 4500);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function unlockAchievement(name) {
    if (unlockedAchievements.includes(name)) return;

    unlockedAchievements.push(name);

    localStorage.phoneAchievements =
        JSON.stringify(unlockedAchievements);

    showToast(
    "Achievement Unlocked",
    name,
    "achievement"
);
}

function answer(button, correct) {
    document.querySelectorAll("#answers button")
        .forEach(btn => btn.disabled = true);

        updateGlobalStats(correct);

    totalAnswered++;

    if (correct) {
        score++;
        streak++;
        totalCorrect++;

        let phoneCorrect =
    Number(localStorage.getItem("guessrPhoneCorrect") || 0);

phoneCorrect++;

localStorage.setItem("guessrPhoneCorrect", phoneCorrect);

       addXP(10, button);

unlockAchievement("First Phone Code Correct");

if (streak >= 10) {
    unlockAchievement("10 Phone Code Streak");
}

if (score >= 25) {
    unlockAchievement("25 Phone Codes Correct");
}

if (score >= 50) {
    unlockAchievement("Phone Code Expert");
}

        button.classList.add("correct");

        remainingQuestions = remainingQuestions.filter(
            item => item.country !== current.country
        );
    } else {
        streak = 0;
        button.classList.add("wrong");

        document.querySelectorAll("#answers button")
            .forEach(btn => {
                if (btn.textContent === correctAnswer) {
                    btn.classList.add("correct");
                }
            });
    }

    updateStats();
    updateCodeInfo();
}

const levelXPTable = [
    0, 100, 250, 450, 700,
    1000, 1400, 1900, 2500, 3200,
    4000, 5000, 6200, 7600, 9200,
    11000, 13000, 15200, 17600, 20200,
    23000, 26000, 29200, 32600, 36200,
    40000, 44000, 48200, 52600, 57200
];

function getLevelFromXP(xp){
    let level = 1;

    for (let i = 0; i < levelXPTable.length; i++) {
        if (xp >= levelXPTable[i]) {
            level = i + 1;
        }
    }

    return level;
}

function showFloatingXP(button, amount){
    const rect =
        button.getBoundingClientRect();

    const xpText =
        document.createElement("div");

    xpText.className = "xp-float";
    xpText.textContent = "+" + amount + " XP";

    xpText.style.left =
        rect.left + rect.width / 2 + "px";

    xpText.style.top =
        rect.top + "px";

    document.body.appendChild(xpText);

    setTimeout(() => {
        xpText.remove();
    }, 1000);
}

function addXP(amount, button){
    const oldXP =
        Number(localStorage.getItem("guessrXP") || 0);

    const oldLevel =
        getLevelFromXP(oldXP);

    const newXP =
        oldXP + amount;

    const newLevel =
        getLevelFromXP(newXP);

    localStorage.setItem("guessrXP", newXP);

    if (button) {
        showFloatingXP(button, amount);
    }

    if (newLevel > oldLevel) {
        showToast(
            "Level Up!",
            "Level " + oldLevel + " → Level " + newLevel,
            "level"
        );
    }
}

function updateStats() {
    document.getElementById("score").textContent = score;
    document.getElementById("streak").textContent = streak;

    let accuracy = 0;

    if (totalAnswered > 0) {
        accuracy = Math.round((totalCorrect / totalAnswered) * 100);
    }

    document.getElementById("accuracy").textContent = accuracy + "%";
}

function updateCodeInfo() {
    document.getElementById("codeInfo").innerHTML = `
        <strong>${current.code}</strong><br><br>
        <b>Country:</b> ${current.country}<br>
        <b>Region:</b> ${current.continent}<br><br>
        ${current.hard
            ? "This is a more specific regional/NANP-style calling code."
            : "This is the main international calling code for this country."}
    `;
}

function showCompletionScreen() {
    const accuracy =
        totalAnswered > 0
            ? Math.round((totalCorrect / totalAnswered) * 100)
            : 0;

    document.getElementById("completionScreen").style.display = "flex";

    document.getElementById("completeScore").textContent =
        `${score} / ${totalAnswered}`;

    document.getElementById("completeAccuracy").textContent =
        accuracy + "%";

    document.getElementById("completeBest").textContent =
        streak;

    document.getElementById("completeXP").textContent =
        "+" + (score * 10) + " XP";

    document.getElementById("completionAchievement").textContent =
        "📞 Phone Code Quiz Completed!";
}

function restartQuiz() {
    remainingQuestions = [...data];

    score = 0;
    streak = 0;
    totalAnswered = 0;
    totalCorrect = 0;

    document.getElementById("completionScreen").style.display = "none";

    updateStats();
    nextQuestion();
}

document.getElementById("next")
    .addEventListener("click", nextQuestion);

document.getElementById("restart")
    .addEventListener("click", restartQuiz);

document.getElementById("region")
    .addEventListener("change", () => {
        nextQuestion();
    });

document.getElementById("difficulty")
    .addEventListener("change", () => {
        nextQuestion();
    });

    document.getElementById("playAgain")
    .addEventListener("click", restartQuiz);

document.getElementById("nextQuiz")
    .addEventListener("click", () => {
        window.location.href = "../domains/index.html";
    });