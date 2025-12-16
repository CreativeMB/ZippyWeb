// Inicializar Firebase ya está hecho por /__/firebase/init.js
const auth = firebase.auth();

// Elementos del DOM
const btnGoogle = document.getElementById("btnGoogle");
const errorMessage = document.getElementById("error-message");

// Proveedor de Google
const provider = new firebase.auth.GoogleAuthProvider();

// Evento de login con Google
btnGoogle.addEventListener("click", () => {
  auth.signInWithPopup(provider)
    .then((result) => {
      // Usuario logueado
      console.log("Usuario logueado:", result.user.email);
      // Redirigir al dashboard
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error(error);
      errorMessage.textContent = error.message;
    });
});

// Verificar si ya está logueado
auth.onAuthStateChanged(user => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});
