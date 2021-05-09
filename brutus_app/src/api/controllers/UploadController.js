const axios = require("axios");

const extractCaptureGroups = (file) => {
  var matchingCaptureGroups = [];
  var hours = [];
  var usernames = [];
  var ips = [];

  var regexp = new RegExp(
    ".* (\\d{2}):(\\d{2}):(\\d{2}) .* Failed password for(?: invalid user)? (.+) from (\\d+\\.\\d+\\.\\d+\\.\\d+).*"
  );

  file = file.toString();
  const lines = file.split(/\r?\n/);
  lines.forEach((line) => {
    if (line.match(regexp)) {
      const match = line.match(regexp);
      var hour = match[1];
      var username = match[4];
      var ip = match[5];

      hours.push(hour);
      usernames.push(username);
      ips.push(ip);
    }
  });

  matchingCaptureGroups.push(hours);
  matchingCaptureGroups.push(usernames);
  matchingCaptureGroups.push(ips);

  return matchingCaptureGroups;
};

const graphUsernames = (usernames) => {
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

  return data.slice(0, 10);
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
    const captureGroups = extractCaptureGroups(data);

    if (captureGroups[1].length === 0) {
      return res.send({
        error: true,
      });
    }

    const hours = graphHours(captureGroups[0]);
    const usernames = graphUsernames(captureGroups[1]);

    const ipsResults = graphIps(captureGroups[2]);
    const ips = ipsResults[1];
    const countries = await graphCountries(ipsResults[0]);

    return res.send({
      usernames,
      ips,
      countries,
      hours,
    });
  },
};
