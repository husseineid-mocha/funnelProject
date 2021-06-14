const express = require("express");
const fetch = require('node-fetch');

const app = express();

// dataArray will store the values from the last 5 mins
let dataArray = [];

// the interval that will fetch the data every 10 secs
setInterval(() => {
    updateData()
}, 10 * 1000)

//initial load before the setInterval begins at second 10
updateData()

//function to retrieve the average of an array of integers
function averageFunction(array) {
    const average = array.reduce((sum, value) => {
        return sum + value
    }, 0) / array.length
    return average
}

function updateData() {
    fetch('http://nestio.space/api/satellite/data')
        .then(response => response.json())
        .then(data => dataArray.push({ altitude: data.altitude, time: data.last_updated }))
        .then(() => {
            const lastEntry = new Date(dataArray[dataArray.length - 1].time)
                //filter the dataArray by values that are less than 5 minutes old
            dataArray = dataArray.filter(item => {
                const instanceEntry = new Date(item.time)
                return lastEntry.getTime() - instanceEntry.getTime() < (300 * 1000)
            })
        })
}

app.get("/stats", async(req, res) => {
    const altitudes = dataArray.map(obj => obj.altitude)

    const minimum = Math.min(...altitudes);
    const maximum = Math.max(...altitudes);
    const average = averageFunction(altitudes)

    const responseData = {
        minimum,
        maximum,
        average
    }
    res.send(JSON.stringify(responseData));
})

function getHealth(dataArray) {
    const lastEntry = new Date(dataArray[dataArray.length - 1].time)

    // the array of values for one minute before the current minute
    const twoMinutesBefore = dataArray.filter(item => {
        const minuteTime = new Date(item.time)
        const time = lastEntry.getTime() - minuteTime.getTime()
        return time < 120 * 1000 && time >= 60 * 1000
    })

    // the array of values for the most current minute
    const oneMinuteBefore = dataArray.filter(item => {
        const minuteTime = new Date(item.time)
        return lastEntry.getTime() - minuteTime.getTime() < 60 * 1000
    })

    // the averages for the last minute and last two minutes
    const oneMinAverage = averageFunction(oneMinuteBefore.map(item => item.altitude))
    const twoMinAverage = averageFunction(twoMinutesBefore.map(item => item.altitude))

    if (oneMinAverage < 160) {
        return ('WARNING: RAPID ORBITAL DECAY IMMINENT')
    } else if (twoMinAverage < 160) {
        return ('Sustained Low Earth Orbit Resumed')
    } else {
        return ('Altitude is A-OK')
    }
}

app.get('/health', async(req, res) => {
    res.send(getHealth(dataArray))
})

// Define a port and start listening for connections.
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = { getHealth: getHealth }