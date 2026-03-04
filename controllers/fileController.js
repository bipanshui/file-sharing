const multer = require("multer");

let storage = multer.diskStorage({
    destination: (req, file, cb) =>cb(null, 'uploads/'),
    filename: (req, file, cb)=>{
        const uniqueName = `${Date.now()} - ${Math.round(Math.random() * 159)}`
    }
})

function fileController(req, res){
    //Validate request  
        if(!req.file){
            return res.status(400).json({

            })
        }
    //Store file

    //Store into database

    //Response -> Link
}


module.exports = fileController;