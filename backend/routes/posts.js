
const express = require('express');
const Post = require('../models/Post');
const MessageRequest = require('../models/MessageRequest');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Get all posts
router.get('/', requireAuth, async (req, res) =>{
    try{
        const { parkingStructure } = req.query;
        const filter = {};

        if(parkingStructure){
            filter.parkingStructure = parkingStructure;
        }

        const posts = await Post.find(filter).populate('owner', 'name email').sort({ createdAt: -1});
        res.json(posts);
    } catch(err){
        console.error("Error fetching posts:", err.message);
        res.status(500).json({error: "Failed to fetch posts."});
    }
});

// Get posts created by the current user
router.get('/mine', requireAuth, async (req, res) =>{
    try{
        const posts = await Post.find({owner: req.user._id}).sort({createdAt: -1});
        res.json(posts);

    } catch(err){
        console.error("Error fetching user posts", err.message);
        res.status(500).json({error: "Failed to fetch user posts"});
    }
});

// Create a new post
router.post('/', requireAuth, async (req, res) =>{
    try{
        const { parkingStructure, schedule, notes } = req.body;
        if(!parkingStructure){
            return res.status(400).json({error: "Parking structure is required."});
        }
        else if(!schedule || schedule.length === 0){
            return res.status(400).json({error: "On-campus schedule is required."});
        }

        for(const item of schedule){
            if(!item.day || !item.startTime || !item.endTime){
                return res.status(400).json({error: "Each schedule item needs a day, start time, and end time."});
            }

            if(item.startTime >= item.endTime){
                return res.status(400).json({error: "Start time must be before end time."});
            }
        }
        
        const postType = req.user.verificationStatus === "verified" ? "offering" : "looking";

        const post = await Post.create({
            owner: req.user._id,
            postType,
            parkingStructure,
            schedule,
            notes,
        });

        res.status(201).json(post);

    } catch(err){
        console.error("Error creating post:", err.message);
        res.status(500).json({error: "Failed to create post."});
    }
});

/*
    TIANYI Code:
*/

// Delete a post created by the current user
router.delete('/:id', requireAuth, async (req, res) =>{
    try{
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({error: "Post not found."});
        }

        if(!post.owner.equals(req.user._id)){
            return res.status(403).json({error: "Forbidden."});
        }

        // Clean up all message requests tied to this post so no orphaned documents remain.
        await MessageRequest.deleteMany({ post: post._id });
        await post.deleteOne();
        res.json({success: true});

    } catch(err){
        console.error("Error deleting post:", err.message);
        res.status(500).json({error: "Failed to delete post."});
    }
});

// Update a post created by the current user
router.patch('/:id', requireAuth, async (req, res) =>{
    try{
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({error: "Post not found."});
        }

        if(!post.owner.equals(req.user._id)){
            return res.status(403).json({error: "Forbidden."});
        }

        const { parkingStructure, schedule, notes } = req.body;

        if(!parkingStructure){
            return res.status(400).json({error: "Parking structure is required."});
        }

        if(!schedule || schedule.length === 0){
            return res.status(400).json({error: "Schedule is required."});
        }

        post.parkingStructure = parkingStructure;
        post.schedule = schedule;
        post.notes = notes ?? '';

        await post.save();
        res.json(post);

    } catch(err){
        console.error("Error updating post:", err.message);
        res.status(500).json({error: "Failed to update post."});
    }
});


module.exports = router;
