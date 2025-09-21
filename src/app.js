require("dotenv").config();
const fileController = require("./controllers/fileController");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.set("trust proxy", true);
app.use(cors());
app.use(morgan("dev"));

const router = express.Router();

app.use(bodyParser.json());
app.use(router);

app.use("/", fileController);

router.get("/", (_, res) => {
  return res.json({ health: "ok" });
});

const PORT = 4000;

app.listen(PORT, async () => {
  console.log("🌍 server running on port: ", PORT);
});
