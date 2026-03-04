const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const file = require("../models/file");
const { v4 : uuid4 } = require("uuid");

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
    }
})

let upload = multer({
    storage,
    limit : { fileSize : 1000000 * 100 }
}).single('myfile');

//multer is a middleware for handling multipart/form-data
router.post('/',  (req, res)=>{
     //validate request
      if(!req.file){
         return res.status(400).json({
            "message" : "file couldn't be found",
         })
      }

     //store file
        upload(req, res, async(err)=>{
            if(err){
                return res.status(500).send({ error : err.mmessage })
            }
            //store into database
            const file = new file({
                filename: req.file.filename,
                uuid: uuid4(),
                path: req.file.path,
                size: req.file.size
            });

            const response = await file.save();
            return res.json({ file  : `${process.env.APP_BASE_URL}`})
        })

     //response -> Link
});

module.exports = router;