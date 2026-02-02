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

    updateList();
    document.getElementById("display").classList.remove("hidden");

    // Limpiar inputs
    nameInput.value = "";
    workInput.value = "";
    restInput.value = "";
  }
}

function updateList() {
  const list = document.getElementById("taskList");
  // Solo mostramos los ejercicios (tipo 'work') en la lista de preparación
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

  document.getElementById("setup").style.display = "none";
  document.getElementById("taskList").style.display = "none";
  document.getElementById("startBtn").style.display = "none";
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

  // Opcional: Podrías llamar a saveWorkout() aquí automáticamente
  // o dejar que el usuario lo guarde con un botón y nombre.
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
    id: Date.now(), // ID único basado en tiempo
    name: routineName,
    date: new Date().toLocaleDateString(),
    data: [...routine], // Guardamos toda la estructura de ejercicios y descansos
  };

  history.unshift(newEntry);
  localStorage.setItem("workoutHistory", JSON.stringify(history));

  nameInput.value = ""; // Limpiar el nombre
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
        <div class="history-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
                <strong style="color: var(--primary);">${item.name}</strong><br>
                <small>${item.date} - ${item.data.filter((i) => i.type === "work").length} ej.</small>
            </div>
            <button onclick="loadRoutine(${item.id})" class="btn-repeat" style="padding: 5px 10px; font-size: 0.7rem; width: auto;">Cargar</button>
        </div>
    `,
    )
    .join("");
}

function loadRoutine(id) {
  const history = JSON.parse(localStorage.getItem("workoutHistory")) || [];
  const routineToLoad = history.find((item) => item.id === id);

  if (routineToLoad) {
    routine = [...routineToLoad.data]; // Cargamos los datos en la variable global
    updateList();
    document.getElementById("display").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" }); // Subir al principio para ver la rutina
    alert("Rutina '" + routineToLoad.name + "' cargada.");
  }
}

function clearHistory() {
  if (confirm("¿Borrar todas tus rutinas guardadas?")) {
    localStorage.removeItem("workoutHistory");
    loadHistory();
  }
}
