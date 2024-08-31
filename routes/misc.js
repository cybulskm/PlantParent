const express = require("express");
const router = express.Router();

// GET: Plant Index
router.get("/misc/newcontent", (req, res) => {
  console.log("GET: Misc new content");
  res.render("misc/newcontent.html", {});
});

router.get("/misc/tutorial", (req, res) => {
  console.log("GET: Misc tutorial");
  res.render("misc/tutorial.html", {});
});

module.exports = router;
