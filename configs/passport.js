const User = require('../models/user')
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require("passport-google-oauth20").Strategy
const bcrypt = require('bcryptjs') // !!!
const passport = require('passport')

passport.serializeUser((loggedInUser, cb) => {
  cb(null, loggedInUser._id)
})

passport.deserializeUser((userIdFromSession, cb) => {
  User.findById(userIdFromSession, (err, userDocument) => {
    if (err) {
      cb(err)
      return
    }
    cb(null, userDocument)
  })
})

passport.use(
  new LocalStrategy({ passReqToCallback: true }, (req, username, password, callback) => {

    console.log("Passport is authenticating with Local Strategy...")

    User.findOne({ username })
    .then(user => {
      if (!user) {
        console.log("could not find a user")
        return callback(null, false, { message: 'Incorrect username' })
      }
      if (!bcrypt.compareSync(password, user.password)) {
        console.log("password doesn't match")
        return callback(null, false, { message: 'Incorrect password' })
      }
      console.log("everything OK with the authentication...")

      req.session.user = user

      callback(null, user)
    })
    .catch(error => {
      console.log("Something went wrong with the authentication...")
      callback(error)
    })
  })
)

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      // to see the structure of the data in received response:
      console.log("Google account details:", profile)

      User.findOne({ googleID: profile.id })
        .then(user => {
          if (user) {
            done(null, user)
            return
          }

          User.create({ googleID: profile.id, fullName: profile.displayName, avatar: profile.photos[0].value })
            .then(newUser => {
              done(null, newUser)
            })
            .catch(err => done(err)) // closes User.create()
        })
        .catch(err => done(err)) // closes User.findOne()
    }
  )
)
