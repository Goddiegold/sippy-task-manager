# Task Manager API

This is a RESTful API that allows users to create, update, delete, and track tasks. This system support multiple users, authentication, task assignment, status updates, priority levels, and image uploads.


## 🛠️ Setup Instructions

### 1️⃣ Clone the Repository
```sh
git clone <repo-url>
cd <project-directory>
```

### 2️⃣ Create a `.env` File
Ensure you have the `.env` file in the root directory, check slack message.


### 3️⃣ Install Dependencies
```sh
npm install
```

### 4️⃣ Generate Prisma Client
```sh
npx prisma generate
```

### 5️⃣ Start the Development Server
```sh
npm run start:dev
```

### 6️⃣ Wait for Application to Start
Once the server starts, you should see:
```
Application is running on: http://localhost:5353
```

### 5️⃣ Run unit test
```sh
npm run test:e2e
```