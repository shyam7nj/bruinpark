
const express = require('express');
const Post = require('../models/Post');
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
        else if(!schedule){
            return res.status(400).json({error: "On-campus schedule is required."});
        }
        
        const post = await Post.create({
            owner: req.user._id,
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

module.exports = router;
