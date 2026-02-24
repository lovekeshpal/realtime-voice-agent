import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { handleSocket } from "./websocket/socketHandler.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

app.get("/health", (_, res) => res.send("OK"));

const server = createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", handleSocket);

server.listen(3000, () => {
    console.log("Server running on 3000");
});