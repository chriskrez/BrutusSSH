const express = require("express");
const router = express.Router();

const GraphController = require("../controllers/GraphController");

router.post("/upload", GraphController.upload);

module.exports = router;
