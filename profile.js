const levelXPTable = [
    0, 100, 250, 450, 700,
    1000, 1400, 1900, 2500, 3200,
    4000, 5000, 6200, 7600, 9200,
    11000, 13000, 15200, 17600, 20200,
    23000, 26000, 29200, 32600, 36200,
    40000, 44000, 48200, 52600, 57200
];

function getLevelProgress(xp) {
    let level = 1;

    for (let i = 0; i < levelXPTable.length; i++) {
        if (xp >= levelXPTable[i]) {
            level = i + 1;
        }
    }

    const currentLevelXP = levelXPTable[level - 1];
    const nextLevelXP = levelXPTable[level] || levelXPTable[levelXPTable.length - 1];

    const xpIntoLevel = xp - currentLevelXP;
    const xpNeededForNext = nextLevelXP - currentLevelXP;

    const percent =
        level >= levelXPTable.length
            ? 100
            : Math.floor((xpIntoLevel / xpNeededForNext) * 100);

    return {
        level,
        currentXP: xpIntoLevel,
        neededXP: xpNeededForNext,
        percent
    };
}

function getTitle(level) {
    if (level >= 30) return "Guessr Legend";
    if (level >= 25) return "Atlas Master";
    if (level >= 20) return "Cartographer";
    if (level >= 15) return "Traveler";
    if (level >= 10) return "Adventurer";
    if (level >= 5) return "Explorer";
    return "New Explorer";
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

    return percent;
}

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
document.getElementById("playerTitle").textContent = getTitle(progress.level);

document.getElementById("level").textContent =
    "Level " + progress.level;

document.getElementById("xp").textContent =
    xp + " Total XP";

document.getElementById("xpFill").style.width =
    progress.percent + "%";

document.getElementById("nextLevel").textContent =
    progress.currentXP + " / " + progress.neededXP + " XP to next level";

document.getElementById("totalCorrect").textContent = totalCorrect;
document.getElementById("totalAnswered").textContent = totalAnswered;
document.getElementById("accuracy").textContent = accuracy + "%";
document.getElementById("bestStreak").textContent = bestStreak;

const domainsLearned =
    JSON.parse(localStorage.masteredDomains || "[]").length;

const flagsLearned =
    Number(localStorage.getItem("guessrFlagCorrect") || 0);

const phonesLearned =
    Number(localStorage.getItem("guessrPhoneCorrect") || 0);

const domainPercent =
    updateProgressBar("domainProgressText", "domainProgressFill", domainsLearned, 249);

const flagPercent =
    updateProgressBar("flagProgressText", "flagProgressFill", flagsLearned, 224);

const phonePercent =
    updateProgressBar("phoneProgressText", "phoneProgressFill", phonesLearned, 224);

const overall =
    Math.round((domainPercent + flagPercent + phonePercent) / 3);

document.getElementById("overallProgress").textContent =
    overall + "%";

const unlockedAchievements = [
    ...JSON.parse(localStorage.achievements || "[]"),
    ...JSON.parse(localStorage.flagAchievements || "[]"),
    ...JSON.parse(localStorage.phoneAchievements || "[]")
];

const uniqueAchievements =
    [...new Set(unlockedAchievements)];

const achievementData = [
    {
        name:"First Correct Answer",
        desc:"Answer your first domain question correctly."
    },
    {
        name:"10 Answer Streak",
        desc:"Get a 10-answer streak in Domain Quiz."
    },
    {
        name:"50 Correct Answers",
        desc:"Get 50 correct answers in Domain Quiz."
    },
    {
        name:"Learn 100 Domains",
        desc:"Master 100 different domains."
    },
    {
        name:"First Flag Correct",
        desc:"Answer your first flag question correctly."
    },
    {
        name:"10 Flag Streak",
        desc:"Get a 10-answer streak in Flag Quiz."
    },
    {
        name:"25 Flags Correct",
        desc:"Get 25 correct answers in Flag Quiz."
    },
    {
        name:"Flag Expert",
        desc:"Get 50 correct answers in Flag Quiz."
    },
    {
        name:"First Phone Code Correct",
        desc:"Answer your first phone code correctly."
    },
    {
        name:"10 Phone Code Streak",
        desc:"Get a 10-answer streak in Phone Quiz."
    },
    {
        name:"25 Phone Codes Correct",
        desc:"Get 25 correct answers in Phone Quiz."
    },
    {
        name:"Phone Code Expert",
        desc:"Get 50 correct answers in Phone Quiz."
    }
];

document.getElementById("achievementNumber").textContent =
    uniqueAchievements.length;

document.getElementById("achievementCounter").textContent =
    uniqueAchievements.length + " / " + achievementData.length + " Achievements Unlocked";

const achievementGrid =
    document.getElementById("achievementGrid");

achievementGrid.innerHTML = "";

achievementData.forEach(achievement => {
    const unlocked =
        uniqueAchievements.includes(achievement.name);

    const card =
        document.createElement("div");

    card.className =
        "achievement-tile " + (unlocked ? "unlocked" : "locked");

    card.innerHTML = `
        <h3>${unlocked ? "✅" : "🔒"} ${achievement.name}</h3>
        <p>${achievement.desc}</p>
    `;

    achievementGrid.appendChild(card);
});