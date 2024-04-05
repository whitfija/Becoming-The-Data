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

// get visitor data for sessionId
function getVisitorData(sessionId) {
    return new Promise((resolve, reject) => {
        // Reference to the visitor document in Firestore
        const visitorRef = db.collection('visitors').doc(sessionId);

        // Fetch visitor document
        visitorRef.get()
            .then(doc => {
                if (!doc.exists) {
                    // Visitor document does not exist
                    reject(new Error('Visitor data not found'));
                } else {
                    // Visitor document found, resolve with visitor data
                    resolve(doc.data());
                }
            })
            .catch(error => {
                // Error fetching visitor document
                reject(error);
            });
    });
}

// check if session exists
const checkSession = (req, res, next) => {
    if (!req.session.sessionId) {
        res.redirect('/start');
    } else {
        next();
    }
};

let dots = [];
async function initializeDots() {
    try {
        const snapshot = await db.collection('dots').get();
        dots = snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Error fetching dots:', error);
        // Handle error
    }
}
initializeDots();

// index
app.get('/', (req, res)=>{
    res.render("pages/index");
})

// about
app.get('/about', (req, res)=>{
    res.render("pages/about");
})


async function fetchDotsFromFirestore() {
    const dotsRef = db.collection('dots');
    
    // Fetch all dots from Firestore
    const snapshot = await dotsRef.get();
    
    // Parse dot data from Firestore snapshot
    const dots = [];
    snapshot.forEach(doc => {
        const dotData = doc.data();
        dots.push(dotData);
    });

    return dots;
}
// map
app.get('/map', async (req, res) => {
    try {
        // Fetch dot data from Firestore
        dots = await fetchDotsFromFirestore(); // Implement this function to fetch dots from Firestore

        // Render the map page with dot data
        res.render("pages/map", { dots });
    } catch (error) {
        console.error('Error fetching dots:', error);
        res.status(500).send('Error fetching dots');
    }
});

// data test
app.get('/data', async (req, res)=>{
    const visitors = await displayVisitors();
    res.render('pages/datatestpage', { visitors });
})


// --------------------- experience ---------------------

function generateSessionId() {
    const timestamp = Date.now().toString(36); // convert current timestamp to base36 string
    const randomString = Math.random().toString(36).substring(2, 8); // generate a random string of length 6
    return timestamp + randomString;
}

// start experience, build session if needed, navigate to scanner
app.get('/start', (req, res)=>{
    if (!req.session.sessionId) {
        const sessionId = generateSessionId();
        req.session.sessionId = sessionId;

        // build visitor entry in Firebase
        const visitorRef = db.collection('visitors').doc(sessionId);
        const startTime = new Date();
        const assignedPersonality = Math.floor(Math.random() * 8) + 1; // random number between 1 and 8
        const visitorData = {
            sessionId: sessionId,
            active: true,
            group: assignedPersonality,
            starttime: startTime,
            endtime: null,
            exhibitsvisited: {
                'oceans': false,
                'airquality': false,
                'socialdata': false,
                'gridgame': false,
                'acid': false,
                'datamap': false
            },
            exhibitinfo: {
                'oceans': '',
                'airquality': '',
                'socialdata': '',
                'gridgame': '',
                'acid': '',
                'datamap': ''
            }
        };

        visitorRef.set(visitorData)
            .then(() => {
                console.log('Visitor entry created successfully.');
                res.redirect('/scanner');
            })
            .catch(error => {
                console.error('Error creating visitor entry:', error);
                res.status(500).send('Error creating visitor entry.');
            });
    } else {
        // session already exists
        res.redirect('/summary');
    }
})

// scanner screen
app.get('/scanner', checkSession, (req, res)=>{
    const sessionId = req.session.sessionId;
    res.render("pages/scanner", { sessionId });
})


const exhibitNames = {
    'oceans': 'Accessible Oceans',
    'airquality': 'Air Quality Data Literacy',
    'socialdata': 'Atlanta Arrest Data',
    'gridgame': 'Electrical Grid Management',
    'acid': 'Acid Rain',
    'datamap': ' MR Interactive Dataseum Map'
};
// experience summary screen
app.get('/summary', checkSession, (req, res)=>{
    const sessionId = req.session.sessionId;
    const visitorRef = db.collection('visitors').doc(sessionId);

    // get visitor's data from Firebase
    visitorRef.get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                const exhibitsVisited = data.exhibitsvisited || {};
                res.render("pages/checklist", { sessionId, exhibitsVisited, exhibitNames });
            } else {
                res.status(404).send('Visitor entry not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching visitor data:', error);
            res.status(500).send('Failed to fetch visitor data.');
        });
})

// finish experience screen - show id and allow to view data profile or add to map
app.get('/finish', checkSession, (req, res)=>{
    const sessionId = req.session.sessionId;
    const visitorRef = db.collection('visitors').doc(sessionId);
    const endTime = new Date();

    visitorRef.update({
            active: false,
            endtime: endTime
        })
        .then(() => {
            console.log('Visitor entry updated successfully.');
            req.session.destroy();
            res.render("pages/finish", {
                sessionId
            });
        })
        .catch(error => {
            console.error('Error updating visitor entry:', error);
            res.status(500).send('Error updating visitor entry.');
        });
})

// display profile
app.get('/profile/:id', (req, res)=>{
    const sessionId = req.params.id;

    // get visitor data from Firebase
    db.collection('visitors').doc(sessionId).get()
    .then((doc) => {
        if (doc.exists) {
            const visitorData = doc.data();
            res.render("pages/profile", { visitorData });
        } else {
            console.error('Visitor not found');
            res.redirect('/');
        }
    })
    .catch((error) => {
        console.error('Error fetching visitor data:', error);
        res.redirect('/');
    });
})

// build dot
app.get('/dotbuilder/:id', (req, res)=>{
    const sessionId = req.params.id;

    // get visitor data from Firebase
    db.collection('visitors').doc(sessionId).get()
    .then((doc) => {
        if (doc.exists) {
            const visitorData = doc.data();
            res.render("pages/dotbuilder", { visitorData });
        } else {
            console.error('Visitor not found');
            res.redirect('/');
        }
    })
    .catch((error) => {
        console.error('Error fetching visitor data:', error);
        res.redirect('/');
    });
})

function checkDotExists(sessionId) {
    return new Promise((resolve, reject) => {
        const dotRef = db.collection('dots').where('sessionId', '==', sessionId);
        dotRef.get()
            .then(snapshot => {
                const dotExists = !snapshot.empty;
                resolve(dotExists);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function addDot(sessionId, colorHex, group) {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
    
        // default coordinates around Atlanta with random variation
        const atlantaLongitude = 33.749;
        const atlantaLatitude = -84.388;
        const variation = 0.08;
        const latitude = atlantaLatitude + (Math.random() * variation * 2 - variation);
        const longitude = atlantaLongitude + (Math.random() * variation * 2 - variation);
    
    
        // Dot data
        const dotData = {
            sessionId: sessionId,
            group: group,
            colorHex: colorHex,
            timestamp: timestamp,
            longitude: longitude,
            latitude: latitude
        };
    
        // add the dot to the Firestore collection
        db.collection('dots').add(dotData)
        .then((docRef) => {
            resolve(docRef.id);
        })
        .catch(error => {
            reject(error);
        });
    });
}

// place dot on wanted position on map
app.get('/map/add/:id', async (req, res)=>{
    const sessionId = req.params.id; 
    try {
        // check if a dot already exists for the session ID
        const dotExists = await checkDotExists(sessionId);

        if (dotExists) {
            res.redirect('/map');
        } else {
            const visitorData = await getVisitorData(sessionId);
            const group = visitorData.group;

            // add new dot
            const color = req.query.color || 'error';
            const dotId = await addDot(sessionId, color, group);

            // Wait for a short delay to allow Firestore to propagate the changes
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // get added dot from the Firebase database
            const addedDotSnapshot = await db.collection('dots').doc(dotId).get();
            const addedDotData = addedDotSnapshot.data();

            // Ensure the snapshot contains valid data before pushing it
            if (addedDotData) {
                dots.push(addedDotData);
            } else {
                console.error('Error: Added dot data is null');
            }

            //res.render("pages/map_placer", {sessionId});
            res.redirect('/map');
        }
    } catch (error) {
        console.error('Error adding dot:', error);
        res.status(500).send('Error adding dot');
    }
})

// get dots
app.get('/api/dots', (req, res) => {
    res.json(dots);
});

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
app.get('/survey/:description', async (req, res) => {
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

            // build visitor entry
            const visitorRef = db.collection('visitors').doc(sessionId);
            const startTime = new Date();
            const assignedPersonality = Math.floor(Math.random() * 8) + 1; // random number between 1 and 8
            const visitorData = {
                sessionId: sessionId,
                active: true,
                group: assignedPersonality,
                starttime: startTime,
                endtime: null,
                exhibitsvisited: {
                    'oceans': false,
                    'airquality': false,
                    'socialdata': false,
                    'gridgame': false,
                    'acid': false,
                    'datamap': false
                },
                exhibitinfo: {
                    'oceans': '',
                    'airquality': '',
                    'socialdata': '',
                    'gridgame': '',
                    'acid': '',
                    'datamap': ''
                }
            };

            visitorRef.set(visitorData)
                .then(() => {
                    console.log('Visitor entry created successfully.');
                })
                .catch(error => {
                    console.error('Error creating visitor entry:', error);
                    res.status(500).send('Error creating visitor entry.');
                });


        } 

        sessionId = req.session.sessionId;

        //update visitor's entry
        const visitorRef = db.collection('visitors').doc(sessionId);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const doc = await visitorRef.get();
            if (!doc.exists) {
                throw new Error('Visitor document does not exist');
            }

            const exhibitName = desctosurvey[description];
            const exhibitsvisited = doc.data().exhibitsvisited || {};
            exhibitsvisited[exhibitName] = true;

            await visitorRef.update({
                exhibitsvisited: exhibitsvisited
            });

            res.render("pages/experiences/" + fileName, { sessionId });
        } catch (error) {
            functions.logger.error("Error updating visitor's entry:", error);
            res.status(500).send("Error updating visitor's entry");
        }
    } else {
        // unrecognized
        functions.logger.info("Unrecognized description:", description);
        res.redirect('/scanner');
    }

});

// save survey response
app.post('/survey/submit', checkSession, (req, res) => {
    const { exhibitName, data } = req.body;
    const sessionId = req.session.sessionId;

    const visitorRef = db.collection('visitors').doc(sessionId);
    visitorRef.update({
        [`exhibitinfo.${exhibitName}`]: data
    })
    .then(() => {
        res.status(200).send('Survey response submitted successfully.');
    })
    .catch(error => {
        console.error('Error updating exhibitinfo:', error);
        res.status(500).send('Failed to submit survey response.');
    });
});

// unknown
app.get('*', (req, res) => {
    res.redirect('/');
});


exports.app = functions.https.onRequest(app);