# Complete Installation & Deployment Guide

## System Requirements

- **OS**: Windows 10+, macOS, or Linux
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **MongoDB**: v4.4.0 or higher (local or Atlas)
- **RAM**: Minimum 2GB
- **Disk Space**: Minimum 500MB

## Step-by-Step Installation

### Part 1: Prerequisites Installation

#### Windows
1. **Install Node.js**
   - Download from https://nodejs.org/
   - Choose LTS version
   - Run installer and follow setup
   - Verify: `node --version` and `npm --version`

2. **Install MongoDB** (Optional - can use MongoDB Atlas cloud)
   - Download from https://www.mongodb.com/try/download/community
   - Run installer
   - Choose "Install MongoDB as a Service"
   - Start MongoDB: `net start MongoDB` (or use MongoDB Compass)

#### macOS
```bash
# Install Node.js (using Homebrew)
brew install node

# Install MongoDB (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux (Ubuntu)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### Part 2: Project Setup

#### 1. Download/Clone Project
```bash
# Navigate to your projects folder
cd ~/projects  # or your preferred location

# Clone or download the project
git clone <repository-url> billing
cd billing
```

#### 2. Automatic Setup (Recommended)

**Windows:**
```bash
# Double-click setup.bat or run in Command Prompt
setup.bat
```

**macOS/Linux:**
```bash
# Run setup script
bash setup.sh
```

#### 3. Manual Setup (If automatic fails)

**Backend Setup:**
```bash
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Your backend is ready
cd ..
```

**Frontend Setup:**
```bash
cd frontend

# Install dependencies
npm install

# Your frontend is ready
cd ..
```

### Part 3: Configuration

#### MongoDB Configuration

**Option A: Local MongoDB**
1. Start MongoDB service:
   - Windows: Services → MongoDB (or `mongod` in terminal)
   - Mac/Linux: `brew services start mongodb-community`

2. Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/gst-invoice
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string
4. Edit `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gst-invoice?retryWrites=true&w=majority
```

#### Backend Configuration
Edit `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gst-invoice
NODE_ENV=development
JWT_SECRET=change_this_to_random_string
```

#### Frontend Configuration
Frontend automatically connects to `http://localhost:5000` (see `frontend/src/utils/api.js`)

### Part 4: Running the Application

#### Terminal 1 - Start Backend Server
```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB connected
```

#### Terminal 2 - Start Frontend Server
```bash
cd frontend
npm start
```

Expected output:
```
Compiled successfully!
You can now view gst-invoice-frontend in the browser.
Local: http://localhost:3000
```

### Part 5: Verification

1. Open browser and go to http://localhost:3000
2. You should see the GST Invoice Manager interface
3. Check API health: http://localhost:5000/api/health
4. Should return: `{"status":"Server is running"}`

---

## Production Deployment

### Backend Deployment (Example: Heroku)

1. **Prepare for Deployment**
```bash
cd backend
npm install -g heroku-cli
heroku login
```

2. **Create Heroku App**
```bash
heroku create your-app-name
heroku addons:create mongolab:sandbox
```

3. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secure-secret-key
```

4. **Deploy**
```bash
git push heroku main
```

### Frontend Deployment (Example: Vercel)

1. **Build Production Bundle**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Connect GitHub repository
   - Select `frontend` folder as root
   - Set environment variable:
     - `REACT_APP_API_URL=https://your-backend-url.com`

3. **Alternative: Manual Deployment**
```bash
# Build
npm run build

# Deploy 'build' folder to any static hosting
# - AWS S3
# - Azure Static Web Apps
# - GitHub Pages
# - Netlify
```

### Production Environment Setup

**Backend `.env` (Production)**
```
PORT=5000
MONGODB_URI=<your-mongodb-atlas-uri>
NODE_ENV=production
JWT_SECRET=<very-long-random-string>
INVOICE_PDF_PATH=/tmp/invoices
```

**Frontend API Configuration**
Update `frontend/src/utils/api.js`:
```javascript
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

---

## Troubleshooting

### Issue: MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
- Ensure MongoDB is running: `mongod` or service started
- Check connection URI in `.env`
- Verify firewall allows port 27017

### Issue: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
```bash
# Windows: Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux: Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Issue: CORS Error in Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**
- Ensure backend is running on port 5000
- Check frontend `api.js` has correct API_BASE_URL
- Verify CORS middleware in backend `server.js`

### Issue: npm Dependencies Issue
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Cannot Find Module Error
```bash
# Reinstall dependencies
npm install

# Or specific package
npm install <package-name>
```

### Issue: React App Not Loading
- Check browser console (F12) for errors
- Verify API connection to backend
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito mode

---

## Database Management

### MongoDB Commands

```bash
# Connect to MongoDB
mongosh  # or mongo for older versions

# List databases
show dbs

# Use specific database
use gst-invoice

# List collections
show collections

# View documents
db.companies.find()
db.invoices.find().limit(5)

# Delete invoice
db.invoices.deleteOne({ _id: ObjectId("...") })

# Backup database
mongodump --db gst-invoice --out ./backup

# Restore database
mongorestore --db gst-invoice ./backup/gst-invoice
```

### Create Indexes for Performance
```bash
# Connect to database
mongosh gst-invoice

# Create indexes
db.invoices.createIndex({ invoiceNumber: 1 }, { unique: true })
db.invoices.createIndex({ financialYear: 1 })
db.invoices.createIndex({ status: 1 })
db.parties.createIndex({ gstin: 1 }, { unique: true })
db.goods.createIndex({ goodsName: 1 }, { unique: true })
```

---

## Maintenance

### Regular Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y-%m-%d)
mongodump --db gst-invoice --out ./backups/$DATE

# Keep backups for 30 days
find ./backups -mtime +30 -exec rm -rf {} \;
```

### Log Rotation
Monitor logs in:
- Backend: Check console output
- Frontend: Browser DevTools (F12)

### Database Cleanup
Periodically remove old/cancelled invoices:
```bash
# Remove invoices older than 1 year
db.invoices.deleteMany({
  invoiceDate: {
    $lt: new Date(new Date().getTime() - 365*24*60*60*1000)
  },
  status: "cancelled"
})
```

---

## Performance Optimization

### Backend Optimization
1. Enable gzip compression
2. Add pagination to invoice list
3. Implement caching for parties and goods
4. Use connection pooling for MongoDB

### Frontend Optimization
1. Code splitting with React.lazy()
2. Image compression
3. CSS minification
4. Bundle analysis with webpack-bundle-analyzer

### Database Optimization
1. Create indexes (see above)
2. Regular backups
3. Database maintenance
4. Query optimization

---

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use strong JWT_SECRET
   - Rotate secrets regularly

2. **HTTPS**
   - Always use HTTPS in production
   - Install SSL certificate

3. **Input Validation**
   - Already implemented in forms
   - Backend validation for all endpoints

4. **Database**
   - Regular backups
   - Restrict MongoDB access
   - Use strong credentials

5. **API Security**
   - Implement rate limiting
   - Add authentication (JWT)
   - Use API keys for third-party access

---

## Support & Resources

- **Documentation**: See README.md and other .md files
- **API Reference**: See API_DOCUMENTATION.md
- **Database Schema**: See DATABASE_SCHEMA.md
- **Quick Start**: See QUICKSTART.md

---

**Installation Complete! You're ready to use the GST Invoice Manager.** 🎉
