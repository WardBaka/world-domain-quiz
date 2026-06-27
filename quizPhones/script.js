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
        totalCorrect++;
    }

    localStorage.setItem("guessrTotalAnswered", totalAnswered);
    localStorage.setItem("guessrTotalCorrect", totalCorrect);
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

function unlockAchievement(name) {
    if (unlockedAchievements.includes(name)) return;

    unlockedAchievements.push(name);

    localStorage.phoneAchievements =
        JSON.stringify(unlockedAchievements);

    showAchievementToast(name);
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

        let xp = Number(localStorage.getItem("guessrXP") || 0);
xp += 10;
localStorage.setItem("guessrXP", xp);

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