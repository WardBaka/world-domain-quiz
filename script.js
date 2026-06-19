// ======================
// GAME DATA
// ======================

let data = [];
let current = null;

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

        loadBoard();
        loadAchievements();
        updateMastery();

        nextQuestion();

    });

// ======================
// NEXT QUESTION
// ======================

function nextQuestion() {

    if (data.length === 0) return;

    questionNumber++;

    document.getElementById("questionCounter").textContent =
        `Question ${questionNumber} / ${data.length}`;

    const progress =
        (questionNumber / data.length) * 100;

    document.getElementById("progressBar").style.width =
        progress + "%";

    current =
        data[Math.floor(Math.random() * data.length)];

    document.getElementById("domain").textContent =
        current.domain;

    const flag = document.getElementById("flag");

if (
    document.getElementById("difficulty").value === "Easy"
) {
    flag.src = current.flag;
    flag.style.display = "block";
}
else {
    flag.style.display = "none";
}

    let answerCount =
        document.getElementById("difficulty").value === "Hard"
            ? 6
            : 4;

    let options = [current.country];

    while (options.length < answerCount) {

        let country =
            data[Math.floor(Math.random() * data.length)]
                .country;

        if (!options.includes(country)) {
            options.push(country);
        }

    }

    options.sort(() => Math.random() - 0.5);

    const box = document.getElementById("answers");

    box.innerHTML = "";

    options.forEach(option => {

        const button = document.createElement("button");

        button.textContent = option;

        button.onclick = () =>
            answer(button, option === current.country);

        box.appendChild(button);

    });

}

// ======================
// ANSWER
// ======================

function answer(button, correct) {

    document.querySelectorAll("#answers button")
        .forEach(btn => btn.disabled = true);

    totalAnswered++;

    if (correct) {

        score++;
        streak++;
        totalCorrect++;

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

                if (btn.textContent === current.country) {
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

    const li = document.createElement("li");

    li.textContent = "✅ " + name;

    document
        .getElementById("achievements")
        .appendChild(li);

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