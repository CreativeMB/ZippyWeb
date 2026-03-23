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

    const fecha = new Date(yyyy, mmF - 1, dd, hh, mm, ss);
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

   // ... dentro de iniciarSesionGoogle() ...

firebase.auth().signInWithPopup(provider)
  .then((result) => {
    const user = result.user;
    if (!user) return errorMessage.textContent = "No se pudo obtener el usuario";

    const empresaRef = firebase.database().ref(user.uid + "/perfilempresa");
    empresaRef.get().then((snapshot) => {
      
      // ESCENARIO 1: No existe la empresa
      if (!snapshot.exists()) {
        return Swal.fire({
          icon: 'warning',
          title: 'Empresa no registrada',
          text: 'Debes crear primero una empresa desde la app móvil.',
          confirmButtonColor: '#f8bb86'
        });
      }

      const empresaData = snapshot.val();
      const fechaExpStr = empresaData.fechaExpiracion;

      // ESCENARIO 2: No hay fecha de expiración
      if (!fechaExpStr) {
        return Swal.fire({
          icon: 'question',
          title: 'Error de cuenta',
          text: 'No se encontró la fecha de expiración. Contacta a soporte.',
          confirmButtonColor: '#3085d6'
        });
      }

      // Calculamos el estado usando tus funciones
      const mensajeDias = mostrarDiasRestantes(fechaExpStr);
      const fechaExp = parseFechaExpiracion(fechaExpStr);
      const ahora = new Date();
      const fechaExpSoloDia = new Date(fechaExp.getFullYear(), fechaExp.getMonth(), fechaExp.getDate());
      const ahoraSoloDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

      if (ahoraSoloDia <= fechaExpSoloDia) {
        // ESCENARIO 3: SUSCRIPCIÓN ACTIVA
        Swal.fire({
          icon: 'success',
          title: 'Suscripción Activa',
          text: mensajeDias,
          timer: 2000, // Se cierra solo en 2 segundos para no molestar
          showConfirmButton: false,
          timerProgressBar: true
        }).then(() => {
          sessionStorage.setItem("suscripcionValida", "true");
          window.location.href = "basededatos.html";
        });

      } else {
        // ESCENARIO 4: SUSCRIPCIÓN VENCIDA
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'Su suscripción ha vencido.',
          footer: `<b>${mensajeDias}</b>`,
          confirmButtonText: 'Cerrar Sesión',
          confirmButtonColor: '#d33',
          allowOutsideClick: false
        }).then(() => {
          sessionStorage.setItem("suscripcionValida", "false");
          firebase.auth().signOut();
        });
      }

    }).catch(err => {
      console.error(err);
      Swal.fire('Error', 'No se pudo leer el perfil: ' + err.message, 'error');
    });

  }).catch(error => {
    console.error(error);
    errorMessage.textContent = "Error al autenticar: " + error.message;
  });
  }

  // --- Botón Google ---
  btnGoogle.addEventListener("click", () => {
    firebase.auth().signOut().finally(() => {
      iniciarSesionGoogle();
    });
  });
});
