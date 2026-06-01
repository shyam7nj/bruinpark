
const express = require('express');
const MessageRequest = require('../models/MessageRequest');
const Post = require('../models/Post');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();


// Create a message request
router.post('/', requireAuth, async (req, res) => {
    try{
        const {postId, message} = req.body;
        if(!postId){
            return res.status(400).json({error: "Post ID is required."});
        }

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "Post not found."});
        }

        if(post.owner.equals(req.user._id)){
            return res.status(400).json({error: "You cannot message yourself."});
        }

        const existingRequest = await MessageRequest.findOne({
            post: post._id, 
            sender: req.user._id,
            status: "pending"
        });

        if(existingRequest){
            return res.status(400).json({error: "You already have a pending request for this person's post."})
        }

        const messageRequest = await MessageRequest.create({
            post: post._id,
            sender: req.user._id,
            recipient: post.owner,
            message: message || ""
        });

        res.status(201).json(messageRequest);
    }
    catch(err){
        console.error("Error creating message request:", err.message);
        res.status(500).json({error: "Failed to create message request."})
    }
});


// Get user's incoming message requests
router.get('/incoming', requireAuth, async (req, res) => {
    try{
        const incomingRequests = await MessageRequest.find({recipient: req.user._id})
        .populate('sender', 'name email')
        .populate('post', 'parkingStructure schedule postType notes')
        .sort({createdAt: -1});

        res.json(incomingRequests);
    }
    catch(err){
        console.error("Error fetching incoming message requests.", err.message);
        res.status(500).json({error: "Failed to fetch incoming message requests."});
    }
});


// Get user's outgoing message requests
router.get('/outgoing', requireAuth, async (req, res) => {
    try{
        const outgoingRequests = await MessageRequest.find({sender: req.user._id})
        .populate('recipient', 'name email')
        .populate('post', 'parkingStructure schedule postType notes')
        .sort({createdAt: -1});

        res.json(outgoingRequests);
    }
    catch(err){
        console.error("Error fetching outgoing message requests.", err.message);
        res.status(500).json({error: "Failed to fetch outgoing message requests."});
    }
});

// Accept a message request
router.patch('/:id/accept', requireAuth, async (req, res) => {
    try{
        const messageRequest = await MessageRequest.findById(req.params.id);
        if(!messageRequest){
            return res.status(404).json({error: "Message request not found."});
        }

        if(!messageRequest.recipient.equals(req.user._id)){
            return res.status(403).json({error: "You don't have permission to accept this message request."});
        }

        messageRequest.status = "accepted";
        messageRequest.reviewedAt = new Date();
        await messageRequest.save();

        res.json({
            message: "Message request accepted",
            messageRequest
        });
    }
    catch(err){
        console.error("Error accepting message request.", err.message);
        res.status(500).json({error: "Failed to accept message request."});
    }
});

router.patch('/:id/reject', requireAuth, async (req, res) => {
    try{
        const messageRequest = await MessageRequest.findById(req.params.id);
        if(!messageRequest){
            return res.status(404).json({error: "Message Request not found."});
        }

        if(!messageRequest.recipient.equals(req.user._id)){
            return res.status(403).json({error: "You don't have permission to reject this request."});
        }

        messageRequest.status = "rejected";
        messageRequest.reviewedAt = new Date();
        await messageRequest.save();

        res.json({
            message: "Message request rejected.",
            messageRequest
        });
    }
    catch(err){
        console.error("Error rejecting message request", err.message);
        res.status(500).json({error: "Failed to reject message request."});
    }
});

module.exports = router;