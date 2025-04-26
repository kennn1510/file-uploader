require("dotenv").config();
const express = require("express");
const app = express();
const { PrismaClient } = require("./generated/prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  const user = await prisma.user.createMany({
    data: [
      {
        name: "Ken",
        email: "ken@test.com",
        age: 23,
      },
      {
        name: "Sally",
        email: "sally@test.com",
        age: 32,
      },
    ],
  });

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
