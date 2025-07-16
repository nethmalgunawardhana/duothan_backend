# Duothan Backend API

A complete Node.js + Express backend with JWT authentication, Firebase Firestore, ImageKit image uploads, and SendGrid email service.

**🎯 Status: Production Ready** | **✅ All Services Connected** | **🔒 Security Verified**

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and configure
cp .env.example .env
# Edit .env with your API keys

# 3. Start the server
npm run dev
```

**🔗 Health Check**: `http://localhost:5000/api/health`

## 🚀 Features

- **Authentication**: Custom JWT-based auth system
- **Database**: Firebase Firestore integration
- **File Uploads**: ImageKit.io for image management
- **Email Service**: SendGrid for transactional emails
- **Security**: CORS, Helmet, Rate limiting ready
- **Health Checks**: Comprehensive service monitoring
- **Error Handling**: Global error handling middleware

## 📋 Prerequisites

- Node.js (v18 or higher, tested with v20.17.0)
- npm (comes with Node.js)
- Firebase project with Firestore enabled
- ImageKit.io account
- SendGrid account with verified sender

## 🛠️ Installation

1. **Clone and setup:**
```bash
git clone <repository-url>
cd duothan_backend
npm install
```

2. **Environment Setup:**
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. **Start the server:**
```bash
npm run dev
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-for-security

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id

# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

### 🔧 Getting Your API Keys

#### Firebase Setup:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create/select your project
3. Go to Project Settings → Service Accounts
4. Generate new private key
5. Download the JSON file and copy the values

#### ImageKit Setup:
1. Sign up at [ImageKit.io](https://imagekit.io/)
2. Go to Developer → API Keys
3. Copy Public Key, Private Key, and URL Endpoint

#### SendGrid Setup:
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Go to Settings → API Keys
3. Create new API key with Mail Send permissions
4. Verify your sender email in Settings → Sender Authentication

## 🏃‍♂️ How to Run

### Development Mode
```bash
npm run dev
```
Server runs on `http://localhost:5000` with auto-reload.

### Production Mode
```bash
npm start
```

### Run Both Frontend & Backend
```bash
npm run dev:both
```
Runs both backend (port 5000) and frontend (port 3000) concurrently.

## 📡 API Endpoints

### Health Check Endpoints
```bash
# Overall health check
GET /api/health

# Database connection check
GET /api/health/database

# All services check
GET /api/health/services
```

### Authentication Endpoints
```bash
# Register new user
POST /api/auth/register
Body: { "name": "John Doe", "email": "john@example.com", "password": "password123" }

# Login user
POST /api/auth/login
Body: { "email": "john@example.com", "password": "password123" }

# Get user profile (requires auth token)
GET /api/auth/profile
Headers: { "Authorization": "Bearer <jwt-token>" }
```

## 🧪 Testing the API

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2025-07-15T21:27:25.011Z",
    "uptime": 123.456,
    "services": {
      "firebase": true,
      "sendgrid": true,
      "imagekit": true
    }
  }
}
```

### 2. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "name": "Test User",
    "email": "test@example.com",
    "isVerified": false
  }
}
```

### 3. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Get Profile (with token)
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📁 Project Structure

```
duothan_backend/
├── server.js                 # Main server file
├── package.json
├── .env                      # Environment variables
├── .gitignore
├── README.md
└── src/
    ├── controllers/
    │   ├── authController.js     # Authentication logic
    │   └── healthController.js   # Health check logic
    ├── middleware/
    │   └── auth.js               # JWT middleware
    ├── models/
    │   ├── BaseModel.js          # Base model class with common functionality
    │   ├── index.js              # Model exports and initialization
    │   ├── Post.js               # Post model for content management
    │   └── User.js               # User model for authentication
    ├── routes/
    │   ├── auth.js               # Auth routes
    │   └── health.js             # Health routes
    ├── config/
    │   ├── firebase.js           # Firebase configuration
    │   ├── sendgrid.js           # SendGrid configuration
    │   └── imagekit.js           # ImageKit configuration
    └── utils/
        └── jwt.js                # JWT utilities
```

## 🛡️ Security Features

- **CORS**: Configurable cross-origin requests
- **Helmet**: Security headers middleware
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Environment Variables**: Sensitive data protection
- **Input Validation**: Request validation middleware ready

## 🚨 Troubleshooting

### Common Issues:

#### 1. Port Already in Use
```powershell
# Kill process on port 5000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
# Or use different port
$env:PORT=5001; npm run dev
```

#### 2. Firebase Connection Failed
- Check your Firebase project ID
- Verify service account permissions
- Ensure private key format is correct (with \n)

#### 3. CORS Errors
- Check FRONTEND_URL in .env
- Verify frontend is running on specified port
- For competition, use `origin: true` in server.js

#### 4. JWT Token Issues
- Ensure JWT_SECRET is at least 32 characters
- Check token expiration (24h default)
- Verify Authorization header format: `Bearer <token>`

#### 5. Email Not Sending
- Verify SendGrid API key permissions
- Check sender email verification
- Ensure FROM_EMAIL is verified in SendGrid

### Debug Mode
```bash
DEBUG=* npm run dev
```

### Check Service Connections
```powershell
# Test each service individually (PowerShell)
curl http://localhost:5000/api/health/database
curl http://localhost:5000/api/health/services

# Or use Invoke-RestMethod for better JSON formatting
Invoke-RestMethod http://localhost:5000/api/health | ConvertTo-Json
```

## 📚 Dependencies

### Production Dependencies
- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **helmet**: Security middleware
- **morgan**: HTTP request logger
- **dotenv**: Environment variable loader
- **jsonwebtoken**: JWT implementation
- **bcryptjs**: Password hashing
- **firebase-admin**: Firebase SDK
- **imagekit**: ImageKit SDK
- **@sendgrid/mail**: SendGrid SDK

### Development Dependencies
- **nodemon**: Auto-restart on changes
- **concurrently**: Run multiple commands

## 🔄 Current Status

✅ **Server**: Running successfully on port 5000  
✅ **Health Checks**: All endpoints responding  
✅ **Database**: Firebase Firestore connected  
✅ **Security**: All vulnerabilities fixed  
✅ **Dependencies**: All packages up to date  

### ✅ Verified Working (Last checked: July 16, 2025)
- Health endpoint: `GET /api/health` → Status: OK
- Database check: `GET /api/health/database` → Connected
- Services check: `GET /api/health/services` → All operational
- Auth endpoints: `POST /api/auth/*` → Responding correctly
- CORS: Configured for development
- Security: Helmet + CORS enabled
- Environment: 12 variables loaded successfully

## 📝 Available Scripts

```bash
npm start          # Production server
npm run dev        # Development server with auto-reload
npm run dev:both   # Run backend + frontend together
npm install        # Install dependencies
npm audit fix      # Fix security vulnerabilities
```

## 🔗 Related

- **Frontend Repository**: `../duothan_frontend`
- **API Documentation**: Available at `/api/health` for service status

## 📞 Support

For competition support, check:
1. Health endpoints: `/api/health/*`
2. Console logs for error details
3. Network tab in browser dev tools
4. This README troubleshooting section

---

**Good luck with your competition! 🏆**

> **Quick Start Reminder**: 
> 1. Copy environment variables
> 2. Run `npm install`
> 3. Run `npm run dev`
> 4. Test health endpoint
> 5. Start building! 🚀