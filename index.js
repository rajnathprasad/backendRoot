const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")
const {JWT_SECRET, MONGO_URI, PORT} = require("./config.js");
const {userModel, adminModel} = require("./db.js")

//middlewares
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ message: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token missing" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const data = fs.readFileSync("cred.txt", "utf-8");
    const dataJson = JSON.parse(data);
    console.log(dataJson);
    if (dataJson[decoded.username]) {
      console.log("Hello", decoded.username);
      req.username=decoded.username
      next();
    } else {
      return res.status(403).json({
          message: "User not found",
        }
      );
    }
  } catch (err) {
    return res.status(403).json({ msg: "Invalid token" });
  }
}

//routes
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/login", async function (req, res) {
  const username = req.body.uname;
  const password = req.body.pswd;
  if(username=="" || password==""){
    res.json({
      message : "Fill both fields"
    })
  }
  const userRecord = await userModel.findOne({
    username : username
  })
  if(!userRecord){
    return res.json({
      message : "User not found"
    })
  }
  const passwordMatch = await bcrypt.compare(password,userRecord.password)
  if(!passwordMatch){
    return res.json({
      message : "Incorrect Password"
    })
  }
  else{
    const token = `Bearer ${jwt.sign({username : userRecord.username},JWT_SECRET, {expiresIn : "1h"})}`
    return res.json({
      message : "Logged in",
      authentication : token
    })
  }
});

app.post("/signUp", async function (req, res) {
  const username = req.body.uname;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const dob = req.body.dob;
  const password = req.body.pswd;
  const confirmPassword = req.body.cnfPswd;

  if(username=="" || firstName=="" || email=="" || dob=="" || password=="" || confirmPassword==""){
    return res.json({
      message : "Please fill required details"
    })
  }
  else if(password!=confirmPassword){
    return res.json({
      message : "Create password and confirm password are not same"
    })
  }

  try{
    const hashedPassword = await bcrypt.hash(password,10);
    await userModel.create({
    username : username,
    email : email,
    password : hashedPassword,
    firstName : firstName,
    lastName : lastName,
    dob : dob
    })
    res.json({
      message : "Account Created"
    })
  }catch(err){
    console.log(err)
  }
});

app.get("/dashboard", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "userDashboard.html"));
});


async function main(){
  try{
    await mongoose.connect(MONGO_URI);
    app.listen(PORT);
    console.log(`Click here : http://localhost:${PORT}`)
  }
  catch(err){
    console.log(err)
  }
}

main()

