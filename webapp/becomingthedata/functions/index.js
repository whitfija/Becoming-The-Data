/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require("firebase-functions");
const firebase = require("firebase-admin");

const express = require('express')
const path = require('path')
const session = require('express-session')
const ejs = require('ejs')

const app = express()
app.engine('ejs', ejs.renderFile);
app.set("view engine", "ejs")
app.set("views", "./views")

app.use('/public', express.static('./public'))
app.use(express.urlencoded({extended: true}))

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// firebase
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();


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
    res.set("Cache")
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

exports.app = functions.https.onRequest(app);