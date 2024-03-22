const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const app = express();
const PORT = 8000;
const User = require("./User");
require("./Config");
const Faculty = require("./Faculty");
const Student = require("./Student");

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));

// Middleware for parsing JSON and URL-encoded data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public");
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.render("Login");
});

app.post("/fac", upload.single("img"), async (req, res) => {
  const { name, email, phone, age, experience, address } = req.body;
  const img = req.file ? req.file.filename : null;
  const faculty = new Faculty({
    name,
    email,
    phone,
    age,
    experience,
    address,
    img,
  });
  const result = await faculty.save();
  if (result) {
    res.send(
      '<script>alert("registerd"); window.location.assign("/faculty") </script>'
    );
  }
});

app.post("/addstud", upload.single("img"), async (req, res) => {
  const { name, email, phone, age, course, address } = req.body;
  const img = req.file ? req.file.filename : null;
  const student = new Student({
    name,
    email,
    phone,
    age,
    course,
    address,
    img,
  });
  const result = await student.save();
  if (result) {
    res.send(
      '<script>alert("registerd"); window.location.assign("/student") </script>'
    );
  }
});

app.post("/login", async (req, resp) => {
  if (req.body.email && req.body.password) {
    let result = await User.findOne(req.body).select("-password");
    if (result) {
      resp.redirect("/sidebar");
    } else {
      resp.send({ result: "Invalid Credentials" });
    }
  } else {
    resp.send({ result: "Both fields are mandatory" });
  }
});

app.get("/sidebar", (req, res) => {
  res.render("Sidebar");
});

app.get("/HomePage.ejs", (req, res) => {
  res.render("HomePage");
});

app.get("/AddStudent.ejs", (req, res) => {
  res.render("AddStudent");
});

app.get("/faculty", async (req, res) => {
  const facultyList = await Faculty.find();
  res.render("FacDisp", { facultyList: facultyList });
});

app.get("/student", async (req, res) => {
  const facultyList = await Student.find();
  res.render("StudDisp", { facultyList: facultyList });
});

app.get("/delete/:id", async (req, res) => {
  const deletedFaculty = await Faculty.findByIdAndDelete(req.params.id);
  if (deletedFaculty) {
    res.redirect("/faculty"); // Redirect to faculty page after deletion
  } else {
    res.status(404).send("Faculty not found");
  }
});

app.get("/deleteStud/:id", async (req, res) => {
  const deletedFaculty = await Student.findByIdAndDelete(req.params.id);
  if (deletedFaculty) {
    res.redirect("/student"); // Redirect to faculty page after deletion
  } else {
    res.status(404).send("Student not found");
  }
});

app.get("/facupdate/:id", async (req, resp) => {
  let result = await Faculty.findOne({ _id: req.params.id });
  if (result) {
    const facultyList = await Faculty.find({ _id: req.params.id });
    resp.render("UpdateFaculty", { facultyList: facultyList });
  } else {
    resp.send({ result: "No Record Found." });
  }
});

app.get("/studupdt/:id", async (req, resp) => {
  let result = await Student.findOne({ _id: req.params.id });
  if (result) {
    const facultyList = await Student.find({ _id: req.params.id });
    resp.render("UpdateStudent", { facultyList: facultyList });
  } else {
    resp.send({ result: "No Record Found." });
  }
});

app.post("/update/:id", upload.single("img"), async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, age, experience, address } = req.body;
  const img = req.file ? req.file.filename : null;

  const faculty = await Faculty.findById(id);
  if (!faculty) {
    return res.status(404).send("Faculty not found");
  }

  // Update fields
  faculty.name = name;
  faculty.email = email;
  faculty.phone = phone;
  faculty.age = age;
  faculty.experience = experience;
  faculty.address = address;
  if (img) {
    faculty.img = img;
  }

  const result = await faculty.save();
  if (result) {
    res.redirect("/faculty");
  } else {
    res.status(500).send("Error updating faculty");
  }
});

app.post("/studupdate/:id", upload.single("img"), async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, age, course, address } = req.body;
  const img = req.file ? req.file.filename : null;

  const student = await Student.findById(id);
  if (!student) {
    return res.status(404).send("Student not found");
  }

  // Update fields
  student.name = name;
  student.email = email;
  student.phone = phone;
  student.age = age;
  student.course = course;
  student.address = address;
  if (img) {
    student.img = img;
  }

  const result = await student.save();
  if (result) {
    res.redirect("/student");
  } else {
    res.status(500).send("Error updating student");
  }
});

app.get("/searchStudent/:key", async (req, res) => {
  const searchKey = req.params.key.trim();
  try {
    const result = await Student.find({
      $or: [
        { name: { $regex: searchKey, $options: "i" } }, // Case-insensitive search
        { email: { $regex: searchKey, $options: "i" } },
        { address: { $regex: searchKey, $options: "i" } },
        { course: { $regex: searchKey, $options: "i" } },
      ],
    });
    res.json(result);
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/searchFaculty/:key", async (req, res) => {
  const searchKey = req.params.key.trim();
  try {
    const result = await Faculty.find({
      $or: [
        { name: { $regex: searchKey, $options: "i" } }, // Case-insensitive search
        { email: { $regex: searchKey, $options: "i" } },
        { address: { $regex: searchKey, $options: "i" } },
      ],
    });
    res.json(result);
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Server-side route for updating a faculty member

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
