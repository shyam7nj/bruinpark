/*
  Middleware that blocks unverified users from creating posts.
  Must be used after requireAuth so req.user is guaranteed to exist.
*/
const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      error: 'Permit verification required.',
      code: 'UNVERIFIED',
    });
  }
  next();
};

module.exports = requireVerified;