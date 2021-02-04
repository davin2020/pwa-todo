
// const offLineMsg = document.querySelector('.offline');

// this is not SW stuff but its handy to know for UX reasons ie helpful msgs for enduser
const offlineMsg = document.querySelector('.offline');

window.addEventListener('online', updateStatus);
window.addEventListener('offline', updateStatus);
//shoudl also do this ie checek for online/offlinestatus when page loads,
document.addEventListener('DOMContentLoaded', updateStatus);

function updateStatus() {
    //disable Add button and check boxes if ur offline - can do this as stopgap
    document.querySelector('button').disabled = !navigator.onLine;
    document.querySelectorAll('.todo input').forEach(input => {
        input.disabled = !navigator.onLine;
    })

    if (navigator.onLine === false) {
        offlineMsg.innerHTML = 'You are currently offline.'
    } else {
        offlineMsg.innerHTML = '';
    }
}


function loadTodos() {
    fetch('/api/todo').then(function (data) {
        return data.json()
    }).then(function (todos) {
        var todoEl = document.querySelector('.todos');
        if (todos.success) {
            document.querySelector('.todos').innerHTML = '';
            todos.data.forEach(function (todo) {
                if (todo[0]) {
                    var todoContent = todoEl.innerHTML
                    todoEl.innerHTML = todoContent + '<div class="todo">' + todo[1] + '<input type="checkbox" value="' + todo[0] + '"></div>'
                }
            })

            document.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
                checkbox.onclick = function() {
                    var todo = {done : this.value};

                    fetch('/api/todo', {
                        method: "POST",
                        body: JSON.stringify(todo),
                        headers: new Headers({
                            'Content-Type': 'application/json'
                        })
                    }).then(function(data) {
                        return data.json()
                    }).then(function(data) {
                        if (data.success) {
                            loadTodos();
                        } else {
                            alert('something broke')
                        }
                    })
                }
            })

        }
    })
}

loadTodos();

document.querySelector('button').onclick = function() {
    var todo = {todo : document.getElementsByName('todo')[0].value};

    fetch('/api/todo', {
        method: "POST",
        body: JSON.stringify(todo),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    }).then(function(data) {
        return data.json()
    }).then(function(data) {
        if (data.success) {
            document.getElementsByName('todo')[0].value = ''
            loadTodos();
        } else {
            alert('something broke')
        }
    })
}
