
/*
    This middleware ensures that only users with the flag isAdmin marked as 'true' can access
    certain admin pages.
    - If a logged-in user tries to access an admin page, but doesn't have the correct permissions, 
      they will get an Error 403: Forbidden Access. 
*/
function requireAdmin(req, res, next){
    if(!req.user){
        return res.status(401).json({error: "You must be logged in."});
    }

    if(!req.user.isAdmin){
        return res.status(403).json({error: "Error 403 Forbidden: You don't have permission to access this page."});
    }

    next();

}

module.exports = requireAdmin;