let data = [];
let remainingQuestions = [];
let current = null;
let correctAnswer = "";

let score = 0;
let streak = 0;

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

function nextQuestion() {
    const filtered = getFilteredData();

    const flag = document.getElementById("flag");
    const question = document.getElementById("question");
    const answers = document.getElementById("answers");

    answers.innerHTML = "";

    if (filtered.length === 0) {
        flag.style.display = "none";
        question.textContent = "🎉 Region completed!";
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

    if (correct) {
        score++;
        streak++;

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

function restartQuiz() {
    remainingQuestions = [...data];

    score = 0;
    streak = 0;

    document.getElementById("score").textContent = score;
    document.getElementById("streak").textContent = streak;

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