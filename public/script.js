const allTasks = document.getElementById("allTasks");
const readBtn = document.getElementById("readBtn");
const noTasks = document.getElementById("noTasksBox");
const taskModalEl = document.getElementById("taskModal");
const taskModalLabel = document.getElementById("taskModalLabel");
const taskForm = document.getElementById("taskForm");
const port = 3000;

// btns
const deleteBtns = document.querySelectorAll(".task-box-del");
const editBtns = document.querySelectorAll(".task-box-edit");
const doneBtns = document.querySelectorAll(".task-box-done");

// add task box to UI
function addTask(task) {
  noTasks.style.visibility = "hidden";
  const card = document.createElement("div");
  card.className = "card task-box";
  card.id = task._id.toString();
  card.innerHTML = `
    <div class="card-header d-flex justify-content-between">
        <h5 class="card-title task-box-title">${task.title}</h5>
        <div>
            <button class="btn btn-sm btn-outline-success task-box-done"> 
                <i class="bi bi-check-circle-fill"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary task-box-edit"> 
                <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger task-box-del"> 
                <i class="bi bi-trash-fill"></i>
            </button>
        </div>
    </div>
    <div class="card-body">
        <div class="task-box-body">${task.desc}</div>
    </div>
    `;
  allTasks.appendChild(card);
}

// update existing task
async function updateTask(card) {
  const taskId = card.id;
  const title = card.querySelector(".task-box-title").textContent;
  const desc = card.querySelector(".task-box-body").textContent;

  // Open modal & fill values
  taskModalLabel.textContent = "Edit task";
  taskForm.querySelector('button[type="submit"]').textContent = "Update Task";
  taskForm.title.value = title;
  taskForm.desc.value = desc;
  taskForm.dataset.editingId = taskId;
  const modal = bootstrap.Modal.getOrCreateInstance(taskModalEl);
  modal.show();
}

// updates task UI after updation in backend
function updateTaskUI(task) {
  const card = document.getElementById(task._id);
  if (!card) return;
  card.querySelector(".task-box-title").innerText = task.title;
  card.querySelector(".task-box-body").innerText = task.desc;
}

// remove task box from UI
async function removeTask(task_id) {
  try {
    const res = await fetch(`http://localhost:${port}/tasks`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: task_id }),
    });

    if (res.ok) {
      const task = document.getElementById(task_id);
      if (task) task.remove();
    } else {
      console.log("Failed to delete task.");
    }
  } catch (err) {
    console.log("Error: ", err);
  }
}

// CREATE & UPDATE eventListeners
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // check mode of submit (i.e. edit or create)
  const isEdit = !!taskForm.dataset.editingId;

  // get form data & store in object 'task'
  const formData = new FormData(taskForm);
  const task = {
    title: formData.get("title"),
    desc: formData.get("desc"),
  };
  let data, res;
  try {
    // EDIT TASK
    if (isEdit) {
      const taskId = taskForm.dataset.editingId;
      res = await fetch(`http://localhost:${port}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });
      data = await res.json();
      // if task updated in DB then update UI else error
      if (res.ok) {
        updateTaskUI(data);
      } else {
        console.log("Error in updating task.");
      }

      // after successfuly task edition, reset modal
      if (res.ok) {
        taskForm.reset();
        delete taskForm.dataset.editingId;
        taskForm.querySelector('button[type="submit"]').textContent =
          "Create Task";
        const modal = bootstrap.Modal.getOrCreateInstance(taskModalEl);
        modal.hide();
      } else {
        console.log("Failed to save task.");
      }

      // CREATE TASK
    } else {
      res = await fetch(`http://localhost:${port}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });
      data = await res.json();

      if (res.ok) {
        taskForm.reset();
        const modal = bootstrap.Modal.getInstance(taskModalEl);
        modal.hide();
        addTask(data);
      } else {
        console.log("Failed to add task.");
      }
    }
  } catch (err) {
    console.log("DB error: ", err);
  }
});

// READ
readBtn.addEventListener("click", async () => {
  try {
    const res = await fetch("/tasks", { method: "GET" });
    if (!res.ok) throw new Error("Failed to fetch tasks.");

    const data = await res.json();

    if (data.length === 0) {
      noTasks.style.visibility = "visible";
      return;
    } else {
      noTasks.style.visibility = "hidden";
    }

    allTasks.innerHTML = ``;
    data.forEach((task) => addTask(task));
  } catch (err) {
    console.error(err);
  }
});

// LOAD EVENT LISTENERS
allTasks.addEventListener("click", (e) => {
  if (e.target.closest(".task-box-del")) {
    const card = e.target.closest(".card");
    removeTask(card.id);

  } else if (e.target.closest(".task-box-edit")) {
    const card = e.target.closest(".task-box");
    updateTask(card);

  } else if (e.target.closest(".task-box-done")) {
    const card = e.target.closest(".card");
    removeTask(card.id);

    Swal.fire({
        icon : 'success',
        title: 'Task Completed!',
        text: 'Great job finishing the task.',
        toast: true,
        showConfirmButton : false,
        timer : 2500,
        timerProgressBar: true,
        position: 'top-end'
    });

  }
});
