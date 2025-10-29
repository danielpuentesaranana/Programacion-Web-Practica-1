const APIURL = '/api';
let token = '';
let user = null;
let userRole = '';

async function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const res = await fetch(`${APIURL}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({username, password})
  });
  const data = await res.json();
  if(data.token){
    token = data.token;
    user = data.user.username;
    userRole = data.user.role;
    localStorage.setItem('token', token);
    localStorage.setItem('user', user);
    localStorage.setItem('role', userRole);
    showMain();
  }else{
    document.getElementById('login-error').textContent = data.error || 'Error';
  }
}

async function register() {
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  const role = document.getElementById('register-role').value;
  const res = await fetch(`${APIURL}/auth/register`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({username, password, role})
  });
  const data = await res.json();
  document.getElementById('register-error').textContent = data.msg || data.error || 'Error';
}

function logout() {
  token = '';
  localStorage.clear();
  location.reload();
}

async function cargarProductos() {
  const res = await fetch(`${APIURL}/productos`, {
    headers:{Authorization:"Bearer "+token}
  });
  const productos = await res.json();
  let html = '';
  productos.forEach(p => {
    html += `<tr>
      <td>${p.nombre}</td>
      <td>${p.precio}</td>
      <td>${p.descripcion}</td>
      <td>
        ${userRole==="admin" ?
         `<button onclick="editarProducto('${p._id}','${p.nombre}','${p.precio}','${p.descripcion}')">Editar</button>
          <button onclick="borrarProducto('${p._id}')">Borrar</button>`:""}
      </td>
    </tr>`;
  });
  document.querySelector('#tabla-productos tbody').innerHTML = html;
}

document.getElementById('form-producto').onsubmit = async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const precio = document.getElementById('precio').value;
  const descripcion = document.getElementById('descripcion').value;
  const id = document.getElementById('form-producto').getAttribute('data-edit');
  const url = id ? `${APIURL}/productos/${id}` : `${APIURL}/productos`;
  const method = id ? "PUT" : "POST";
  const res = await fetch(url, {
    method,
    headers:{'Content-Type':'application/json', Authorization:'Bearer '+token},
    body: JSON.stringify({nombre, precio, descripcion})
  });
  document.getElementById('form-producto').reset();
  document.getElementById('form-producto').removeAttribute('data-edit');
  cargarProductos();
};

window.editarProducto = (id,nombre,precio,descripcion) => {
  document.getElementById('nombre').value=nombre;
  document.getElementById('precio').value=precio;
  document.getElementById('descripcion').value=descripcion;
  document.getElementById('form-producto').setAttribute('data-edit',id);
};

window.borrarProducto = async (id) => {
  if(confirm("¿Borrar producto?")){
    await fetch(`${APIURL}/productos/${id}`, {
      method:"DELETE",
      headers:{Authorization:'Bearer '+token}
    });
    cargarProductos();
  }
};

document.getElementById('busqueda').oninput = function(){
  const term = this.value.toLowerCase();
  Array.from(document.querySelectorAll('#tabla-productos tbody tr')).forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(term) ? "" : "none";
  });
};

function showMain(){
  document.getElementById('auth-section').style.display = "none";
  document.getElementById('main-section').style.display = "block";
  if(userRole === "admin")
    document.getElementById("form-producto").style.display = "flex";
  cargarProductos();
  conectarChat();
}

document.getElementById('login-btn').onclick = login;
document.getElementById('register-btn').onclick = register;
document.getElementById('logout-btn').onclick = logout;

// CHAT
let socket;
function conectarChat(){
  socket = io();
  socket.on("chat message", function(msg){
    const li = document.createElement("li");
    li.textContent = msg;
    document.getElementById("mensajes").appendChild(li);
  });
  document.getElementById('formulario-chat').onsubmit = function(e){
    e.preventDefault();
    if(document.getElementById("input-mensaje").value){
      socket.emit("chat message", user + ": " + document.getElementById("input-mensaje").value);
      document.getElementById("input-mensaje").value = "";
    }
  }
}

// Mostrar pantalla principal si el usuario ya está logueado
window.onload = () => {
  token = localStorage.getItem("token");
  user = localStorage.getItem("user");
  userRole = localStorage.getItem("role");
  if(token) showMain();
};
