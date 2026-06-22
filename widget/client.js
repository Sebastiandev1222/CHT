const socket = new WebSocket("ws://testch.onrender.com");

const clientId = Date.now().toString();

socket.onopen = () => {

    socket.send(JSON.stringify({
        type: "connect",
        clientId
    }));

};

socket.onmessage = event => {

    const data = JSON.parse(event.data);

    document.getElementById("chat").innerHTML +=
        "<p>Admin: " + data.message + "</p>";

};

function send() {

    socket.send(JSON.stringify({
        type: "message",
        message: document.getElementById("msg").value
    }));

}
