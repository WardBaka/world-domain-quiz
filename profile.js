const levelXPTable = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    450,    // Level 4
    700,    // Level 5
    1000,   // Level 6
    1400,   // Level 7
    1900,   // Level 8
    2500,   // Level 9
    3200,   // Level 10
    4000,   // Level 11
    5000,   // Level 12
    6200,   // Level 13
    7600,   // Level 14
    9200,   // Level 15
    11000,  // Level 16
    13000,  // Level 17
    15200,  // Level 18
    17600,  // Level 19
    20200,  // Level 20
    23000,  // Level 21
    26000,  // Level 22
    29200,  // Level 23
    32600,  // Level 24
    36200,  // Level 25
    40000,  // Level 26
    44000,  // Level 27
    48200,  // Level 28
    52600,  // Level 29
    57200   // Level 30
];

function getLevelProgress(xp) {
    let level = 1;

    for (let i = 0; i < levelXPTable.length; i++) {
        if (xp >= levelXPTable[i]) {
            level = i + 1;
        }
    }

    const currentLevelXP = levelXPTable[level - 1];

    const nextLevelXP =
        levelXPTable[level] || levelXPTable[levelXPTable.length - 1];

    const xpIntoLevel =
        xp - currentLevelXP;

    const xpNeededForNext =
        nextLevelXP - currentLevelXP;

    const percent =
        level >= levelXPTable.length
            ? 100
            : Math.floor((xpIntoLevel / xpNeededForNext) * 100);

    return {
        level: level,
        currentXP: xpIntoLevel,
        neededXP: xpNeededForNext,
        percent: percent
    };
}

function updateProgressBar(textId, fillId, learned, total) {
    const percent =
        total > 0
            ? Math.round((learned / total) * 100)
            : 0;

    document.getElementById(textId).textContent =
        learned + " / " + total + " (" + percent + "%)";

    document.getElementById(fillId).style.width =
        percent + "%";
}

const domainsLearned =
    JSON.parse(localStorage.masteredDomains || "[]").length;

const flagsLearned =
    JSON.parse(localStorage.flagAchievements || "[]").includes("First Flag Correct")
        ? Number(localStorage.getItem("guessrFlagCorrect") || 0)
        : 0;

const phonesLearned =
    JSON.parse(localStorage.phoneAchievements || "[]").includes("First Phone Code Correct")
        ? Number(localStorage.getItem("guessrPhoneCorrect") || 0)
        : 0;

updateProgressBar("domainProgressText", "domainProgressFill", domainsLearned, 250);
updateProgressBar("flagProgressText", "flagProgressFill", flagsLearned, 250);
updateProgressBar("phoneProgressText", "phoneProgressFill", phonesLearned, 200);

const allAchievements = [
    ...JSON.parse(localStorage.achievements || "[]"),
    ...JSON.parse(localStorage.flagAchievements || "[]"),
    ...JSON.parse(localStorage.phoneAchievements || "[]")
];

const uniqueAchievements = [...new Set(allAchievements)];

document.getElementById("achievementCounter").textContent =
    uniqueAchievements.length + " Achievements Unlocked";

const achievementList = document.getElementById("achievements");

achievementList.innerHTML = "";

uniqueAchievements.forEach(achievement => {
    const li = document.createElement("li");
    li.textContent = "✅ " + achievement;
    achievementList.appendChild(li);
});

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

const progress =
    getLevelProgress(xp);

const accuracy =
    totalAnswered > 0
        ? Math.round((totalCorrect / totalAnswered) * 100)
        : 0;

document.getElementById("username").textContent = username;

document.getElementById("level").textContent =
    "Level " + progress.level;

document.getElementById("xp").textContent =
    xp + " Total XP";

document.getElementById("xpFill").style.width =
    progress.percent + "%";

document.getElementById("nextLevel").textContent =
    progress.currentXP + " / " + progress.neededXP + " XP to next level";

document.getElementById("totalCorrect").textContent =
    totalCorrect;

document.getElementById("totalAnswered").textContent =
    totalAnswered;

document.getElementById("accuracy").textContent =
    accuracy + "%";

document.getElementById("bestStreak").textContent =
    bestStreak;