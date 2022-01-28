
const express = require('express')
const app = express()
const path = require("path")
const multer = require("multer")
const port = 3000
// View Engine Setup
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname, 'public')));
// var upload = multer({ dest: "Upload_folder_name" })
// If you do not want to use diskStorage then uncomment it

var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        // Uploads is the Upload_folder_name
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now()+".xml")
    }
  })

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;

var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb){

        // Set the filetypes, it is optional
        var filetypes = /recphyloxml|phyloxml|xml/;
        var mimetype = filetypes.test(file.mimetype);

        var extname = filetypes.test(path.extname(
                    file.originalname).toLowerCase());

        // if (mimetype && extname) {
            return cb(null, true);
        // }

        // cb("Error: File upload only supports the "
        //         + "following filetypes - " + filetypes);
      }

// mypic is the name of file attribute
}).single("mypic");


// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })
app.get("/",function(req,res){
    res.render("Signup");
})
app.post("/uploadProfilePicture",function (req, res, next) {

    // Error MiddleWare for multer file upload, so if any
    // error occurs, the image would not be uploaded!
    upload(req,res,function(err) {

        if(err) {

            // ERROR occured (here it can be occured due
            // to uploading image of size greater than
            // 1MB or uploading different file type)
            res.send(err)
        }
        else {
            const { exec } = require("child_process");
            // SUCCESS, image successfully uploaded

            // res.send("Success, Image uploaded!")
            // console.log(req.file.filename);


            exec("/home/simon/.cargo/bin/thirdkind -f uploads/"+req.file.filename+ " -o public/"+req.file.filename+".svg", (error, stdout, stderr) => {
              console.log(stdout);
              console.log(stderr);
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                res.render("Display" ,{ path: req.file.filename , message: 'Hello there!'});
            });


        }
    })
})

// const { exec } = require("child_process");
//
// exec("ls -la", (error, stdout, stderr) => {
//     if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//     }
//     console.log(`stdout: ${stdout}`);
// });

// exec("/home/simon/.cargo/bin/thirdkind -h ", (error, stdout, stderr) => {
//   console.log(stdout);
//   console.log(stderr);
//     if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//     }
//     console.log(`stdout: ${stdout}`);
// });



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
