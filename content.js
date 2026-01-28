
// Convertir texto del precio a numero
function parsearPrecio(texto) {
  const numero = texto.replace(/[^\d]/g, "");
  return parseFloat(numero);
}

// Insertar el div con dias + horas
function insertarDiasHoras(precioElemento, totalHoras, horasPorDia) {
  if (!precioElemento) return;

  let div = precioElemento.parentNode.querySelector(".horas-trabajo-ext");
  if (!div) {
    div = document.createElement("div");
    div.className = "horas-trabajo-ext";
    div.style.fontSize = "14px";
    div.style.color = "#555";
    div.style.marginTop = "5px";
    precioElemento.parentNode.appendChild(div);
  }

  div.innerText = `≈ ${formatearDiasHoras(totalHoras, horasPorDia)}`;
}

// Convertir horas totales a formato dias + horas
function formatearDiasHoras(totalHoras, horasPorDia) {
  if (!horasPorDia || horasPorDia <= 0) return `${totalHoras.toFixed(2)}h`;
  const dias = Math.floor(totalHoras / horasPorDia);
  const horas = Math.round(totalHoras - dias * horasPorDia);
  let resultado = "";
  if (dias > 0) resultado += `${dias}d `;
  if (horas > 0) resultado += `${horas}h`;
  if (resultado === "") resultado = "0h";
  return resultado.trim();
}

// Calcular horas por producto y actualizar todos los precios
function actualizarValores(valorHora, horasDia) {
  if (!valorHora) return;

  console.log("Actualizando valores con valorHora:", valorHora, "y horasDia:", horasDia);

  document.querySelectorAll(".andes-money-amount__fraction").forEach(precioElemento => {
    const precio = parsearPrecio(precioElemento.innerText);
    if (!isNaN(precio)) {
      const horasTrabajo = precio / valorHora;
      insertarDiasHoras(precioElemento, horasTrabajo, horasDia);
    }
  });
}
// Listener de cambios
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    chrome.storage.sync.get(["dias", "horasDia", "activo", "valorHora"], ({ dias, horasDia, activo, valorHora }) => {
      if (activo === false) {
        document.querySelectorAll(".horas-trabajo-ext").forEach(div => div.remove());
      } else if (valorHora && horasDia) {
        console.log("Valor hora:", valorHora, "Horas dia:", horasDia);
        actualizarValores(valorHora, horasDia);
      }
    });
  }
});

// Cargar valores al cargar la pagina
chrome.storage.sync.get(["dias", "horasDia", "activo", "valorHora"], ({ dias, horasDia, activo, valorHora }) => {
  if (activo !== false && valorHora && horasDia) {
    actualizarValores(valorHora, horasDia);
  }
});

// Observer para detectar cambios en el DOM
const observer = new MutationObserver(() => {
  chrome.storage.sync.get(["dias", "horasDia", "activo", "valorHora"], ({ dias, horasDia, activo, valorHora }) => {
    if (activo !== false && valorHora && horasDia) {
      actualizarValores(valorHora, horasDia);
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
