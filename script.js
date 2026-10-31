// ======================================
// DEVTRACK - LEARNING DASHBOARD
// ======================================


// INITIAL TASKS

const KEY = "devtrack_tasks_v1";

const starter = [

    {
        id: 1,
        title: "Review JavaScript array methods",
        category: "JavaScript",
        status: "progress"
    },

    {
        id: 2,
        title: "Build a responsive navigation menu",
        category: "HTML & CSS",
        status: "todo"
    },

    {
        id: 3,
        title: "Practice Python functions",
        category: "Python",
        status: "todo"
    },

    {
        id: 4,
        title: "Revise German technical vocabulary",
        category: "German",
        status: "done"
    }

];


// GLOBAL VARIABLES

let tasks = readTasks();

const $ = id => document.getElementById(id);

const labels = {
    todo: "To Do",
    progress: "In Progress",
    done: "Completed"
};


// ======================================
// LOCAL STORAGE
// ======================================

function readTasks() {

    try {

        const data = localStorage.getItem(KEY);

        return data ? JSON.parse(data) : starter;

    }

    catch (error) {

        console.error("Unable to read saved tasks", error);

        return starter;

    }

}


function save() {

    localStorage.setItem(
        KEY,
        JSON.stringify(tasks)
    );

}


// ======================================
// RENDER TASKS
// ======================================

function render() {

    const query = $("search").value.trim().toLowerCase();

    const filter = $("filter").value;


    const shown = tasks.filter(task => {

        const matchesText =
            (task.title + " " + task.category)
            .toLowerCase()
            .includes(query);

        const matchesStatus =
            filter === "all" || task.status === filter;

        return matchesText && matchesStatus;

    });


    $("taskList").innerHTML = "";

    $("empty").hidden = shown.length !== 0;


    shown.forEach(task => {

        const row = document.createElement("div");

        row.className = "task " +
            (task.status === "done" ? "done" : "");


        // CHECK BUTTON

        const check = document.createElement("button");

        check.className = "check";

        check.type = "button";

        check.textContent =
            task.status === "done" ? "✓" : "";

        check.setAttribute(
            "aria-label",
            "Change task status"
        );

        check.addEventListener("click", () => {

            cycle(task.id);

        });


        // TASK INFORMATION

        const info = document.createElement("div");

        info.className = "task-info";


        const title = document.createElement("b");

        title.textContent = task.title;


        const category = document.createElement("small");

        category.textContent = task.category;


        info.append(title, category);


        // STATUS

        const pill = document.createElement("span");

        pill.className = "pill " + task.status;

        pill.textContent = labels[task.status];


        // DELETE BUTTON

        const del = document.createElement("button");

        del.className = "delete";

        del.type = "button";

        del.textContent = "×";

        del.setAttribute(
            "aria-label",
            "Delete task"
        );

        del.addEventListener("click", () => {

            removeTask(task.id);

        });


        // ADD ELEMENTS

        row.append(
            check,
            info,
            pill,
            del
        );


        $("taskList").append(row);

    });


    updateStats();

}



// ======================================
// UPDATE STATISTICS
// ======================================

function updateStats() {

    const total = tasks.length;


    const done = tasks.filter(task => {

        return task.status === "done";

    }).length;


    const active = tasks.filter(task => {

        return task.status === "progress";

    }).length;


    const percent = total
        ? Math.round((done / total) * 100)
        : 0;


    $("total").textContent = total;

    $("completed").textContent = done;

    $("inProgress").textContent = active;

    $("percent").textContent = percent + "%";

    $("ringPercent").textContent = percent + "%";

    $("doneCount").textContent = done;

    $("remaining").textContent = total - done;


    // MINI PROGRESS BAR

    $("bar").style.width = percent + "%";


    // CIRCULAR PROGRESS

    $("ring").style.background =

        `conic-gradient(
            var(--purple) ${percent}%,
            #efeff5 ${percent}% 100%
        )`;

}



// ======================================
// CHANGE TASK STATUS
// ======================================

function cycle(id) {

    const task = tasks.find(item => {

        return item.id === id;

    });


    if (!task) return;


    const nextStatus = {

        todo: "progress",

        progress: "done",

        done: "todo"

    };


    task.status = nextStatus[task.status];


    save();

    render();

    notify("Status: " + labels[task.status]);

}



// ======================================
// DELETE TASK
// ======================================

function removeTask(id) {

    tasks = tasks.filter(task => {

        return task.id !== id;

    });


    save();

    render();

    notify("Task deleted");

}



// ======================================
// OPEN TASK FORM
// ======================================

function openForm(task = null) {

    $("taskForm").reset();


    $("editId").value = task ? task.id : "";

    $("title").value = task ? task.title : "";

    $("category").value =
        task ? task.category : "JavaScript";

    $("status").value =
        task ? task.status : "todo";


    $("dialogTitle").textContent =
        task ? "Edit Task" : "Add a Task";


    $("dialog").showModal();

    $("title").focus();

}



// ======================================
// NOTIFICATION
// ======================================

function notify(message) {

    $("toast").textContent = message;

    $("toast").classList.add("show");


    clearTimeout(notify.timer);


    notify.timer = setTimeout(() => {

        $("toast").classList.remove("show");

    }, 2000);

}



// ======================================
// SAVE TASK
// ======================================

$("taskForm").addEventListener("submit", event => {

    event.preventDefault();


    const id = $("editId").value;

    const title = $("title").value.trim();


    if (!title) return;


    const data = {

        title: title,

        category: $("category").value,

        status: $("status").value

    };


    // EDIT EXISTING TASK

    if (id) {

        const oldTask = tasks.find(task => {

            return task.id === Number(id);

        });


        if (oldTask) {

            Object.assign(oldTask, data);

        }


        notify("Task updated");

    }


    // ADD NEW TASK

    else {

        tasks.unshift({

            id: Date.now(),

            ...data

        });


        notify("Task added");

    }


    save();

    render();

    $("dialog").close();

});



// ======================================
// EVENT LISTENERS
// ======================================


// OPEN FORM

$("addTop").addEventListener("click", () => {

    openForm();

});


$("addInline").addEventListener("click", () => {

    openForm();

});



// CLOSE FORM

$("close").addEventListener("click", () => {

    $("dialog").close();

});


$("cancel").addEventListener("click", () => {

    $("dialog").close();

});



// SEARCH

$("search").addEventListener("input", render);


// FILTER

$("filter").addEventListener("change", render);



// ======================================
// CURRENT DATE
// ======================================

$("dateLabel").textContent =

    new Date().toLocaleDateString("en-US", {

        weekday: "long",

        month: "long",

        day: "numeric"

    }).toUpperCase();



// ======================================
// START APPLICATION
// ======================================

render();