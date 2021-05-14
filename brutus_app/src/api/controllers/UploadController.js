const axios = require("axios");
const async = require("async");
const dateFormat = require("dateformat");

const extractCaptureGroups = (file) => {
  var failedMatchingCaptureGroups = [];
  var successResults = [];

  var failedHours = [];
  var failedUsernames = [];
  var failedIps = [];

  var regexpFail = new RegExp(
    "(\\w*) \\s*(\\d+) (\\d{2}):(\\d{2}):(\\d{2}) .* Failed password for(?: invalid user)? (.+) from (\\d+\\.\\d+\\.\\d+\\.\\d+).*"
  );

  var regexpSuccess = new RegExp(
    "(\\w*) \\s*(\\d+) (\\d{2}:\\d{2}:\\d{2}) .* Accepted (.+) for (.+) from (\\d+\\.\\d+\\.\\d+\\.\\d+).*"
  );

  file = file.toString();
  const lines = file.split(/\r?\n/);
  const firstLine = lines.shift();

  var lastLine = "";
  var index = -1;
  do {
    lastLine = lines.slice(index)[0];
    index -= 1;
  } while (lastLine === "");

  if (firstLine === undefined || lastLine === undefined) {
    return;
  }

  var firstDateMatch = "";
  var lastDateMatch = "";

  if (firstLine.match(new RegExp("(\\w*) \\s*(\\d+)"))) {
    firstDateMatch = firstLine.match(new RegExp("(\\w*) \\s*(\\d+)"))[0].trim();
  }

  if (lastLine.match(new RegExp("(\\w*) \\s*(\\d+)"))) {
    lastDateMatch = lastLine.match(new RegExp("(\\w*) \\s*(\\d+)"))[0].trim();
  }

  var dateRange = [firstDateMatch, lastDateMatch];

  var tfattempts = 0;
  var now = new Date();

  lines.forEach((line) => {
    if (line.match(regexpFail)) {
      const match = line.match(regexpFail);
      var failedHour = match[3];
      var failedUsername = match[6];
      var failedIp = match[7];

      failedHours.push(failedHour);
      failedUsernames.push(failedUsername);
      failedIps.push(failedIp);

      if (dateFormat(now, "mmm d") === match[1] + " " + match[2]) {
        tfattempts += 1;
      }
    } else if (line.match(regexpSuccess)) {
      const match = line.match(regexpSuccess);
      var successParams = {};

      successParams["date"] = match[1] + " " + match[2] + " " + match[3];
      successParams["method"] = match[4];
      successParams["username"] = match[5];
      successParams["ip"] = match[6];

      successResults.push(successParams);
    }
  });

  failedMatchingCaptureGroups.push(failedHours);
  failedMatchingCaptureGroups.push(failedUsernames);
  failedMatchingCaptureGroups.push(failedIps);

  return [failedMatchingCaptureGroups, successResults, dateRange, tfattempts];
};

const graphUsernames = (usernames) => {
  var attempts = usernames.length;
  var countedUsernames = {};

  usernames.forEach((user) => {
    if (countedUsernames[user]) {
      countedUsernames[user] += 1;
    } else {
      countedUsernames[user] = 1;
    }
  });

  const data = [];
  for (var username in countedUsernames) {
    data.push({ name: username, value: countedUsernames[username] });
  }

  data.sort((a, b) => {
    return b.value - a.value;
  });

  var results = [data.slice(0, 10), attempts];
  return results;
};

const graphIps = (ips) => {
  var countedIps = {};

  ips.forEach((ip) => {
    if (countedIps[ip]) {
      var oldValue = countedIps[ip];
      countedIps[ip] = oldValue + 1;
    } else {
      countedIps[ip] = 1;
    }
  });

  const data = [];
  for (var ip in countedIps) {
    data.push({ name: ip, value: countedIps[ip] });
  }

  data.sort((a, b) => {
    return b.value - a.value;
  });

  return [countedIps, data.slice(0, 10)];
};

const graphHours = (hours) => {
  var countedHours = {};

  hours.forEach((hour) => {
    if (countedHours[hour]) {
      countedHours[hour] += 1;
    } else {
      countedHours[hour] = 1;
    }
  });

  const data = [];
  for (var hour in countedHours) {
    data.push({ name: hour + ":00", value: countedHours[hour] });
  }

  data.sort((a, b) => {
    return parseInt(a.name.slice(0, 2)) - parseInt(b.name.slice(0, 2));
  });

  return data;
};

module.exports = {
  async upload(req, res) {
    const data = req.files.file.data;

    const extractedData = extractCaptureGroups(data);
    if (extractedData === undefined) {
      return res.send({
        error: "No matching login attempt. Please try another file!",
      });
    }

    const failedCaptureGroups = extractedData[0];
    const successResults = extractedData[1];
    const dateRange = extractedData[2];
    const tfattempts = extractedData[3];

    async.parallel(
      [
        function (callback) {
          callback(null, graphHours(failedCaptureGroups[0]));
        },
        function (callback) {
          callback(null, graphUsernames(failedCaptureGroups[1]));
        },
        function (callback) {
          callback(null, graphIps(failedCaptureGroups[2]));
        },
      ],
      async function (err, results) {
        if (err) {
          return res.send({
            error: true,
          });
        }

        return res.send({
          hours: results[0],
          usernames: results[1][0],
          ips: results[2][1],
          countedIps: results[2][0],
          attempts: results[1][1],
          success: successResults,
          dateRange,
          tfattempts,
        });
      }
    );
  },

  async fetchCountries(req, res) {
    var ips = req.body;
    var countries = {};

    var keys = Object.keys(ips);
    var iterations = Math.ceil(keys.length / 100);

    for (var i = 0; i < iterations; i++) {
      var sliced = keys.slice(100 * i, Math.min(100 * (i + 1), keys.length));

      var request = [];
      sliced.forEach((ip) => {
        request.push({ query: ip, fields: "country,query" });
      });

      let response = await axios.post("http://ip-api.com/batch", request);
      response.data.forEach((q) => {
        var country = q.country;
        var ip = q.query;

        if (countries[country]) {
          countries[country] += ips[ip];
        } else {
          countries[country] = ips[ip];
        }
      });
    }

    const data = Object.keys(countries).map((country) => ({
      name: country,
      value: countries[country],
    }));

    data.sort((a, b) => {
      return b.value - a.value;
    });

    return res.send({
      countries: data.slice(0, 10),
    });
  },
};
