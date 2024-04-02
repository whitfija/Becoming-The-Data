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

const FirestoreStore = require('firestore-store')(session);

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

// sessions

app.use(
    session({
        store: new FirestoreStore({
            database: firebase.firestore()
        }),
        name: '__session',
        secret: "gtdataseumisfun",
        resave: true,
        saveUninitialized: true,
        cookie: {
            expires: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
            maxAge: 4 * 60 * 60 * 1000,
            secure: false,
            httpOnly: false
        }
    })
);

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

// check if session exists
const checkSession = (req, res, next) => {
    if (!req.session.sessionId) {
        res.redirect('/start');
    } else {
        next();
    }
};

// index
app.get('/', (req, res)=>{
    res.render("pages/index");
})

// about
app.get('/about', (req, res)=>{
    res.render("pages/about");
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


// --------------------- experience ---------------------

function generateSessionId() {
    // Generate a random number between 1000 and 9999
    return Math.floor(Math.random() * 9000) + 1000;
}

// start experience, build session if needed, navigate to scanner
app.get('/start', (req, res)=>{
    const sessionId = req.session.sessionId || generateSessionId();
    req.session.sessionId = sessionId;
    req.session.exhibitsvisited = {
        'oceans': false,
        'airquality': false,
        'socialdata': false,
        'gridgame': false,
        'acid': false,
        'datamap': false
    }
    res.redirect('/scanner');
})

// scanner screen
app.get('/scanner', checkSession, (req, res)=>{
    const sessionId = req.session.sessionId;
    res.render("pages/scanner", { sessionId });
})

// experience summary screen
app.get('/summary', checkSession, (req, res)=>{
    const sessionId = req.session.sessionId;
    res.render("pages/checklist");
})

// finish experience screen - show id and allow to view data profile or add to map
app.get('/finish', checkSession, (req, res)=>{
    const sessionId = req.session.sessionId;

    // store info to firebase or update or whatever is needed

    res.render("pages/finish", { sessionId });
})

// display profile
app.get('/profile/:id', checkSession, (req, res)=>{

    // pull info from firebase for display

    res.render("pages/profile");
})

// add profile to map
app.get('/map/add/:id', checkSession, (req, res)=>{

    // pull info from firebase

    res.render("pages/dotbuilder");
})

// end experience
app.get('/end', checkSession, (req, res)=>{
    // store info to firebase

    // end session
    const sessionId = req.session.sessionId;
    delete req.session.sessionId;

    res.redirect(`/summary/${sessionId}`);
})

const desctosurvey = {
    'accessible_oceans': 'oceans',
    'air_quality_data_literacy': 'airquality',
    'atlanta_arrest_data': 'socialdata',
    'electrical_grid_game': 'gridgame',
    'acid_rain': 'acid',
    'the_dataseum_data_map': 'datamap'
};

// nav to survey prompt 
app.get('/survey/:description', (req, res) => {
    const description = req.params.description; 
    functions.logger.info("Description:", description);
    
    if (desctosurvey.hasOwnProperty(description)) {
        const fileName = desctosurvey[description];
        functions.logger.info("File name:", fileName);

        var sessionId;
        // make new session if session doesnt exist
        if (!req.session.sessionId) {
            sessionId = generateSessionId();
            req.session.sessionId = sessionId;
            req.session.exhibitsvisited = {
                'oceans': false,
                'airquality': false,
                'socialdata': false,
                'gridgame': false,
                'acid': false,
                'datamap': false
            }
        } else {
            sessionId = req.session.sessionId || generateSessionId();
        }

        req.session.exhibitsvisited[fileName] = true;
        res.render("pages/experiences/" + fileName, {sessionId, completed});
    } else {
        functions.logger.info("Unrecognized description:", description); // Print unrecognized description
        // unrecognized
        res.redirect('/scanner');
    }

});

// save survey response
app.get('/survey/submit/', checkSession, (req, res) => {
    // store data into firebase by session info
    res.redirect('/');
});

// unknown
app.get('*', (req, res) => {
    res.redirect('/');
});


exports.app = functions.https.onRequest(app);