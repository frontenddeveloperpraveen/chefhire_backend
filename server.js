const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chefapp";

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/bookings", require("./routes/bookings"));

app.get("/", (req, res) => {
  res.send("Chef Hiring App Backend Running");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
