require("dotenv").config();
const express = require("express");
const expressSession = require("express-session");
const { PrismaClient } = require("./generated/prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const path = require("path");
const passport = require("passport");
const homeRouter = require("./routes/home");
const loginRouter = require("./routes/login");
const signupRouter = require("./routes/signup");

const app = express();
const prisma = new PrismaClient();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: "my secret key",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, // ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
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
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// passport.serializeUser((user, done) => {
//   // might not be secure to have email here, just try being able to access the email
//   // should be able to access through req.user
//   return done(null, { id: user.id, email: user.email });
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//   } catch (error) {
//     done(error);
//   }
// });

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      email: user.email,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

async function main() {
  const user = await prisma.user.findMany();

  console.log(user);
}

main()
  .catch((e) => {
    console.error(e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

app.use("/", homeRouter);
app.use("/login", loginRouter);
app.use("/signup", signupRouter);

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`);
});
