const getPort = require("get-port");

if (!process.env.PORT) {
  (async () => {
    process.env["PORT"] = await getPort({
      port: getPort.makeRange(4000, 4200),
    });
    require("./init.js");
  })();
} else {
  require("./init.js");
}
