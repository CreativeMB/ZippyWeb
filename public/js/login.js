const auth = firebase.auth();
const db = firebase.database();
const btnGoogle = document.getElementById("btnGoogle");
const errorMessage = document.getElementById("error-message");

// Proveedor de Google
const provider = new firebase.auth.GoogleAuthProvider();

// Click en login
btnGoogle.addEventListener("click", () => {
  // 🔹 Cerrar sesión para permitir selección de cuenta
  auth.signOut().then(() => {
    firebase.auth().signInWithPopup(provider)
      .then(result => {
        const user = result.user;

        // Validar si existe "perfilempresa" en Realtime Database
        const empresaRef = db.ref(`${user.uid}/perfilempresa`);
        empresaRef.get().then(snapshot => {
          if (!snapshot.exists()) {
            auth.signOut();
            errorMessage.textContent = "Debes registrarte primero en la aplicación móvil.";
            return;
          }

          // Validar fecha de expiración
          const fechaExpStr = snapshot.child("fechaExpiracion").val();
          if (!fechaExpStr) {
            navigateToProfileCreation();
            return;
          }

          // Obtener hora real del servidor
          obtenerFechaServidor(fechaServidor => {
            if (!fechaServidor) {
              errorMessage.textContent = "Error al obtener fecha del servidor";
              navigateToProfileCreation();
              return;
            }

            const fechaExp = new Date(fechaExpStr);
            const diffMillis = fechaExp.getTime() - fechaServidor.getTime();
            const diasRestantes = Math.floor(diffMillis / (1000 * 60 * 60 * 24));

            if (diffMillis > 0 && diasRestantes > 0) {
              navigateToDashboard(); // Suscripción activa
            } else {
              errorMessage.textContent = "❌ Suscripción vencida o expirada";
              navigateToProfileCreation();
            }
          });

        }).catch(err => {
          console.error(err);
          errorMessage.textContent = "Error al verificar la empresa";
        });

      })
      .catch(error => {
        console.error(error);
        errorMessage.textContent = error.message;
      });
  });
});

// Mantener sesión activa si ya está logueado
auth.onAuthStateChanged(user => {
  if (!user) return;

  // 🔹 Obtener el idEmpresa asociado a este usuario
  const userRef = db.ref(`Usuarios/${user.uid}/idEmpresa`);
  userRef.get().then(snapshot => {
    const idEmpresa = snapshot.val();
    if (!idEmpresa) {
      auth.signOut();
      errorMessage.textContent = "Debes registrarte primero en la aplicación móvil.";
      return;
    }

    // Ahora usamos idEmpresa para acceder a los datos de la empresa
    const empresaRef = db.ref(`${idEmpresa}/perfilempresa`);
    empresaRef.get().then(empSnap => {
      if (!empSnap.exists()) {
        auth.signOut();
        errorMessage.textContent = "Debes registrarte primero en la aplicación móvil.";
        return;
      }

      navigateToDashboard(); // todo ok
    });
  });
});

// Funciones de navegación
function navigateToProfileCreation() {
  window.location.href = "perfil.html"; // Crear perfil en la web
}

function navigateToDashboard() {
  window.location.href = "dashboard.html"; // Ir al dashboard
}

// Obtener hora real del servidor
function obtenerFechaServidor(callback) {
  const offsetRef = db.ref(".info/serverTimeOffset");
  offsetRef.once("value").then(snapshot => {
    const offset = snapshot.val() || 0;
    const fechaServidor = new Date(Date.now() + offset);
    callback(fechaServidor);
  }).catch(() => callback(null));
}
