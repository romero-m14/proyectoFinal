// 1. Variables de mis IDs
const contenedorHoteles = document.querySelector("#hoteles");
const elementoContador = document.querySelector("#contador");
const menuBusqueda = document.querySelector("#menuBusqueda");
const buscarCiudad = document.querySelector("#buscarCiudad");
const fondoOscuro = document.querySelector("#fondoOscuro");

let dataHoteles = [];
let huespedes = { adultos: 0, ninos: 0 };

// 2. Llamado del json
async function iniciarApp() {
  try {
    const res = await fetch("/stays.json");
    dataHoteles = await res.json();
    if (dataHoteles.length) mostrarHoteles(dataHoteles);
  } catch (error) {
    console.error("Error al cargar la información de los hoteles:", error);
  }
}

iniciarApp();

// 3. Funciones para mostrar al publico
function mostrarHoteles(grupoDeHoteles) {
  contenedorHoteles.innerHTML = "";
  elementoContador.innerHTML = `${grupoDeHoteles.length}+ stays`;

  if (grupoDeHoteles.length === 0) {
    contenedorHoteles.innerHTML = `
      <div class="col-span-full text-center py-20">
        <h2 class="text-xl font-bold text-[#828282]">No hay alojamientos disponibles</h2>
        <p class="text-[#828282]">Intenta buscar otra ciudad o ajusta el número de huéspedes.</p>
      </div>
    `;
    return;
  }

  grupoDeHoteles.forEach((hotel) => {
    let superHostHTML = hotel.superHost
      ? `<span class="border border-[#4f4f4f] text-[#4f4f4f] font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">Superhost</span>`
      : "";

    contenedorHoteles.innerHTML += `
      <div class="flex flex-col gap-3">
        <div class="overflow-hidden rounded-3xl aspect-4/3">
          <img src="${hotel.photo}" alt="${hotel.title}" class="w-full h-full object-cover">
        </div>
        <div class="flex justify-between items-center text-xs text-[#828282] mt-1">
          <div class="flex items-center gap-2">
            ${superHostHTML}
            <span>${hotel.type} . ${hotel.beds || 0} beds</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-[#eb5757]">★</span>
            <span class="font-semibold text-[#4f4f4f]">${hotel.rating}</span>
          </div>
        </div>
        <h3 class="text-sm font-semibold text-[#333333] truncate">${hotel.title}</h3>
      </div>
    `;
  });
}

function actualizarSugerencias() {
  let texto = buscarCiudad.value.toLowerCase().trim();
  let lista = document.querySelector("#listaSugerencias");
  lista.innerHTML = "";
  if (texto === "") return;

  let ciudadesUnicas = [
    ...new Set(dataHoteles.map((h) => `${h.city}, ${h.country}`)),
  ];

  ciudadesUnicas.forEach((ciudad) => {
    if (ciudad.toLowerCase().includes(texto)) {
      lista.innerHTML += `
        <li class="opcion-ciudad flex items-center gap-3 cursor-pointer hover:text-black py-1" data-ciudad="${ciudad}">
          <span class="text-gray-400">📍</span> ${ciudad}
        </li>
      `;
    }
  });
}

// 4. Logica del search y guests
function modificarContador(tipo, operacion) {
  if (operacion === "menos" && huespedes[tipo] > 0) huespedes[tipo]--;
  if (operacion === "mas") huespedes[tipo]++;

  document.querySelector(
    tipo === "adultos" ? "#cantAdultos" : "#cantNinos",
  ).innerHTML = huespedes[tipo];

  let total = huespedes.adultos + huespedes.ninos;
  document.querySelector("#buscarHuespedes").value =
    total > 0 ? `${total} guests` : "";
}

function ejecutarFiltrado() {
  let ciudadUsuario = buscarCiudad.value.toLowerCase().trim();
  let totalBuscado = huespedes.adultos + huespedes.ninos;

  let filtrados = dataHoteles.filter(
    (h) =>
      `${h.city}, ${h.country}`.toLowerCase().includes(ciudadUsuario) &&
      h.maxGuests >= totalBuscado,
  );

  mostrarHoteles(filtrados);
  resetearBusqueda();
}

function resetearBusqueda() {
  buscarCiudad.value = "";
  document.querySelector("#buscarHuespedes").value = "";
  document.querySelector("#listaSugerencias").innerHTML = "";
  huespedes = { adultos: 0, ninos: 0 };
  document.querySelector("#cantAdultos").innerHTML = 0;
  document.querySelector("#cantNinos").innerHTML = 0;
  menuBusqueda.classList.add("hidden");
  fondoOscuro.classList.add("hidden");

  if (window.innerWidth < 768) {
    document.querySelector("#panelContadores").classList.add("hidden");
  }
}

// 5. Interaciones de los botones
document.querySelector("#gatilloBusqueda").addEventListener("click", () => {
  menuBusqueda.classList.remove("hidden");
  fondoOscuro.classList.remove("hidden");
  buscarCiudad.focus();
  if (window.innerWidth < 768) {
    document.querySelector("#panelContadores").classList.add("hidden");
  }
  actualizarSugerencias();
});

buscarCiudad.addEventListener("input", actualizarSugerencias);

document
  .querySelector("#btnMasAdultos")
  .addEventListener("click", () => modificarContador("adultos", "mas"));
document
  .querySelector("#btnMenosAdultos")
  .addEventListener("click", () => modificarContador("adultos", "menos"));
document
  .querySelector("#btnMasNinos")
  .addEventListener("click", () => modificarContador("ninos", "mas"));
document
  .querySelector("#btnMenosNinos")
  .addEventListener("click", () => modificarContador("ninos", "menos"));

document.addEventListener("click", (e) => {
  let opcion = e.target.closest(".opcion-ciudad");
  let inputHuespedes = e.target.closest("#buscarHuespedes");
  let panelContadores = document.querySelector("#panelContadores");

  if (opcion) {
    buscarCiudad.value = opcion.getAttribute("data-ciudad");
    document.querySelector("#listaSugerencias").innerHTML = "";
    if (window.innerWidth < 768) panelContadores.classList.remove("hidden");
  } else if (inputHuespedes) {
    panelContadores.classList.toggle("hidden");
  } else if (e.target === fondoOscuro) {
    resetearBusqueda();
  }
});

document
  .querySelector("#btnEjecutarBusqueda")
  .addEventListener("click", ejecutarFiltrado);

if (document.querySelector("#btnEjecutarBusquedaMvl")) {
  document
    .querySelector("#btnEjecutarBusquedaMvl")
    .addEventListener("click", ejecutarFiltrado);
}

if (document.querySelector("#btnCerrarMenuMvl")) {
  document
    .querySelector("#btnCerrarMenuMvl")
    .addEventListener("click", resetearBusqueda);
}

document.querySelector("header a").addEventListener("click", (evento) => {
  evento.preventDefault();
  resetearBusqueda();
  mostrarHoteles(dataHoteles);
});
