let data = [];
let remainingQuestions = [];
let current = null;
let correctAnswer = "";

let score = 0;
let streak = 0;
let bestStreak = 0;
let totalAnswered = 0;
let totalCorrect = 0;
let xpEarnedThisQuiz = 0;

let unlockedAchievements =
    JSON.parse(localStorage.flagAchievements || "[]");

fetch("flags.json")
    .then(r => r.json())
    .then(d => {
        data = d;
        remainingQuestions = [...data];
        nextQuestion();
    });

function getFilteredData() {
    const region = document.getElementById("region").value;

    if (region === "All") {
        return remainingQuestions;
    }

    return remainingQuestions.filter(
        item => item.continent === region
    );
}

function getOptionsPool() {
    const region = document.getElementById("region").value;

    if (region === "All") {
        return data;
    }

    return data.filter(
        item => item.continent === region
    );
}

function updateGlobalStats(correct) {
    let globalAnswered =
        Number(localStorage.getItem("guessrTotalAnswered") || 0);

    let globalCorrect =
        Number(localStorage.getItem("guessrTotalCorrect") || 0);

    globalAnswered++;

    if (correct) {
        updateDailyChallengeProgress("flags");
        globalCorrect++;
    }

    localStorage.setItem("guessrTotalAnswered", globalAnswered);
    localStorage.setItem("guessrTotalCorrect", globalCorrect);
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
    const filtered = getFilteredData();

    const flag = document.getElementById("flag");
    const question = document.getElementById("question");
    const answers = document.getElementById("answers");

    answers.innerHTML = "";

    if (filtered.length === 0) {
        showCompletionScreen();
        return;
    }

    current = filtered[
        Math.floor(Math.random() * filtered.length)
    ];

    let mode = document.getElementById("quizMode").value;

    if (mode === "mixed") {
        mode = Math.random() < 0.5
            ? "flag-country"
            : "country-flag";
    }

    flag.style.display = "none";

    let options = [];

    if (mode === "flag-country") {
        flag.src = current.flag;
        flag.style.display = "block";

        question.textContent = "";
        correctAnswer = current.country;

        options.push(correctAnswer);

    } else if (mode === "country-flag") {
        question.textContent = current.country;
        correctAnswer = current.flag;

        options.push(correctAnswer);
    }

    const difficulty = document.getElementById("difficulty").value;

    let answerCount = difficulty === "Hard" ? 6 : 4;

    const optionsPool = getOptionsPool();

    answerCount = Math.min(answerCount, optionsPool.length);

    while (options.length < answerCount) {
        const randomItem =
            optionsPool[Math.floor(Math.random() * optionsPool.length)];

        const randomOption =
            mode === "flag-country"
                ? randomItem.country
                : randomItem.flag;

        if (!options.includes(randomOption)) {
            options.push(randomOption);
        }
    }

    options.sort(() => Math.random() - 0.5);

    options.forEach(option => {
        const btn = document.createElement("button");

        if (mode === "country-flag") {
            const img = document.createElement("img");
            img.src = option;
            img.style.width = "100px";
            img.style.borderRadius = "8px";
            btn.appendChild(img);
        } else {
            btn.textContent = option;
        }

        btn.onclick = () => answer(btn, option === correctAnswer, mode);

        answers.appendChild(btn);
    });
}

function answer(button, correct, mode) {
    document.querySelectorAll("#answers button")
        .forEach(btn => btn.disabled = true);

    updateGlobalStats(correct);

    totalAnswered++;

    if (correct) {
        score++;
        streak++;
        totalCorrect++;

        let flagCorrect =
    Number(localStorage.getItem("guessrFlagCorrect") || 0);

flagCorrect++;

localStorage.setItem("guessrFlagCorrect", flagCorrect);

        if (streak > bestStreak) {
            bestStreak = streak;
        }

       addXP(10, button);

        unlockAchievement("First Flag Correct");

        if (streak >= 10) {
            unlockAchievement("10 Flag Streak");
        }

        if (score >= 25) {
            unlockAchievement("25 Flags Correct");
        }

        if (score >= 50) {
            unlockAchievement("Flag Expert");
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
                if (mode === "flag-country") {
                    if (btn.textContent === correctAnswer) {
                        btn.classList.add("correct");
                    }
                } else {
                    const img = btn.querySelector("img");

                    if (img && img.getAttribute("src") === correctAnswer) {
                        btn.classList.add("correct");
                    }
                }
            });
    }

    document.getElementById("score").textContent = score;
    document.getElementById("streak").textContent = streak;
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
        bestStreak;

    document.getElementById("completeXP").textContent =
        "+" + xpEarnedThisQuiz + " XP";

    document.getElementById("completionAchievement").textContent =
        "🏳️ Flag Quiz Completed!";
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

    localStorage.flagAchievements =
        JSON.stringify(unlockedAchievements);

    showToast(
    "Achievement Unlocked",
    name,
    "achievement"
);
}

function restartQuiz() {
    remainingQuestions = [...data];

    score = 0;
    streak = 0;
    bestStreak = 0;
    totalAnswered = 0;
    totalCorrect = 0;
    xpEarnedThisQuiz = 0;

    document.getElementById("score").textContent = score;
    document.getElementById("streak").textContent = streak;

    const completionScreen =
        document.getElementById("completionScreen");

    if (completionScreen) {
        completionScreen.style.display = "none";
    }

    nextQuestion();
}

document.getElementById("next")
    .addEventListener("click", nextQuestion);

document.getElementById("region")
    .addEventListener("change", nextQuestion);

document.getElementById("quizMode")
    .addEventListener("change", nextQuestion);

document.getElementById("difficulty")
    .addEventListener("change", nextQuestion);

const playAgainButton =
    document.getElementById("playAgain");

if (playAgainButton) {
    playAgainButton.addEventListener(
        "click",
        restartQuiz
    );
}

const nextQuizButton =
    document.getElementById("nextQuiz");

if (nextQuizButton) {
    nextQuizButton.addEventListener(
        "click",
        () => {
            window.location.href =
                "../quizPhones/index.html";
        }
    );
}