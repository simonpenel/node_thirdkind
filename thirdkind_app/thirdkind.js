
const express = require('express')
const util = require('util')
const app = express()
const path = require("path")
const multer = require("multer")
var fs = require("fs"); // Load the filesystem module

const port = 3000
// View Engine Setup
app.set("views",path.join(__dirname,"views"))
app.set("partials",path.join(__dirname,"partials"))
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname, 'public')));

// const thirdkind_exec = "/home/simon/.cargo/bin/thirdkind";
const thirdkind_exec = "thirdkind";

//  STORAGE DEFINITION
//  -----------------
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Uploads is the Upload_folder_name
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
      var ipfields = req.ip.split(':');
      var userIp = ipfields[ipfields.length - 1]
            cb(null, file.fieldname + "_" + Date.now()+"_"+userIp+"_"+file.originalname.replace(/\s/g, '_'))
    }
  })

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1024 * 1024;

// UPLOAD SIMPLE
// ------------
var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb){
      var filetypes = /recphyloxml|phyloxml|recphylo|xml/;
      var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      if (extname) {
        return cb(null, true);
      }
      else {
        cb("Error: Thirdkind server supports the recPhyloXML format only. Please use one of the following extensions : " + filetypes);
      }
    }
}).single("mypic");

// UPLOAD DOUBLE
// -------------
const multi_upload = multer({
    storage,
    limits: { fileSize: maxSize},
    fileFilter: (req, file, cb) => {
      var filetypes = /recphyloxml|phyloxml|recphylo|xml/;
      var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      if (extname) {
        cb(null, true);
      }
      else {
        cb("Error:  Thirdkind server supports the recPhyloXML format only. Please use one of the following extensions : " + filetypes);
      }
    },
}).array('mypic_2', 2)

// HOME
// ----
app.get("/",function(req,res){
    res.render("Signup");
})

// UPLOAD 1 RECPHYLOXML FILE
//  ------------------------
app.post("/uploadOneXML",function (req, res, next) {
    upload(req,res,function(err) {
        if(err) {
            res.render("InputError" ,{ message: err});
        }
        else {
            const { exec } = require("child_process");
            // var commande_thirdkind = "/home/simon/.cargo/bin/thirdkind -F recphylo -f uploads/"+req.file.filename+ " -o public/"+req.file.filename+".svg"
            var commande_thirdkind = thirdkind_exec + " -F recphylo -f uploads/"+req.file.filename+ " -o public/"+req.file.filename+".svg"
            if (req.body.freeliving == "on") {
              commande_thirdkind = commande_thirdkind + " -e ";
              req.body.freeliving = "checked";
            }
            console.log(commande_thirdkind);
            exec(commande_thirdkind, (error, stdout, stderr) => {
              console.log(stdout);
              console.log(stderr);
              if (error) {
                console.log(`error: ${error.message}`);                // if (stderr) {
                  res.render("Error" ,{ message: error.message,path1: req.file.filename,path2: "none", options:req.body });
                }
                else {
                  console.log(`stdout: ${stdout}`);
                  req.body.speciespolice="25";
                  req.body.genepolice="12";
                  req.body.width="1.0";
                  req.body.height="1.0";
                  var affichage =    "<img src="+req.file.filename+".svg >" ;
                  var stats = fs.statSync("public/"+req.file.filename+".svg");
                  var fileSizeInBytes = stats.size;
                  if (fileSizeInBytes > 70000) {
                    affichage = 'The SVG is very big. Download it <a href='+req.file.filename+'.svg target=_blank>here</a>';
                  }
                res.render("Display" ,{ path1: req.file.filename ,path2: "none", options:req.body,affichage:affichage});
                }
            });
        }
    })
})

// UPLOAD 2 RECPHYLOXML FILES
//  -------------------------
app.post("/uploadTwoXML", function (req, res, next) {
    multi_upload(req,res,function(err) {
            if(err) {
                res.render("InputError" ,{ message: err})
            }
            else {

              const { exec } = require("child_process");
              var commande_thirdkind = thirdkind_exec + " -F recphylo -f uploads/"+req.files[0].filename+ " -g uploads/"+req.files[1].filename+ " -o public/"+req.files[0].filename+"_";
              if (req.body.freeliving == "on") {
                commande_thirdkind = commande_thirdkind + " -e ";
                req.body.freeliving = "checked";
              }
              console.log(commande_thirdkind);
              exec(commande_thirdkind, (error, stdout, stderr) => {
                console.log(stdout);
                console.log(stderr);
                if (error) {
                  console.log(`error: ${error.message}`);                // if (stderr) {
                    res.render("Error" ,{ message: error.message,path1: req.files[0].filename, path2:req.files[1].filename, options:req.body });
                  }
                  else {
                    console.log(`stdout: ${stdout}`);
                    req.body.speciespolice="25";
                    req.body.genepolice="12";
                    req.body.width="1.0";
                    req.body.height="1.0";

                    var affichage = "<h2>Main output files:</h2>";
                    affichage = affichage + '<a href='+req.files[0].filename+"_thirdkind_mapped_1.svg target=_blank>First mapped file</a> reconciled 'upper' symbiote tree(s) with 'lower' gene tree(s) inside<br>";
                    affichage = affichage + '<a href='+req.files[0].filename+"_thirdkind_mapped_2.svg target=_blank>Second mapped file</a> 'upper' host tree with 'lower' symbiote tree(s) inside plus gene transfer<br>";
                    affichage = affichage + '<a href='+req.files[0].filename+"_thirdkind_mapped_3.svg target=_blank>Third mapped file</a> 'upper' host tree with gene tree(s) inside<br>";
                    affichage = affichage + '<a href='+req.files[0].filename+"_thirdkind_symbiote_host.svg target=_blank>Symbiote - Host</a> 'upper' host tree with 'lower' symbiote tree(s) inside<br>";
                    affichage = affichage + '<a href='+req.files[0].filename+"_thirdkind_gene_symbiote.svg target=_blank>Gene - Symbiote</a>'upper' symbiote tree(s) with 'lower' gene tree(s) inside<br>";

                    affichage =  affichage +  "First mapped file is displayed above:<br><img src="+req.files[0].filename+"_thirdkind_mapped_1.svg >" ;


                    res.render("Display" ,{ path1: req.files[0].filename ,path2: req.files[1].filename, options:req.body,affichage:affichage});
                  }
              });
    console.log(req.files[0].filename);
  }
})
})

// UPLOAD PREFERENCES
// -----------------
app.post("/uploadPreferences",function (req, res, next) {

    upload(req,res,function(err) {

        if(err) {

            // ERROR occured (here it can be occured due
            // to uploading image of size greater than
            // 1MB or uploading different file type)
            res.send(err)
        }
        else {
            const { exec } = require("child_process");
            inputfile1 = req.body.uploaded1;
            inputfile2 = req.body.uploaded2;

            var commande_thirdkind = thirdkind_exec + " -F recphylo -f uploads/"+inputfile1
            if (inputfile2 != "none") {
              commande_thirdkind = commande_thirdkind + " -g  uploads/"+ inputfile2;
              commande_thirdkind = commande_thirdkind + " -o public/"+inputfile1+"_"

            }
            else {
              commande_thirdkind = commande_thirdkind + " -o public/"+inputfile1+".svg"
            }

            if (req.body.landscape == "on") {
              commande_thirdkind = commande_thirdkind + " -L";
              req.body.landscape = "checked";
            }
            if (req.body.freeliving == "on") {
              commande_thirdkind = commande_thirdkind + " -e";
              req.body.freeliving = "checked";
            }
            if (req.body.speciesnode == "on") {
              commande_thirdkind = commande_thirdkind + " -I";
              req.body.speciesnode = "checked";
            }
            if (req.body.genenode == "on") {
              commande_thirdkind = commande_thirdkind + " -i";
              req.body.genenode = "checked"
            }
            if (req.body.usebrlength == "on") {
              if (req.body.facbrlength == "") {
                req.body.facbrlength = "1.0";
              }
              commande_thirdkind = commande_thirdkind + " -B -l "+req.body.facbrlength ;
              req.body.usebrlength = "checked"
            }
            if (req.body.usetransfert == "on") {
              if (req.body.thrtransfert == "") {
                req.body.thrtransfert = "0";
              }
              commande_thirdkind = commande_thirdkind + " -J  -t "+req.body.thrtransfert ;
              req.body.usetransfert = "checked"
            }
            if (req.body.speciespolice == undefined) {
              req.body.speciespolice = 25;
            }
            commande_thirdkind = commande_thirdkind + " -D "+ req.body.speciespolice;

            if (req.body.genepolice == undefined) {
              req.body.genepolice = 12;
            }
            commande_thirdkind = commande_thirdkind + " -d "+ req.body.genepolice;

            if (req.body.width == undefined) {
              req.body.width = 1.0;
            }
            commande_thirdkind = commande_thirdkind + " -W "+ req.body.width;


            if (req.body.height == undefined) {
                req.body.height = 1.0;
            }
            commande_thirdkind = commande_thirdkind + " -H "+ req.body.height;
            console.log("=======================THIRDKIND=============================");
            console.log(commande_thirdkind);
            console.log("=======================THIRDKIND=============================");
            exec(commande_thirdkind, (error, stdout, stderr) => {
              console.log(stdout);
              console.log(stderr);
                if (error) {
                    console.log(`error: ${error.message}`);                // if (stderr) {
                    res.render("Error" ,{ message: error.message, path1: inputfile1,path2: inputfile2, options: req.body});

                }
                else {
                  console.log(`stdout: ${stdout}`);
                  if (inputfile2 == "none") {
                    var affichage =    "<img src="+inputfile1+".svg >" ;
                    var stats = fs.statSync("public/"+inputfile1+".svg");
                    var fileSizeInBytes = stats.size;
                    if (fileSizeInBytes > 70000) {
                      affichage = 'The SVG is very big. Download it <a href='+inputfile1+'.svg target=_blank>here</a>';
                    }
                  }
                  else {
                    var affichage = "<h2>Main output files:</h2>";
                    affichage = affichage + '<a href='+inputfile1+"_thirdkind_mapped_1.svg target=_blank>First mapped file</a> reconciled 'upper' symbiote tree(s) with 'lower' gene tree(s) inside<br>";
                    affichage = affichage + '<a href='+inputfile1+"_thirdkind_mapped_2.svg target=_blank>Second mapped file</a> 'upper' host tree with 'lower' symbiote tree(s) inside plus gene transfer<br>";
                    affichage = affichage + '<a href='+inputfile1+"_thirdkind_mapped_3.svg target=_blank>Third mapped file</a> 'upper' host tree with gene tree(s) inside<br>";
                    affichage = affichage + '<a href='+inputfile1+"_thirdkind_symbiote_host.svg target=_blank>Symbiote - Host</a> 'upper' host tree with 'lower' symbiote tree(s) inside<br>";
                    affichage = affichage + '<a href='+inputfile1+"_thirdkind_gene_symbiote.svg target=_blank>Gene - Symbiote</a>'upper' symbiote tree(s) with 'lower' gene tree(s) inside<br>";
                    var stats = fs.statSync("public/"+inputfile1+"_thirdkind_mapped_1.svg");
                    var fileSizeInBytes = stats.size;
                    if (fileSizeInBytes < 70000) {
                      affichage =  affichage +  "First mapped file is displayed above:<br><img src="+inputfile1+"_thirdkind_mapped_1.svg >" ;
                    }
                  }
                  res.render("Display" ,{ path1: inputfile1, path2:inputfile2, options: req.body, affichage: affichage});
                }
            });
        }
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
    console.log(`Server http://localhost:${port}`);
})
