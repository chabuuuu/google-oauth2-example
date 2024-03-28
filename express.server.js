require('dotenv').config()
const http = require('http');
const https = require('https');
const url = require('url');
var session = require('express-session')
const { google } = require('googleapis');

const express = require('express')

const app = express()

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
  );
  console.log('redirectr:', process.env.REDIRECT_URL);
  
app.get('/login-by-google', (req, res, next) => {
    const randomState = Math.random().toString(36).substring(7);
      // Access scopes for read-only Drive activity.
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email'
  ];
  
  // Generate a url that asks permissions for the Drive activity scope
  const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    /** Pass in the scopes array defined above.
      * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true,
    state: randomState
  });
    console.log('randomState:', randomState);
    req.session.protect = randomState;
    res.redirect(authorizationUrl)
})

app.get('/oauth2callback', async (req, res, next) => {
    let q = url.parse(req.url, true).query;
    const query = req.query
    console.log('query:', query);
    console.log('callback state: ', query.state);
    console.log('Session: ', req.session.protect);
    if (query.error){
        console.log('Error:' + query.error);
        res.status(400).json({error: query.error})
    }
    let { tokens } = await oauth2Client.getToken(q.code);
    console.log('token:::', tokens);
    console.log('session state:::', req.session.protect);
    res.status(200).json({tokens})
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})