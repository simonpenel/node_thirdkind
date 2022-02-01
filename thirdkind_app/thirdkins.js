
const express = require('express')
const util = require('util')
const app = express()
const path = require("path")
const multer = require("multer")
const port = 3000
// View Engine Setup
app.set("views",path.join(__dirname,"views"))
app.set("partials",path.join(__dirname,"partials"))
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
          console.log("LANDSCAPE:");
          // console.log(res);
              console.log(req.body.landscape);
            const { exec } = require("child_process");
            // SUCCESS, image successfully uploaded

            // res.send("Success, Image uploaded!")
            // console.log(req.file.filename);
            var commande_thirdkind = "/home/simon/.cargo/bin/thirdkind -f uploads/"+req.file.filename+ " -o public/"+req.file.filename+".svg"
            if (req.body.landscape == "on") {
              commande_thirdkind = commande_thirdkind + " -L ";
            }
            if (req.body.freeliving == "on") {
              commande_thirdkind = commande_thirdkind + " -e ";
            }
            if (req.body.speciesnode == "on") {
              commande_thirdkind = commande_thirdkind + " -I ";
            }
            if (req.body.genenode == "on") {
              commande_thirdkind = commande_thirdkind + " -i ";
            }

        console.log(commande_thirdkind);
            exec(commande_thirdkind, (error, stdout, stderr) => {
              console.log(stdout);
              console.log(stderr);
                if (error) {
                    console.log(`error: ${error.message}`);                // if (stderr) {
                    res.render("Error" ,{ message: error.message,path: req.file.filename });

                }
                // if (stderr) {
                //     console.log(`stderr: ${stderr}`);
                //     return;
                // }
                console.log(`stdout: ${stdout}`);
                res.render("Display" ,{ path: req.file.filename ,speciespolice:"25", genepolice:"12", message: 'Hello there!'});
            });


        }
    })
})

app.post("/uploadPreferences",function (req, res, next) {

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
          console.log("REPONSE");
          console.log(req.body);
          console.log(req.body.freeliving);
          console.log(req.speciespolice);
            const { exec } = require("child_process");
            // SUCCESS, image successfully uploaded
            inputfile = req.body.uploaded;
            // res.send("Success, Image uploaded!")
            // console.log(req.file.filename);
            var commande_thirdkind = "/home/simon/.cargo/bin/thirdkind -f uploads/"+inputfile+ " -o public/"+inputfile+".svg"
            if (req.body.landscape == "on") {
              commande_thirdkind = commande_thirdkind + " -L";
            }
            if (req.body.freeliving == "on") {
              commande_thirdkind = commande_thirdkind + " -e";
            }

            if (req.body.speciesnode == "on") {
              commande_thirdkind = commande_thirdkind + " -I";
            }
            if (req.body.genenode == "on") {
              commande_thirdkind = commande_thirdkind + " -i";
            }

        console.log(commande_thirdkind);
            if (req.body.speciespolice == undefined) {
              req.body.speciespolice = 20;
            }
            commande_thirdkind = commande_thirdkind + " -D "+ req.body.speciespolice;

            if (req.body.genepolice == undefined) {
              req.body.genepolice = 12;
            }
            commande_thirdkind = commande_thirdkind + " -d "+ req.body.genepolice;
            exec(commande_thirdkind, (error, stdout, stderr) => {
              console.log(stdout);
              console.log(stderr);
                if (error) {
                    console.log(`error: ${error.message}`);                // if (stderr) {
                    res.render("Error" ,{ message: error.message, path: inputfile});

                }
                // if (stderr) {
                //     console.log(`stderr: ${stderr}`);
                //     return;
                // }
                console.log(`stdout: ${stdout}`);
                res.render("Display" ,{ path: inputfile, speciespolice:req.body.speciespolice, genepolice:req.body.genepolice,
                  message: 'Hello there!'});
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
