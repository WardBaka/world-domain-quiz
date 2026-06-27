// ======================
// GAME DATA
// ======================

let data = [];
let current = null;
let filteredData = [];
let currentMode = "";
let correctAnswer = "";
let gameActive = true;
let timeLeft = 60;
let timerInterval = null;
let remainingQuestions = [];

let score = 0;
let streak = 0;
let best = Number(localStorage.bestStreak || 0);

let totalAnswered = 0;
let totalCorrect = 0;
let questionNumber = 0;

let masteredDomains = JSON.parse(
    localStorage.masteredDomains || "[]"
);

let unlockedAchievements = JSON.parse(
    localStorage.achievements || "[]"
);

// ======================
// INITIALIZE
// ======================

document.getElementById("best").textContent = best;

fetch("domains.json")
    .then(r => r.json())
    .then(d => {

        data = d;
remainingQuestions = [...data];

        loadBoard();
        loadAchievements();
        updateMastery();

        nextQuestion();

    });

// ======================
// NEXT QUESTION
// ======================

function startTimedMode() {

    clearInterval(timerInterval);

    timeLeft = 60;

    document.getElementById("timer").textContent =
        timeLeft;

    timerInterval = setInterval(() => {

        timeLeft--;

        document.getElementById("timer").textContent =
            timeLeft;

        if (timeLeft <= 0) {

            clearInterval(timerInterval);

            gameActive = false;

            alert(
                `⏰ Time's Up!\n\nScore: ${score}`
            );

        }

    }, 1000);

}

function getOptionsPool() {
    const region =
        document.getElementById("region").value;

    if (region === "All") {
        return data;
    }

    return data.filter(
        item => item.continent === region
    );
}

function getFilteredData() {

    const region =
        document.getElementById("region").value;

    if (region === "All") {
        return remainingQuestions;
    }

    return remainingQuestions.filter(
        item => item.continent === region
    );

}

function updateGlobalStats(correct) {
    let totalAnswered =
        Number(localStorage.getItem("guessrTotalAnswered") || 0);

    let totalCorrect =
        Number(localStorage.getItem("guessrTotalCorrect") || 0);

    totalAnswered++;

    if (correct) {
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

function showCompletionScreen(){
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
        best;

    document.getElementById("completeXP").textContent =
        "+" + (score * 10) + " XP";

    document.getElementById("completionAchievement").textContent =
        "🌐 Domain Quiz Completed!";
}

function nextQuestion() {

    if (!gameActive) return;

    filteredData = getFilteredData();

    if (filteredData.length === 0) {
        showCompletionScreen();
        return;
    }

    const optionsPool = getOptionsPool();

    questionNumber++;

    document.getElementById("questionCounter").textContent =
        `Question ${questionNumber}`;

    current =
        filteredData[
            Math.floor(
                Math.random() * filteredData.length
            )
        ];

    let mode =
        document.getElementById("quizMode").value;

    if (mode === "mixed") {
        const modes = [
            "domain-country",
            "country-domain"
        ];

        mode =
            modes[
                Math.floor(
                    Math.random() * modes.length
                )
            ];
    }

    currentMode = mode;

    const flag =
        document.getElementById("flag");

    const question =
        document.getElementById("domain");

    flag.style.display = "none";

    let answerCount =
        document.getElementById("difficulty").value === "Hard"
            ? 6
            : 4;

    answerCount =
        Math.min(answerCount, optionsPool.length);

    let options = [];

    if (mode === "domain-country") {

        question.textContent = current.domain;

        if (
            document.getElementById("difficulty").value === "Easy"
        ) {
            flag.src = current.flag;
            flag.style.display = "block";
        }

        correctAnswer = current.country;
        options.push(correctAnswer);

        while (options.length < answerCount) {
            let random =
                optionsPool[
                    Math.floor(
                        Math.random() * optionsPool.length
                    )
                ].country;

            if (!options.includes(random)) {
                options.push(random);
            }
        }

    }

    else if (mode === "country-domain") {

        question.textContent = current.country;

        correctAnswer = current.domain;
        options.push(correctAnswer);

        while (options.length < answerCount) {
            let random =
                optionsPool[
                    Math.floor(
                        Math.random() * optionsPool.length
                    )
                ].domain;

            if (!options.includes(random)) {
                options.push(random);
            }
        }

    }

    options.sort(() => Math.random() - 0.5);

    const box =
        document.getElementById("answers");

    box.innerHTML = "";

    options.forEach(option => {
        const button =
            document.createElement("button");

        button.textContent = option;

        button.onclick = () =>
            answer(
                button,
                option === correctAnswer
            );

        box.appendChild(button);
    });
}

// ======================
// ANSWER
// ======================

function answer(button, correct) {

    document.querySelectorAll("#answers button")
        .forEach(btn => btn.disabled = true);

        updateGlobalStats(correct);

    totalAnswered++;

    if (correct) {
        remainingQuestions =
    remainingQuestions.filter(
        item =>
            item.domain !== current.domain
    );

    updateDailyChallengeProgress("domains");

        score++;
        streak++;
        totalCorrect++;

       addXP(10, button);

        button.classList.add("correct");

        if (!masteredDomains.includes(current.domain)) {

            masteredDomains.push(current.domain);

            localStorage.masteredDomains =
                JSON.stringify(masteredDomains);

        }

    } else {

        streak = 0;

        button.classList.add("wrong");

        document
            .querySelectorAll("#answers button")
            .forEach(btn => {

                if (btn.textContent === correctAnswer) {
                    btn.classList.add("correct");
                }

            });

    }



    best = Math.max(best, streak);

    localStorage.bestStreak = best;

    document.getElementById("score").textContent =
        score;

    document.getElementById("streak").textContent =
        streak;

    document.getElementById("best").textContent =
        best;

    updateAccuracy();
    updateDomainInfo();
    updateAchievements();
    updateMastery();

}

// ======================
// ACCURACY
// ======================

function updateAccuracy() {

    let accuracy = 0;

    if (totalAnswered > 0) {

        accuracy = Math.round(
            (totalCorrect / totalAnswered) * 100
        );

    }

    document.getElementById("accuracy").textContent =
        accuracy + "%";

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
            "⬆️"
        );
    }
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

// ======================
// DOMAIN INFO
// ======================

function updateDomainInfo() {

    document.getElementById("domainInfo").innerHTML = `
        <strong>${current.domain}</strong><br><br>
        <b>Country:</b> ${current.country}<br>
        <b>Continent:</b>
        ${current.continent || "Unknown"}<br><br>
        ${current.info || "No information available."}
    `;

}

// ======================
// ACHIEVEMENTS
// ======================

function unlockAchievement(name) {

    if (unlockedAchievements.includes(name))
        return;

    unlockedAchievements.push(name);

    localStorage.achievements =
        JSON.stringify(unlockedAchievements);

    const achievementList =
        document.getElementById("achievements");

    if (achievementList) {
        const li = document.createElement("li");
        li.textContent = "✅ " + name;
        achievementList.appendChild(li);
    }

    showToast(
    "Achievement Unlocked",
    name,
    "achievement"
);
}

function updateAchievements() {

    if (score >= 1)
        unlockAchievement(
            "First Correct Answer"
        );

    if (streak >= 10)
        unlockAchievement(
            "10 Answer Streak"
        );

    if (score >= 50)
        unlockAchievement(
            "50 Correct Answers"
        );

    if (masteredDomains.length >= 100)
        unlockAchievement(
            "Learn 100 Domains"
        );

}

function loadAchievements() {

    unlockedAchievements.forEach(a => {

        const li =
            document.createElement("li");

        li.textContent = "✅ " + a;

        document
            .getElementById("achievements")
            .appendChild(li);

    });

}

// ======================
// MASTERY
// ======================

function updateMastery() {

    const continents = {
        Europe: {
            learned: 0,
            total: 0
        },
        Asia: {
            learned: 0,
            total: 0
        },
        Africa: {
            learned: 0,
            total: 0
        },
        "North America": {
            learned: 0,
            total: 0
        },
        "South America": {
            learned: 0,
            total: 0
        },
        Oceania: {
            learned: 0,
            total: 0
        }
    };

    // Count total domains per continent
    data.forEach(domain => {

        if (continents[domain.continent]) {
            continents[domain.continent].total++;
        }

    });

    // Count mastered domains per continent
    masteredDomains.forEach(mastered => {

        const domainData =
            data.find(d => d.domain === mastered);

        if (
            domainData &&
            continents[domainData.continent]
        ) {
            continents[domainData.continent]
                .learned++;
        }

    });

    document.getElementById(
        "europeMastery"
    ).textContent =
        `${continents.Europe.learned} / ${continents.Europe.total}`;

    document.getElementById(
        "asiaMastery"
    ).textContent =
        `${continents.Asia.learned} / ${continents.Asia.total}`;

    document.getElementById(
        "africaMastery"
    ).textContent =
        `${continents.Africa.learned} / ${continents.Africa.total}`;

    document.getElementById(
        "northAmericaMastery"
    ).textContent =
        `${continents["North America"].learned} / ${continents["North America"].total}`;

    document.getElementById(
        "southAmericaMastery"
    ).textContent =
        `${continents["South America"].learned} / ${continents["South America"].total}`;

    document.getElementById(
        "oceaniaMastery"
    ).textContent =
        `${continents.Oceania.learned} / ${continents.Oceania.total}`;

}

// ======================
// LEADERBOARD
// ======================

function loadBoard() {

    let board = JSON.parse(
        localStorage.leaderboard || "[]"
    );

    let ol =
        document.getElementById("leaderboard");

    ol.innerHTML = "";

    board.forEach(entry => {

        let li =
            document.createElement("li");

        li.textContent =
            `${entry.name} - ${entry.score}`;

        ol.appendChild(li);

    });

}

window.addEventListener("beforeunload", () => {

    let name =
        localStorage.playerName ||
        prompt("Enter your name:") ||
        "Player";

    localStorage.playerName = name;

    let board = JSON.parse(
        localStorage.leaderboard || "[]"
    );

    board.push({
        name: name,
        score: score
    });

    board.sort(
        (a, b) => b.score - a.score
    );

    board = board.slice(0, 10);

    localStorage.leaderboard =
        JSON.stringify(board);

});

// ======================
// NEXT BUTTON
// ======================

document
    .getElementById("next")
    .addEventListener(
        "click",
        nextQuestion
    );

    document
    .getElementById("region")
    .addEventListener(
        "change",
        nextQuestion
    );

document
    .getElementById("quizMode")
    .addEventListener(
        "change",
        nextQuestion
    );

    document
.getElementById("gameMode")
.addEventListener("change", () => {

    gameActive = true;

    if (
        document.getElementById("gameMode").value ===
        "timed"
    ) {
        startTimedMode();
    }
    else {
        clearInterval(timerInterval);

        document.getElementById("timer").textContent =
            "-";
    }

});

document
.getElementById("restartQuiz")
.addEventListener("click", () => {

    remainingQuestions = [...data];

    score = 0;
    streak = 0;
    totalAnswered = 0;
    totalCorrect = 0;
    questionNumber = 0;

    gameActive = true;

    document.getElementById("score").textContent = 0;
    document.getElementById("streak").textContent = 0;
    document.getElementById("accuracy").textContent = "0%";

    nextQuestion();

});

const playAgainButton = document.getElementById("playAgain");

if (playAgainButton) {
    playAgainButton.addEventListener("click", () => {
        document.getElementById("completionScreen").style.display = "none";

        remainingQuestions = [...data];

        score = 0;
        streak = 0;
        totalAnswered = 0;
        totalCorrect = 0;
        questionNumber = 0;
        gameActive = true;

        document.getElementById("score").textContent = 0;
        document.getElementById("streak").textContent = 0;
        document.getElementById("accuracy").textContent = "0%";

        nextQuestion();
    });
}

const nextQuizButton = document.getElementById("nextQuiz");

if (nextQuizButton) {
    nextQuizButton.addEventListener("click", () => {
        window.location.href = "../quizFlags/index.html";
    });
}