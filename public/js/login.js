// Firebase Auth
const auth = firebase.auth();

// Elementos del DOM
const btnGoogle = document.getElementById("btnGoogle");
const errorMessage = document.getElementById("error-message");

// Proveedor de Google
const provider = new firebase.auth.GoogleAuthProvider();

// Login con popup
btnGoogle.addEventListener("click", () => {
  auth.signInWithPopup(provider)
    .then((result) => {
      console.log("Usuario logueado:", result.user.email);
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error(error);
      errorMessage.textContent = error.message;
    });
});

// Redirigir si ya está logueado
auth.onAuthStateChanged(user => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});
