const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Define a port and start listening for connections.
const port = 3000;

app.listen(port, () => console.log(`Listening on port ${port}...`));