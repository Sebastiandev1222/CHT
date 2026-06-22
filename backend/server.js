const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const { v4: uuidv4 } = require("uuid");
const db = require("./db");
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const path = require("path");
app.use(express.static(path.join(__dirname, "../public")));
app.use("/admin", express.static(path.join(__dirname, "../admin")));
app.use("/widget", express.static(path.join(__dirname, "../widget")));
app.get("/", (req, res) => {
    res.json({
        status: "online",
        message: "Chat server is running"
    });
});
app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});
const users = new Map();
const admins = new Set();
wss.on("connection", (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const role = url.searchParams.get("role");
    const userId = uuidv4();
    ws.id = userId;
    ws.role = role || "user";
    console.log("Connected:", role, userId);
    // ================= ADMIN =================
    if (role === "admin") {
        admins.add(ws);
        ws.send(JSON.stringify({ type: "admin_ready" }));
        ws.on("message", (raw) => {
            const data = JSON.parse(raw);
            if (data.type === "admin_message") {
                console.log("ADMIN → USER:", data.roomId, data.message);
                const user = users.get(data.roomId);
                if (!user) {
                    console.log("❌ USER NOT FOUND FOR ROOM:", data.roomId);
                    return;
                }
                if (user.readyState === 1) {
                    user.send(JSON.stringify({
                        type: "admin_message",
                        message: data.message
                    }));
                }
                // ✅ CHANGED: ? → $1, $2, $3
                db.query(
                    "INSERT INTO messages (roomId, sender, message) VALUES ($1, $2, $3)",
                    [data.roomId, "admin", data.message]
                );
            }
        });
        ws.on("close", () => {
            admins.delete(ws);
        });
        return;
    }
    // ================= USER =================
    users.set(userId, ws);
    console.log("USER STORED:", userId);
    ws.send(JSON.stringify({
        type: "init",
        userId
    }));
    broadcastUsers();
    ws.on("message", (raw) => {
        const data = JSON.parse(raw);
        if (data.type === "user_message") {
            console.log("USER → ADMIN:", userId, data.message);
            admins.forEach(a => {
                if (a.readyState === 1) {
                    a.send(JSON.stringify({
                        type: "new_message",
                        roomId: userId,
                        message: data.message
                    }));
                }
            });
            // ✅ CHANGED: ? → $1, $2, $3
            db.query(
                "INSERT INTO messages (roomId, sender, message) VALUES ($1, $2, $3)",
                [userId, "user", data.message]
            );
        }
    });
    ws.on("close", () => {
        users.delete(userId);
        broadcastUsers();
    });
});
function broadcastUsers() {
    const list = Array.from(users.keys());
    admins.forEach(a => {
        if (a.readyState === 1) {
            a.send(JSON.stringify({
                type: "users",
                users: list
            }));
        }
    });
}
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Server running on", PORT);
});
