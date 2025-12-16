// public/js/login.js

// Función para iniciar sesión con Google
document.addEventListener("DOMContentLoaded", () => {
  const btnGoogle = document.getElementById("btnGoogle");
  const errorMessage = document.getElementById("error-message");

  btnGoogle.addEventListener("click", () => {
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

        // Referencia al perfil de empresa en Realtime Database
        const empresaRef = firebase.database().ref(user.uid + "/perfilempresa");

        empresaRef.get().then((snapshot) => {
          if (snapshot.exists()) {
            const empresaData = snapshot.val();
            console.log("Perfil empresa:", empresaData);

            // Validar fechaExpiracion
            const fechaExpStr = empresaData.fechaExpiracion;
            if (fechaExpStr) {
              const fechaExp = new Date(fechaExpStr.split(" ")[0].split("/").reverse().join("-") + "T" + fechaExpStr.split(" ")[1]);
              const now = new Date();

              if (now <= fechaExp) {
                // Suscripción activa, redirigir al dashboard
                window.location.href = "basededatos.html"; // Ajusta según tu web
              } else {
                alert(`❌ Suscripción vencida el ${fechaExpStr}. Contacta al administrador.`);
              }
            } else {
              alert("❌ No se encontró la fecha de expiración de la empresa.");
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
  });
});
