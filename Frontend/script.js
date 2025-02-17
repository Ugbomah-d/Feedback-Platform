// Toggle between login and signup forms
document
  .getElementById("signupLink")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "block";
  });

document
  .getElementById("loginLink")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
  });

// Handle login form submission
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("Please fill in both fields.");
      return;
    }

    try {
      // Fetch CSRF token first
      const csrfResponse = await fetch("http://localhost:5000/csrf-token", {
        method: "GET",
      });

      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrf_token;

      // Now send the login request
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken, // Send CSRF token in header
        },

        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      console.log("Login successful:", data);
      window.location.href = "./main.html";
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  });

// Handle signup form submission
document
  .getElementById("signupForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const confirmPassword = document
      .getElementById("confirmPassword")
      .value.trim();

    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      // Fetch CSRF token first
      const csrfResponse = await fetch("http://localhost:5000/csrf-token", {
        method: "GET",
      });

      const csrfData = await csrfResponse.json();
      console.log("Recived Token", csrfData);
      const csrfToken = csrfData.csrf_token;

      const payload = {
        username: username,
        email: document.getElementById("signupEmail").value.trim(),
        password: password,
      };
      console.log("Sending payload:", payload);

      // Send the signup request
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //"X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      }); 

      const data = await response.json();
      console.log(payload);
      if (!response.ok) {
        const data = await response.json();
        console.log("Server response:", data);
      }

      console.log("Signup successful:", data);
      alert("Signup successful! Please login.");
      document.getElementById("signupForm").style.display = "none";
      document.getElementById("loginForm").style.display = "block";
    } catch (error) {
      // console.error("error", error);
      alert(error.message);
    }
  });
