const scripts = require("../scripts/extractData.js");

const graphUsernames = (usernames) => {
  const data = [];
  for (var username in usernames) {
    data.push({ name: username, value: usernames[username] });
  }

  data.sort((a, b) => {
    return b.value - a.value;
  });

  return data.slice(0, 10);
};

const graphIps = (ips) => {
  const data = [];
  for (var ip in ips) {
    data.push({ name: ip, value: ips[ip] });
  }

  data.sort((a, b) => {
    return b.value - a.value;
  });

  return data.slice(0, 10);
};

const graphCountries = async (ips) => {
  const countries = await scripts.extractCountries(ips);
  const data = [];

  for (var obj in countries) {
    data.push({ name: obj, value: countries[obj] });
  }

  data.sort((a, b) => {
    return b.value - a.value;
  });

  return data.slice(0, 10);
};

module.exports = {
  async upload(req, res) {
    const data = req.files.file.data;
    const results = await scripts.extractUsernamesAndIps(data);
    const usernames = graphUsernames(results[0]);
    const ips = graphIps(results[1]);
    const countries = await graphCountries(ips);

    return res.send({
      usernames,
      ips,
      countries,
    });
  },
};
