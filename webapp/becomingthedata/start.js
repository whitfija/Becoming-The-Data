const express = require('express')
const path = require('path')
const session = require('express-session')
const ejs = require('ejs')
const app = express()

app.engine('ejs', ejs.renderFile);
app.set("view engine", "ejs")

// index
app.get('/', (req, res)=>{
    res.render('pages/index');
})

app.listen(3000, ()=>{
    console.log('Server is listening at http://localhost:3000');
})