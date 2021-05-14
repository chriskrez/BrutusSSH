const express = require("express");
const router = express.Router();

const UploadController = require("../controllers/UploadController");

router.post("/", UploadController.upload);

router.post("/fetch_countries", UploadController.fetchCountries);

module.exports = router;
