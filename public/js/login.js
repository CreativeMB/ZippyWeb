// Inicialización de Firebase ya está hecha por /__/firebase/init.js
const auth = firebase.auth();

// Elementos del DOM
const btnLogin = document.getElementById("btnLogin");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");

// Evento de login
btnLogin.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Login exitoso
      window.location.href = "dashboard.html"; // Página a redirigir después del login
    })
    .catch((error) => {
      errorMessage.textContent = error.message;
    });
});
