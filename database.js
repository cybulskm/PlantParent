const sqlite3 = require("sqlite3").verbose();
const util = require("util");

// Database Connection
const db = ConnectToDatabase();

module.exports.db = db;

// Promisify db methods
db.all = util.promisify(db.all);
db.run = util.promisify(db.run);
db.each = util.promisify(db.each);

// Connect to Database and Initialize Tables
function ConnectToDatabase() {
  const db = new sqlite3.Database("./data/prod.sqlite", (err) => {
    if (err) {
      console.error("Database connection error:", err.message);
    } else {
      console.log("Connected to the plants database");
    }
  });

  db.serialize(() => {
    const createTables = [
      `CREATE TABLE IF NOT EXISTS Plants (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        img TEXT,
        Name TEXT,
        Strain TEXT,
        DatePlanted DATE,
        Yield INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS Notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        plantId INTEGER,
        img TEXT,
        Title TEXT,
        Description TEXT,
        Date DATE,
        Height INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS Soil (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        noteId INTEGER,
        Ingredient TEXT,
        Weight INTEGER,
        N INTEGER,
        P INTEGER,
        K INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS TableInput (
        TableName TEXT,
        Column TEXT,
        DataType TEXT
      )`,
    ];

    createTables.forEach((sql) => {
      db.prepare(sql).run().finalize();
    });
  });

  return db;
}

// Add Object to a Table
module.exports.AddObject = async function (values, table) {
  try {
    // Get column names from the table (excluding ID)
    const cols = (await GetColumns(table)).filter((col) => col !== "id");

    // Prepare an array to hold the valid values for insertion
    const sortedValues = cols.map((col) => {
      if (values[col] && values[col] !== "") {
        return `'${values[col]}'`; // If value is provided, wrap it in quotes
      } else {
        return "NULL"; // If value is missing or empty, use NULL
      }
    });

    // Join the column names and values into the SQL statement
    const sql = `INSERT INTO ${table} (${cols.join(",")}) VALUES (${sortedValues.join(",")})`;

    console.log("SQL Query:", sql);

    // Execute the SQL query
    await db.run(sql);
    console.log(`Row inserted into ${table}`);
    return true;
  } catch (error) {
    console.error("Error adding object:", error.message);
    return false;
  }
};

// Edit Object in a Table
module.exports.EditObject = async function (values, table) {
  try {
    const columns = await GetColumns(table);
    const id = values.Id;
    const updates = SortObject(values, columns)
      .map((val, idx) => `${columns[idx]} = '${val}'`)
      .filter((update) => !update.startsWith("id"))
      .join(",");

    const sql = `UPDATE ${table} SET ${updates} WHERE id = ${id}`;
    console.log(sql);

    await db.run(sql);
    console.log("Row updated");
    return true;
  } catch (error) {
    console.error("Error editing object:", error.message);
    return false;
  }
};

// Get Notes by Plant ID
module.exports.GetNotes = async function (plantId) {
  try {
    const sql = `SELECT * FROM Notes WHERE plantId = ${plantId}`;
    console.log(sql);
    const notes = await db.all(sql);
    return notes;
  } catch (err) {
    console.error("Error retrieving notes:", err.message);
    return [];
  }
};

// Clear All Entries in a Table
module.exports.ClearAll = async function (table) {
  try {
    const sql = `DELETE FROM ${table}`;
    await db.run(sql);
    console.log(`All rows deleted from ${table}`);
    return true;
  } catch (error) {
    console.error("Error clearing table:", error.message);
    return false;
  }
};

// Delete Object from Table
module.exports.DeleteObjById = async function (id, table) {
  try {
    const sql = `DELETE FROM ${table} WHERE id = ${id}`;
    console.log(sql);
    await db.run(sql);
    console.log(`Deleted rows with id: ${id} from ${table}`);
    return true;
  } catch (error) {
    console.error("Error deleting object:", error.message);
    return false;
  }
};

module.exports.DeleteObjByCol = async function (column, data, table) {
  try {
    const sql = `DELETE FROM ${table} WHERE ${column} = ${data}`;
    console.log(sql);
    await db.run(sql);
    console.log(`Deleted rows with ${column}: ${data} from ${table}`);
    return true;
  } catch (error) {
    console.error("Error deleting object:", error.message);
    return false;
  }
};

// Get All Entries from a Table
module.exports.GetAll = async function (table) {
  try {
    const sql = `SELECT * FROM ${table}`;
    console.log(sql);
    const rows = await db.all(sql);
    return rows;
  } catch (error) {
    console.error("Error retrieving all entries:", error.message);
    return [];
  }
};

// Get Object by ID from Table
module.exports.GetObjByid = async function (table, id) {
  try {
    const sql = `SELECT * FROM ${table} WHERE id = ${id} LIMIT 1`;
    console.log(sql);
    const rows = await db.all(sql);
    return rows[0] || null;
  } catch (error) {
    console.error("Error retrieving object by ID:", error.message);
    return null;
  }
};

module.exports.GetObjByLastRow = async function (table) {
  try {
    const sql = `SELECT * FROM ${table} ORDER BY id DESC LIMIT 1`;
    console.log(sql);
    const rows = await db.all(sql);
    return rows[0] || null;
  } catch (error) {
    console.error("Error retrieving object by ID:", error.message);
    return null;
  }
};

// Get Object by ID from Table
module.exports.GetObjByAttribute = async function (table, id, attribute) {
  try {
    const sql = `SELECT * FROM ${table} WHERE ${attribute} = ${id} LIMIT 1`;
    console.log(sql);
    const rows = await db.all(sql);
    return rows[0] || null;
  } catch (error) {
    console.error("Error retrieving object by ID:", error.message);
    return null;
  }
};

// Get Columns of a Table
async function GetColumns(table) {
  try {
    const sql = `PRAGMA table_info(${table})`;
    const columns = [];
    await db.each(sql, (err, row) => {
      if (err) {
        throw new Error(err.message);
      }
      columns.push(row.name);
    });
    return columns;
  } catch (error) {
    console.error("Error retrieving columns:", error.message);
    return [];
  }
}

// Sort Object Values Based on Columns
function SortObject(obj, cols) {
  const sortedObj = Array(cols.length).fill("");
  Object.entries(obj).forEach(([key, value]) => {
    const idx = cols.indexOf(key);
    if (idx > -1) {
      sortedObj[idx] = value;
    }
  });
  return sortedObj;
}
