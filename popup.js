const sueldoInput = document.getElementById("sueldo");
const diasInput = document.getElementById("dias");
const horasDiaInput = document.getElementById("horasDia");
const valorHoraSpan = document.getElementById("valorHora");
const horasExtraToggle = document.getElementById("horasExtraToggle");
const horasExtraOpciones = document.getElementById("horasExtraOpciones");
const horasExtraComunesInput = document.getElementById("horasExtraComunes");
const horasExtraEspecialesInput = document.getElementById("horasExtraEspeciales");
const guardarButton = document.getElementById("guardar");
const toggleButton = document.getElementById("toggle");

// Calcular horas al mes
function calcularHorasMes(dias, horasDia) {
  return dias * horasDia * 4.33;
}

// Toggle para mostrar opciones de horas extra
horasExtraToggle.addEventListener("change", () => {
  horasExtraOpciones.style.display = horasExtraToggle.checked ? "block" : "none";
});

// Recargar Mercado Libre
function recargarMercadoLibre() {
    const patterns = [
    "*://www.mercadolibre.com/*",
    "*://www.mercadolibre.com.ar/*",
    "*://articulo.mercadolibre.com.ar/*",
    "*://listado.mercadolibre.com.ar/*"
  ];

    chrome.tabs.query({ url: patterns }, (tabs) => {
    if (chrome.runtime.lastError) {
      console.error("Error al consultar pestañas:", chrome.runtime.lastError.message);
      return;
    }

    if (tabs.length === 0) {
      console.log("No se encontraron pestañas de Mercado Libre que coincidan con los patrones especificados.");
      return;
    }

    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.reload(tab.id, {}, () => {
          if (chrome.runtime.lastError) {
            console.error(`Error al recargar la pestaña ${tab.id}:`, chrome.runtime.lastError.message);
          }
        });
      }
    });
  });
}

// Cargar datos guardados
chrome.storage.sync.get(
  ["sueldo", "dias", "horasDia", "horasExtraComunes", "horasExtraEspeciales", "activo", "valorHora"],
  (data) => {
    if (data.sueldo) sueldoInput.value = data.sueldo;
    if (data.dias) diasInput.value = data.dias;
    if (data.horasDia) horasDiaInput.value = data.horasDia;
    if (data.horasExtraComunes) horasExtraComunesInput.value = data.horasExtraComunes;
    if (data.horasExtraEspeciales) horasExtraEspecialesInput.value = data.horasExtraEspeciales;

    if (data.sueldo && data.dias && data.horasDia && data.valorHora) {
      valorHoraSpan.innerText = `$${data.valorHora.toFixed(2)}`;
    }

    toggleButton.innerText = data.activo === false ? "Activar" : "Desactivar";
  }
);

// Guardar datos
guardarButton.addEventListener("click", () => {
  const sueldo = parseFloat(sueldoInput.value);
  const dias = parseFloat(diasInput.value);
  const horasDia = parseFloat(horasDiaInput.value);
  const horasExtraComunes = parseFloat(horasExtraComunesInput.value) || 0;
  const horasExtraEspeciales = parseFloat(horasExtraEspecialesInput.value) || 0;

  if (isNaN(sueldo) || isNaN(dias) || isNaN(horasDia) || dias <= 0 || horasDia <= 0) {
    alert("Por favor ingresa valores válidos");
    return;
  }

  const horasMes = calcularHorasMes(dias, horasDia);
  let horasMesFinal = horasMes;

  if (horasExtraToggle.checked) {
    horasMesFinal += horasExtraComunes * 1.5 + horasExtraEspeciales * 2;
  }

  const valorHora = sueldo / horasMesFinal;

  chrome.storage.sync.set(
    { sueldo, dias, horasDia, horasExtraComunes, horasExtraEspeciales, valorHora },
    () => {
      if (chrome.runtime.lastError) {
        console.error("Error al guardar los datos:", chrome.runtime.lastError);
        alert("No se pudo guardar la información. Por favor, intenta de nuevo.");
        return;
      }

      console.log("Datos guardados correctamente. Valor hora:", valorHora);
      valorHoraSpan.innerText = `$${valorHora.toFixed(2)}`;
      
      recargarMercadoLibre();
    }
  );
});

// Activar o Desactivar
toggleButton.addEventListener("click", () => {
  chrome.storage.sync.get("activo", (data) => {
    const nuevoEstado = !(data.activo === false);
    chrome.storage.sync.set({ activo: !nuevoEstado }, () => {
      toggleButton.innerText = !nuevoEstado ? "Desactivar" : "Activar";
      recargarMercadoLibre();
    });
  });
});