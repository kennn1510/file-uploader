const { Router } = require("express");
const router = Router();
const passport = require("passport");
const { body, validationResult } = require("express-validator");

const loginSanitizationRules = [
  body("username").trim().escape(),
  body("password").trim(),
];

const loginValidationRules = [
  body("username")
    .notEmpty()
    .withMessage("Username is required.")
    .isEmail()
    .withMessage("Invalid username."),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be a minimum of 8 characters"),
];

const validateLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("login", { errors: errors.array(), values: req.body });
  }
};

router.get("/", (req, res, next) => {
  res.render("login", { messages: req.session.messages });
  req.session.messages = [];
});
router.post(
  "/",
  loginSanitizationRules,
  loginValidationRules,
  validateLogin,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true, // oh ho, I won't need this anymore because I have express validator above ohhhhh, gotta do it later. my brain is fried.
  })
);

module.exports = router;
