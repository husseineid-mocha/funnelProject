const assert = require('assert');

const { getHealth } = require('../index.js')

const startTime = new Date("2021-06-14T14:35:30");

function generateTestData(altitudes) {
    return altitudes.map(altitude => {
        startTime.setSeconds(startTime.getSeconds() + 10);
        return {
            altitude,
            time: startTime.toISOString()
        }
    })
}

describe('getHealth', function() {
    it('should return A-OK if average altitude is over 160km', function() {
        const testData = generateTestData(Array.from({ length: 12 }, () => 178));
        assert.equal(getHealth(testData), 'Altitude is A-OK');
    });

    it('should return WARNING if average altitude is less  160km', function() {
        const testData = generateTestData(Array.from({ length: 12 }, () => 128));
        assert.equal(getHealth(testData), 'WARNING: RAPID ORBITAL DECAY IMMINENT');
    });

    it('should return Sustained if average altitude is less  160km but now above', function() {
        const testData = generateTestData([...Array.from({ length: 6 }, () => 128), ...Array.from({ length: 6 }, () => 187)]);
        assert.equal(getHealth(testData), 'Sustained Low Earth Orbit Resumed');
    });
});