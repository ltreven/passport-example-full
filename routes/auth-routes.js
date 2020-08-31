const express = require('express')
const router = express.Router()
const passport = require('passport')
const ensureLogin = require('connect-ensure-login')

const User = require('../models/user')

const bcrypt = require('bcryptjs')
const bcryptSalt = 10

router.post('/signup', (req, res, next) => {
  const { fullName, username, password } = req.body

  console.log("signing up: ", req.body)

  if (!username || !password) {
    res.status(400).json({ message: 'Provide username and password' })
    return
  }

  console.log("Finding the user in the database...")
  User.findOne({ username }).then(user => {
    console.log("found user ", user)

    if (user !== null) {
      res.status(400).json({ message: 'Username already exists. Choose another one.' })
      return
    }

    const salt = bcrypt.genSaltSync(bcryptSalt)
    const hashPass = bcrypt.hashSync(password, salt)

    User.create({
      fullName,
      username,
      password: hashPass
    })
    .then(newUser => res.status(200).json(newUser))
    .catch(err => {
      console.log(err)
      res.status(500).json({ message: "Username check went bad." })
    })

  })
    .catch(error => {
      res.status(500).json({ message: "Username check went bad." })
      return
    })
})


router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, theUser, failureDetails) => {

    console.log("This is the callback function passport will call after authentication...")

    if (err) {
      res.status(500).json({ message: 'Something went wrong authenticating user' });
      return;
    }

    if (!theUser) {
      // "failureDetails" contains the error messages
      // from our logic in "LocalStrategy" { message: '...' }.
      res.status(401).json(failureDetails);
      return;
    }

    console.log("Login successful")

    // passport login: saves the user in session
    req.login(theUser, (err) => {
      if (err) {
        res.status(500).json({ message: 'Session save went bad.' });
        return;
      }

      // We are now logged in (that's why we can also send req.user)
      res.status(200).json(theUser);
    });
  })(req, res, next);
});

router.post('/logout', (req, res, next) => {
  // req.logout() is defined by passport
  req.logout();
  res.status(200).json({ message: 'Logged out successfully!' });
});

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  })
)

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/private-page",
    failureRedirect: "/login"
  })
)

const ensureAuthenticated = (req, res, next) => req.isAuthenticated() ? next() : res.sendStatus(401);

router.get('/check', ensureAuthenticated, (req, res, next) => {
  console.log("Authenticated call to the API")
  console.log("User in request: ", req.user)
  console.log("USer in session (do you really need another place to keep the user?): ", req.session.user)
  res.status(200).json({ message: 'check!' })
})

module.exports = router