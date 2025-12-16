// public/js/login.js

document.addEventListener("DOMContentLoaded", () => {
  const btnGoogle = document.getElementById("btnGoogle");
  const errorMessage = document.getElementById("error-message");

  // Función para mostrar los días restantes
  function mostrarDiasRestantes(fechaExpStr) {
    const fechaParts = fechaExpStr.split(" ");
    const fecha = new Date(fechaParts[0].split("/").reverse().join("-") + "T" + fechaParts[1]);
    const ahora = new Date();

    let mensaje = "";
    if (ahora < fecha) {
      const diff = fecha - ahora;
      const diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24));
      mensaje = `⏳ Suscripción activa. Vence en ${diasRestantes} día(s).`;
    } else if (ahora.toDateString() === fecha.toDateString()) {
      mensaje = "⚠️ Tu suscripción vence hoy";
    } else {
      const diff = ahora - fecha;
      const diasVencidos = Math.ceil(diff / (1000 * 60 * 60 * 24));
      mensaje = `❌ Suscripción vencida hace ${diasVencidos} día(s)`;
    }
    return mensaje;
  }

  // Función para iniciar sesión con Google
  function iniciarSesionGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        if (!user) {
          errorMessage.textContent = "No se pudo obtener el usuario";
          return;
        }

        console.log("UID Google:", user.uid);

        // Referencia al perfil de empresa
        const empresaRef = firebase.database().ref(user.uid + "/perfilempresa");

        empresaRef.get().then((snapshot) => {
          if (snapshot.exists()) {
            const empresaData = snapshot.val();
            console.log("Perfil empresa:", empresaData);

            // Validar fechaExpiracion
            const fechaExpStr = empresaData.fechaExpiracion;
            if (!fechaExpStr) {
              alert("❌ No se encontró la fecha de expiración de la empresa.");
              return;
            }

            const mensajeDias = mostrarDiasRestantes(fechaExpStr);
            alert(mensajeDias);

            const fechaParts = fechaExpStr.split(" ");
            const fechaExp = new Date(fechaParts[0].split("/").reverse().join("-") + "T" + fechaParts[1]);
            const ahora = new Date();

            if (ahora <= fechaExp) {
              // Suscripción activa, redirigir
              window.location.href = "basededatos.html"; // Ajusta según tu web
            }

          } else {
            alert("⚠️ Debes crear primero una empresa desde la app móvil.");
          }
        }).catch((err) => {
          console.error(err);
          errorMessage.textContent = "Error al leer perfil de empresa: " + err.message;
        });

      })
      .catch((error) => {
        console.error(error);
        errorMessage.textContent = "Error al autenticar con Google: " + error.message;
      });
  }

  btnGoogle.addEventListener("click", () => {
    // Siempre cerrar sesión primero para forzar login nuevo
    firebase.auth().signOut().finally(() => {
      iniciarSesionGoogle();
    });
  });

  // ⚠️ Aquí quitamos la parte de onAuthStateChanged para que no verifique sesiones previas
});
