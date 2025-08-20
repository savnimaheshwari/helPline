# Helpline

## How to Run

### Prerequisites
- Node.js
- MongoDB

### Setup
1. Install dependencies:
```bash
npm install
cd backend && npm install
```

2. Create `.env` file in backend folder:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/helpline
JWT_SECRET=your-secret-key
```

3. Start MongoDB:
```bash
brew services start mongodb/brew/mongodb-community
```

4. Start backend:
```bash
cd backend
npm run dev
```

5. Start frontend (new terminal):
```bash
npm start
```

### Access
- Frontend: http://localhost:3000
- Backend: http://localhost:5001
