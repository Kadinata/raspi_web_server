//===========================================================================
//  
//===========================================================================
const passport = require('passport');
const Errors = require('../../modules/status_codes/error_codes');

const login = (req, res, next) => {
  const session = false;
  passport.authenticate('login', { session }, (err, user, info) => {

    if (err !== null) {
      console.error(`Login Error: ${err}`);
      const message = 'An internal error occurred';
      return next(new Errors.InternalServerError(message));
    }

    if (!user) {
      const { message } = info;
      console.error(`Login Error: ${message}`);
      return next(new Errors.Unauthorized(message));
    }

    req.login(user, { session }, (err) => {
      if (err) {
        return next(new Errors.Unauthorized(err));
      }

      const token = req.auth.generateToken(user, 60 * 60);
      const auth = true;
      const message = 'Login successful';
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      res.cookie('jwt', token, { expires });
      res.json({ auth, token, message });
    });

  })(req, res, next);
};

const register = (req, res, next) => {
  const session = false;

  passport.authenticate('register', { session }, (err, user, info) => {
    if (err !== null) {
      console.error(`Register Error: ${err}`);
      const message = 'An internal error occurred';
      return next(new Errors.InternalServerError(message));
    }

    if (info !== undefined) {
      const { message } = info;
      console.error(`Register Error: ${message}`);
      return next(new Errors.Forbidden(message));
    }

    req.login(user, { session }, async () => {
      const status = 'success';
      const message = 'User created';
      res.json({ status, message });
    });

  })(req, res, next);
};

const userAuth = (req, res, next) => {
  const user = (req.user || null);
  res.json({ user });
};

const updatePassword = async (req, res, next) => {
  const user = (req.user || null);
  const { currentPassword, newPassword } = req.body;
  if (user === null) {
    const message = 'Permission denied';
    return next(new Errors.Forbidden(message));
  }
  const { error } = await req.auth.updateUserPassword(user.id, currentPassword, newPassword);

  if (error !== null) {
    const { message } = error;
    return next(new Errors.InternalServerError(message));
  }
  const status = 'success';
  const message = 'Password Updated';
  res.json({ status, message });
};

module.exports = {
  login,
  register,
  userAuth,
  updatePassword,
};