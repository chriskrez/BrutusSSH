const axios = require("axios");

module.exports = {
  async extractUsernamesAndIps(file) {
    var regexp = new RegExp(
      "Failed password for(?: invalid user)? (.+) from (\\d+\\.\\d+\\.\\d+\\.\\d+).*"
    );

    var usernames = {};
    var ips = {};

    file = file.toString();
    const lines = file.split(/\r?\n/);
    lines.forEach((line) => {
      if (line.match(regexp)) {
        match = line.match(regexp);
        var user = match[1];
        var ip = match[2];

        if (usernames[user]) {
          var oldValue = usernames[user];
          usernames[user] = oldValue + 1;
        } else {
          usernames[user] = 1;
        }

        if (ips[ip]) {
          var oldValue = ips[ip];
          ips[ip] = oldValue + 1;
        } else {
          ips[ip] = 1;
        }
      }
    });

    return [usernames, ips];
  },

  async extractCountries(ips) {
    var result = {};
    for (ip in ips) {
      const record = ips[ip];
      let res = await axios.get(
        "http://www.geoplugin.net/json.gp?ip=" + record.name
      );
      var country = res.data.geoplugin_countryName;
      if (result[country]) {
        var oldValue = result[country];
        result[country] = oldValue + record.value;
      } else {
        result[country] = record.value;
      }
    }

    return result;
  },

  async extractTime(file) {
    var regexp = new RegExp(
      ".* (\\d{2}):(\\d{2}):(\\d{2}) .* Failed password for .*"
    );
    var result = {};

    file = file.toString();
    const lines = file.split(/\r?\n/);
    lines.forEach((line) => {
      if (line.match(regexp)) {
        match = line.match(regexp);
        var hour = match[1];

        if (result[hour]) {
          result[hour] += 1;
        } else {
          result[hour] = 1;
        }
      }
    });

    return result;
  },
};
