const levelXPTable = [
    0, 100, 250, 450, 700,
    1000, 1400, 1900, 2500, 3200,
    4000, 5000, 6200, 7600, 9200,
    11000, 13000, 15200, 17600, 20200,
    23000, 26000, 29200, 32600, 36200,
    40000, 44000, 48200, 52600, 57200
];

const QUIZ_TOTALS = {
    domains: 249,
    flags: 224,
    phones: 224,
    languages: 224
};

/* =========================
   SAFE STORAGE HELPERS
========================= */

function getStoredNumber(key){
    const value =
        Number(localStorage.getItem(key) || 0);

    return Number.isFinite(value)
        ? value
        : 0;
}

function getStoredArray(key){
    try {
        const value =
            JSON.parse(
                localStorage.getItem(key) || "[]"
            );

        return Array.isArray(value)
            ? value
            : [];
    }
    catch {
        return [];
    }
}

/* =========================
   LEVEL SYSTEM
========================= */

function getLevelProgress(xp){
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

    const maxLevel =
        levelXPTable.length;

    if (level >= maxLevel) {
        return {
            level: maxLevel,
            currentXP: 0,
            neededXP: 0,
            percent: 100,
            isMaxLevel: true
        };
    }

    const currentLevelXP =
        levelXPTable[level - 1];

    const nextLevelXP =
        levelXPTable[level];

    const xpIntoLevel =
        Math.max(
            0,
            xp - currentLevelXP
        );

    const xpNeededForNext =
        nextLevelXP - currentLevelXP;

    const percent =
        xpNeededForNext > 0
            ? Math.min(
                100,
                Math.floor(
                    (
                        xpIntoLevel /
                        xpNeededForNext
                    ) * 100
                )
            )
            : 100;

    return {
        level,
        currentXP: xpIntoLevel,
        neededXP: xpNeededForNext,
        percent,
        isMaxLevel: false
    };
}

function getTitle(level){
    if (level >= 30) return "Guessr Legend";
    if (level >= 25) return "Atlas Master";
    if (level >= 20) return "Cartographer";
    if (level >= 15) return "Traveler";
    if (level >= 10) return "Adventurer";
    if (level >= 5) return "Explorer";

    return "New Explorer";
}

/* =========================
   PROGRESS HELPERS
========================= */

function updateProgressBar(
    textId,
    fillId,
    percentId,
    learned,
    total
){
    const safeLearned =
        Math.max(0, learned);

    const cappedLearned =
        Math.min(safeLearned, total);

    const percent =
        total > 0
            ? Math.min(
                100,
                Math.round(
                    (
                        cappedLearned /
                        total
                    ) * 100
                )
            )
            : 0;

    const textElement =
        document.getElementById(textId);

    const fillElement =
        document.getElementById(fillId);

    const percentElement =
        document.getElementById(percentId);

    if (textElement) {
        textElement.textContent =
            cappedLearned +
            " / " +
            total;
    }

    if (fillElement) {
        fillElement.style.width =
            percent + "%";
    }

    if (percentElement) {
        percentElement.textContent =
            percent + "%";
    }

    return percent;
}

/* =========================
   LATEST ACHIEVEMENT
========================= */

function getTimeAgo(dateString){
    if (!dateString) {
        return "Unlocked recently";
    }

    const unlockedDate =
        new Date(dateString);

    if (
        Number.isNaN(
            unlockedDate.getTime()
        )
    ) {
        return "Unlocked recently";
    }

    const seconds =
        Math.max(
            0,
            Math.floor(
                (
                    Date.now() -
                    unlockedDate.getTime()
                ) / 1000
            )
        );

    if (seconds < 60) {
        return "Unlocked just now";
    }

    const minutes =
        Math.floor(seconds / 60);

    if (minutes < 60) {
        return (
            "Unlocked " +
            minutes +
            " minute" +
            (minutes === 1 ? "" : "s") +
            " ago"
        );
    }

    const hours =
        Math.floor(minutes / 60);

    if (hours < 24) {
        return (
            "Unlocked " +
            hours +
            " hour" +
            (hours === 1 ? "" : "s") +
            " ago"
        );
    }

    const days =
        Math.floor(hours / 24);

    return (
        "Unlocked " +
        days +
        " day" +
        (days === 1 ? "" : "s") +
        " ago"
    );
}

function updateLatestAchievement(){
    const achievement =
        localStorage.getItem(
            "guessrLatestAchievement"
        );

    const date =
        localStorage.getItem(
            "guessrLatestAchievementDate"
        );

    const nameElement =
        document.getElementById(
            "latestAchievement"
        );

    const timeElement =
        document.getElementById(
            "latestAchievementTime"
        );

    if (!achievement) {
        nameElement.textContent =
            "No achievements yet";

        timeElement.textContent =
            "Play a quiz to unlock your first achievement.";

        return;
    }

    nameElement.textContent =
        achievement;

    timeElement.textContent =
        getTimeAgo(date);
}

/* =========================
   PROFILE DATA
========================= */

const username =
    localStorage.getItem(
        "guessrUsername"
    ) || "Guest";

const xp =
    getStoredNumber("guessrXP");

const totalCorrect =
    getStoredNumber(
        "guessrTotalCorrect"
    );

const totalAnswered =
    getStoredNumber(
        "guessrTotalAnswered"
    );

const bestStreak =
    getStoredNumber(
        "bestStreak"
    );

const accuracy =
    totalAnswered > 0
        ? Math.round(
            (
                totalCorrect /
                totalAnswered
            ) * 100
        )
        : 0;

const levelProgress =
    getLevelProgress(xp);

/* =========================
   PROFILE HERO
========================= */

document.getElementById(
    "username"
).textContent = username;

document.getElementById(
    "playerTitle"
).textContent =
    getTitle(levelProgress.level);

document.getElementById(
    "level"
).textContent =
    "Level " + levelProgress.level;

document.getElementById(
    "levelBadge"
).textContent =
    levelProgress.level;

document.getElementById(
    "xp"
).textContent =
    xp.toLocaleString() +
    " Total XP";

document.getElementById(
    "xpFill"
).style.width =
    levelProgress.percent + "%";

document.getElementById(
    "xpPercent"
).textContent =
    levelProgress.percent + "%";

document.getElementById(
    "nextLevel"
).textContent =
    levelProgress.isMaxLevel
        ? "Maximum level reached"
        : (
            levelProgress.currentXP +
            " / " +
            levelProgress.neededXP +
            " XP to next level"
        );

/* =========================
   BASIC STATISTICS
========================= */

document.getElementById(
    "totalCorrect"
).textContent =
    totalCorrect.toLocaleString();

document.getElementById(
    "totalAnswered"
).textContent =
    totalAnswered.toLocaleString();

document.getElementById(
    "accuracy"
).textContent =
    accuracy + "%";

document.getElementById(
    "bestStreak"
).textContent =
    bestStreak.toLocaleString();

/* =========================
   QUIZ PROGRESS
========================= */

const domainsLearned =
    new Set(
        getStoredArray(
            "masteredDomains"
        )
    ).size;

const flagsLearned =
    getStoredNumber(
        "guessrFlagCorrect"
    );

const phonesLearned =
    getStoredNumber(
        "guessrPhoneCorrect"
    );

const languagesLearned =
    getStoredNumber(
        "guessrLanguageCorrect"
    );

const domainPercent =
    updateProgressBar(
        "domainProgressText",
        "domainProgressFill",
        "domainProgressPercent",
        domainsLearned,
        QUIZ_TOTALS.domains
    );

const flagPercent =
    updateProgressBar(
        "flagProgressText",
        "flagProgressFill",
        "flagProgressPercent",
        flagsLearned,
        QUIZ_TOTALS.flags
    );

const phonePercent =
    updateProgressBar(
        "phoneProgressText",
        "phoneProgressFill",
        "phoneProgressPercent",
        phonesLearned,
        QUIZ_TOTALS.phones
    );

const languagePercent =
    updateProgressBar(
        "languageProgressText",
        "languageProgressFill",
        "languageProgressPercent",
        languagesLearned,
        QUIZ_TOTALS.languages
    );

const overallProgress =
    Math.round(
        (
            domainPercent +
            flagPercent +
            phonePercent +
            languagePercent
        ) / 4
    );

document.getElementById(
    "overallProgress"
).textContent =
    overallProgress + "%";

/* =========================
   ACHIEVEMENTS
========================= */

const unlockedAchievements = [
    ...getStoredArray(
        "achievements"
    ),

    ...getStoredArray(
        "flagAchievements"
    ),

    ...getStoredArray(
        "phoneAchievements"
    ),

    ...getStoredArray(
        "languageAchievements"
    )
];

const uniqueAchievements =
    [...new Set(unlockedAchievements)];

const achievementData = [
    {
        name:"First Correct Answer",
        desc:"Answer your first Domain Quiz question correctly.",
        category:"DOMAINS"
    },
    {
        name:"10 Answer Streak",
        desc:"Reach a 10-answer streak in the Domain Quiz.",
        category:"DOMAINS"
    },
    {
        name:"50 Correct Answers",
        desc:"Get 50 correct answers during a Domain Quiz session.",
        category:"DOMAINS"
    },
    {
        name:"Learn 100 Domains",
        desc:"Master 100 different internet country domains.",
        category:"DOMAINS"
    },

    {
        name:"First Flag Correct",
        desc:"Identify your first national flag correctly.",
        category:"FLAGS"
    },
    {
        name:"10 Flag Streak",
        desc:"Reach a 10-answer streak in the Flag Quiz.",
        category:"FLAGS"
    },
    {
        name:"25 Flags Correct",
        desc:"Get 25 correct answers during a Flag Quiz session.",
        category:"FLAGS"
    },
    {
        name:"Flag Expert",
        desc:"Get 50 correct answers during a Flag Quiz session.",
        category:"FLAGS"
    },

    {
        name:"First Phone Code Correct",
        desc:"Identify your first international phone code.",
        category:"PHONE CODES"
    },
    {
        name:"10 Phone Code Streak",
        desc:"Reach a 10-answer streak in the Phone Code Quiz.",
        category:"PHONE CODES"
    },
    {
        name:"25 Phone Codes Correct",
        desc:"Get 25 correct answers during a Phone Code Quiz session.",
        category:"PHONE CODES"
    },
    {
        name:"Phone Code Expert",
        desc:"Get 50 correct answers during a Phone Code Quiz session.",
        category:"PHONE CODES"
    },

    {
        name:"First Language Correct",
        desc:"Match your first language phrase or clue to its country.",
        category:"LANGUAGES"
    },
    {
        name:"10 Language Streak",
        desc:"Reach a 10-answer streak in the Languages Quiz.",
        category:"LANGUAGES"
    },
    {
        name:"25 Languages Correct",
        desc:"Get 25 correct answers during a Languages Quiz session.",
        category:"LANGUAGES"
    },
    {
        name:"Language Expert",
        desc:"Get 50 correct answers during a Languages Quiz session.",
        category:"LANGUAGES"
    }
];

document.getElementById(
    "achievementNumber"
).textContent =
    uniqueAchievements.length;

document.getElementById(
    "achievementCounter"
).textContent =
    uniqueAchievements.length +
    " / " +
    achievementData.length +
    " unlocked";

const achievementGrid =
    document.getElementById(
        "achievementGrid"
    );

achievementGrid.innerHTML = "";

achievementData.forEach(
    achievement => {
        const unlocked =
            uniqueAchievements.includes(
                achievement.name
            );

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "achievement-tile " +
            (
                unlocked
                    ? "unlocked"
                    : "locked"
            );

        card.innerHTML = `
            <h3>
                ${unlocked ? "✅" : "🔒"}
                ${achievement.name}
            </h3>

            <p>
                ${achievement.desc}
            </p>

            <span class="achievement-category">
                ${achievement.category}
            </span>
        `;

        achievementGrid.appendChild(
            card
        );
    }
);

/* =========================
   LATEST ACHIEVEMENT
========================= */

updateLatestAchievement();

/* =========================
   LEVEL-UP PROFILE GLOW
========================= */

const savedProfileLevel =
    getStoredNumber(
        "guessrLastSeenProfileLevel"
    ) || levelProgress.level;

if (
    levelProgress.level >
    savedProfileLevel
) {
    const profileHero =
        document.querySelector(
            ".profile-hero"
        );

    if (profileHero) {
        profileHero.classList.add(
            "level-glow"
        );

        setTimeout(() => {
            profileHero.classList.remove(
                "level-glow"
            );
        }, 1200);
    }
}

localStorage.setItem(
    "guessrLastSeenProfileLevel",
    levelProgress.level
);