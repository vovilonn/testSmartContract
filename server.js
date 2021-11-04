const express = require("express");
const http = require("http");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

const httpServer = http.createServer(app);

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public" + "/p1.html");
});

app.get("/p2", (req, res) => {
    res.sendFile(__dirname + "/public" + "/p2.html");
});

httpServer.listen(80, "185.105.89.140", () => console.log("Server has been started!"));
