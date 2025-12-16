const auth = firebase.auth();
const db = firebase.database();
const btnGoogle = document.getElementById("btnGoogle");
const errorMessage = document.getElementById("error-message");

// Proveedor de Google
const provider = new firebase.auth.GoogleAuthProvider();

// Click en login
btnGoogle.addEventListener("click", () => {
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;

      // Verificar si el usuario tiene empresa creada en Realtime Database
      const empresaRef = db.ref(user.uid + "/empresa");

      empresaRef.get().then(snapshot => {
        if (!snapshot.exists()) {
          // No hay empresa → cerrar sesión
          auth.signOut();
          errorMessage.textContent = "Debes registrarte primero en la app móvil.";
        } else {
          // Usuario válido → redirigir a dashboard
          window.location.href = "dashboard.html";
        }
      }).catch(err => {
        console.error(err);
        errorMessage.textContent = "Error al verificar la empresa.";
      });

    })
    .catch(error => {
      console.error(error);
      errorMessage.textContent = error.message;
    });
});

// Mantener sesión iniciada
auth.onAuthStateChanged(user => {
  if (user) {
    const empresaRef = db.ref(user.uid + "/empresa");
    empresaRef.get().then(snapshot => {
      if (snapshot.exists()) {
        window.location.href = "dashboard.html";
      }
    });
  }
});
