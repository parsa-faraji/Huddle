# Backend Setup Guide (Beginner Friendly)

Welcome to the backend setup! This guide is designed to help your team set up a solid foundation for the backend using **Node.js, Express, and Firebase**.

We'll take it step by step so everyone can follow along.

## Prerequisites
Make sure everyone on the team has the following installed on their computers:
1. **Node.js** (Download from [nodejs.org](https://nodejs.org/))
2. **Postman** or **Insomnia** (Optional, but great for testing APIs)

---

## Step 1: Initialize the Project
First, we need to create a `package.json` file which keeps track of all our project's packages and scripts.

Open your terminal, navigate to the `Backend` folder, and run:
```bash
cd Backend
npm init -y
```

## Step 2: Install Dependencies
We will need a few standard libraries to get our server running and talking to Firebase:
- **express**: The core framework for our web server.
- **cors**: Allows our frontend to securely talk to our backend.
- **dotenv**: Lets us use a `.env` file to keep our sensitive keys safe.
- **firebase-admin**: Allows our backend to securely interact with our Firebase database.
- **nodemon** (Dev Dependency): Automatically restarts the server when you save a file.

Run this command to install the main packages:
```bash
npm install express cors dotenv firebase-admin
```

Then, install nodemon for development:
```bash
npm install nodemon --save-dev
```

## Step 3: Setup the Server (`index.js`)
Create a new file inside the `Backend` folder called `index.js`. This will be the entry point for your server.

Add the following starter code to `index.js`:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Initialize the app
const app = express();

// Middleware
app.use(cors()); // Allow requests from our frontend
app.use(express.json()); // Allow our API to parse JSON data sent in requests

// A simple test route
app.get('/api/status', (req, res) => {
  res.json({ message: "Backend is running successfully! 🚀" });
});

// Set the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

## Step 4: Add Start Scripts
Open the `package.json` file that was created in Step 1. Find the `"scripts"` section and update it to look like this:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```
Now you can run `npm run dev` in your terminal to start the server!

## Step 5: Test the Server
1. In your terminal, inside the `Backend` folder, run:
   ```bash
   npm run dev
   ```
2. Open your web browser and go to: [http://localhost:5000/api/status](http://localhost:5000/api/status)
3. If you see `{"message":"Backend is running successfully! 🚀"}`, you did it! 🎉

## Step 6: Connect to Firebase (Next Steps)
Since you already have Firebase configured in the root folder, the next big step will be connecting your Express server to Firebase using the **Firebase Admin SDK**.
1. Go to your Firebase Console > Project Settings > Service Accounts.
2. Generate a new private key and save it in your `Backend` folder (make sure to add it to `.gitignore` so you don't leak it on GitHub!).
3. Initialize `firebase-admin` in your code using that key.

---
**Tip for the Team**: Take turns "driving" (typing the code) while others "navigate" (guide and review). Have fun building!
