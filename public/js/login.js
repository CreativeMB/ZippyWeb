document.addEventListener("DOMContentLoaded", () => {
  const btnGoogle = document.getElementById("btnGoogle");
  const errorMessage = document.getElementById("error-message");

  function parseFechaExpiracion(fechaExpStr) {
    if (!fechaExpStr) return null;
    const [fechaPart, horaPart = "00:00:00"] = fechaExpStr.split(" ");
    let [hh, mm, ss] = horaPart.split(":").map(Number);
    let [dd, mmF, yyyy] = fechaPart.split("/").map(Number);

    const extraDias = Math.floor(hh / 24);
    hh = hh % 24;
    dd += extraDias;

    const fecha = new Date(yyyy, mmF - 1, dd, hh, mm, ss);
    return isNaN(fecha) ? null : fecha;
  }

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

  function iniciarSesionGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        if (!user) return errorMessage.textContent = "No se pudo obtener el usuario";

        const empresaRef = firebase.database().ref(user.uid + "/perfilempresa");
        empresaRef.get().then((snapshot) => {
          if (!snapshot.exists()) return alert("⚠️ Debes crear primero una empresa desde la app móvil.");

          const empresaData = snapshot.val();
          const fechaExpStr = empresaData.fechaExpiracion;
          if (!fechaExpStr) return alert("❌ No se encontró la fecha de expiración de la empresa.");

          const mensajeDias = mostrarDiasRestantes(fechaExpStr);
          alert(mensajeDias);

          const fechaExp = parseFechaExpiracion(fechaExpStr);
          const ahora = new Date();
          const fechaExpSoloDia = new Date(fechaExp.getFullYear(), fechaExp.getMonth(), fechaExp.getDate());
          const ahoraSoloDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

          if (ahoraSoloDia <= fechaExpSoloDia) {
            // Suscripción activa -> marcar sesión válida
            sessionStorage.setItem("suscripcionValida", "true");
            window.location.href = "basededatos.html";
          } else {
            alert("❌ Su suscripción ha vencido, no puede ingresar.");
            sessionStorage.setItem("suscripcionValida", "false");
            firebase.auth().signOut(); // cerrar sesión para prevenir acceso
          }

        }).catch(err => {
          console.error(err);
          errorMessage.textContent = "Error al leer perfil de empresa: " + err.message;
        });

      }).catch(error => {
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
