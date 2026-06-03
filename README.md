# BruinPark

BruinPark is a web application that helps UCLA commuter students save money by sharing parking permits, by matching users with other commuters with non-overlapping schedules. Users authenticate with their UCLA Google account, and can create a parking post to describe what structure their are assigned, what time they need to be on campus, and extra notes section for extra requirements. Students are able to send messages directly to each other within the app to further coordinate sharing a permit.


## Features:
- UCLA only sign in via Google OAuth 2.0 (`@ucla.edu` and `@g.ucla.edu`)
- Create, edit and delete parking posts
- Browse and filter posts based on day of the week and parking structure
- Send message requests with other students
- Permit verification by uploading a screenshot of their confirmation email
- Admin dashboard to verify permits


## Tech Stack:
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB (via Mongoose)
- **Authentication**: Google OAuth 2.0 + Passport.js
- **Sessions**: express-session stored in MongoDB via connect-mongo
- **File Uploads**: Multer

## Repository Structure:
```
bruinpark/
    backend/
        config/
        middleware/
        models/
        routes/
        uploads/
        index.js
        package.json
    frontend/
        src/
            api/
            components/
            hooks/
            pages/
            styles/
            utils/
            App.css
            App.jsx
            index.css
            main.jsx
        package.json
```

## Prerequisites:
1. Node.js v18 or higher
2. npm
3. MongoDB either locally on `mongodb://localhost:27017` or a Mongo atlas cluster (free)
4. Google OAuth 2.0 credentials

## Setup:
1. Clone the repository
```bash
git clone <https://github.com/shyam7nj/bruinpark.git>
cd BruinPark
```

2. Setup Google OAuth credentials
    - `Go to https://console.cloud.google.com/` 
    -  Create a new project
    - Go to `APIs & Services` -> `OAuth consent screen` -> Choose external and fill in basic info
    - Go to `APIs & Services` -> `Credentials` -> `Create credentials` -> `OAuth client ID`
    - Choose `Web Application`
    - Under `Authorized JavaScript origins` add: `http://localhost:5173`
    - Under `Authorized redirect URIs` add: `http://localhost:3001/auth/google/callback`
    - Save a copy of `Client ID` and `Client Secret`

3. Configure .env variables
```env
GOOGLE_CLIENT_ID= <client ID from previous step>
GOOGLE_CLIENT_SECRET= <client secret from previous step>
MONGO_URI= <mongo connection string>
SESSION_SECRET= <any random long string>
CLIENT_URI= <http://localhost:5173>
```
4. Install dependencies (two terminals needed)
```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

5. Start the backend and frontend (two terminals needed)
```bash
cd backend
npm run dev
```

```bash
cd backend
npm run dev
```

6. Open the app
- Open `http://localhost:5173` in whatever browser of your choice and login with your UCLA email


7. (Optional) Access Admin Page
- The admin verificaiton page is only accessible to users with the `isAdmin` flag set to true, and must be done directly in the database.
- Locate the collection that stores all the users in MongoDB. Then, manually edit `isAdmin` to true, and save. It will likely be in a folder called `users`.
- Refresh and you should see the option to review permit verifications. 

