console.log("🚀 Chat loaded");

let ws;
let userId = null;

function connect() {
    ws = new WebSocket("ws://testch.onrender.com");

    ws.onopen = () => {
        console.log("✅ connected");
    };

    ws.onclose = () => {
        console.log("❌ reconnecting...");
        setTimeout(connect, 2000);
    };

    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.type === "init") {
            userId = data.userId;
            console.log("ID:", userId);
        }

        if (data.type === "admin_message") {
            addMsg("admin", data.message);
        }
    };
}

function UI() {
    const box = document.createElement("div");

    box.style.cssText = `
        position:fixed;
        bottom:20px;
        right:20px;
        width:300px;
        height:400px;
        background:#111;
        color:white;
        display:flex;
        flex-direction:column;
        z-index:999999;
    `;

    box.innerHTML = `
        <div style="padding:10px;background:#222;">Chat</div>
        <div id="msgs" style="flex:1;overflow:auto;padding:10px;"></div>
        <div style="display:flex;">
            <input id="msg" style="flex:1;" />
            <button id="send">Send</button>
        </div>
    `;

    document.body.appendChild(box);

    document.getElementById("send").onclick = () => {
        const input = document.getElementById("msg");

        ws.send(JSON.stringify({
            type: "user_message",
            message: input.value
        }));

        addMsg("you", input.value);
        input.value = "";
    };
}

function addMsg(sender, msg) {
    const box = document.getElementById("msgs");

    const div = document.createElement("div");
    div.innerHTML = `<b>${sender}:</b> ${msg}`;
    box.appendChild(div);
}

UI();
connect();
