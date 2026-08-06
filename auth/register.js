import {
    supabase
} from "../shared/supabase-client.js";


const registerForm =
    document.getElementById(
        "registerForm"
    );

const usernameInput =
    document.getElementById(
        "username"
    );

const emailInput =
    document.getElementById(
        "email"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const confirmPasswordInput =
    document.getElementById(
        "confirmPassword"
    );

const termsInput =
    document.getElementById(
        "terms"
    );

const registerButton =
    document.getElementById(
        "registerButton"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );


function showMessage(
    message,
    type
) {
    formMessage.textContent =
        message;

    formMessage.className =
        "form-message " + type;

    formMessage.hidden =
        false;
}


function clearMessage() {
    formMessage.hidden =
        true;

    formMessage.textContent =
        "";

    formMessage.className =
        "form-message";
}


function normalizeUsername(value) {
    return value
        .trim()
        .replace(/\s+/g, " ");
}


function usernameIsValid(username) {
    return /^[A-Za-z0-9 _-]{3,24}$/
        .test(username);
}


function setLoading(isLoading) {
    registerButton.disabled =
        isLoading;

    registerButton.textContent =
        isLoading
            ? "Creating Account..."
            : "Create Account";
}


function addPasswordToggle(
    buttonId,
    input
) {
    const button =
        document.getElementById(
            buttonId
        );

    button.addEventListener(
        "click",
        () => {
            const hidden =
                input.type ===
                "password";

            input.type =
                hidden
                    ? "text"
                    : "password";

            button.textContent =
                hidden
                    ? "Hide"
                    : "Show";

            button.setAttribute(
                "aria-label",
                hidden
                    ? "Hide password"
                    : "Show password"
            );
        }
    );
}


addPasswordToggle(
    "togglePassword",
    passwordInput
);

addPasswordToggle(
    "toggleConfirmPassword",
    confirmPasswordInput
);


registerForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        clearMessage();

        const username =
            normalizeUsername(
                usernameInput.value
            );

        const email =
            emailInput.value
                .trim()
                .toLowerCase();

        const password =
            passwordInput.value;

        const confirmedPassword =
            confirmPasswordInput.value;

        if (!usernameIsValid(username)) {
            showMessage(
                "Choose a username containing 3–24 letters, numbers, spaces, underscores, or hyphens.",
                "error"
            );

            usernameInput.focus();
            return;
        }

        if (!emailInput.validity.valid) {
            showMessage(
                "Enter a valid email address.",
                "error"
            );

            emailInput.focus();
            return;
        }

        if (password.length < 8) {
            showMessage(
                "Your password must contain at least 8 characters.",
                "error"
            );

            passwordInput.focus();
            return;
        }

        if (
            password !==
            confirmedPassword
        ) {
            showMessage(
                "The passwords do not match.",
                "error"
            );

            confirmPasswordInput.focus();
            return;
        }

        if (!termsInput.checked) {
            showMessage(
                "You must agree to the Terms and Privacy Policy.",
                "error"
            );

            termsInput.focus();
            return;
        }

        setLoading(true);

        try {
            const redirectURL =
                new URL(
                    "login.html",
                    window.location.href
                ).href;

            const {
                data,
                error
            } =
                await supabase.auth.signUp({
                    email,
                    password,

                    options: {
                        emailRedirectTo:
                            redirectURL,

                        data: {
                            username
                        }
                    }
                });

            if (error) {
                throw error;
            }

            /*
             * When email confirmation is enabled,
             * Supabase usually returns a user but
             * no active session until confirmation.
             */
            if (
                data.user &&
                !data.session
            ) {
                showMessage(
                    "Account created. Check your email and confirm your address before logging in.",
                    "success"
                );

                registerForm.reset();
                return;
            }

            if (data.session) {
                showMessage(
                    "Account created successfully. Redirecting...",
                    "success"
                );

                setTimeout(() => {
                    window.location.href =
                        "../profile/";
                }, 1000);

                return;
            }

            showMessage(
                "Account request received. Check your email for the next step.",
                "success"
            );
        }
        catch (error) {
            console.error(
                "Registration error:",
                error
            );

            showMessage(
                error.message ||
                "We could not create the account. Please try again.",
                "error"
            );
        }
        finally {
            setLoading(false);
        }
    }
);