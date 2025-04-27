require("dotenv").config();
const express = require("express");
const expressSession = require("express-session");
const { PrismaClient } = require("./generated/prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const LocalStrategy = require("passport-local").LocalStrategy;
const bcrypt = require("bcryptjs");
const path = require("path");
const passport = require("passport");

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

passport.use(new LocalStrategy());

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

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`);
});
