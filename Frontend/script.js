const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const signupLink = document.getElementById("signupLink");
const loginLink = document.getElementById("loginLink");
const authTabs = document.querySelectorAll("[data-auth-tab]");

function setAuthMode(mode) {
  const showSignup = mode === "signup";
  loginForm.classList.toggle("active", !showSignup);
  signupForm.classList.toggle("active", showSignup);

  authTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.authTab === mode);
  });
}

signupLink.addEventListener("click", function (event) {
  event.preventDefault();
  setAuthMode("signup");
});

loginLink.addEventListener("click", function (event) {
  event.preventDefault();
  setAuthMode("login");
});

authTabs.forEach((tab) => {
  tab.addEventListener("click", function () {
    setAuthMode(tab.dataset.authTab);
  });
});

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const submitButton = loginForm.querySelector("button[type='submit']");

  if (!username || !password) {
    alert("Please fill in both fields.");
    return;
  }

  submitButton.disabled = true;

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    window.location.href = "./main.html";
  } catch (error) {
    alert(error.message);
  } finally {
    submitButton.disabled = false;
  }
});

signupForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const submitButton = signupForm.querySelector("button[type='submit']");

  if (!username || !email || !password || !confirmPassword) {
    alert("Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  submitButton.disabled = true;

  try {
    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Signup failed");
    }

    alert("Signup successful! Please login.");
    signupForm.reset();
    setAuthMode("login");
  } catch (error) {
    alert(error.message);
  } finally {
    submitButton.disabled = false;
  }
});
