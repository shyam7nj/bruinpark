
const express = require('express'); 
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3001;

app.use(express.json());

app.get(`/`, (req, res) => {
    res.send("BruinPark API running")
})

app.listen(port, () =>{
    console.log(`Server listening on Port ${port}`)
});