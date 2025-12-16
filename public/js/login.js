// public/js/login.js
const auth = firebase.auth();
const db = firebase.database();
const btnGoogle = document.getElementById("btnGoogle");
const errorMessage = document.getElementById("error-message");

// Login con Google
btnGoogle.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(async result => {
      const user = result.user;
      const empresaRef = db.ref(`usuarios/${user.uid}/idEmpresa`);

      empresaRef.get().then(snapshot => {
        if (!snapshot.exists()) {
          auth.signOut();
          errorMessage.textContent = "Debes crear primero una empresa desde la aplicación móvil.";
        } else {
          window.location.href = "dashboard.html";
        }
      });
    })
    .catch(error => {
      console.error(error);
      errorMessage.textContent = error.message;
    });
});

// Si ya está logueado
auth.onAuthStateChanged(user => {
  if (user) {
    const empresaRef = db.ref(`usuarios/${user.uid}/idEmpresa`);
    empresaRef.get().then(snapshot => {
      if (snapshot.exists()) {
        window.location.href = "dashboard.html";
      } else {
        auth.signOut();
      }
    });
  }
});
