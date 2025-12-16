const auth = firebase.auth();
const db = firebase.firestore(); // o firebase.database() según tu app
const btnGoogle = document.getElementById("btnGoogle");
const errorMessage = document.getElementById("error-message");

// Proveedor de Google
const provider = new firebase.auth.GoogleAuthProvider();

// Login con Google
btnGoogle.addEventListener("click", async () => {
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;

    // Revisar si el usuario existe y tiene empresa
    const userRef = db.collection("usuarios").doc(user.uid);
    const doc = await userRef.get();

    if (!doc.exists || !doc.data().idEmpresa) {
      // Usuario no existe o no tiene empresa → obligar registro desde la app móvil
      await auth.signOut();
      errorMessage.textContent = "Debes crear primero una empresa desde la aplicación móvil.";
    } else {
      // Usuario registrado y con empresa → permitir login
      window.location.href = "dashboard.html";
    }

  } catch (error) {
    console.error(error);
    errorMessage.textContent = error.message;
  }
});

// Redirigir si ya está logueado y tiene empresa
auth.onAuthStateChanged(async user => {
  if (user) {
    const userRef = db.collection("usuarios").doc(user.uid);
    const doc = await userRef.get();
    if (doc.exists && doc.data().idEmpresa) {
      window.location.href = "dashboard.html";
    } else {
      await auth.signOut();
    }
  }
});
