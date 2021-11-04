const express = require("express");
const http = require("http");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const PATH_TO_JSON = path.join(__dirname, "/data", "data.json");

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

app.get("/json", (req, res) => {
    res.sendFile(PATH_TO_JSON);
});

app.post("/json", (req, res) => {
    const jsonData = require(PATH_TO_JSON);
    jsonData.push(req.body);
    fs.writeFileSync(PATH_TO_JSON, JSON.stringify(jsonData));
    res.status(200);
});

httpServer.listen(80, "185.105.89.140", () => console.log("Server has been started!"));
