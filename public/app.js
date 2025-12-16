import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, onValue } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "zippy-727d5.firebaseapp.com",
  databaseURL: "https://zippy-727d5-default-rtdb.firebaseio.com",
  projectId: "zippy-727d5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// LOGIN
window.login = function () {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => location.href = "dashboard.html")
    .catch(e => alert(e.message));
};

// LOGOUT
window.logout = function () {
  signOut(auth).then(() => location.href = "login.html");
};

// CARGAR DATOS
onAuthStateChanged(auth, user => {
  if (!user) return;

  const empresaId = user.uid;

  const pedidosRef = ref(db, `${empresaId}/Pedidos`);
  onValue(pedidosRef, snap => {
    const cont = document.getElementById("pedidos");
    if (!cont) return;

    cont.innerHTML = "";
    snap.forEach(p => {
      cont.innerHTML += `<p>${p.val().nombre} - $${p.val().total}</p>`;
    });
  });
});
