## Passport JS:
- **Middleware** specialized for user authentication
- `req.login()`
- `req.logout()`
- `passport.serializeUser()`
- `passport.deserializeUser()`
- We chose Passport.JS with Google OAuth because it lets us rely on Google's authentication system instead of building our own user/password-based login. This makes it easier to verify that users actually are real, and own the UCLA address they sign up with. Also, it reduces security risk considering we don't need to store/manage passwords ourselves. 