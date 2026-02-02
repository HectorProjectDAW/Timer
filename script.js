let routine = [];
let isPaused = false;

document.addEventListener("DOMContentLoaded", loadHistory);

// --- LÓGICA DE LA RUTINA ---

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

    // --- CORRECCIÓN AQUÍ ---
    // Mostramos la sección que contiene la lista y el botón de guardar
    document.getElementById("listSection").classList.remove("hidden");
    document.getElementById("display").classList.remove("hidden");

    updateList();

    // Limpiar inputs
    nameInput.value = "";
    workInput.value = "";
    restInput.value = "";
  }
}

function updateList() {
  const list = document.getElementById("taskList");
  const listSection = document.getElementById("listSection");

  // Si no hay ejercicios, ocultamos la sección
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
}

async function startRoutine() {
  if (routine.length === 0) return;

  // Ocultamos todo lo que no sea el cronómetro
  document.getElementById("setup").style.display = "none";
  document.getElementById("listSection").classList.add("hidden"); // Ocultamos la lista y el botón guardar
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("historySection").classList.add("hidden"); // Ocultamos historial para foco total
  document.getElementById("pauseBtn").classList.remove("hidden");

  for (let item of routine) {
    const display = document.getElementById("display");
    display.className =
      "glass-card " + (item.type === "work" ? "working" : "resting");
    document.getElementById("status-label").innerText =
      item.type === "work" ? "ENTRENANDO" : "DESCANSO";

    await runTimer(item.name, item.time);
  }

  document.getElementById("pauseBtn").classList.add("hidden");
  document.getElementById("status-label").innerText = "¡MUY BIEN AMOR! ❤️";
  document.getElementById("timer").innerText = "🏆";
  document.getElementById("currentTask").innerText = "¡Completado!";
}

function runTimer(name, seconds) {
  return new Promise((resolve) => {
    let timeLeft = seconds;
    document.getElementById("currentTask").innerText = name;

    const interval = setInterval(() => {
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

// --- LÓGICA DEL HISTORIAL (GUARDAR Y CARGAR) ---

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
  alert("Rutina '" + routineName + "' guardada con éxito.");
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("workoutHistory")) || [];
  const container = document.getElementById("workoutHistory");

  if (history.length === 0) {
    container.innerHTML =
      '<p style="opacity: 0.5; font-size: 0.8rem;">Aún no hay rutinas guardadas.</p>';
    return;
  }

  container.innerHTML = history
    .map(
      (item) => `
        <div class="history-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px;">
            <div>
                <strong style="color: #6366f1;">${item.name}</strong><br>
                <small>${item.date} - ${item.data.filter((i) => i.type === "work").length} ej.</small>
            </div>
            <button onclick="loadRoutine(${item.id})" class="btn-repeat" style="padding: 5px 10px; font-size: 0.7rem; width: auto; background: #a855f7; color: white;">Cargar</button>
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

    // --- CORRECCIÓN AQUÍ ---
    // Al cargar una rutina, también debemos mostrar la sección de la lista
    document.getElementById("listSection").classList.remove("hidden");
    document.getElementById("display").classList.remove("hidden");

    updateList();
    window.scrollTo({ top: 0, behavior: "smooth" });
    alert("Rutina '" + routineToLoad.name + "' cargada.");
  }
}

function clearHistory() {
  if (confirm("¿Borrar todas tus rutinas guardadas?")) {
    localStorage.removeItem("workoutHistory");
    loadHistory();
  }
}
