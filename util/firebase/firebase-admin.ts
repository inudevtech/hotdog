import firebaseAdmin from 'firebase-admin';

const firebase = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp() : firebaseAdmin.app();
const auth = firebase.auth();
export default auth;
