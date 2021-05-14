const express = require("express");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const uploadRoutes = require("./routes/upload");

const port = process.env.PORT || 4000;
const app = express();
app.use(cors());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

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
app.use("/api/upload", uploadRoutes);

app.listen(port, () => {
  console.log(`Backend API listening at on port:${port}`);
});
