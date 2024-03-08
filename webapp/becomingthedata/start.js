const express = require('express')
const path = require('path')
const session = require('express-session')
const ejs = require('ejs')
const app = express()

app.engine('ejs', ejs.renderFile);
app.set("view engine", "ejs")

app.use('/public', express.static('public'))
app.use(express.urlencoded({extended: true}))

// firebase
// Require Firebase Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./keys/becoming-the-data-firebase-adminsdk-n9w2z-f4e3a75fcb.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get Firestore instance
const db = admin.firestore();

// Function to fetch and return visitors data
async function displayVisitors() {
    try {
        const snapshot = await db.collection('visitors').get();
        const visitorsData = [];
        snapshot.forEach(doc => {
            visitorsData.push(doc.data());
        });
        return visitorsData;
    } catch (error) {
        console.error('Error fetching visitors: ', error);
        return [];
    }
}

// index
app.get('/', (req, res)=>{
    res.render("pages/index");
})

// map
app.get('/map', (req, res)=>{
    res.render("pages/map");
})

// data test
app.get('/data', async (req, res)=>{
    const visitors = await displayVisitors();
    res.render('pages/datatestpage', { visitors });
})

app.listen(3000, ()=>{
    console.log('Server is listening at http://localhost:3000');
})