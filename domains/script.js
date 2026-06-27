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

questionNumber++;

    document.getElementById(
        "questionCounter"
    ).textContent =
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

answerCount = Math.min(
    answerCount,
    Math.max(filteredData.length, 2)
);

    let options = [];

    // DOMAIN -> COUNTRY
    if (mode === "domain-country") {

        question.textContent =
            current.domain;

        if (
            document.getElementById(
                "difficulty"
            ).value === "Easy"
        ) {
            flag.src = current.flag;
            flag.style.display = "block";
        }

        correctAnswer =
            current.country;

        options.push(
            current.country
        );

        while (
            options.length <
            answerCount
        ) {

            let random =
                filteredData[
                    Math.floor(
                        Math.random() *
                        filteredData.length
                    )
                ].country;

            if (
                !options.includes(random)
            ) {
                options.push(random);
            }

        }

    }

    // COUNTRY -> DOMAIN
    else if (
        mode === "country-domain"
    ) {

        question.textContent =
            current.country;

        correctAnswer =
            current.domain;

        options.push(
            current.domain
        );

        while (
            options.length <
            answerCount
        ) {

            let random =
                filteredData[
                    Math.floor(
                        Math.random() *
                        filteredData.length
                    )
                ].domain;

            if (
                !options.includes(random)
            ) {
                options.push(random);
            }

        }

    }

    // FLAG -> COUNTRY
    else if (
        mode === "flag-country"
    ) {

        flag.src = current.flag;
        flag.style.display = "block";

        question.textContent = "";

        correctAnswer =
            current.country;

        options.push(
            current.country
        );

        while (
            options.length <
            answerCount
        ) {

            let random =
                filteredData[
                    Math.floor(
                        Math.random() *
                        filteredData.length
                    )
                ].country;

            if (
                !options.includes(random)
            ) {
                options.push(random);
            }

        }

    }

    // FLAG -> DOMAIN
    else if (
        mode === "flag-domain"
    ) {

        flag.src = current.flag;
        flag.style.display = "block";

        question.textContent = "";

        correctAnswer =
            current.domain;

        options.push(
            current.domain
        );

        while (
            options.length <
            answerCount
        ) {

            let random =
                filteredData[
                    Math.floor(
                        Math.random() *
                        filteredData.length
                    )
                ].domain;

            if (
                !options.includes(random)
            ) {
                options.push(random);
            }

        }

    }

    options.sort(
        () => Math.random() - 0.5
    );

    const box =
        document.getElementById(
            "answers"
        );

    box.innerHTML = "";

    options.forEach(option => {

        const button =
            document.createElement(
                "button"
            );

        button.textContent =
            option;

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

        score++;
        streak++;
        totalCorrect++;

        let xp = Number(localStorage.getItem("guessrXP") || 0);
xp += 10;
localStorage.setItem("guessrXP", xp);

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

function showAchievementToast(name) {

    const toast =
        document.createElement("div");

    toast.className =
        "achievement-toast";

    toast.innerHTML = `
        <h3>🏆 Achievement Unlocked</h3>
        <p>${name}</p>
    `;

    document.body.appendChild(toast);

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

    showAchievementToast(name);
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

document.getElementById("playAgain")
    .addEventListener("click", () => {
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

document.getElementById("nextQuiz")
    .addEventListener("click", () => {
        window.location.href = "../quizFlags/index.html";
    });