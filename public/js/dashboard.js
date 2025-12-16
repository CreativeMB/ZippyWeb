const auth = firebase.auth();
const btnLogout = document.getElementById("btnLogout");

// Verificar si el usuario está logueado
auth.onAuthStateChanged(user => {
  if (!user) {
    // Si no está logueado, redirigir al login
    window.location.href = "index.html";
  } else {
    // Usuario logueado
    console.log("Usuario logueado:", user.email);
  }
});

// Función de logout
btnLogout.addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(err => console.error("Error al cerrar sesión:", err));
});
