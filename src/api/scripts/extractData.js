const fs = require("fs");
const axios = require("axios");

const extractOccurences = (discriminator, regexp, file) => {
  var occurences = {};
  file = file.toString();
  const lines = file.split(/\r?\n/);
  lines.forEach((line) => {
    if (line.includes(discriminator)) {
      if (line.match(regexp)) {
        var key = line.match(regexp)[1];
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
    var discriminator = "Invalid user";
    var regexp = new RegExp(discriminator + "\\s(\\w+)");
    var occurences = extractOccurences(discriminator, regexp, file);

    return occurences;
  },

  extractInvalidIps: (file) => {
    var discriminator = "Invalid user";
    var regexp = new RegExp("from\\s(\\w+.\\w+.\\w+.\\w+.)");
    var occurences = extractOccurences(discriminator, regexp, file);

    return occurences;
  },

  async extractCountries(ips) {
    var result = {};
    for (ip in ips) {
      const record = ips[ip];
      let res = await axios.get("http://www.geoplugin.net/json.gp?ip=" + record.name);
        var country = res.data.geoplugin_countryName;
        if(result[country]) {
          var oldValue = result[country];
          result[country] = oldValue + record.value;
        } else {
          result[country] = record.value;
        }
    }

    return result;
  }
};
