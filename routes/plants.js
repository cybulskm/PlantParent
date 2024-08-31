const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const dataBase = require("../database.js");
const db = dataBase.db;

// Middleware
router.use(bodyParser.urlencoded({ extended: true }));

// Multer Configuration for File Upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// Helper Function to Unlink Picture
async function unlinkPicture(src) {
  try {
    const path = "./public/" + src;
    fs.unlink(path, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("File deleted");
      }
    });
  } catch (error) {
    console.log(error);
  }
}

// GET: Plant Index
router.get("/plant/index", async (req, res) => {
  console.log("GET: Plants index");
  try {
    const plants = await dataBase.GetAll("Plants");
    res.render("plant/index.html", {
      plant_list: plants || [],
      message: plants.length ? "" : "No plants found",
    });
  } catch (err) {
    console.log(err.message);
    res.render("plant/index.html", {
      plant_list: [],
      message: "Error retrieving plants",
    });
  }
});

// GET: Plant Create
router.get("/plant/create", (req, res) => {
  console.log("GET: Create Plant");
  res.render("plant/create.html");
});

// POST: Plant Create
router.post("/plant/create", upload.single("file"), (req, res) => {
  console.log("POST: Create plant");
  if (req.file) {
    req.body.img = "/images/" + req.file.filename;
    console.log("Uploaded: ", req.file.filename);
  } else {
    req.body.img = "";
    console.log("No file uploaded.");
  }
  dataBase.AddObject(req.body, "Plants");
  res.redirect("/plant/index");
});

// POST: Edit Plant
router.post("/plant/edit", upload.single("file"), async (req, res) => {
  console.log("POST: Edit plant");

  if (req.file) {
    req.body.img = "/images/" + req.file.filename;
    console.log("Uploaded: ", req.file.filename);
  } else {
    const plant = await dataBase.GetObjByid("Plants", req.body.id);
    req.body.img = plant?.img || "undefined";
    console.log("Using existing image: ", req.body.img);
  }

  dataBase.EditObject(req.body, "Plants");
  res.redirect("/plant/index");
});

// POST: Delete Plant
router.post("/plant/delete/:id", async (req, res) => {
  const id = req.params.id;
  console.log("POST: Delete Plant: " + id);

  try {
    const plant = await dataBase.GetObjByid("Plants", id);
    if (!plant) {
      console.log("Plant not found");
      return res.redirect("/plant/index");
    }

    
    if (plant.img && plant.img !== "undefined") {
      await unlinkPicture(plant.img);
    }
    await dataBase.DeleteObjById("Plants", id);
    await dataBase.DeleteObjByCol("plantId", id, "Notes");
    const plants = await dataBase.GetAll("Plants");
    res.render("plant/index.html", {
      message: `Plant: ${plant.name} deleted successfully!`,
      plant_list: plants,
    });
  } catch (err) {
    console.log("Error deleting plant: ", err);
    res.redirect("/plant/index");
  }
});

// POST: Delete All Plants
router.post("/plant/clear", async (req, res) => {
  console.log("Clear Plants database called");
  try {
    const plants = await dataBase.GetAll("Plants");
    const cleared = false;
    for (const plant of plants) {
      if (plant.img && plant.img !== "undefined") {
        await unlinkPicture(plant.img);
      }
      cleared = await dataBase.DeleteObjById(plant.id, "Plants");
      cleared = await dataBase.DeleteObjByCol("plantId", plant.id, "Notes");
    }
        res.render("plant/index.html", {
      message: cleared ? "Plants cleared" : "Failed to clear plants",
      plant_list: [],
    });
  } catch (err) {
    console.log("Error clearing plants: ", err);
    res.redirect("/plant/index");
  }
});

module.exports = router;
