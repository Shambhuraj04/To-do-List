import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function getList() {
  const result = await db.query("SELECT * FROM list ORDER BY id ASC");
  const items = result.rows;
  return items;
}

app.get("/", async (req, res) => {
  const items = await getList();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query("INSERT INTO list(title) VALUES ($1)", [item]);

  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const updatedId = req.body.updatedItemId;
  const updatedTitle = req.body.updatedItemTitle;
  await db.query("UPDATE list SET title = $1 WHERE id = $2", [
    updatedTitle,
    updatedId,
  ]);

  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const deleteId = req.body.deleteItemId;
  await db.query("DELETE FROM list WHERE id = $1", [deleteId]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
