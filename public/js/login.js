const auth = firebase.auth();
const btnGoogle = document.getElementById("btnGoogle");
const errorMessage = document.getElementById("error-message");

// Proveedor de Google
const provider = new firebase.auth.GoogleAuthProvider();

// Login con Google
btnGoogle.addEventListener("click", () => {
  auth.signInWithPopup(provider)
    .then(async (result) => {
      const user = result.user;

      // Verificar si el usuario existe en Firebase
      if (user.metadata.creationTime === user.metadata.lastSignInTime) {
        // El usuario es nuevo → no permitir login desde la web
        auth.signOut();
        errorMessage.textContent = "Debes registrarte primero en la aplicación móvil.";
      } else {
        // Usuario existente → permitir login
        window.location.href = "dashboard.html";
      }
    })
    .catch((error) => {
      console.error(error);
      errorMessage.textContent = error.message;
    });
});

// Redirigir si ya está logueado y existe
auth.onAuthStateChanged(user => {
  if (user) {
    if (user.metadata.creationTime !== user.metadata.lastSignInTime) {
      window.location.href = "dashboard.html";
    }
  }
});
