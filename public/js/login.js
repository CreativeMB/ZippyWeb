// js/login.js

const auth = firebase.auth();
const btnGoogle = document.getElementById("btnGoogle");
const errorMessage = document.getElementById("error-message");

// Proveedor de Google
const provider = new firebase.auth.GoogleAuthProvider();

// Login con Google
btnGoogle.addEventListener("click", () => {
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;

      // Verificar si el usuario tiene idEmpresa en tu base de datos
      // Aquí solo un ejemplo usando Realtime Database
      const empresaRef = firebase.database().ref(`Empresas/${user.uid}`);
      empresaRef.get().then(snapshot => {
        if (snapshot.exists()) {
          // Usuario tiene empresa → permite login
          window.location.href = "dashboard.html";
        } else {
          // Usuario no tiene empresa → no permite login
          auth.signOut();
          errorMessage.textContent = "Debes crear tu empresa primero desde la app móvil.";
        }
      });

    })
    .catch((error) => {
      console.error(error);
      errorMessage.textContent = error.message;
    });
});

// Redirigir si ya está logueado y tiene empresa
auth.onAuthStateChanged(user => {
  if (user) {
    const empresaRef = firebase.database().ref(`Empresas/${user.uid}`);
    empresaRef.get().then(snapshot => {
      if (snapshot.exists()) {
        window.location.href = "dashboard.html";
      }
    });
  }
});
