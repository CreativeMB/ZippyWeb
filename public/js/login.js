// public/js/login.js
const auth = firebase.auth();
const db = firebase.database();
const btnGoogle = document.getElementById("btnGoogle");
const errorMessage = document.getElementById("error-message");

// Redirigir al dashboard
function navigateToDashboard() {
  window.location.href = "dashboard.html";
}

// Login con Google
btnGoogle.addEventListener("click", () => {
  auth.signOut(); // Cerrar sesión previa
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then(async (result) => {
      const user = result.user;
      if (!user) return;

      // 🔹 Obtener idEmpresa desde Usuarios/<uid>/idEmpresa
      const userRef = db.ref(`Usuarios/${user.uid}/idEmpresa`);
      const snapshot = await userRef.get();
      const idEmpresa = snapshot.val();

      if (!idEmpresa) {
        auth.signOut();
        errorMessage.textContent = "Debes registrarte primero en la aplicación móvil.";
        return;
      }

      // 🔹 Verificar que exista perfilempresa
      const empresaRef = db.ref(`${idEmpresa}/perfilempresa`);
      const empresaSnap = await empresaRef.get();

      if (!empresaSnap.exists()) {
        auth.signOut();
        errorMessage.textContent = "Debes registrarte primero en la aplicación móvil.";
        return;
      }

      // ✅ Todo ok, redirigir
      navigateToDashboard();
    })
    .catch((error) => {
      console.error(error);
      errorMessage.textContent = error.message;
    });
});

// Redirigir si ya está logueado y idEmpresa existe
auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  const userRef = db.ref(`Usuarios/${user.uid}/idEmpresa`);
  const snapshot = await userRef.get();
  const idEmpresa = snapshot.val();

  if (!idEmpresa) {
    auth.signOut();
    errorMessage.textContent = "Debes registrarte primero en la aplicación móvil.";
    return;
  }

  const empresaRef = db.ref(`${idEmpresa}/perfilempresa`);
  const empresaSnap = await empresaRef.get();

  if (!empresaSnap.exists()) {
    auth.signOut();
    errorMessage.textContent = "Debes registrarte primero en la aplicación móvil.";
    return;
  }

  navigateToDashboard();
});
