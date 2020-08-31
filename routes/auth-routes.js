// routes/auth-routes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ensureLogin = require('connect-ensure-login');

// User model
const User = require('../models/user');

// Bcrypt to encrypt passwords
const bcrypt = require('bcrypt');
const bcryptSalt = 10;

router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
});

router.post('/signup', (req, res, next) => {
  const { fullName, username, password } = req.body;

  console.log("signup ", req.body)

  if (!username || !password) {
    res.render('auth/signup', { message: 'Indicate username and password' });
    return;
  }
  console.log("signup2 ")

  User.findOne({ username })
    .then(user => {

      console.log("found user ", user)

      if (user !== null) {
        console.log("enviando página com erro")
        res.render('auth/signup', { message: 'The username already exists' });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        fullName,
        username,
        password: hashPass
      });

      newUser.save().then(() => res.redirect('/'))

    })
    .catch(error => {
      res.render('auth/signup', { message: 'Something went wrong' });
    });
});


router.get('/login', (req, res, next) => {
  res.render('auth/login', { message: req.flash('error') });
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
    passReqToCallback: true
  })
);

router.get('/private-page', ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render('private', { user: req.user });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/private-page",
    failureRedirect: "/" // here you would redirect to the login page using traditional login approach
  })
);

module.exports = router;