require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use(require("./routes/performers"));
app.use(require("./routes/shows"));
app.use(require("./routes/castLists"));
app.use(require("./routes/roles"));
app.use(require("./routes/users"));

// catch-all: must stay last
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
