
/*
    https://www.npmjs.com/package/multer  
    - Multer is an Express middleware package that handles file uploads

    This route file handles permit verification:
    -   A logged in user uploads a screenshot of their confirmation email
    -   The backend saves the screenshot in backend/uploads/verification
    -   The user's verificationStatus changes to 'pending' on their Dashboard
    -   Once an admin manually reviews the screenshot, they can update the user's status
*/

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// The file path where user screenshots should be stored
const uploadDirectory = path.join(__dirname, '..', 'uploads', 'verification');

if(!fs.existsSync(uploadDirectory)){
    fs.mkdirSync(uploadDirectory, {recursive: true});
}

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, uploadDirectory);
    },

    filename: function(req, file, cb){
        const fileExtension = path.extname(file.originalname);
        const filename = `${req.user._id}-${Date.now()}${fileExtension}`;
        cb(null, filename);
    }
});

function fileFilter(req, file, cb){
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    // file.mimetype stores the type of file that the user uploaded
    if(allowedTypes.includes(file.mimetype)){
        cb(null, true);
    }
    else{
        cb(new Error("Only PNG and JPG images are allowed."));
    }
}

// Limit the screenshot upload size to maximum 5 MB
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

router.post('/submit', requireAuth, upload.single('permitImage'), async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({error: "Permit screenshot is required."});
        }

        req.user.verificationStatus = "pending";
        req.user.verificationImagePath = `uploads/verification/${req.file.filename}`;
        req.user.verificationSubmitDate = new Date();
        req.user.verificationReviewDate = undefined;
        req.user.verificationRejectionReason = "";
        
        await req.user.save();

        res.json({
            message: "Permit verification submitted for review.",
            verificationStatus: req.user.verificationStatus
        });
    }
    catch(err){
        console.error("Error submitting permit verification:", err.message);
        res.status(500).json({error: "Failed to submit permit verification"});
    }
});

module.exports = router;