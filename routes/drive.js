const { Router } = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

const userFolders = {};

router.get("/", (req, res) => {
  res.render("drive", { userFolders: userFolders });
});

router.post("/folder", (req, res) => {
  if (req.body.folder_name in userFolders) {
    res.render("drive", {
      msg: "Folder name already in use.",
      userFolders: userFolders,
    });
  } else {
    userFolders[req.body.folder_name] = [];
    res.render("drive", { userFolders: userFolders });
  }
});

router.post("/upload", upload.single("uploaded_file"), (req, res) => {
  console.log(req.file);
  console.log(req.body);
  res.send("Success!");
});

module.exports = router;
