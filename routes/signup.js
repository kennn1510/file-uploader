const { Router } = require("express");
const router = Router();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");

const userSanitizationRules = [
  body("username").trim().escape(),
  body("password").trim(),
  body("confirmpassword").trim(),
];

const userValidationRules = [
  body("username")
    .notEmpty()
    .isEmail()
    .withMessage("Username needs to be a valid email"),
  body("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Password must be a minimum of 8 characters"),
  body("confirmpassword")
    .notEmpty()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Confirmation password does not match password.");
      }
      return true;
    }),
];

router.get("/", (req, res, next) => {
  res.render("signup");
});
router.post(
  "/",
  userSanitizationRules,
  userValidationRules,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("signup", { errors: errors.array() });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = await prisma.user.create({
        data: {
          username: req.body.username,
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
  }
);

module.exports = router;
