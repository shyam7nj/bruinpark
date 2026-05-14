
/*
This middleware helps only allow logged in requests to go through
- If Passport misses req.user, send error 401 indicating login is needed
- Otherwise if req.user DOES exist from passport, allow the request to continue
*/
const requireAuth = (req, res, next) => {
    if(!req.user){
        return res.status(401).json({error: 'Login required'});
    }
    next();
};

module.exports = requireAuth;