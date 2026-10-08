// menu hamburguesa
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
if (burger && nav) {
  burger.addEventListener('click', function () {
    nav.classList.toggle('abierto');
  });
}

// cambiar la pestaña activa en el perfil de ejemplo
const tabs = document.getElementById('tabs');
if (tabs) {
  const botones = tabs.querySelectorAll('.tab');
  botones.forEach(function (btn) {
    btn.addEventListener('click', function () {
      botones.forEach(function (b) { b.classList.remove('activo'); });
      btn.classList.add('activo');
    });
  });
}
