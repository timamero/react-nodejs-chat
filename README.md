# 💬 Video Chat App

A video chat app created with Socket.io, Typescript, React, Node.js, and Express.  
  
*This project is still in development.*

## 🚀 Quick Start
1. Clone this repository
```sh
git clone https://github.com/timamero/react-nodejs-video-chat.git
```
2. Install dependencies
```sh
npm install
```
3. Run the server and client in development mode
```sh
npm run dev
```
 - Concurrently is used to run the server and client at the same time
 - You can also run the the app by running the server and client separately.
```sh
cd backend
npm run dev
cd ..
cd frontend
npm start
```

4. Open the browser and go to http://localhost:3000/.

5. To demo the video chat room go to http://localhost:3000/testroom.

## 🧪 Testing
1. To run E2E testing run the following commands from the root folder.
```sh
npm run cypress:prestart
npm run cypress-e2e
```
2. To run component testing run the following commands from the root folder.
```sh
npm run cypress:prestart
npm run cypress-ct
```


E2E tests are located in `frontend/cypress/integration`.
Component tests are located in `frontend/src/__tests__`.