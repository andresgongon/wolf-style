/* ============================================================
   WOLF STYLE - Capa de conexion con la API (Fase 3)
   Habla con la API del equipo (Node/Express/Mongoose + MongoDB).
   Jairo la corre en local con server.bat -> http://localhost:3000

   Si no hay servidor (el sitio se abre descargado / offline o la
   API esta apagada) se usa un MODO DEMOSTRACION con datos de
   ejemplo guardados en el navegador, para poder recorrer todo el
   portafolio igual. Con la API encendida se usan los datos reales.
   ============================================================ */

const WolfAPI = (() => {

  const BASE_URL = "http://localhost:3000";

  // Sesion. La API no usa token (se descarto para esta entrega),
  // asi que guardamos el usuario que devuelve el login.
  const USER_KEY = "wolf_user";
  const getUser   = () => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } };
  const setUser   = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));
  const clearUser = () => localStorage.removeItem(USER_KEY);
  const userId    = () => { const u = getUser(); return u && (u.Id_Usuario || u._id); };

  async function req(path, { method = "GET", body = null } = {}) {
    let res;
    try {
      res = await fetch(BASE_URL + path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null,
      });
    } catch (e) {
      throw new Error("NO_API"); // servidor apagado / sitio offline
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.mensaje || data.error || ("Error " + res.status));
    return data;
  }

  /* -------- Modo demostracion (datos locales) --------
     Se usa solo cuando la API no responde. Los datos de ejemplo
     son los mismos que muestra el prototipo, para que el sitio se
     vea igual al mostrarlo sin servidor. */
  const Demo = (() => {
    const UK = "wolf_demo_usuarios", RK = "wolf_demo_recursos";
    const copia = (x) => JSON.parse(JSON.stringify(x));
    const leer  = (k, def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch { return def; } };
    const guardar = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    const sinPass = (u) => { if (!u) return u; const { Contrasena, ...r } = u; return r; };
    const nuevoId = (p) => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const UID = "demo-1";

    function sembrar() {
      if (localStorage.getItem(UK)) return;
      guardar(UK, [{
        _id: UID, Id_Usuario: UID,
        Nombre_Completo: "Germán González", Apodo: "Germán",
        Correo_Electronico: "demo@wolfstyle.co", Contrasena: "demo1234",
        "País": "Colombia", Departamento: "Cundinamarca", Ciudad: "Bogotá",
        Ano_Nacimiento: 1999, Labor: "Desarrollo Web e Integración",
        Descripcion: "Portafolio interactivo de proyectos de creación digital.",
        Imagen_Perfil: "img/avatar.jpg"
      }]);
      guardar(RK, [
        { _id: "r1", Id_Recurso: "r1", Id_Usuario: UID, Tipo: "Incrustación de Sketchfab", Ano: 2026, Estrellas: 5,
          Nombre: "Activo de RV de Neo-Shibuya", Enlace: "https://sketchfab.com",
          Descripcion: "Activo 3D para realidad virtual, modelado y texturizado, presentado con una incrustación de Sketchfab.",
          Imagen_de_Portada: "img/proj-1.jpg" },
        { _id: "r2", Id_Recurso: "r2", Id_Usuario: UID, Tipo: "itch.io Playable", Ano: 2026, Estrellas: 4,
          Nombre: "Fluido líquido espacio-temporal", Enlace: "https://itch.io",
          Descripcion: "Experiencia jugable publicada en itch.io, desarrollada en Unity.",
          Imagen_de_Portada: "img/proj-2.jpg" },
        { _id: "r3", Id_Recurso: "r3", Id_Usuario: UID, Tipo: "Galería de ArtStation", Ano: 2025, Estrellas: 5,
          Nombre: "Hábitat prefabricado Monolith", Enlace: "https://www.artstation.com",
          Descripcion: "Galería de ilustraciones y renders del concepto Monolith, publicada en ArtStation.",
          Imagen_de_Portada: "img/proj-3.jpg" }
      ]);
    }
    const usuarios = () => leer(UK, []);
    const recursos = () => leer(RK, []);
    const esMismo = (a, b) => String(a) === String(b);

    return {
      sembrar,
      usuarioDemo: () => { sembrar(); return sinPass(usuarios()[0]); },
      login: ({ Correo_Electronico, Contrasena }) => {
        sembrar();
        const u = usuarios().find(x => (x.Correo_Electronico || "").toLowerCase() === (Correo_Electronico || "").toLowerCase());
        if (!u || (u.Contrasena && Contrasena && u.Contrasena !== Contrasena)) throw new Error("Correo o contraseña incorrectos (modo demostración).");
        return sinPass(u);
      },
      registrar: (p) => {
        sembrar();
        const lista = usuarios();
        if (lista.some(x => (x.Correo_Electronico || "").toLowerCase() === (p.Correo_Electronico || "").toLowerCase()))
          throw new Error("Ese correo ya está registrado (modo demostración).");
        const nuevo = { _id: nuevoId("u"), ...p }; nuevo.Id_Usuario = nuevo._id;
        lista.push(nuevo); guardar(UK, lista); return sinPass(nuevo);
      },
      getUsuario: (id) => { sembrar(); const u = usuarios().find(x => esMismo(x._id, id) || esMismo(x.Id_Usuario, id)); if (!u) throw new Error("Usuario no encontrado."); return sinPass(u); },
      actualizarUsuario: (id, p) => { sembrar(); const l = usuarios(); const i = l.findIndex(x => esMismo(x._id, id) || esMismo(x.Id_Usuario, id)); if (i < 0) throw new Error("Usuario no encontrado."); l[i] = { ...l[i], ...p }; guardar(UK, l); return sinPass(l[i]); },
      listarRecursosDe: (id) => { sembrar(); return { recursos: copia(recursos().filter(r => esMismo(r.Id_Usuario, id))) }; },
      getRecurso: (id) => { sembrar(); const r = recursos().find(x => esMismo(x._id, id) || esMismo(x.Id_Recurso, id)); if (!r) throw new Error("Proyecto no encontrado."); return copia(r); },
      crearRecurso: (p) => { sembrar(); const l = recursos(); const nuevo = { _id: nuevoId("r"), ...p }; nuevo.Id_Recurso = nuevo._id; l.push(nuevo); guardar(RK, l); return copia(nuevo); },
      actualizarRecurso: (id, p) => { sembrar(); const l = recursos(); const i = l.findIndex(x => esMismo(x._id, id) || esMismo(x.Id_Recurso, id)); if (i < 0) throw new Error("Proyecto no encontrado."); l[i] = { ...l[i], ...p }; guardar(RK, l); return copia(l[i]); },
      eliminarRecurso: (id) => { sembrar(); const l = recursos().filter(x => !esMismo(x._id, id) && !esMismo(x.Id_Recurso, id)); guardar(RK, l); return { mensaje: "Eliminado" }; }
    };
  })();

  // Muestra un aviso fijo de que se estan usando datos de ejemplo.
  let avisado = false;
  function avisarDemo() {
    if (avisado || typeof document === "undefined") return; avisado = true;
    if (document.getElementById("wolf-demo-bar")) return;
    const bar = document.createElement("div");
    bar.id = "wolf-demo-bar";
    bar.textContent = "Modo demostración · datos de ejemplo (sin servidor conectado)";
    bar.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#E88B3C;color:#241400;font-family:'Instrument Sans',system-ui,sans-serif;font-weight:600;font-size:13px;text-align:center;padding:9px 14px";
    document.body.appendChild(bar);
  }

  // Intenta la llamada real; si no hay API, cae al modo demo.
  async function conDemo(real, demo) {
    try { return await real(); }
    catch (e) { if (e.message === "NO_API") { avisarDemo(); return demo(); } throw e; }
  }

  return {
    BASE_URL, getUser, setUser, clearUser, userId,
    estaLogueado: () => !!userId(),

    // ¿la API responde? (para ofrecer el modo demo en el login)
    probarApi: async () => { try { await fetch(BASE_URL + "/", { method: "GET" }); return true; } catch { return false; } },
    entrarDemo: () => { avisarDemo(); const u = Demo.usuarioDemo(); setUser(u); return u; },

    registrar: (payload) => conDemo(() => req("/usuarios", { method: "POST", body: payload }), () => Demo.registrar(payload)),

    login: async ({ Correo_Electronico, Contrasena }) => {
      const u = await conDemo(
        async () => { const d = await req("/usuarios/login", { method: "POST", body: { Correo_Electronico, Contrasena } }); return d.usuario || d; },
        () => Demo.login({ Correo_Electronico, Contrasena })
      );
      setUser(u); return u;
    },
    logout: () => clearUser(),
    getUsuario: (id) => conDemo(() => req("/usuarios/" + id), () => Demo.getUsuario(id)),
    actualizarUsuario: (id, p) => conDemo(() => req("/usuarios/" + id, { method: "PUT", body: p }), () => Demo.actualizarUsuario(id, p)),

    listarRecursosDe: (id) => conDemo(() => req("/recursos/usuario/" + id), () => Demo.listarRecursosDe(id)),
    getRecurso: (id) => conDemo(() => req("/recursos/" + id), () => Demo.getRecurso(id)),
    crearRecurso: (p) => conDemo(() => req("/recursos", { method: "POST", body: p }), () => Demo.crearRecurso(p)),
    actualizarRecurso: (id, p) => conDemo(() => req("/recursos/" + id, { method: "PUT", body: p }), () => Demo.actualizarRecurso(id, p)),
    eliminarRecurso: (id) => conDemo(() => req("/recursos/" + id, { method: "DELETE" }), () => Demo.eliminarRecurso(id)),
  };
})();

// Protege las paginas privadas: si no hay sesion, manda al login.
function wolfRequireAuth() {
  if (!WolfAPI.estaLogueado()) { location.href = "login.html"; return false; }
  return true;
}
