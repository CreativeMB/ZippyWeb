// public/js/login.js

document.addEventListener("DOMContentLoaded", () => {
  const btnGoogle = document.getElementById("btnGoogle");
  const errorMessage = document.getElementById("error-message");

  // --- Función para parsear fecha de expiración con horas >= 24 ---
  function parseFechaExpiracion(fechaExpStr) {
    if (!fechaExpStr) return null;

    const [fechaPart, horaPart = "00:00:00"] = fechaExpStr.split(" ");
    let [hh, mm, ss] = horaPart.split(":").map(Number);
    let [dd, mmF, yyyy] = fechaPart.split("/").map(Number);

    // Sumar días si hh >= 24
    const extraDias = Math.floor(hh / 24);
    hh = hh % 24;
    dd += extraDias;

    // Crear fecha JS correctamente
    const fecha = new Date(yyyy, mmF - 1, dd, hh, mm, ss);

    if (isNaN(fecha)) return null;
    return fecha;
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

          // Mostrar días restantes o vencidos
          const mensajeDias = mostrarDiasRestantes(fechaExpStr);
          alert(mensajeDias);

          // Validar si la suscripción está activa
          const fechaExp = parseFechaExpiracion(fechaExpStr);
const ahora = new Date();

// Solo comparar fechas, ignorando horas
const fechaExpSoloDia = new Date(fechaExp.getFullYear(), fechaExp.getMonth(), fechaExp.getDate());
const ahoraSoloDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

if (ahoraSoloDia <= fechaExpSoloDia) {
    // Suscripción activa -> puede entrar
    window.location.href = "basededatos.html";
} else {
    // Suscripción vencida -> no entra
    alert("❌ Su suscripción ha vencido, no puede ingresar.");
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
