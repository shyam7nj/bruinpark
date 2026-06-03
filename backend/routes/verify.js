
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
const User = require('../models/User');
const requireAdmin = require('../middleware/requireAdmin');

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

// Admin Route: Get all users waiting for permit verification review
router.get('/pending', requireAuth, requireAdmin, async (req, res) => {
    try{
        const pendingUsers = await User.find({verificationStatus: "pending"}).select('name email verificationStatus verificationImagePath verificationSubmitDate');
        res.json(pendingUsers);
    }
    catch(err){
        console.error("Error fetching pending verifications:", err.message);
        res.status(500).json({error: "Failed to fetch pending verifications."});
    }
});

// Admin Route: View an uploaded user screenshot
router.get('/file/:filename', requireAuth, requireAdmin, (req, res) => {
    try{
        const filePath = path.join(uploadDirectory, req.params.filename);

        if(!fs.existsSync(filePath)){
            return res.status(404).json({error: "Verification screenshot not found."});
        }

        res.sendFile(filePath);
    }
    catch(err){
        console.error("Error loading verification screenshot:", err.message);
        res.status(500).json({error: "Failed to load verification screenshot."});
    }
});

// Admin Route: Approve a user's permit verification
router.patch('/:userId/approve', requireAuth, requireAdmin, async (req, res) => {
    try{
        const user = await User.findById(req.params.userId);
        if(!user){
            return res.status(404).json({error: "User not found."});
        }

        user.verificationStatus = "verified";
        user.verificationReviewDate = new Date();
        user.verificationRejectionReason = "";

        await user.save();

        res.json({
            message: "User permit verification approved.",
            user
        });
    }
    catch(err){
        console.error("Error approving verification", err.message);
        res.status(500).json({error: "Failed to approve verification."});
    }
});

// Admin Route: Reject a user's permit verification
router.patch('/:userId/reject', requireAuth, requireAdmin, async (req, res) => {
    try{
        const user = await User.findById(req.params.userId);
        if(!user){
            return res.status(404).json({error: "User not found."});
        }

        user.verificationStatus = "rejected";
        user.verificationReviewDate = new Date();
        user.verificationRejectionReason = req.body.reason || "Permit verification was rejected.";

        await user.save();
        
        res.json({
            message: "User permit verification rejected",
            user
        });
    }
    catch(err){
        console.error("Error rejecting verification", err.message);
        res.status(500).json({error: "Failed to reject verification."});
    }
});

module.exports = router;