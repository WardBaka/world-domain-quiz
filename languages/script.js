let data = [];
let remainingQuestions = [];
let current = null;
let correctAnswer = "";

let score = 0;
let streak = 0;
let bestStreak = 0;
let totalAnswered = 0;
let totalCorrect = 0;
let questionNumber = 0;
let xpEarnedThisQuiz = 0;
let answerLocked = false;

let unlockedAchievements =
    JSON.parse(
        localStorage.getItem("languageAchievements") || "[]"
    );

const levelXPTable = [
    0, 100, 250, 450, 700,
    1000, 1400, 1900, 2500, 3200,
    4000, 5000, 6200, 7600, 9200,
    11000, 13000, 15200, 17600, 20200,
    23000, 26000, 29200, 32600, 36200,
    40000, 44000, 48200, 52600, 57200
];

fetch("languages.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(
                "Could not load languages.json"
            );
        }

        return response.json();
    })
    .then(languageData => {
        data = languageData;
        resetQuestionPool();
        nextQuestion();
    })
    .catch(error => {
        console.error(error);

        document.getElementById("languageQuestion").textContent =
            "Could not load the language data.";

        document.getElementById("languageInfo").textContent =
            "Check that languages.json is inside the quizLanguages folder.";
    });

function getLevelFromXP(xp){
    let level = 1;

    for (let i = 0; i < levelXPTable.length; i++) {
        if (xp >= levelXPTable[i]) {
            level = i + 1;
        }
    }

    return level;
}

function showToast(
    title,
    message,
    type = "achievement"
){
    const toast =
        document.createElement("div");

    toast.className =
        "toast toast-" + type;

    let icon = "🏆";

    if (type === "level") {
        icon = "⬆️";
    }

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

function addXP(amount, button = null){
    const oldXP =
        Number(
            localStorage.getItem("guessrXP") || 0
        );

    const oldLevel =
        getLevelFromXP(oldXP);

    const newXP =
        oldXP + amount;

    const newLevel =
        getLevelFromXP(newXP);

    localStorage.setItem(
        "guessrXP",
        newXP
    );

    if (button) {
        showFloatingXP(button, amount);
    }

    if (newLevel > oldLevel) {
        showToast(
            "Level Up!",
            "Level " + oldLevel +
            " → Level " + newLevel,
            "level"
        );
    }
}

function resetQuestionPool(){
    const region =
        document.getElementById("region").value;

    remainingQuestions =
        region === "All"
            ? [...data]
            : data.filter(
                item => item.continent === region
            );
}

function getFilteredQuestions(){
    const region =
        document.getElementById("region").value;

    if (region === "All") {
        return remainingQuestions;
    }

    return remainingQuestions.filter(
        item => item.continent === region
    );
}

function getOptionsPool(){
    const region =
        document.getElementById("region").value;

    if (region === "All") {
        return data;
    }

    return data.filter(
        item => item.continent === region
    );
}

function updateGlobalStats(correct){
    let globalAnswered =
        Number(
            localStorage.getItem(
                "guessrTotalAnswered"
            ) || 0
        );

    let globalCorrect =
        Number(
            localStorage.getItem(
                "guessrTotalCorrect"
            ) || 0
        );

    globalAnswered++;

    if (correct) {
        globalCorrect++;
    }

    localStorage.setItem(
        "guessrTotalAnswered",
        globalAnswered
    );

    localStorage.setItem(
        "guessrTotalCorrect",
        globalCorrect
    );
}

function nextQuestion(){
    const filtered =
        getFilteredQuestions();

    if (filtered.length === 0) {
        showCompletionScreen();
        return;
    }

    answerLocked = false;
    questionNumber++;

    current =
        filtered[
            Math.floor(
                Math.random() * filtered.length
            )
        ];

    correctAnswer = current.country;

    document.getElementById(
        "questionCounter"
    ).textContent = questionNumber;

    document.getElementById(
        "languageQuestion"
    ).textContent = current.language;

    document.getElementById(
        "languageInfo"
    ).textContent =
        "Select an answer to learn more.";

    const difficulty =
        document.getElementById(
            "difficulty"
        ).value;

    let answerCount =
        difficulty === "Hard" ? 6 : 4;

    const optionsPool =
        getOptionsPool();

    const uniqueCountries =
        [...new Set(
            optionsPool.map(
                item => item.country
            )
        )];

    answerCount =
        Math.min(
            answerCount,
            uniqueCountries.length
        );

    const options =
        [correctAnswer];

    while (options.length < answerCount) {
        const randomCountry =
            uniqueCountries[
                Math.floor(
                    Math.random() *
                    uniqueCountries.length
                )
            ];

        if (!options.includes(randomCountry)) {
            options.push(randomCountry);
        }
    }

    options.sort(
        () => Math.random() - 0.5
    );

    const answersBox =
        document.getElementById("answers");

    answersBox.innerHTML = "";

    options.forEach(option => {
        const button =
            document.createElement("button");

        button.textContent = option;

        button.addEventListener(
            "click",
            () => {
                answer(
                    button,
                    option === correctAnswer
                );
            }
        );

        answersBox.appendChild(button);
    });
}

function answer(button, correct){
    if (answerLocked) return;

    answerLocked = true;

    document
        .querySelectorAll("#answers button")
        .forEach(btn => {
            btn.disabled = true;
        });

    totalAnswered++;
    updateGlobalStats(correct);

    if (correct) {
        score++;
        streak++;
        totalCorrect++;
        xpEarnedThisQuiz += 10;

        if (streak > bestStreak) {
            bestStreak = streak;
        }

        button.classList.add("correct");

        addXP(10, button);

        let languageCorrect =
            Number(
                localStorage.getItem(
                    "guessrLanguageCorrect"
                ) || 0
            );

        languageCorrect++;

        localStorage.setItem(
            "guessrLanguageCorrect",
            languageCorrect
        );

        /*
         * Remove by phrase, not country.
         * This allows both Tuvalu entries to exist.
         */
        remainingQuestions =
            remainingQuestions.filter(
                item =>
                    item.language !== current.language
            );

        unlockAchievement(
            "First Language Correct"
        );

        if (streak >= 10) {
            unlockAchievement(
                "10 Language Streak"
            );
        }

        if (score >= 25) {
            unlockAchievement(
                "25 Languages Correct"
            );
        }

        if (score >= 50) {
            unlockAchievement(
                "Language Expert"
            );
        }

    } else {
        streak = 0;
        button.classList.add("wrong");

        document
            .querySelectorAll("#answers button")
            .forEach(btn => {
                if (
                    btn.textContent ===
                    correctAnswer
                ) {
                    btn.classList.add("correct");
                }
            });
    }

    updateStats();
    updateLanguageInfo();
}

function updateStats(){
    const accuracy =
        totalAnswered > 0
            ? Math.round(
                (
                    totalCorrect /
                    totalAnswered
                ) * 100
            )
            : 0;

    document.getElementById(
        "score"
    ).textContent = score;

    document.getElementById(
        "streak"
    ).textContent = streak;

    document.getElementById(
        "accuracy"
    ).textContent = accuracy + "%";
}

function getFlagPath(flagPath){
    if (!flagPath) return "";

    if (
        flagPath.startsWith("http") ||
        flagPath.startsWith("../")
    ) {
        return flagPath;
    }

    /*
     * JSON currently contains flags/nl.png,
     * while the shared flags folder is one
     * level above quizLanguages.
     */
    if (flagPath.startsWith("flags/")) {
    return "../" + flagPath.replace("flags/", "flagsImg/");
}

    return flagPath;
}

function updateLanguageInfo(){
    const flagPath =
        getFlagPath(current.flag);

    document.getElementById(
        "languageInfo"
    ).innerHTML = `
        <div class="info-header">
            ${
                flagPath
                    ? `
                        <img
                            src="${flagPath}"
                            alt="${current.country} flag"
                            class="info-flag"
                        >
                    `
                    : ""
            }

            <strong>${current.country}</strong>
        </div>

        <p>
            <b>Region:</b>
            ${current.continent}
        </p>

        <p>
            ${current.info}
        </p>
    `;
}

function unlockAchievement(name){
    if (
        unlockedAchievements.includes(name)
    ) {
        return;
    }

    unlockedAchievements.push(name);

    localStorage.setItem(
        "languageAchievements",
        JSON.stringify(
            unlockedAchievements
        )
    );

    localStorage.setItem(
        "guessrLatestAchievement",
        name
    );

    localStorage.setItem(
        "guessrLatestAchievementDate",
        new Date().toISOString()
    );

    showToast(
        "Achievement Unlocked",
        name,
        "achievement"
    );
}

function showCompletionScreen(){
    const accuracy =
        totalAnswered > 0
            ? Math.round(
                (
                    totalCorrect /
                    totalAnswered
                ) * 100
            )
            : 0;

    document.getElementById(
        "completionScreen"
    ).style.display = "flex";

    document.getElementById(
        "completeScore"
    ).textContent =
        score + " / " + totalAnswered;

    document.getElementById(
        "completeAccuracy"
    ).textContent =
        accuracy + "%";

    document.getElementById(
        "completeBest"
    ).textContent =
        bestStreak;

    document.getElementById(
        "completeXP"
    ).textContent =
        "+" + xpEarnedThisQuiz + " XP";
}

function restartQuiz(){
    score = 0;
    streak = 0;
    bestStreak = 0;
    totalAnswered = 0;
    totalCorrect = 0;
    questionNumber = 0;
    xpEarnedThisQuiz = 0;
    answerLocked = false;

    resetQuestionPool();

    document.getElementById(
        "completionScreen"
    ).style.display = "none";

    document.getElementById(
        "score"
    ).textContent = "0";

    document.getElementById(
        "streak"
    ).textContent = "0";

    document.getElementById(
        "accuracy"
    ).textContent = "0%";

    document.getElementById(
        "questionCounter"
    ).textContent = "0";

    nextQuestion();
}

document
    .getElementById("next")
    .addEventListener(
        "click",
        nextQuestion
    );

document
    .getElementById("restart")
    .addEventListener(
        "click",
        restartQuiz
    );

document
    .getElementById("region")
    .addEventListener(
        "change",
        () => {
            restartQuiz();
        }
    );

document
    .getElementById("difficulty")
    .addEventListener(
        "change",
        () => {
            restartQuiz();
        }
    );

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
                "../";
        }
    );
}