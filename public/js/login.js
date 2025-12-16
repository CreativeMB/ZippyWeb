// login.js
// 🔹 Asegúrate de que init.js ya inicializa Firebase correctamente

const btnGoogle = document.getElementById("btnGoogle");
const errorMessage = document.getElementById("error-message");

btnGoogle.addEventListener("click", async () => {
  try {
    // Cerrar sesión previa para forzar selector de cuentas
    await firebase.auth().signOut();

    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await firebase.auth().signInWithPopup(provider);

    const user = result.user;
    if (!user) throw new Error("No se pudo autenticar el usuario");

    // 🔹 UID de Firebase = idEmpresa
    const idEmpresa = user.uid;
    const empresaRef = firebase.database().ref(`${idEmpresa}/perfilempresa`);

    empresaRef.get().then(snapshot => {
      if (!snapshot.exists()) {
        errorMessage.textContent = "❌ No hay perfil de empresa registrado.";
        firebase.auth().signOut();
        return;
      }

      const empresa = snapshot.val();
      console.log("Empresa cargada:", empresa);

      // Validar suscripción usando fechaExpiracion
      validarSuscripcion(empresa.fechaExpiracion).then(isActiva => {
        if (!isActiva) {
          alert("❌ Tu suscripción ha vencido. Contacta al administrador.");
          // 🔹 Aquí podrías redirigir a una página de suscripción
        } else {
          // 🔹 Todo bien, ir al dashboard
          window.location.href = "dashboard.html";
        }
      });
    }).catch(err => {
      console.error(err);
      errorMessage.textContent = "Error al leer datos de la empresa";
    });

  } catch (err) {
    console.error(err);
    errorMessage.textContent = "Error al iniciar sesión con Google";
  }
});

// Función para validar suscripción con fechaExpiracion
async function validarSuscripcion(fechaExpStr) {
  if (!fechaExpStr) return false;

  try {
    // 🔹 Usar fecha local como aproximación (no hay offset server en web)
    const fechaExp = new Date(fechaExpStr);
    const fechaActual = new Date();

    return fechaActual <= fechaExp;
  } catch (err) {
    console.error(err);
    return false;
  }
}

// 🔹 Detecta si ya hay sesión activa al cargar la página
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    // Usuario ya logueado, redirigir directamente
    window.location.href = "dashboard.html";
  }
});
