const { Router } = require("express");
const router = Router();

router.get("/", (req, res, next) => {
  res.render("signup");
});
router.post("/", (req, res, next) => {});

module.exports = router;
