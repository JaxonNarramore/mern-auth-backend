// Imports
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Models
// const User = require('../models/User');
const db  = require('../models');

// GET controllers/users/test (Public)
router.get('/test', (req, res) => {
    res.json({ msg: 'User endpoint OK!' })
});

// POST controllers/users/register (public)
router.post('/register', (req, res) => {
    // Find user by email
    db.User.findOne({ email: req.body.email })
    .then(user => {
        // If email already exists, send 400 response 
        if (user) {
            return res.status(400).json({ msg: 'Email already exists' });
        } else {
            // Create new user
            const newUser = new User({ 
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
             });
             // Salt and hash the password, then save the user
             bcrypt.genSalt(10, (err, salt) => {
                 if (err) throw Error;

                 bcrypt.hash(newUser.password, salt, (error, hash) => {
                    if (error) throw Error;
                    // Change the password in newUser in hash
                    newUser.password = hash;
                    newUser.save()
                    .then(createdUser => res.json(createdUser))
                    .catch(error => console.log(error));
                 })
             })
        }
    })
})

module.exports = router;