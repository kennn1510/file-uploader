const { Router } = require("express");
const router = Router();
const passport = require("passport");
const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");

const loginSanitizationRules = [
  body("email").trim().normalizeEmail(),
  body("password").trim(),
];

const loginValidationRules = [
  body("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email.")
    .custom(async (email) => {
      const user = await prisma.user.findUnique({
        where: { email: email },
      });
      if (!user) {
        throw new Error();
      }
    })
    .withMessage("No account associated with that email."),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number.")
    .matches(/[^a-zA-Z0-9\s]/) // Matches any non-alphanumeric, non-whitespace character
    .withMessage("Password must contain at special character."),
];

const validateLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("login", {
      errors: errors.array(),
      email: req.body.email,
    });
  }
  next();
};

router.get("/", (req, res, next) => {
  res.render("login");
});
router.post(
  "/",
  loginSanitizationRules,
  loginValidationRules,
  validateLogin,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

module.exports = router;
