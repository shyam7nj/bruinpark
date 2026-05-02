
const express = require('express'); 
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const port = 3001;

app.use(express.json());

app.get(`/`, (req, res) => {
    res.send("BruinPark API running")
})

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB Connected");
});


app.listen(port, () =>{
    console.log(`Server listening on Port ${port}`)
});