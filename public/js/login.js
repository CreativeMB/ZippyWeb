// public/js/login.js
const auth = firebase.auth();
const db = firebase.database();
const btnGoogle = document.getElementById("btnGoogle");
const errorMessage = document.getElementById("error-message");

// Proveedor de Google
const provider = new firebase.auth.GoogleAuthProvider();

// Función de redirección al dashboard
function navigateToDashboard() {
  window.location.href = "dashboard.html";
}

// Login con Google
btnGoogle.addEventListener("click", () => {
  auth.signOut(); // Cerrar sesión previa
  auth.signInWithPopup(provider)
    .then(async (result) => {
      const user = result.user;

      if (!user) return;

      // 🔹 Buscar idEmpresa asociado a este usuario
      const userRef = db.ref(`Usuarios/${user.uid}/idEmpresa`);
      const snapshot = await userRef.get();

      const idEmpresa = snapshot.val();
      if (!idEmpresa) {
        auth.signOut();
        errorMessage.textContent = "Debes registrarte primero en la aplicación móvil.";
        return;
      }

      // 🔹 Validar que exista el perfil de empresa
      const empresaRef = db.ref(`${idEmpresa}/perfilempresa`);
      const empresaSnap = await empresaRef.get();

      if (!empresaSnap.exists()) {
        auth.signOut();
        errorMessage.textContent = "Debes registrarte primero en la aplicación móvil.";
        return;
      }

      // Todo ok, redirigir
      navigateToDashboard();
    })
    .catch((error) => {
      console.error(error);
      errorMessage.textContent = error.message;
    });
});

// Redirigir si ya está logueado y existe idEmpresa
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

  // Todo ok, redirigir
  navigateToDashboard();
});
