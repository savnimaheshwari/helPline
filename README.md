# Helpline Backend API

A comprehensive backend API for the Purdue University Student Health & Safety App - Helpline.

## 🚀 Features

- **User Authentication & Management**
  - Purdue University student registration and login
  - JWT-based authentication
  - Account verification and security features
  - Rate limiting and brute force protection

- **Health Profile Management**
  - Comprehensive health information storage
  - Emergency contact management
  - Medical conditions and allergies tracking
  - Data export and backup

- **Emergency Response System**
  - SOS alert system with real-time notifications
  - Location-based emergency tracking
  - Campus safety integration
  - Emergency contact notification

- **Campus Beacon System**
  - Location sharing for safety
  - Temporary location broadcasting
  - Campus safety monitoring
  - Geospatial emergency tracking

## 🏗️ Architecture

```
backend/
├── config/          # Database and configuration
├── models/          # MongoDB schemas and models
├── routes/          # API route handlers
├── middleware/      # Authentication and validation
├── utils/           # Helper functions
├── server.js        # Main server file
└── package.json     # Dependencies
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Mongoose validation + custom middleware

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## ⚙️ Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/helpline

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Purdue University Configuration
CAMPUS_EMERGENCY_NUMBER=911
PURDUE_POLICE_NUMBER=765-494-8221
STUDENT_HEALTH_NUMBER=765-494-1700
```

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | User registration | Public |
| POST | `/login` | User authentication | Public |
| GET | `/profile` | Get user profile | Private |
| PUT | `/profile` | Update user profile | Private |
| PUT | `/change-password` | Change password | Private |
| POST | `/verify-email` | Email verification | Public |
| POST | `/forgot-password` | Password reset | Public |
| POST | `/refresh` | Refresh JWT token | Private |

### Health Profile (`/api/health`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/` | Create health profile | Private |
| GET | `/` | Get health profile | Private |
| PUT | `/` | Update health profile | Private |
| DELETE | `/` | Delete health profile | Private |
| GET | `/qr-data` | Get QR code data | Private |
| GET | `/export` | Export health data | Private |
| GET | `/summary` | Get profile summary | Private |
| PUT | `/emergency-contacts` | Update contacts | Private |
| POST | `/medical-conditions` | Add condition | Private |
| PUT | `/medical-conditions/:id` | Update condition | Private |

### Emergency (`/api/emergency`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/sos` | Send SOS alert | Private |
| GET | `/alerts` | Get user alerts | Private |
| GET | `/alerts/:id` | Get specific alert | Private |
| PUT | `/alerts/:id/status` | Update alert status | Private |
| PUT | `/alerts/:id/cancel` | Cancel alert | Private |
| GET | `/stats` | Get emergency stats | Private |
| GET | `/nearby` | Get nearby alerts | Private |
| POST | `/test-notification` | Test notifications | Private |

### Beacon (`/api/beacon`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/activate` | Activate beacon | Private |
| PUT | `/deactivate` | Deactivate beacon | Private |
| GET | `/status` | Get beacon status | Private |
| GET | `/nearby` | Get nearby beacons | Private |
| GET | `/history` | Get beacon history | Private |
| PUT | `/location` | Update location | Private |
| PUT | `/extend` | Extend duration | Private |
| GET | `/stats` | Get beacon stats | Private |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Models

### User
- Purdue ID and email validation
- Password hashing with bcrypt
- Account security features
- Academic information

### HealthProfile
- Personal health information
- Emergency contacts
- Medical conditions and allergies
- Campus location data

### EmergencyAlert
- Emergency situation tracking
- Location-based alerts
- Notification status
- Beacon information

## 🚨 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Mongoose schema validation
- **CORS Protection**: Cross-origin request security
- **Helmet**: Security headers and protection

## 📱 Integration

### Frontend Integration
The API is designed to work seamlessly with the React frontend. Key integration points:

- JWT token storage in localStorage
- Real-time location updates
- Emergency alert notifications
- Health data synchronization

### External Services
Future integrations planned:

- SMS notifications (Twilio)
- Email services (SendGrid)
- Campus safety systems
- Emergency response coordination

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Performance

- **Database Indexing**: Optimized MongoDB queries
- **Rate Limiting**: API usage throttling
- **Response Caching**: Static data caching
- **Connection Pooling**: Database connection optimization

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Configure production MongoDB URI
   - Set secure JWT secret

2. **Security**
   - Enable HTTPS
   - Configure CORS origins
   - Set up rate limiting

3. **Monitoring**
   - Log aggregation
   - Performance monitoring
   - Error tracking

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🔮 Roadmap

- [ ] Real-time notifications (WebSocket)
- [ ] SMS/Email integration
- [ ] Campus safety API integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app API endpoints
- [ ] Multi-language support
- [ ] Advanced security features
- [ ] Performance monitoring
- [ ] Automated testing suite
- [ ] CI/CD pipeline
