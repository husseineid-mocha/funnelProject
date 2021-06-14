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
    let dataArrayHealth = dataArray.filter(item => {
        let minuteTime = new Date(item.time)
        let lastEntry = new Date(dataArray[dataArray.length - 1].time)
        return lastEntry.getTime() - minuteTime.getTime() < 60000
    })

    const newArrayHealth = dataArrayHealth.map(obj => obj.altitude)

    const average = newArrayHealth.reduce((sum, value) => {
        return sum + value
    }, 0) / newArrayHealth.length

    let message
    let timeoutFlag

    function timer() {
        message = 'Sustained Low Earth Orbit Resumed'
        let count = 60
        return timer = setInterval(() => {
            console.log('hello')
            count--
            if (count <= 0) {
                timeoutFlag = false
                clearInterval(timer)
            }
            console.log(count)
        }, 10000)
    }

    if (average < 160) {
        message = 'WARNING: RAPID ORBITAL DECAY IMMINENT'
        timeoutFlag = true
        count = 60
    } else {
        timer()
            // if (timeoutFlag) {
            //     timer()
            // } else {
            //     message = 'Altitude is A-OK'
            // }
    }

    let responseDataHealth = {
        message: message,
        average: average,
        array: dataArrayHealth,
        flag: timeoutFlag
    }

    res.send(JSON.stringify(responseDataHealth))
})

// Define a port and start listening for connections.
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));