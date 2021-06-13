const express = require("express");
const fetch = require('node-fetch');

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/stats", async(req, res) => {
    const response = await fetch('http://nestio.space/api/satellite/data');
    const data = await response.json();
    console.log(data.altitude)

    res.send(data)
})

// Define a port and start listening for connections.
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));