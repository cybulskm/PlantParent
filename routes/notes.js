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
// GET: Note Index
router.get("/note/index", async (req, res) => {
  console.log("GET: Notes Index");
  try {
    const notes = await dataBase.GetAll("Notes");
    const plants = await dataBase.GetAll("Plants");

    const soils = await dataBase.GetAll("Soil");

    res.render("note/index.html", {
      note_list: notes || [],
      plant_list: plants || [],
      soil_compositions: soils || [],
      message: notes.length ? "" : "No notes found",
    });
  } catch (err) {
    console.log(err.message);
    res.render("note/index.html", {
      note_list: [],
      plant_list: [],
      soil_compositions: soil_compositions || [],
      message: "Error retrieving notes",
    });
  }
});

// GET: Note Index by Plant ID
router.get("/note/index/:id", async (req, res) => {
  const id = req.params.id;
  console.log("GET: Note Index/id:", id);

  if (id) {
    try {
      const notes = await db.all(`SELECT * FROM Notes WHERE plantId = ${id}`);
      const plant = await dataBase.GetObjByid("Plants", id);
      const plant_list = await dataBase.GetAll("Plants");
      const soils = await dataBase.GetAll("Soil");

      if (notes && plant) {
        return res.render("note/index.html", {
          note_list: notes,
          plant: plant,
          plant_list: plant_list,
          soil_compositions: soils,
        });
      }
    } catch (err) {
      console.log("Error fetching notes or plant: ", err.message);
    }
  }

  console.log("No notes found or invalid plant ID");
  res.render("note/index.html", {
    note_list: [],
    plant_list: [],
    soil_compositions: [],
    message: "Error: No notes found",
  });
});

// GET: Create Note
router.get("/note/create", async (req, res) => {
  console.log("Redirect to create note");
  const plant_list = (await dataBase.GetAll("Plants")) || [];
  if (plant_list.length == 0) {
    res.render("plant/index.html", {
      plant_list: [],
      message: "You can't add a note right now, you must add a plant first",
    });
  } else {
    res.render("note/create.html", { plant_list });
  }
});
router.post("/note/create", upload.single("img"), async (req, res) => {
  console.log("POST: Create note");

  // Handle image upload
  if (req.file) {
    req.body.img = "/images/" + req.file.filename;
    console.log("Uploaded: ", req.file.filename);
  } else {
    req.body.img = "";
    console.log("No file uploaded.");
  }

  // Extract note details (everything except soil composition)
  const noteData = {
    plantId: req.body.plantId,
    img: req.body.img,
    Title: req.body.Title,
    Date: req.body.Date,
    Height: req.body.Height,
    Description: req.body.Description,
  };

  // Insert note details into the Notes table
  await dataBase.AddObject(noteData, "Notes");
  const lastnote = await dataBase.GetObjByLastRow("Notes");
  const noteId = lastnote.id;

  // Handle soil composition data (multiple rows)
  const ingredients = Array.isArray(req.body.Ingredient)
    ? req.body.Ingredient
    : [req.body.Ingredient];
  const weights = Array.isArray(req.body.Weight)
    ? req.body.Weight
    : [req.body.Weight];
  const n_values = Array.isArray(req.body.N) ? req.body.N : [req.body.N];
  const p_values = Array.isArray(req.body.P) ? req.body.P : [req.body.P];
  const k_values = Array.isArray(req.body.K) ? req.body.K : [req.body.K];
  console.log("!!!!CALLED!!!!");
  console.log(ingredients.length);
  console.log(ingredients);
  console.log(req.body.Ingredient);
  if (
    ingredients.length > 0 &&
    weights.length > 0 &&
    n_values.length > 0 &&
    p_values.length > 0 &&
    k_values.length > 0
  ) {
    for (let i = 0; i < ingredients.length; i++) {
      const soilCompositionData = {
        noteId: noteId, // Associate soil composition with the note
        Ingredient: ingredients[i],
        Weight: weights[i],
        N: n_values[i],
        P: p_values[i],
        K: k_values[i],
      };
      // Insert each soil composition row into the Soil table
      await dataBase.AddObject(soilCompositionData, "Soil");
      console.log("Soil composition row added:", soilCompositionData);
    }
  }

  // Redirect after submission
  res.redirect("/note/index");
});

// POST: Delete Note
router.post("/note/delete/:id", async (req, res) => {
  const id = req.params.id;
  console.log("POST: Delete Note:", id);

  if (id) {
    try {
      const success = await dataBase.DeleteObjById(id, "Notes");
      if (success) {
        console.log("Note deleted successfully");
        return res.redirect("/note/index");
      }
      throw new Error("Failed to delete note");
    } catch (err) {
      console.log(err.message);
    }
  } else {
    console.log("Note ID does not exist");
  }

  res.redirect("/note/index");
});

// POST: Edit Note
router.post("/note/edit", async (req, res) => {
  console.log("POST: Edit note", req.body);
  try {
    await dataBase.EditObject(req.body, "Notes");
  } catch (err) {
    console.log("Error editing note: ", err.message);
  }
  res.redirect("/note/index");
});

// POST: Clear All Notes
router.post("/note/clear", async (req, res) => {
  console.log("Clear Notes database called");
  try {
    const success = await dataBase.ClearAll("Notes");
    console.log(
      success ? "Note database cleared" : "Note database not cleared",
    );
  } catch (err) {
    console.log("Error clearing notes: ", err.message);
  }
  res.redirect("/note/index");
});

// POST: Clear All Notes
router.post("/soil/clear", async (req, res) => {
  console.log("Clear Soil database called");
  try {
    const success = await dataBase.ClearAll("Soil");
    console.log(
      success ? "Soil database cleared" : "Soil database not cleared",
    );
  } catch (err) {
    console.log("Error clearing notes: ", err.message);
  }
  res.redirect("/note/index");
});

module.exports = router;
