const {mongoose, Schema, ObjectId} = require("mongoose");

const userSchema = new Schema({
    email : String,
    username : {type : String, unique : true},
    password : String,
    firstName : String,
    lastName : String,
    dob : Date
})
const adminSchema = new Schema({
    email : String,
    username : {type : String, unique : true},
    password : String,
    firstName : String,
    lastName : String,
    dob : Date
})

const userModel = mongoose.model("users",userSchema)
const adminModel = mongoose.model("admins",adminSchema)

module.exports = {
    userModel,
    adminModel
}