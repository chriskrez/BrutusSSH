const axios = require("axios");
const async = require("async");

const extractCaptureGroups = (file) => {
  var failedMatchingCaptureGroups = [];
  var successResults = [];

  var failedHours = [];
  var failedUsernames = [];
  var failedIps = [];

  var regexpFail = new RegExp(
    ".* (\\d{2}):(\\d{2}):(\\d{2}) .* Failed password for(?: invalid user)? (.+) from (\\d+\\.\\d+\\.\\d+\\.\\d+).*"
  );

  var regexpSuccess = new RegExp(
    "(\\w*) (\\d+) (\\d{2}:\\d{2}:\\d{2}) .* Accepted (.+) for (.+) from (\\d+\\.\\d+\\.\\d+\\.\\d+).*"
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

  var firstDateMatch = firstLine.match(new RegExp("(\\w*) (\\d+) "))[0].trim();
  var lastDateMatch = lastLine.match(new RegExp("(\\w*) (\\d+) "))[0].trim();
  var dateRange = [firstDateMatch, lastDateMatch];

  lines.forEach((line) => {
    if (line.match(regexpFail)) {
      const match = line.match(regexpFail);
      var failedHour = match[1];
      var failedUsername = match[4];
      var failedIp = match[5];

      failedHours.push(failedHour);
      failedUsernames.push(failedUsername);
      failedIps.push(failedIp);
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

  return [failedMatchingCaptureGroups, successResults, dateRange];
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

const graphCountries = async (ips) => {
  var countries = {};

  var keys = Object.keys(ips);
  var iterations = Math.ceil(keys.length / 100);

  for (var i = 0; i < iterations; i++) {
    var sliced = keys.slice(100 * i, Math.min(100 * (i + 1), keys.length));

    var req = [];
    sliced.forEach((ip) => {
      req.push({ query: ip, fields: "country,query" });
    });

    let res = await axios.post("http://ip-api.com/batch", req);
    res.data.forEach((q) => {
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

  return data.slice(0, 10);
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
    const failedCaptureGroups = extractedData[0];
    const successResults = extractedData[1];
    const dateRange = extractedData[2];

    if (failedCaptureGroups[1].length === 0) {
      return res.send({
        error: true,
      });
    }

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

        const countries = await graphCountries(results[2][0]);

        return res.send({
          hours: results[0],
          usernames: results[1][0],
          ips: results[2][1],
          countries,
          attempts: results[1][1],
          success: successResults,
          dateRange,
        });
      }
    );
  },
};
