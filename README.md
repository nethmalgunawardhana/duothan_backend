# Duothan Backend API

A complete Node.js + Express backend with JWT authentication, Firebase Firestore, ImageKit image uploads, SendGrid email service, and Judge0 code execution.

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
- **Code Execution**: Judge0 API for executing code submissions
- **Security**: CORS, Helmet, Rate limiting ready
- **Health Checks**: Comprehensive service monitoring
- **Error Handling**: Global error handling middleware

## 📋 Prerequisites

- Node.js (v18 or higher, tested with v20.17.0)
- npm (comes with Node.js)
- Firebase project with Firestore enabled
- ImageKit.io account
- SendGrid account with verified sender
- Judge0 API key from RapidAPI

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
FIREBASE_CLIENT_EMAIL=your-firebase-client-email@example.com

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-endpoint

# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=your-verified-sender@example.com

# Default Admin Account
DEFAULT_ADMIN_EMAIL=admin@oasis.com
DEFAULT_ADMIN_PASSWORD=admin123

# Judge0 API Configuration (Custom CE Instance)
JUDGE0_API_URL=http://10.3.5.139:2358
JUDGE0_API_TOKEN=ZHVvdGhhbjUuMA==
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
    │   ├── adminController.js     # Admin logic
    │   ├── authController.js      # Authentication logic
    │   ├── healthController.js    # Health check logic
    │   └── submissionController.js # Code submission logic
    ├── middleware/
    │   ├── adminAuth.js           # Admin authentication middleware
    │   └── auth.js                # JWT middleware
    ├── models/
    │   ├── Admin.js               # Admin model
    │   ├── BaseModel.js           # Base model class
    │   ├── Challenge.js           # Challenge model
    │   ├── index.js               # Model exports
    │   ├── Post.js                # Post model
    │   ├── Submission.js          # Submission model
    │   ├── Team.js                # Team model
    │   └── User.js                # User model
    ├── routes/
    │   ├── admin.js               # Admin routes
    │   ├── auth.js                # Auth routes
    │   ├── health.js              # Health routes
    │   └── submission.js          # Submission routes
    ├── config/
    │   ├── firebase.js            # Firebase configuration
    │   ├── imagekit.js            # ImageKit configuration
    │   ├── judge0.js              # Judge0 configuration
    │   └── sendgrid.js            # SendGrid configuration
    └── utils/
        ├── jwt.js                 # JWT utilities
        └── judge0Service.js       # Judge0 service utilities
```

## 🧪 Testing the API

### 1. Health Check
```bash
curl http://localhost:5000/api/health
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

### 3. Code Execution
```bash
curl -X POST http://localhost:5000/api/submissions/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "code": "console.log(\"Hello, World!\");",
    "language": "javascript",
    "challengeId": "challenge123"
  }'
```

### 4. Flag Submission
```bash
curl -X POST http://localhost:5000/api/submissions/flag \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "flag": "flag{example_flag}",
    "challengeId": "challenge123"
  }'
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

#### 2. Judge0 API Connection Failed
- Check your RapidAPI key
- Verify API host is correct
- Ensure you have an active subscription on RapidAPI

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
- **axios**: HTTP client for Judge0 API

### Development Dependencies
- **nodemon**: Auto-restart on changes
- **concurrently**: Run multiple commands