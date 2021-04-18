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

const graphHours = async (hours) => {
  const data = [];
  for (var hour in hours) {
    data.push({ name: hour + ":00", value: hours[hour] });
  }

  data.sort((a, b) => {
    return parseInt(a.name.slice(0, 2)) - parseInt(b.name.slice(0, 2));
  });

  return data;
};

module.exports = {
  async upload(req, res) {
    const data = req.files.file.data;
    const extractedUsernamesAndIps = await scripts.extractUsernamesAndIps(data);
    const extractedTime = await scripts.extractTime(data);

    const usernames = graphUsernames(extractedUsernamesAndIps[0]);
    const ips = graphIps(extractedUsernamesAndIps[1]);
    const countries = await graphCountries(ips);
    const hours = await graphHours(extractedTime);

    return res.send({
      usernames,
      ips,
      countries,
      hours,
    });
  },
};
