const express = require("express")
const app = express()
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt")
const saltRounds = 11
const PORT = 5000


// connecting to the DB
mongoose.connect("mongodb://localhost:27017/blogsiteDataBase")
    .then(() => {
        console.log("Server connected to the Data Base")
        app.listen(PORT, (req, res) => {
            console.log("Server is now working on PORT : ", PORT);
        })
    })
    .catch(err => {
        console.log(err)
    })

// Creating Schema
const blogSchema = mongoose.Schema({
    title: { type: String, require: true, unique: true, minlength: 10 },
    description: { type: String, require: true, minlength: 100 }
})

const userSchema = mongoose.Schema({
    email: { minlength: 8, require: true, unique: true, type: String },
    password: { require: true, unique: true, type: String, minlength: 6 }
})

// creating model
const Blog = new mongoose.model("Blog", blogSchema)
const User = new mongoose.model("User", userSchema)

// middlewares and sets
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))
app.set("view engine", "ejs")


// creating ROUTES

// Home
app.get("/", (req, res) => {
    res.render("Home")
})

//Compose
app.get("/compose", (req, res) => {
    res.render("Compose")
})

app.post("/compose", (req, res) => {
    var blog = new Blog({
        title: req.body.title,
        description: req.body.description
    })
    blog.save()
        .then(savedBlogs => {
            console.log(savedBlogs);
            res.redirect("Blogs")
        })
        .catch(err => {
            console.log(err);
        })
})

// Blogs
app.get("/blogs", (req, res) => {
    Blog.find({})
        .then(foundBlogs => {
            if (foundBlogs.length > 0) {
                res.render("Blogs", {
                    data: foundBlogs
                })
            } else {
                res.render("Blogs", {
                    data: "No Blogs Found :("
                })
            }
        })
        .catch(err => {
            console.log(err);
        })
})

// Register
app.get("/register", (req, res) => {
    res.render("Register")
})

app.post("/register", (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        var user = new User({
            email: req.body.email,
            password: hash
        })
        user.save()
            .then(savedUser => {
                console.log(savedUser)
                res.redirect("/blogs")
            })
            .catch(err => {
                console.log(err)
                res.redirect("/register")
            })
    })
})


//Login
app.get("/login", (req, res) => {
    res.render("Login")
})

app.post("/login", (req, res) => {
    var email = req.body.email
    var password = req.body.password
    User.find({ email: email })
        .then(foundUser => {
            bcrypt.compare(req.body.password, foundUser[0].password, function (err, result) {
                if (result) {
                    res.redirect("/blogs")
                } else {
                    res.send("Incorrect Password")
                }
            });
        })
        .catch(err => {
            console.log(err);
        })
})


//Dashboard
app.get("/dashboard", (req, res) => {
    res.render("Dashboard")
})



//  delete route (dymanic)
app.get("/delete/:id", (req, res) => {
    var id = req.params.id
    Blog.findByIdAndDelete(id)
        .then(deletedBlog => {
            console.log("Deleted blogs =>", deletedBlog);
            res.redirect("/blogs")
        })
        .catch(err => {
            console.log(err);
        })
})