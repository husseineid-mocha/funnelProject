const express = require("express");
const fetch = require('node-fetch');

const app = express();

let dataArray = []; // needed to store the data from the last 5 mins

setInterval(() => { // the interval that will fetch the data every 10 secs
    updateData()
}, 10 * 1000)
updateData() // needed so we have an initial load before the setInterval begins at second 10

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
    let averageValue

    let dataArrayHealth = dataArray.filter(item => { //array that contains last two minutes worth of altitudes
        let minuteTime = new Date(item.time)
        let lastEntry = new Date(dataArray[dataArray.length - 1].time)
        return lastEntry.getTime() - minuteTime.getTime() < 120000
    })

    function averageFunction(array) { // function to average array
        let mappedArray = array.map(obj => obj.altitude)
        const average = mappedArray.reduce((sum, value) => {
            return sum + value
        }, 0) / mappedArray.length
        return average
    }

    function lastMinuteFilter(filterArray) { // array to filter the last minute
        filterArray = filterArray.filter(item => {
            let minuteTime = new Date(item.time)
            let lastEntry = new Date(filterArray[filterArray.length - 1].time)
            return lastEntry.getTime() - minuteTime.getTime() < 60000
        })
        return filterArray
    }

    let message

    averageValue = averageFunction(lastMinuteFilter(dataArrayHealth))
    message = 'Altitude is A-OK' // baseline message
    if (averageValue < 160) { // if average value is less than 160
        message = 'WARNING: RAPID ORBITAL DECAY IMMINENT'
    } else { // if greater than 160 we check the previous minute average excluding the last data point
        dataArrayHealthCopy = dataArrayHealth.slice(0) // need a copy otherwise we keep adding to the front of the array after the pop
        while (dataArrayHealthCopy.length > 6) {
            dataArrayHealthCopy.pop()
            oldAverageValue = averageFunction(lastMinuteFilter(dataArrayHealthCopy))
            if (oldAverageValue < 160) { // if that average is less than 160 then we were below 160 within the last minute
                message = 'Sustained Low Earth Orbit Resumed'
                break
            }
        }
    }

    let responseDataHealth = {
        message: message,
        average: averageValue,
        array: dataArrayHealth
    }

    res.send(JSON.stringify(responseDataHealth))
})

// Define a port and start listening for connections.
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));