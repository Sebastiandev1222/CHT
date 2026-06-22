let ws;

function connect() {
    ws = new WebSocket("wss://cht-l5qf.onrender.com?role=admin");

    ws.onopen = () => {
        document.getElementById("status").innerText = "✅ Admin Connected";
    };

    ws.onclose = () => {
        document.getElementById("status").innerText = "❌ Disconnected";
    };

    ws.onerror = (err) => {
        console.log("WebSocket error", err);
    };

    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        console.log("ADMIN RECEIVED:", data);

        // user list
        if (data.type === "users") {
            const box = document.getElementById("users");
            box.innerHTML = "";

            data.users.forEach(id => {
                const div = document.createElement("div");
                div.innerText = id;
                box.appendChild(div);
            });
        }

        // new user message
        if (data.type === "new_message") {
            addMessage("USER (" + data.roomId + ")", data.message);
        }

        // admin reply (optional debug)
        if (data.type === "admin_message") {
            addMessage("ADMIN", data.message);
        }
    };
}

function sendMessage() {
    const roomId = document.getElementById("roomId").value;
    const message = document.getElementById("message").value;

    if (!roomId || !message) {
        alert("Room ID + message required");
        return;
    }

    ws.send(JSON.stringify({
        type: "admin_message",
        roomId,
        message
    }));

    addMessage("YOU (admin)", message);

    document.getElementById("message").value = "";
}

function addMessage(sender, text) {
    const chat = document.getElementById("chat");

    const div = document.createElement("div");
    div.className = "msg";
    div.innerHTML = `<b>${sender}:</b> ${text}`;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

connect();
