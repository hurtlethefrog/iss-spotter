const request = require('request');

const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', function(err, resp, body) {
    let ip = JSON.parse(body);
    if (err) {
      callback(err, null);
      return;
    } else if (resp.statusCode !== 200) {
      callback(resp.ststusCode, null);
      return;
    } else {
      callback(null, ip.ip);
    }
  });
};

const fetchCoordsByIP = function(IP, callback) {
  request(`https://ipvigilante.com/${IP}`, function(err, resp, body) {
    if (err) {
      callback(err, null);
      return;
    } else if (resp.statusCode !== 200) {
      callback(Error(`Status Code ${resp.statusCode} when fetching Coordinates for IP`), null);
      return;
    } else {
      let data = JSON.parse(body);
      let coords = {};
      coords.latitude = data.data.latitude
      coords.longitude = data.data.longitude
      callback(null, coords)
    }   
});
};

const fetchISSFlyOverTimes = function(coords, callback) {
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`, function(err, resp, body) {
    if (err) {
      callback(err, null);
      return;
    } else if (resp.statusCode !== 200) {
      const msg = `Status Code ${resp.statusCode} when fetching flyovers.`
      callback(Error(msg), null);
      return;
    } else {
      let objBody = JSON.parse(body);
      let times = {};
      times = objBody.response;
      callback(null, times)
    }
    })
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};


module.exports = { nextISSTimesForMyLocation };