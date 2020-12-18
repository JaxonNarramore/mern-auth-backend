require('dotenv').config();

// A passport strategy for auth with a json web token
// This allows to authinticate endpoints using a token
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = require('../models/User');


const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

// JWT_SECRET is inside of our enviroment
options.secretOrKey = process.env.JWT_SECRET;

module.exports = (passport) => {
    passport.use(new JwtStrategy(options, (jwt_payload, done) => {
        // Have a user thats going to find by the id in the payload 
        // When we get a user back, we will check to see if the user is in the database
        User.findBtId(jwt_payload.id)
        .then(user => {
            if(user) {
            // If a user is found, return null (for error) and the user
            return done(null, user)
        } else {
            // No user was found
            return done(null, false)
            }
        })
        .catch(error => console.log(error));
    }))
}