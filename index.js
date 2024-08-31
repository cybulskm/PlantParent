const path = require("path");
const express = require("express");
const app = express();

//Imported functions
const dataBase = require(__dirname + "/database.js");
const plantRouter = require("./routes/plants");
const noteRouter = require("./routes/notes");
const miscRouter = require("./routes/misc");

//Database import
const db = dataBase.db;

// Require static assets from public folder
app.use(express.static(path.join(__dirname, "public")));

// Set 'views' directory for any views
// being rendered res.render()
app.set("views", path.join(__dirname, "views"));

// Set view engine as EJS
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.get("/", (req, res) => {
  console.log("Redirect to index");
  res.sendFile("/public/index.html", { root: __dirname });
});

//PLANTS ROUTER
app.get("/plant/index", plantRouter);
app.get("/plant/create", plantRouter);
app.post("/plant/create", plantRouter);
app.post("/plant/delete/:Id", plantRouter);
app.post("/plant/edit", plantRouter);
app.post("/plant/clear", plantRouter);

//NOTES ROUTER
app.get("/note/index", noteRouter);
app.get("/note/index/:Id", noteRouter);
app.get("/note/create", noteRouter);
app.post("/note/create", noteRouter);
app.post("/note/delete/:Id", noteRouter);
app.post("/note/edit", noteRouter);
app.post("/note/clear", noteRouter);
app.post("/soil/clear", noteRouter);

app.get("/misc/newcontent", miscRouter);
app.get("/misc/tutorial", miscRouter);

app.listen(8080);
console.log("App listening on port 8080");
