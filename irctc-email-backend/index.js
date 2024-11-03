const express=require('express');
const cors=require('cors')

const app=express();

app.use(cors());
const bodyParser=require('body-parser')

const path=require('path')

app.use(express.static(path.join(__dirname,"public")))

app.use(bodyParser.urlencoded({extended:false}))

const connection=require('./helpers/connection');



const router=require('./routes/irctcRoutes');

app.use(router);


const port=2000;
app.listen(port,async ()=>{
    console.log(`app is listening on the port ${port} `);
})