// public/js/login.js
const auth = firebase.auth();
const db = firebase.database();
const btnGoogle = document.getElementById("btnGoogle");
const errorMessage = document.getElementById("error-message");

document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const btnGoogle = document.getElementById("btnGoogle");
  const errorMessage = document.getElementById("error-message");

  const provider = new firebase.auth.GoogleAuthProvider();

  btnGoogle.addEventListener("click", () => {
    auth.signInWithPopup(provider)
      .then(result => {
        const user = result.user;

        // Verificar idEmpresa en Realtime Database
        firebase.database().ref(`usuarios/${user.uid}/idEmpresa`).get()
          .then(snapshot => {
            if (!snapshot.exists()) {
              auth.signOut();
              errorMessage.textContent = "Debes crear primero una empresa en la app móvil.";
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

  // Redirigir automáticamente si ya está logueado y tiene idEmpresa
  auth.onAuthStateChanged(user => {
    if (user) {
      firebase.database().ref(`usuarios/${user.uid}/idEmpresa`).get()
        .then(snapshot => {
          if (snapshot.exists()) window.location.href = "dashboard.html";
          else auth.signOut();
        });
    }
  });
});

