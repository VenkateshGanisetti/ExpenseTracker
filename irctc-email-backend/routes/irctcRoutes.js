const express=require('express');
const router=express.Router();

const irctcControllers=require('../controllers/irctcControllers');

router.get('/api/emails',irctcControllers.getAllEmailData);

router.get('/getExistedEmailData',irctcControllers.getAllExisedData);

module.exports=router;