const { Router } = require("express");
const router = Router();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");

const userSanitizationRules = [
  body("email").trim().normalizeEmail(),
  body("password").trim(),
  body("confirmpassword").trim(),
];

const userValidationRules = [
  body("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email.")
    .custom(async (email) => {
      const user = await prisma.user.findUnique({
        where: { email: email },
      });
      if (user) {
        throw new Error();
      }
    })
    .withMessage("Email already taken."),
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
  body("confirmpassword")
    .notEmpty()
    .withMessage("Confirm password is required.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Confirmation password does not match password.");
      }
      return true;
    }),
];

router.get("/", (req, res) => {
  res.render("signup");
});
router.post(
  "/",
  userSanitizationRules,
  userValidationRules,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signup", {
        errors: errors.array(),
        email: req.body.email,
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = await prisma.user.create({
        data: {
          email: req.body.email,
          password: hashedPassword,
        },
      });

      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;