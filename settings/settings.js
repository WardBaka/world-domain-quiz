const animationsToggle =
    document.getElementById("animationsToggle");

const soundToggle =
    document.getElementById("soundToggle");

const resetProgressButton =
    document.getElementById("resetProgress");

animationsToggle.checked =
    localStorage.getItem("guessrAnimations") !== "off";

soundToggle.checked =
    localStorage.getItem("guessrSound") !== "off";

animationsToggle.addEventListener("change", () => {
    localStorage.setItem(
        "guessrAnimations",
        animationsToggle.checked ? "on" : "off"
    );
});

soundToggle.addEventListener("change", () => {
    localStorage.setItem(
        "guessrSound",
        soundToggle.checked ? "on" : "off"
    );
});

resetProgressButton.addEventListener("click", () => {
    console.log("resetProgressButton has been pressed")
    const confirmReset =
        confirm("Are you sure? This will reset your GuessrQuiz progress.");

    if (!confirmReset) return;

    console.log("confirmReset: %s", confirmReset);

    const keepUsername =
        localStorage.getItem("guessrUsername");

    localStorage.clear();

    if (keepUsername) {
        localStorage.setItem("guessrUsername", keepUsername);
    }

    alert("Progress reset.");

    window.location.href = "../";
});