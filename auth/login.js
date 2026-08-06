import {
    supabase
} from "../shared/supabase-client.js";


const loginForm =
    document.getElementById(
        "loginForm"
    );

const emailInput =
    document.getElementById(
        "email"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const rememberMeInput =
    document.getElementById(
        "rememberMe"
    );

const togglePasswordButton =
    document.getElementById(
        "togglePassword"
    );

const loginButton =
    document.getElementById(
        "loginButton"
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


function setLoading(isLoading) {
    loginButton.disabled =
        isLoading;

    loginButton.textContent =
        isLoading
            ? "Logging In..."
            : "Log In";
}


togglePasswordButton.addEventListener(
    "click",
    () => {
        const hidden =
            passwordInput.type ===
            "password";

        passwordInput.type =
            hidden
                ? "text"
                : "password";

        togglePasswordButton.textContent =
            hidden
                ? "Hide"
                : "Show";

        togglePasswordButton.setAttribute(
            "aria-label",
            hidden
                ? "Hide password"
                : "Show password"
        );
    }
);


function getRedirectTarget() {
    const parameters =
        new URLSearchParams(
            window.location.search
        );

    const requestedTarget =
        parameters.get("next");

    /*
     * Only allow local relative paths.
     * This prevents redirecting users
     * to an unrelated external website.
     */
    if (
        requestedTarget &&
        requestedTarget.startsWith("/") &&
        !requestedTarget.startsWith("//")
    ) {
        return requestedTarget;
    }

    return "../";
}


async function redirectExistingUser() {
    const {
        data,
        error
    } =
        await supabase.auth.getSession();

    if (error) {
        console.error(
            "Session check error:",
            error
        );

        return;
    }

    if (data.session) {
        window.location.replace(
            getRedirectTarget()
        );
    }
}


loginForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        clearMessage();

        const email =
            emailInput.value
                .trim()
                .toLowerCase();

        const password =
            passwordInput.value;

        if (!emailInput.validity.valid) {
            showMessage(
                "Enter a valid email address.",
                "error"
            );

            emailInput.focus();
            return;
        }

        if (!password) {
            showMessage(
                "Enter your password.",
                "error"
            );

            passwordInput.focus();
            return;
        }

        setLoading(true);

        try {
            const {
                data,
                error
            } =
                await supabase.auth
                    .signInWithPassword({
                        email,
                        password
                    });

            if (error) {
                throw error;
            }

            if (!data.session) {
                throw new Error(
                    "No login session was created."
                );
            }

            /*
             * The shared Supabase client currently
             * persists sessions by default.
             *
             * We will connect the remember-me choice
             * properly when we build auth-state.js.
             */
            localStorage.setItem(
                "guessrRememberLogin",
                rememberMeInput.checked
                    ? "true"
                    : "false"
            );

            showMessage(
                "Login successful. Redirecting...",
                "success"
            );

            setTimeout(() => {
                window.location.replace(
                    getRedirectTarget()
                );
            }, 600);
        }
        catch (error) {
            console.error(
                "Login error:",
                error
            );

            const message =
                String(
                    error?.message || ""
                ).toLowerCase();

            if (
                message.includes(
                    "email not confirmed"
                )
            ) {
                showMessage(
                    "Confirm your email address before logging in.",
                    "error"
                );
            }
            else {
                /*
                 * Keep this message generic so the
                 * page does not reveal whether a
                 * particular account exists.
                 */
                showMessage(
                    "The email or password is incorrect, or the account is not ready yet.",
                    "error"
                );
            }
        }
        finally {
            setLoading(false);
        }
    }
);


// redirectExistingUser();