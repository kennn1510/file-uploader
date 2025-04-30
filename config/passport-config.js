const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      failureFlash: true,
    },
    async (username, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: {
            username: username,
          },
        });

        if (!user) {
          return done(null, false, {
            message:
              "There is no account associated with this email. Do you want to sign up?",
          });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

module.exports = passport;
