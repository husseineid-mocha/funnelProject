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
        .then(data => dataArray.push({ altitude: data.altitude, time: data.last_updated }))

    if (dataArray[0]) {
        let instanceEntry = new Date(dataArray[0].time) // need to create instance of Date class for time manipulation
        let lastEntry = new Date(dataArray[dataArray.length - 1].time)
            // console.log(instanceEntry.getTime(), lastEntry.getTime())
            // console.log("SUBTRACT", lastEntry.getTime() - instanceEntry.getTime(), lastEntry.getTime() - instanceEntry.getTime() < 300000)
        if (lastEntry.getTime() - instanceEntry.getTime() > 300000) { // making sure the difference is less than 5 seconds
            dataArray.shift()
        }
    }
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

app.get('/health', async(req, res) => {
    res.send('hello world')
})

// Define a port and start listening for connections.
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));