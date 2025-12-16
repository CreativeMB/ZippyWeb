const auth = firebase.auth();
const btnLogout = document.getElementById("btnLogout");

// Redirigir si no está logueado
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    console.log("Usuario logueado:", user.email);
  }
});

// Cerrar sesión
btnLogout.addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(err => console.error("Error al cerrar sesión:", err));
});
