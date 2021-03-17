const fs = require("fs");
const axios = require("axios");

const extractOccurences = (discriminators, regexp, file) => {
  var occurences = {};
  file = file.toString();
  const lines = file.split(/\r?\n/);
  lines.forEach((line) => {
    for (i = 0; i < discriminators.length; i++)
      if (line.includes(discriminators[i])) {
        if (line.match(regexp[i])) {
          var key = line.match(regexp[i])[1];
          if (occurences[key]) {
            var oldValue = occurences[key];
            occurences[key] = oldValue + 1;
          } else {
            occurences[key] = 1;
          }
        }
      }
  });

  return occurences;
};

module.exports = {
  extractUsernames: (file) => {
    var discriminators = ["Invalid user", "Failed password for"];
    var regexUser = new RegExp(discriminators[0] + "\\s(\\w+)");
    var regexRoot = new RegExp(discriminators[1] + "\\s(\\w+)");
    var regexp = [regexUser, regexRoot];
    var occurences = extractOccurences(discriminators, regexp, file);

    return occurences;
  },

  extractInvalidIps: (file) => {
    var discriminators = ["Invalid user", "Failed password for root"];
    var regexp = new RegExp("from\\s(\\w+.\\w+.\\w+.\\w+.)");
    var occurences = extractOccurences(discriminators, [regexp, regexp], file);

    return occurences;
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
};
