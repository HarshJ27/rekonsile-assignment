import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import AuthenticateToken from "./Middlewares/AuthenticateToken.js";
import Users from "./Models/Users.js";

const app = express();
const PORT = process.env.PORT || 3000;
dotenv.config();

// app.use(express.json());
app.use(cors());

// Create a writable stream to log requests
const accessLogStream = fs.createWriteStream("./access.log", { flags: "a" });

// Middleware to log requests
app.use((req, res, next) => {
  const now = new Date().toISOString();
  const logEntry = `${now}: ${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : 'No request body'}\n`;
  console.log(logEntry);
  accessLogStream.write(logEntry);
  next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const refreshTokens = [];

// MONGO_DB setup
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.get("/", (req, res) => {
  res.send("Hello Rekonsile!!!");
});

// Signup route
app.post("/auth/signup", async (req, res, next) => {
  const { name, password } = req.body;

  // Check if name and password are provided
  if (
    !name ||
    !password ||
    typeof name !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ error: "Invalid name or password" });
  }

  const now = new Date().toISOString();
  const logEntry = `${now}: ${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : 'No request body'}\n`;
  console.log(logEntry);
  accessLogStream.write(logEntry);

  // Check if user already exists
  const studentUser = await Users.findOne({ name });

  if (studentUser) {
    return res.status(409).json({ message: "User already exist!!!" });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = new Users({
    name,
    password: hashedPassword,
  });

  await newUser.save();

  // Return success message
  res.status(201).json({ message: "User created successfully" });
  next();
});

// Login route
app.post("/auth/login", async (req, res, next) => {
  const { name, password } = req.body;

  const now = new Date().toISOString();
  const logEntry = `${now}: ${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : 'No request body'}\n`;
  console.log(logEntry);
  accessLogStream.write(logEntry);
//   next();

  // Find user by login
  const user = await Users.findOne({ name });
  if (!user) {
    return res.status(403).json({ message: "Invalid user name" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(403).json({ message: "Invalid password" });
  }

  // Check if user exists
  //   if (!user) {
  //     return res.status(403).json({ error: 'Invalid login or password' });
  //   }

  // Check if password is correct
  //   if (!bcrypt.compareSync(password, user.password)) {
  //     return res.status(403).json({ error: 'Invalid login or password' });
  //   }

  // Generate JWT tokens
  const accessToken = jwt.sign(
    { userId: user.id, name: user.name },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { userId: user.id, name: user.name },
    process.env.REFRESH_TOKEN_SECRET
  );

  // Store refresh token
  refreshTokens.push(refreshToken);

  // Return tokens
  res.json({ accessToken, refreshToken });
});

// Refresh token route
app.post("/auth/refresh", (req, res, next) => {
  const { refreshToken } = req.body;

  const now = new Date().toISOString();
  const logEntry = `${now}: ${req.method} ${req.url} ${req.user ? JSON.stringify(req.user) : 'No request body'}\n`;
  console.log(logEntry);
  accessLogStream.write(logEntry);

  // Check if refreshToken is provided
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is required" });
  }

  // Check if refreshToken is valid
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }

  // Decode refresh token to extract user data
  const decodedToken = jwt.decode(refreshToken);

  // Generate new access token
  const accessToken = jwt.sign(
    { userId: decodedToken.userId, name: decodedToken.name },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  // Return new access token
  res.json({ accessToken });
  next()
});

// Protected route
app.get("/auth/protected", AuthenticateToken, (req, res, next) => {
    const now = new Date().toISOString();
    const logEntry = `${now}: ${req.method} ${req.url} ${req.user ? JSON.stringify(req.user) : 'No request body'}\n`;
    console.log(logEntry);
    accessLogStream.write(logEntry);
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
  next();
});

// Admin route
app.get("/auth/admin", AuthenticateToken, (req, res, next) => {
    // console.log(req.user);
    console.log(refreshTokens);
    const now = new Date().toISOString();
    const logEntry = `${now}: ${req.method} ${req.url} ${req.user ? JSON.stringify(req.user) : 'No request body'}\n`;
    console.log(logEntry);
    accessLogStream.write(logEntry);
  res.json({ message: "Admin route accessed successfully", user: req.user });
  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
