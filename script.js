// 1. CONFIGURACIÓN DE SONIDOS (Siempre al principio)
const ambientMusic = new Audio("assets/audio/Chill-Music.mp3");
ambientMusic.loop = true;

const victorySound = new Audio("assets/audio/skyrim-skeleton.mp3");

// Ajuste de volumen dinámico
document.addEventListener("input", (e) => {
  if (e.target.id === "volumeControl") {
    ambientMusic.volume = e.target.value;
  }
});

// 2. ESTADO GLOBAL
let routine = [];
let isPaused = false;
let isSkipped = false;

document.addEventListener("DOMContentLoaded", loadHistory);

// --- LÓGICA DE LA RUTINA ---

function skipTask() {
  isSkipped = true;
}

function addTask() {
  const nameInput = document.getElementById("taskName");
  const workInput = document.getElementById("taskTime");
  const restInput = document.getElementById("restTime");

  if (nameInput.value && workInput.value) {
    routine.push({
      name: nameInput.value,
      time: parseInt(workInput.value),
      type: "work",
    });

    if (restInput.value > 0) {
      routine.push({
        name: "Descanso",
        time: parseInt(restInput.value),
        type: "rest",
      });
    }

    document.getElementById("listSection").classList.remove("hidden");
    document.getElementById("display").classList.remove("hidden");

    updateList();

    nameInput.value = "";
    workInput.value = "";
    restInput.value = "";
  }
}

function updateList() {
  const list = document.getElementById("taskList");
  const listSection = document.getElementById("listSection");

  if (routine.length === 0) {
    listSection.classList.add("hidden");
    return;
  }

  list.innerHTML = routine
    .filter((item) => item.type === "work")
    .map(
      (item) => `
            <div class="task-item">
                <span>${item.name}</span>
                <span><strong>${item.time}s</strong></span>
            </div>
        `,
    )
    .join("");
}

// --- LÓGICA DEL TEMPORIZADOR ---

function togglePause() {
  isPaused = !isPaused;
  const btn = document.getElementById("pauseBtn");
  btn.innerText = isPaused ? "Reanudar" : "Pausar";
  btn.classList.toggle("paused", isPaused);

  if (isPaused) {
    ambientMusic.pause();
  } else {
    ambientMusic.play().catch(() => {}); // El catch evita errores si el navegador bloquea el audio
  }
}

async function startRoutine() {
  if (routine.length === 0) return;

  // Iniciar música
  ambientMusic.currentTime = 0;
  ambientMusic.play().catch((err) => console.log("Audio bloqueado:", err));

  document.getElementById("setup").style.display = "none";
  document.getElementById("listSection").classList.add("hidden");
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("historySection").classList.add("hidden");
  document.getElementById("pauseBtn").classList.remove("hidden");
  document.getElementById("skipBtn").classList.remove("hidden");

  for (let item of routine) {
    const display = document.getElementById("display");
    display.className =
      "glass-card " + (item.type === "work" ? "working" : "resting");
    document.getElementById("status-label").innerText =
      item.type === "work" ? "ENTRENANDO" : "DESCANSO";

    await runTimer(item.name, item.time);
  }

  // Finalización
  ambientMusic.pause();
  victorySound.play();

  document.getElementById("pauseBtn").classList.add("hidden");
  document.getElementById("skipBtn").classList.add("hidden");
  document.getElementById("status-label").innerText = "¡MUY BIEN AMOR! ❤️";
  document.getElementById("timer").innerText = "🏆";
  document.getElementById("currentTask").innerText =
    "¡Entrenamiento Completado!";
}

function runTimer(name, seconds) {
  return new Promise((resolve) => {
    let timeLeft = seconds;
    isSkipped = false;
    document.getElementById("currentTask").innerText = name;

    const interval = setInterval(() => {
      if (isSkipped) {
        clearInterval(interval);
        resolve();
        return;
      }

      if (!isPaused) {
        document.getElementById("timer").innerText = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(interval);
          resolve();
          return;
        }
        timeLeft--;
      }
    }, 1000);
  });
}

// --- HISTORIAL, IMPORTAR Y EXPORTAR ---

function saveCurrentRoutine() {
  const nameInput = document.getElementById("routineName");
  const routineName = nameInput.value.trim() || "Rutina sin nombre";

  if (routine.length === 0) {
    alert("¡Añade algunos ejercicios primero!");
    return;
  }

  const history = JSON.parse(localStorage.getItem("workoutHistory")) || [];
  const newEntry = {
    id: Date.now(),
    name: routineName,
    date: new Date().toLocaleDateString(),
    data: [...routine],
  };

  history.unshift(newEntry);
  localStorage.setItem("workoutHistory", JSON.stringify(history));

  nameInput.value = "";
  loadHistory();
  alert("Rutina '" + routineName + "' guardada.");
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("workoutHistory")) || [];
  const container = document.getElementById("workoutHistory");

  if (history.length === 0) {
    container.innerHTML =
      '<p style="opacity: 0.5; font-size: 0.8rem;">Aún no hay rutinas.</p>';
    return;
  }

  container.innerHTML = history
    .map(
      (item) => `
        <div class="history-item">
            <div>
                <strong style="color: var(--primary);">${item.name}</strong><br>
                <small>${item.date} - ${item.data.filter((i) => i.type === "work").length} ej.</small>
            </div>
            <button onclick="loadRoutine(${item.id})" class="btn-save" style="width: auto; padding: 5px 15px;">Cargar</button>
        </div>
    `,
    )
    .join("");
}

function loadRoutine(id) {
  const history = JSON.parse(localStorage.getItem("workoutHistory")) || [];
  const routineToLoad = history.find((item) => item.id === id);

  if (routineToLoad) {
    routine = [...routineToLoad.data];
    document.getElementById("listSection").classList.remove("hidden");
    document.getElementById("display").classList.remove("hidden");
    updateList();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function clearHistory() {
  if (confirm("¿Borrar todo el historial?")) {
    localStorage.removeItem("workoutHistory");
    loadHistory();
  }
}

function exportRoutines() {
  const history = localStorage.getItem("workoutHistory");
  if (!history || history === "[]") return alert("No hay datos.");

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(history);
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "mis_rutinas.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function importRoutines(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (Array.isArray(importedData)) {
        const current =
          JSON.parse(localStorage.getItem("workoutHistory")) || [];
        localStorage.setItem(
          "workoutHistory",
          JSON.stringify([...importedData, ...current]),
        );
        loadHistory();
        alert("¡Importado!");
      }
    } catch (err) {
      alert("Error al importar.");
    }
  };
  reader.readAsText(file);
}

function importJSONText() {
  const textArea = document.getElementById("jsonPasteArea");
  const textRaw = textArea.value.trim();

  if (!textRaw) {
    alert("Por favor, pega el código JSON en el recuadro.");
    return;
  }

  try {
    const importedData = JSON.parse(textRaw);

    if (Array.isArray(importedData)) {
      // Obtenemos historial actual
      const current = JSON.parse(localStorage.getItem("workoutHistory")) || [];

      // Combinamos: Lo importado primero, luego lo antiguo
      localStorage.setItem(
        "workoutHistory",
        JSON.stringify([...importedData, ...current]),
      );

      loadHistory();
      textArea.value = ""; // Limpiar el campo
      alert("¡Rutinas importadas correctamente desde el texto!");

      // Hacemos scroll hacia arriba para ver las nuevas rutinas
      document
        .getElementById("historySection")
        .scrollIntoView({ behavior: "smooth" });
    } else {
      alert("El formato no es válido. Debe ser una lista [...] de rutinas.");
    }
  } catch (err) {
    console.error(err);
    alert(
      "Error de formato: Asegúrate de copiar todo el código JSON correctamente (comillas, corchetes, comas).",
    );
  }
}
