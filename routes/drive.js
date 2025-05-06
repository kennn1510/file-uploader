const { Router } = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const folderId = req.body.folderId; // Assuming folderId is sent in the form
    if (!folderId) {
      return cb(new Error("Folder ID is required"));
    }

    try {
      const folder = await prisma.folder.findFirst({
        where: { id: parseInt(folderId) },
      });
      if (!folder) {
        return cb(new Error("Folder not found"));
      }

      const uploadDir = folder.path; // Use the stored folder path
      await fs.mkdir(uploadDir, { recursive: true }); // Ensure it exists (should already, but good to check)
      cb(null, uploadDir);
    } catch (error) {
      console.error("Error finding folder for upload:", error);
      cb(error);
    }
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

router.get("/", async (req, res) => {
  res.render("drive", { userFolders: await prisma.folder.findMany() });
});

router.post("/folder", async (req, res) => {
  const { folder_name } = req.body; // It gets extracted out

  try {
    // Check if a folder with the same name already exists in the database
    const existingFolder = await prisma.folder.findFirst({
      where: { name: folder_name },
    });

    // Fetch all user folders to re-render the drive view
    let userFolders = await prisma.folder.findMany();

    if (existingFolder) {
      return res.render("drive", {
        msg: "Folder name already in use.",
        userFolders: userFolders,
      });
    }

    // Define the path for the new folder on the file system
    // You might want to base this on a root directory for user files
    const basePath = path.join(__dirname, "../user_uploads"); // Example root
    const folderPath = path.join(basePath, folder_name);

    // Create the directory on the file system
    await fs.mkdir(folderPath, { recursive: true });

    // Create the folder record in the database
    const newFolder = await prisma.folder.create({
      data: {
        name: folder_name,
        path: folderPath, // Store the file system path in the database
      },
    });

    userFolders = await prisma.folder.findMany();

    res.render("drive", {
      msg: `Folder "${folder_name}" created successfully!`,
      userFolders: userFolders,
      newFolder: newFolder,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.render("drive", {
      msg: "Failed to create folder.",
      userFolders: await prisma.folder.findMany(), // Ensure folders are still displayed
    });
  }
});

router.post("/upload", upload.single("uploaded_file"), async (req, res) => {
  if (!req.file) {
    return res.render("drive", {
      failureMessage: `Cannot upload nothing.`,
      userFolders: await prisma.folder.findMany(),
    });
  }
  console.log(req.file);
  console.log(req.body);
  res.render("drive", {
    successMessage: `Successfully uploaded file to ${req.file.destination}`,
    userFolders: await prisma.folder.findMany(),
  });
});

module.exports = router;
