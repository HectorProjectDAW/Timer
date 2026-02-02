let routine = [];

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
  const setup = document.getElementById("setup");
  const list = document.getElementById("taskList");
  const startBtn = document.getElementById("startBtn");
  const display = document.getElementById("display");

  setup.style.display = "none";
  list.style.display = "none";
  startBtn.style.display = "none";

  for (let item of routine) {
    display.className =
      "glass-card " + (item.type === "work" ? "working" : "resting");
    document.getElementById("status-label").innerText =
      item.type === "work" ? "ENTRENANDO" : "DESCANSO";
    await runTimer(item.name, item.time);
  }

  document.getElementById("status-label").innerText = "COMPLETADO";
  document.getElementById("currentTask").innerText = "MUY BIEN AMOR!!!";
  document.getElementById("timer").innerText = "🏆";
}

function runTimer(name, seconds) {
  return new Promise((resolve) => {
    let timeLeft = seconds;
    document.getElementById("currentTask").innerText = name;

    const interval = setInterval(() => {
      document.getElementById("timer").innerText = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(interval);
        resolve();
      }
      timeLeft--;
    }, 1000);
  });
}
