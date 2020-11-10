const express = require("express");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");

const graphRoutes = require("./routes/graph");

const port = 4000;
const app = express();

// Logging
morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});

morgan.token("ip", (req, res) => {
  return req.ip.split(":").pop();
});

const logFormat =
  process.env.NODE_ENV == "production"
    ? "[:date[web]] :ip :method :url :status"
    : "[:date[web]] :ip :method :url :status :body";

const unwantedLogs = ["/favicon.ico"];
app.use(
  morgan(logFormat, {
    skip: (req) => {
      return unwantedLogs.some((word) => req.url.startsWith(word));
    },
  })
);

app.use(fileUpload());

// Routes
app.use("/api/graphs", graphRoutes);

app.listen(port, () => {
  console.log(`Backend API listening at on port:${port}`);
});