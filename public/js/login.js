document.addEventListener("DOMContentLoaded", () => {
  const btnGoogle = document.getElementById("btnGoogle");
  const errorMessage = document.getElementById("error-message");

  // Función para mostrar los días restantes
  function mostrarDiasRestantes(fechaExpStr) {
    if (!fechaExpStr) return "❌ Fecha de expiración no disponible";

    // Separar fecha y hora
    const parts = fechaExpStr.split(" ");
    const fechaPart = parts[0];
    const horaPart = parts[1] || "00:00:00"; // Si no hay hora, usar medianoche

    // Convertir DD/MM/YYYY a YYYY-MM-DD
    const fechaISO = fechaPart.split("/").reverse().join("-") + "T" + horaPart;
    const fecha = new Date(fechaISO);
    if (isNaN(fecha)) return "❌ Fecha de expiración inválida";

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

        const empresaRef = firebase.database().ref(user.uid + "/perfilempresa");

        empresaRef.get().then((snapshot) => {
          if (snapshot.exists()) {
            const empresaData = snapshot.val();
            console.log("Perfil empresa:", empresaData);

            const fechaExpStr = empresaData.fechaExpiracion;
            if (!fechaExpStr) {
              alert("❌ No se encontró la fecha de expiración de la empresa.");
              return;
            }

            const mensajeDias = mostrarDiasRestantes(fechaExpStr);
            alert(mensajeDias);

            // Redirigir solo si la suscripción no está vencida
            const parts = fechaExpStr.split(" ");
            const fechaISO = parts[0].split("/").reverse().join("-") + "T" + (parts[1] || "00:00:00");
            const fechaExp = new Date(fechaISO);
            if (!isNaN(fechaExp) && new Date() <= fechaExp) {
              window.location.href = "basededatos.html";
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
    firebase.auth().signOut().finally(() => {
      iniciarSesionGoogle();
    });
  });
});
