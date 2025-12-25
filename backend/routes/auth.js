
// /home/claude/devops-dashboard/backend/routes/auth.js

const express = require('express');

const router = express.Router();

const jwt = require('jsonwebtoken');

const Joi = require('joi');

const User = require('../models/User');

const { auth } = require('../middleware/auth');

const logger = require('../utils/logger');



const registerSchema = Joi.object({

  username: Joi.string().min(3).max(30).required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required()

});



const loginSchema = Joi.object({

  email: Joi.string().email().required(),

  password: Joi.string().required()

});



router.post('/register', async (req, res) => {

  try {

    const { error } = registerSchema.validate(req.body);

    if (error) {

      return res.status(400).json({ error: error.details[0].message });

    }



    const { username, email, password } = req.body;



    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {

      return res.status(400).json({ error: 'User already exists' });

    }



    const user = new User({ username, email, password });

    await user.save();



    const token = jwt.sign(

      { userId: user._id },

      process.env.JWT_SECRET,

      { expiresIn: process.env.JWT_EXPIRE }

    );



    logger.info(`New user registered: ${email}`);



    res.status(201).json({

      message: 'User registered successfully',

      token,

      user: {

        id: user._id,

        username: user.username,

        email: user.email,

        role: user.role

      }

    });

  } catch (error) {

    logger.error('Registration error:', error);

    res.status(500).json({ error: 'Registration failed' });

  }

});



router.post('/login', async (req, res) => {

  try {

    const { error } = loginSchema.validate(req.body);

    if (error) {

      return res.status(400).json({ error: error.details[0].message });

    }



    const { email, password } = req.body;



    const user = await User.findOne({ email });

    if (!user) {

      return res.status(401).json({ error: 'Invalid credentials' });

    }



    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {

      return res.status(401).json({ error: 'Invalid credentials' });

    }



    const token = jwt.sign(

      { userId: user._id },

      process.env.JWT_SECRET,

      { expiresIn: process.env.JWT_EXPIRE }

    );



    logger.info(`User logged in: ${email}`);



    res.json({

      token,

      user: {

        id: user._id,

        username: user.username,

        email: user.email,

        role: user.role,

        preferences: user.preferences

      }

    });

  } catch (error) {

    logger.error('Login error:', error);

    res.status(500).json({ error: 'Login failed' });

  }

});



router.get('/me', auth, async (req, res) => {

  try {

    res.json({ user: req.user });

  } catch (error) {

    logger.error('Get user error:', error);

    res.status(500).json({ error: 'Failed to get user info' });

  }

});



router.patch('/preferences', auth, async (req, res) => {

  try {

    const { theme, notifications } = req.body;

    

    if (theme) req.user.preferences.theme = theme;

    if (notifications !== undefined) req.user.preferences.notifications = notifications;

    

    await req.user.save();

    

    res.json({ 

      message: 'Preferences updated',

      preferences: req.user.preferences 

    });

  } catch (error) {

    logger.error('Update preferences error:', error);

    res.status(500).json({ error: 'Failed to update preferences' });

  }

});



module.exports = router;

