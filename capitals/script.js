// ======================
// GAME DATA
// ======================

let data = [];
let remainingQuestions = [];
let current = null;

let currentMode = "";
let correctAnswer = "";

let score = 0;
let streak = 0;
let bestStreak =
    Number(localStorage.getItem("capitalBestStreak") || 0);

let totalAnswered = 0;
let totalCorrect = 0;
let questionNumber = 0;
let xpEarnedThisQuiz = 0;

let answerLocked = false;
let gameActive = true;

let timerInterval = null;
let timeLeft = 60;

let initialQuestionCount = 0;

let unlockedAchievements =
    JSON.parse(
        localStorage.getItem("capitalAchievements") || "[]"
    );

let masteredCapitals =
    JSON.parse(
        localStorage.getItem("masteredCapitals") || "[]"
    );


// ======================
// LEVEL TABLE
// ======================

const levelXPTable = [
    0, 100, 250, 450, 700,
    1000, 1400, 1900, 2500, 3200,
    4000, 5000, 6200, 7600, 9200,
    11000, 13000, 15200, 17600, 20200,
    23000, 26000, 29200, 32600, 36200,
    40000, 44000, 48200, 52600, 57200
];


// ======================
// INITIALIZE
// ======================

document.getElementById("best").textContent =
    bestStreak;

fetch("capitals.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(
                "Could not load capitals.json"
            );
        }

        return response.json();
    })
    .then(capitalData => {
        data = capitalData;

        restartQuiz();
    })
    .catch(error => {
        console.error(error);

        document.getElementById(
            "capitalQuestion"
        ).textContent =
            "Could not load the capital data.";

        document.getElementById(
            "capitalInfo"
        ).textContent =
            "Check that capitals.json is inside the capitals folder.";
    });


// ======================
// DATA FILTERING
// ======================

function getRegionData() {
    const region =
        document.getElementById("region").value;

    if (region === "All") {
        return data;
    }

    return data.filter(
        item => item.continent === region
    );
}


function resetQuestionPool() {
    remainingQuestions =
        [...getRegionData()];

    initialQuestionCount =
        remainingQuestions.length;
}


function getOptionsPool() {
    return getRegionData();
}


// ======================
// GAME MODES
// ======================

function startTimedMode() {
    clearInterval(timerInterval);

    timeLeft = 60;

    document.getElementById("timer").textContent =
        timeLeft;

    timerInterval =
        setInterval(() => {
            timeLeft--;

            document.getElementById(
                "timer"
            ).textContent =
                timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);

                showCompletionScreen();
            }
        }, 1000);
}


function configureGameMode() {
    clearInterval(timerInterval);

    const gameMode =
        document.getElementById("gameMode").value;

    if (gameMode === "timed") {
        startTimedMode();
    }
    else {
        document.getElementById(
            "timer"
        ).textContent =
            "—";
    }
}


// ======================
// NEXT QUESTION
// ======================

function nextQuestion() {
    if (!gameActive) {
        return;
    }

    if (remainingQuestions.length === 0) {
        showCompletionScreen();
        return;
    }

    answerLocked = false;
    questionNumber++;

    current =
        remainingQuestions[
            Math.floor(
                Math.random() *
                remainingQuestions.length
            )
        ];

    let mode =
        document.getElementById("quizMode").value;

    if (mode === "mixed") {
        const mixedModes = [
            "country-capital",
            "capital-country"
        ];

        mode =
            mixedModes[
                Math.floor(
                    Math.random() *
                    mixedModes.length
                )
            ];
    }

    currentMode = mode;

    document.getElementById(
        "questionCounter"
    ).textContent =
        `Question ${questionNumber}`;

    updateProgressBar();

    const question =
        document.getElementById(
            "capitalQuestion"
        );

    const questionLabel =
        document.getElementById(
            "questionLabel"
        );

    let optionValues = [];

    const optionsPool =
        getOptionsPool();

    // COUNTRY → CAPITAL
    // COUNTRY → CAPITAL
if (mode === "country-capital") {
    questionLabel.textContent =
        "What is the capital of this country?";

    question.textContent =
        current.country;

    correctAnswer =
        current.capital;

    optionValues =
        Array.isArray(current.cities)
            ? current.cities
            : [];
}

// CAPITAL → COUNTRY
else if (mode === "capital-country") {
    questionLabel.textContent =
        "Which country has this capital?";

    question.textContent =
        current.capital;

    correctAnswer =
        current.country;

    optionValues =
        optionsPool.map(
            item => item.country
        );
}

// CITIES CHALLENGE
else if (mode === "cities-challenge") {
    questionLabel.textContent =
        `Which city is the capital of ${current.country}?`;

    question.textContent =
        current.country;

    correctAnswer =
        current.capital;

    optionValues =
        Array.isArray(current.cities)
            ? current.cities
            : [];
}

    createAnswerButtons(optionValues);
}


// ======================
// ANSWER OPTIONS
// ======================

function createAnswerButtons(optionValues) {
    const difficulty =
        document.getElementById(
            "difficulty"
        ).value;

    let answerCount =
        difficulty === "Hard"
            ? 6
            : 4;

    const uniqueOptions =
        [...new Set(
            optionValues.filter(
                option =>
                    typeof option === "string" &&
                    option.trim() !== ""
            )
        )];

    if (!uniqueOptions.includes(correctAnswer)) {
        uniqueOptions.unshift(correctAnswer);
    }

    answerCount =
        Math.min(
            answerCount,
            uniqueOptions.length
        );

    const options =
        [correctAnswer];

    const availableWrongAnswers =
        uniqueOptions.filter(
            option =>
                option !== correctAnswer
        );

    shuffleArray(
        availableWrongAnswers
    );

    options.push(
        ...availableWrongAnswers.slice(
            0,
            answerCount - 1
        )
    );

    shuffleArray(options);

    const answersBox =
        document.getElementById("answers");

    answersBox.innerHTML = "";

    options.forEach(option => {
        const button =
            document.createElement("button");

        button.type = "button";
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


function shuffleArray(array) {
    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {
        const randomIndex =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            array[i],
            array[randomIndex]
        ] = [
            array[randomIndex],
            array[i]
        ];
    }

    return array;
}


// ======================
// ANSWER
// ======================

function answer(button, correct) {
    if (answerLocked || !gameActive) {
        return;
    }

    answerLocked = true;

    document
        .querySelectorAll("#answers button")
        .forEach(answerButton => {
            answerButton.disabled = true;
        });

    totalAnswered++;

    updateGlobalStats(correct);

    if (correct) {
        score++;
        streak++;
        totalCorrect++;

        if (streak > bestStreak) {
            bestStreak = streak;

            localStorage.setItem(
                "capitalBestStreak",
                bestStreak
            );
        }

        button.classList.add("correct");

        addXP(10, button);

        const capitalCorrect =
            Number(
                localStorage.getItem(
                    "guessrCapitalCorrect"
                ) || 0
            ) + 1;

        localStorage.setItem(
            "guessrCapitalCorrect",
            capitalCorrect
        );

        if (
            !masteredCapitals.includes(
                current.country
            )
        ) {
            masteredCapitals.push(
                current.country
            );

            localStorage.setItem(
                "masteredCapitals",
                JSON.stringify(
                    masteredCapitals
                )
            );
        }

        updateDailyChallengeProgress(
            "capitals"
        );

        updateAchievements();
    }
    else {
        streak = 0;

        button.classList.add("wrong");

        document
            .querySelectorAll("#answers button")
            .forEach(answerButton => {
                if (
                    answerButton.textContent ===
                    correctAnswer
                ) {
                    answerButton.classList.add(
                        "correct"
                    );
                }
            });
    }

    remainingQuestions =
        remainingQuestions.filter(
            item =>
                item.country !== current.country
        );

    updateStats();
    updateCapitalInfo();

    const gameMode =
        document.getElementById(
            "gameMode"
        ).value;

    if (
        gameMode === "suddendeath" &&
        !correct
    ) {
        setTimeout(() => {
            showCompletionScreen();
        }, 700);
    }
}


// ======================
// STATISTICS
// ======================

function updateStats() {
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
    ).textContent =
        score;

    document.getElementById(
        "streak"
    ).textContent =
        streak;

    document.getElementById(
        "best"
    ).textContent =
        bestStreak;

    document.getElementById(
        "accuracy"
    ).textContent =
        accuracy + "%";
}


function updateProgressBar() {
    const completed =
        initialQuestionCount -
        remainingQuestions.length;

    const percent =
        initialQuestionCount > 0
            ? Math.round(
                (
                    completed /
                    initialQuestionCount
                ) * 100
            )
            : 0;

    document.getElementById(
        "progressBar"
    ).style.width =
        percent + "%";
}


function updateGlobalStats(correct) {
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


// ======================
// CAPITAL INFORMATION
// ======================

function updateCapitalInfo() {
    const capitalInfo =
        document.getElementById(
            "capitalInfo"
        );

    capitalInfo.innerHTML = `
        <strong>
            🏛️ ${current.capital}
        </strong>

        <br><br>

        <b>Country:</b>
        ${current.country}

        <br>

        <b>Continent:</b>
        ${current.continent}

        <br><br>

        ${current.info || "No additional information is available."}
    `;
}


// ======================
// XP AND LEVELS
// ======================

function getLevelFromXP(xp) {
    let level = 1;

    for (
        let i = 0;
        i < levelXPTable.length;
        i++
    ) {
        if (xp >= levelXPTable[i]) {
            level = i + 1;
        }
    }

    return level;
}


function getTitleForActivity(level) {
    if (level >= 30) {
        return "Guessr Legend";
    }

    if (level >= 25) {
        return "Atlas Master";
    }

    if (level >= 20) {
        return "Cartographer";
    }

    if (level >= 15) {
        return "Traveler";
    }

    if (level >= 10) {
        return "Adventurer";
    }

    if (level >= 5) {
        return "Explorer";
    }

    return "New Explorer";
}


function showFloatingXP(button, amount) {
    const rect =
        button.getBoundingClientRect();

    const xpText =
        document.createElement("div");

    xpText.className =
        "xp-float";

    xpText.textContent =
        "+" + amount + " XP";

    xpText.style.left =
        rect.left +
        rect.width / 2 +
        "px";

    xpText.style.top =
        rect.top + "px";

    document.body.appendChild(
        xpText
    );

    setTimeout(() => {
        xpText.remove();
    }, 1000);
}


function addXP(amount, button = null) {
    const oldXP =
        Number(
            localStorage.getItem(
                "guessrXP"
            ) || 0
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

    xpEarnedThisQuiz += amount;

    if (button) {
        showFloatingXP(
            button,
            amount
        );
    }

    if (newLevel > oldLevel) {
        addRecentActivity(
            "⬆️",
            "Reached Level " + newLevel,
            "Your new title is " +
                getTitleForActivity(
                    newLevel
                ) +
                "."
        );

        showToast(
            "Level Up!",
            "Level " +
                oldLevel +
                " → Level " +
                newLevel,
            "level"
        );
    }
}


// ======================
// ACHIEVEMENTS
// ======================

function updateAchievements() {
    if (score >= 1) {
        unlockAchievement(
            "First Capital Correct"
        );
    }

    if (streak >= 10) {
        unlockAchievement(
            "10 Capital Streak"
        );
    }

    if (score >= 25) {
        unlockAchievement(
            "25 Capitals Correct"
        );
    }

    if (score >= 50) {
        unlockAchievement(
            "Capital Expert"
        );
    }

    if (masteredCapitals.length >= 100) {
        unlockAchievement(
            "Learn 100 Capitals"
        );
    }
}


function unlockAchievement(name) {
    if (
        unlockedAchievements.includes(
            name
        )
    ) {
        return;
    }

    unlockedAchievements.push(name);

    localStorage.setItem(
        "capitalAchievements",
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

    addRecentActivity(
        "🏆",
        "Achievement Unlocked",
        name
    );

    showToast(
        "Achievement Unlocked",
        name,
        "achievement"
    );
}


// ======================
// RECENT ACTIVITY
// ======================

function addRecentActivity(
    icon,
    title,
    message
) {
    let activities = [];

    try {
        activities =
            JSON.parse(
                localStorage.getItem(
                    "guessrRecentActivity"
                ) || "[]"
            );

        if (!Array.isArray(activities)) {
            activities = [];
        }
    }
    catch {
        activities = [];
    }

    activities.unshift({
        icon,
        title,
        message,
        date: new Date().toISOString()
    });

    activities =
        activities.slice(0, 25);

    localStorage.setItem(
        "guessrRecentActivity",
        JSON.stringify(
            activities
        )
    );
}


// ======================
// DAILY CHALLENGE
// ======================

function updateDailyChallengeProgress(type) {
    const challenges = [
        {
            type: "domains",
            goal: 20,
            reward: 250
        },
        {
            type: "flags",
            goal: 25,
            reward: 250
        },
        {
            type: "phones",
            goal: 15,
            reward: 250
        },
        {
            type: "languages",
            goal: 20,
            reward: 250
        },
        {
            type: "capitals",
            goal: 20,
            reward: 250
        }
    ];

    const dayNumber =
        Math.floor(
            Date.now() / 86400000
        );

    const challenge =
        challenges[
            dayNumber %
            challenges.length
        ];

    if (challenge.type !== type) {
        return;
    }

    const today =
        new Date().toDateString();

    let daily = {};

    try {
        daily =
            JSON.parse(
                localStorage.getItem(
                    "guessrDailyChallenge"
                ) || "{}"
            );
    }
    catch {
        daily = {};
    }

    if (daily.date !== today) {
        daily = {
            date: today,
            type: challenge.type,
            goal: challenge.goal,
            reward: challenge.reward,
            progress: 0,
            completed: false,
            rewarded: false
        };
    }

    if (daily.completed) {
        return;
    }

    daily.progress++;

    if (
        daily.progress >=
        challenge.goal
    ) {
        daily.completed = true;

        if (!daily.rewarded) {
            addXP(
                challenge.reward
            );

            daily.rewarded = true;

            addRecentActivity(
                "⭐",
                "Daily Challenge Complete!",
                "+" +
                    challenge.reward +
                    " XP awarded."
            );

            showToast(
                "Daily Challenge Complete!",
                "+" +
                    challenge.reward +
                    " XP Awarded",
                "daily"
            );
        }
    }

    localStorage.setItem(
        "guessrDailyChallenge",
        JSON.stringify(daily)
    );
}


// ======================
// TOAST
// ======================

function showToast(
    title,
    message,
    type = "achievement"
) {
    const toast =
        document.createElement("div");

    toast.className =
        "toast toast-" + type;

    let icon = "🏆";

    if (type === "daily") {
        icon = "⭐";
    }

    if (type === "level") {
        icon = "⬆️";
    }

    if (type === "mastered") {
        icon = "🌍";
    }

    toast.innerHTML = `
        <h3>
            ${icon} ${title}
        </h3>

        <p>
            ${message}
        </p>
    `;

    document.body.appendChild(
        toast
    );

    setTimeout(() => {
        toast.classList.add(
            "toast-hide"
        );
    }, 4500);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}


// ======================
// COMPLETION SCREEN
// ======================

function showCompletionScreen() {
    if (!gameActive) {
        return;
    }

    gameActive = false;

    clearInterval(timerInterval);

    const accuracy =
        totalAnswered > 0
            ? Math.round(
                (
                    totalCorrect /
                    totalAnswered
                ) * 100
            )
            : 0;

    updateProgressBar();

    addRecentActivity(
        "🏛️",
        "Capitals Quiz Completed",
        score +
            " correct answer" +
            (score === 1 ? "" : "s") +
            " with " +
            accuracy +
            "% accuracy."
    );

    document.getElementById(
        "completionScreen"
    ).style.display =
        "flex";

    document.getElementById(
        "completeScore"
    ).textContent =
        `${score} / ${totalAnswered}`;

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
        "+" +
        xpEarnedThisQuiz +
        " XP";

    document.getElementById(
        "completionAchievement"
    ).textContent =
        "🏛️ Capitals Quiz Completed!";

    if (accuracy === 100) {
        document.getElementById(
            "completionTitle"
        ).textContent =
            "Perfect Score!";
    }
    else if (accuracy >= 80) {
        document.getElementById(
            "completionTitle"
        ).textContent =
            "Excellent Work!";
    }
    else if (accuracy >= 60) {
        document.getElementById(
            "completionTitle"
        ).textContent =
            "Great Effort!";
    }
    else {
        document.getElementById(
            "completionTitle"
        ).textContent =
            "Keep Practising!";
    }
}


// ======================
// RESTART
// ======================

function restartQuiz() {
    clearInterval(timerInterval);

    score = 0;
    streak = 0;
    totalAnswered = 0;
    totalCorrect = 0;
    questionNumber = 0;
    xpEarnedThisQuiz = 0;

    answerLocked = false;
    gameActive = true;

    resetQuestionPool();

    document.getElementById(
        "completionScreen"
    ).style.display =
        "none";

    document.getElementById(
        "score"
    ).textContent =
        "0";

    document.getElementById(
        "streak"
    ).textContent =
        "0";

    document.getElementById(
        "accuracy"
    ).textContent =
        "0%";

    document.getElementById(
        "questionCounter"
    ).textContent =
        "Question 1";

    document.getElementById(
        "progressBar"
    ).style.width =
        "0%";

    document.getElementById(
        "capitalInfo"
    ).textContent =
        "Answer a question to learn more about the capital.";

    configureGameMode();
    nextQuestion();
}


// ======================
// EVENT LISTENERS
// ======================

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
        restartQuiz
    );

document
    .getElementById("difficulty")
    .addEventListener(
        "change",
        restartQuiz
    );

document
    .getElementById("quizMode")
    .addEventListener(
        "change",
        restartQuiz
    );

document
    .getElementById("gameMode")
    .addEventListener(
        "change",
        restartQuiz
    );

const playAgainButton =
    document.getElementById(
        "playAgain"
    );

if (playAgainButton) {
    playAgainButton.addEventListener(
        "click",
        restartQuiz
    );
}

const nextQuizButton =
    document.getElementById(
        "nextQuiz"
    );

if (nextQuizButton) {
    nextQuizButton.addEventListener(
        "click",
        () => {
            window.location.href =
                "../";
        }
    );
}