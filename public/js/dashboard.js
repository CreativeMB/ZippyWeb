// public/js/dashboard.js
const auth = firebase.auth();
const db = firebase.database();

const pedidosContainer = document.getElementById("pedidos");
const logoutBtn = document.getElementById("logoutBtn");

// Cerrar sesión
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      window.location.href = "login.html";
    });
  });
}

// Función para cargar los pedidos de la empresa
async function cargarPedidos(idEmpresa) {
  const pedidosRef = db.ref(`${idEmpresa}/Pedidos`);
  pedidosRef.on("value", (snapshot) => {
    pedidosContainer.innerHTML = ""; // Limpiar contenedor

    if (!snapshot.exists()) {
      pedidosContainer.innerHTML = "<p>No hay pedidos disponibles.</p>";
      return;
    }

    snapshot.forEach((pedidoSnap) => {
      const pedido = pedidoSnap.val();
      pedidosContainer.innerHTML += `<p>${pedido.nombre || "Sin nombre"} - $${pedido.total || 0}</p>`;
    });
  });
}

// Redirigir si no hay sesión o idEmpresa
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const userRef = db.ref(`Usuarios/${user.uid}/idEmpresa`);
    const snapshot = await userRef.get();
    const idEmpresa = snapshot.val();

    if (!idEmpresa) {
      auth.signOut();
      alert("Debes registrarte primero en la aplicación móvil.");
      window.location.href = "login.html";
      return;
    }

    // Verificar perfilempresa
    const empresaRef = db.ref(`${idEmpresa}/perfilempresa`);
    const empresaSnap = await empresaRef.get();

    if (!empresaSnap.exists()) {
      auth.signOut();
      alert("Debes registrarte primero en la aplicación móvil.");
      window.location.href = "login.html";
      return;
    }

    // ✅ Cargar pedidos de la empresa
    cargarPedidos(idEmpresa);

  } catch (err) {
    console.error(err);
    alert("Error al cargar la información de la empresa.");
  }
});
