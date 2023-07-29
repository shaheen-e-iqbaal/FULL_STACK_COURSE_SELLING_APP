const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
app.use(express.json());
app.use(cors());
const secretKey = 'secretSuperstar';

const userSchema = new mongoose.Schema({
  username: { type: String },
  password: String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: String,
  courseId:String,
});

// Define mongoose models
const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Course = mongoose.model('Course', courseSchema);

mongoose.connect(
  "mongodb+srv://shaheeneallamaiqbal:*****@cluster0.uyeyspi.mongodb.net/courses",
  { useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" },
);



const generatejwt = (req)=>{
  const {username,password,role} = req.body;
  const obj = {
    username:username,
    password:password,
    role:role
  }
  const token = jwt.sign(obj,secretKey);
  return token;
}

const authenticateJwt = (req,res,next)=>{
  let token = req.headers.auth;
  token = token.split(' ')[1];
  jwt.verify(token,secretKey,(error,data)=>{
    if(error){
      res.status(403).json({message:'wrong input'});
    }
    else{
      req.user = data;
      next();
    }
  })
}

app.get('/role', authenticateJwt,(req,res)=>{
  if(req.user.role === 'Admin')
    res.json({role:'Admin'});
  else
  res.json({role:'User'});
})

app.get('/courses', async (req,res)=>{
  const courses = await Course.find({});
  res.status(200).json(courses);
})

// Admin routes
app.post('/admin/signup', async (req, res) => {
  // logic to sign up admin
  const admin = req.body;
  const present = await Admin.findOne(req.body);
  if(present){
    res.status(403).json({'message':'Admin exist already'});
  }
  else{
    const newAdmin = new Admin(admin);
    await newAdmin.save();
    req.body.role = "Admin";
    const token = generatejwt(req);
    res.status(200).json({'message':'Admin created succesfully',token:token});
  }
});

app.post('/admin/login', async (req, res) => {
  // logic to log in admin
  const {username,password} = req.body;
  const present = await Admin.findOne({ username, password });
  if(present){
    req.body.role = 'Admin';
    const token = generatejwt(req);
    res.status(200).json({message:'Logged in succesfully',token:token});
  }
  else{
  res.status(404).json({message:'Invalid credential'});
  }
});

app.get('/admin/me', authenticateJwt, (req,res)=>{
  res.status(200).json(req.user.username);
})

app.post("/admin/update", authenticateJwt, async (req, res) => {
  const username = req.user.username;
  const password = req.user.password;
  const present = await Admin.findOne({
    username: username,
    password: password,
  });
  const obj = {
    username: username,
    password: req.body.password,
  };
  const update = await User.findOneAndUpdate(
    {
      username: username,
      password: password,
    },
    obj,
    { new: true }
  );
  if (update) {
    req.body.username = username;
    req.body.role = "Admin";
    const token = generatejwt(req);
    res.json({ message: "updated succesfully", token: token });
  } else {
    res.status(404).json({ message: "failed update operation" });
  }
});

app.post('/admin/courses', authenticateJwt, async (req, res) => {
  // logic to create a course
  const course = req.body;
  const present = await Course.findOne({courseId:course.courseId});
  const present1 =await Course.findOne({title:course.title,description:course.description});
  if(present){
    res.status(404).json({message:"Course with this ID Exist"});
  }
  else if(present1){
    res.status(404).json({ message: "Course with this Title and Description Exist" });
  }
  else{
    const newcourse = new Course(course);
    await newcourse.save();
    res.status(200).json({ message: "course created", courseId: newcourse.id });
  }
  
});

app.put('/admin/courses/:courseId', authenticateJwt, async (req, res) => {
  // logic to edit a course
  const courseId = req.params.courseId;
  const course = await Course.findOneAndUpdate({courseId:courseId},req.body,{new :true});
  if(course){
    res.status(200).json({message:'course updated succesfully'});
  }
  else{
    res.status(404).json({message:'no such courses'});
  }
});

app.delete('/admin/courses/delete/:courseId', authenticateJwt, async (req,res)=>{
  const courseId = req.params.courseId;
  const course = await Course.findOneAndDelete({courseId:courseId});
  res.json({message:'course deleted succesfully'});
})

app.get('/admin/courses', authenticateJwt, async (req, res) => {
  // logic to get all courses
  const courses = await Course.find({});
  res.status(200).json(courses);
});

// User routes
app.post('/users/signup', async (req, res) => {
  // logic to sign up user
  const user = req.body;
  const present = await User.findOne(user);
  if(present){
    res.status(404).json({message:'User already exist'});
  }
  else{
    const newuser = new User(user);
    newuser.save();
    req.body.role = "User";
    const token = generatejwt(req);
    res.status(200).json({message:"user created succesfully",token:token});

  }
});

app.post('/users/login', async(req, res) => {
  // logic to log in user
  const {username,password} = req.body;
  const present = await User.findOne({ username, password });
  if(present){
    req.body.role = 'User';
    const token = generatejwt(req);
    res.status(200).json({message:'Logged in succesfully',token:token});
  }
  else{
  res.status(404).json({message:'Invalid credential'});
  }
});

app.post('/users/update', authenticateJwt, async(req,res)=>{
  const username = req.user.username;
  const password = req.user.password;
  const present = await User.findOne({username:username,password:password})
  const obj = {
    username: username,
    password: req.body.password,
    purchasedCourses:present.purchasedCourses
  };
  const update = await User.findOneAndUpdate({
    username: username,
    password: password,
  },obj,{new:true});
  if(update){
    req.body.username = username;
    req.body.role = 'User';
    const token = generatejwt(req);
    res.json({message:'updated succesfully',token:token});
  }
  else{
    res.status(404).json({message:'failed update operation'});
  }
})

app.get("/user/me", authenticateJwt, (req, res) => {
  res.status(200).json(req.user.username);
});

app.get('/user/password', authenticateJwt, (req,res)=>{
  res.status(200).json(req.user.password);
})

app.get('/users/courses', authenticateJwt, async (req, res) => {
  // logic to list all courses
  const courses = await Course.find({});
  res.status(200).json(courses);

});

app.get('/users/coursesbeforesignin', async(req,res)=>{
  const courses = await Course.find({});
  res.status(200).json(courses);
})

app.post('/users/courses/:courseId', authenticateJwt, async (req, res) => {
  // logic to purchase a course
  const courseId = req.params.courseId;
  const course = await Course.findOne({courseId:courseId});
  
  if(!(course === null)){
    const user = await User.findOne({username:req.user.username,password:req.user.password});
    if(user){
    user.purchasedCourses.push(course);
    user.save();
    res.status(200).json('course purchased succesfully');
    }
    else{
      res.status(404).json('no such user available');
    }
  }
  else{
    res.status(404).json('no such course available');
  }
});

app.get('/users/purchasedCourses', authenticateJwt, async (req, res) => {
  // logic to view purchased courses
  const user = await User.findOne({username:req.user.username,password:req.user.password});
  if(user){
    let courses = [];
    for(i = 0;i<user.purchasedCourses.length;i++){
      const course = await Course.findById(user.purchasedCourses[i]);
      courses.push(course);
    }
    res.status(200).json(courses);
  }
  else{
    res.status(404).json('no such user exist');
  }
  
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});



