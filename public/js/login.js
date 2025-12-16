// public/js/login.js

document.addEventListener("DOMContentLoaded", () => {
  const btnGoogle = document.getElementById("btnGoogle");
  const errorMessage = document.getElementById("error-message");

  // --- Función para parsear fecha de expiración ---
  function parseFechaExpiracion(fechaExpStr) {
    if (!fechaExpStr) return null;

    const parts = fechaExpStr.split(" ");
    const fechaPart = parts[0];
    let horaPart = parts[1] || "00:00:00";

    let [hh, mm, ss] = horaPart.split(":").map(Number);
    let date = fechaPart.split("/").reverse().join("-"); // YYYY-MM-DD

    if (hh >= 24) {
      hh = hh - 24;
      const fechaJS = new Date(date + "T00:00:00");
      fechaJS.setDate(fechaJS.getDate() + 1);
      date = fechaJS.toISOString().split("T")[0];
    }

    const fechaISO = `${date}T${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
    const fecha = new Date(fechaISO);
    return isNaN(fecha) ? null : fecha;
  }

  // --- Función para mostrar días restantes o vencidos ---
  function mostrarDiasRestantes(fechaExpStr) {
    const fecha = parseFechaExpiracion(fechaExpStr);
    if (!fecha) return "❌ Fecha de expiración inválida";

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

  // --- Función para iniciar sesión con Google ---
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
          if (!snapshot.exists()) {
            alert("⚠️ Debes crear primero una empresa desde la app móvil.");
            return;
          }

          const empresaData = snapshot.val();
          console.log("Perfil empresa:", empresaData);

          const fechaExpStr = empresaData.fechaExpiracion;
          if (!fechaExpStr) {
            alert("❌ No se encontró la fecha de expiración de la empresa.");
            return;
          }

          const mensajeDias = mostrarDiasRestantes(fechaExpStr);
          alert(mensajeDias);

          const fechaExp = parseFechaExpiracion(fechaExpStr);
          if (fechaExp && new Date() <= fechaExp) {
            window.location.href = "basededatos.html";
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

  // --- Botón Google ---
  btnGoogle.addEventListener("click", () => {
    // Siempre cerrar sesión primero para forzar login nuevo
    firebase.auth().signOut().finally(() => {
      iniciarSesionGoogle();
    });
  });

});
