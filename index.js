const express = require("express");
const fetch = require('node-fetch');

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

let dataArray = [];

setInterval(() => {
    updateData()
}, 10 * 1000)
updateData()

function updateData() {
    fetch('http://nestio.space/api/satellite/data')
        .then(response => response.json())
        .then(data => dataArray.push({ altitude: data.altitude, time: Date(data.last_updated) }))

    // let now = new Date()
    // now.setMinutes(now.getMinutes() - 5)
    // now = new Date(now);

    dataArray.filter(item => {
        newDate = new Date(item.time)
        newDate < (newDate.setMinutes(newDate.getMinutes() + 5))

        console.log(newDate, newDate.setMinutes(newDate.getMinutes() + 5))
    })
    console.log(dataArray)
}


app.get("/stats", async(req, res) => {
    const newArray = dataArray.map(obj => obj.altitude)

    const minimum = Math.min(...newArray);
    const maximum = Math.max(...newArray);
    const average = newArray.reduce((sum, value) => {
        return sum + value
    }, 0) / newArray.length

    const responseData = {
        minimum,
        maximum,
        average
    }
    res.send(JSON.stringify(responseData));
})

// Define a port and start listening for connections.
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));