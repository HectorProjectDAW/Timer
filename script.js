let routine = [];
let isPaused = false;

function togglePause() {
  isPaused = !isPaused;
  const btn = document.getElementById("pauseBtn");
  btn.innerText = isPaused ? "Reanudar" : "Pausar";
  btn.classList.toggle("paused", isPaused);
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

    updateList();
    document.getElementById("display").classList.remove("hidden");

    // Limpiar con estilo
    nameInput.value = "";
    workInput.value = "";
    restInput.value = "";
  }
}

function updateList() {
  const list = document.getElementById("taskList");
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

async function startRoutine() {
  document.getElementById("setup").style.display = "none";
  document.getElementById("taskList").style.display = "none";
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("pauseBtn").classList.remove("hidden"); // Mostrar pausa

  for (let item of routine) {
    const display = document.getElementById("display");
    display.className =
      "glass-card " + (item.type === "work" ? "working" : "resting");
    document.getElementById("status-label").innerText =
      item.type === "work" ? "ENTRENANDO" : "DESCANSO";
    await runTimer(item.name, item.time);
  }

  document.getElementById("pauseBtn").classList.add("hidden");
  document.getElementById("status-label").innerText = "MUY BIEN AMOR!";
  document.getElementById("timer").innerText = "🏆";
}

function runTimer(name, seconds) {
  return new Promise((resolve) => {
    let timeLeft = seconds;
    document.getElementById("currentTask").innerText = name;

    const interval = setInterval(() => {
      if (!isPaused) {
        // <--- SOLO RESTA SI NO ESTÁ PAUSADO
        document.getElementById("timer").innerText = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(interval);
          resolve();
        }
        timeLeft--;
      }
    }, 1000);
  });
}
