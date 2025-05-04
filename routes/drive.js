const { Router } = require("express");
const router = Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
});

module.exports = router;
