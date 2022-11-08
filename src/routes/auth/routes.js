//===========================================================================
//  
//===========================================================================
const express = require('express');
const handlers = require('./handler');
const protectedRoute = require('../../modules/auth/protected_route');

const router = express.Router();

router.post('/register', handlers.register);
router.post('/login', handlers.login);
router.get('/user', protectedRoute, handlers.userAuth);
router.post('/update_password', protectedRoute, handlers.updatePassword);

module.exports = router;
//===========================================================================