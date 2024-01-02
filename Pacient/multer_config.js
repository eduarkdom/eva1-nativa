var fs = require('fs');
var multer = require('multer');
const { v4: uuidv4 } = require('uuid');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        var ext = file.originalname.split('.').pop()
        cb(null, uuidv4() + '.' + ext)
    }
})

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg" ||
            file.mimetype == "image/gif"
        ) {
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
}).single('file')

module.exports = upload;