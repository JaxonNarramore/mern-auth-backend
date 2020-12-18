// Imports
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const JWT_SECRET = process.env.JWT_SECRET;

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

// POST controllers/users/login (Public)
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // Find a user via the email
    db.User.findOne({ email })
    .then(user => {
        // If no user 
        if (!user) {
            res.status(400).json({ msg: 'User not found' })
        } else {
            // A user is found
            bcrypt.compare(password, user.password)
            .then(isMatch => {
                // Check password for match
                if (isMatch) {
                    // User match, send a JSON web token
                    // Create a token payload
                    const payload = {
                        id: user.id,
                        email: user.email,
                        name: user.name
                    };
                    // Sign token
                    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (error, token) => {
                        res.json({
                            success: true,
                            token: `Bearer ${token}`
                        });
                    });
                } else {
                    return res.status(400).json({ msg: 'Email or password is incorrect' });
                }
            })
        }
    })
})

// GET controllers/users/current (public)
router.get('/current', passport.authenticate('jwt', { session: false }),(req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
})

module.exports = router;