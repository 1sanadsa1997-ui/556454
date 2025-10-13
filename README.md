# PromoHive - Complete Registration System

## 🚀 **New Features Added:**

### **1. Complete Registration System**
- ✅ **Registration Page:** Full user registration with all required fields
- ✅ **Login Page:** Username/password authentication
- ✅ **Email Verification:** Email verification system with verification links
- ✅ **User Profile:** Complete user profile with personal information

### **2. Registration Fields**
- **Personal Info:** First Name, Last Name, Username
- **Account Info:** Email, Password, Confirm Password
- **Profile Info:** Gender, Birth Date, Country
- **Validation:** Complete form validation and error handling

### **3. Authentication Flow**
1. **Registration:** User fills registration form
2. **Email Verification:** System sends verification email
3. **Email Confirmation:** User clicks verification link
4. **Login:** User can login with username/password
5. **Dashboard Access:** Redirected based on user role

### **4. Admin Auto-Assignment**
- First registered user automatically becomes ADMIN
- Admin users can access admin dashboard
- Regular users access user dashboard

## 📁 **Files Created/Updated:**

### **New Pages:**
- `client/pages/Register.tsx` - Registration page
- `client/pages/Login.tsx` - Login page  
- `client/pages/EmailVerification.tsx` - Email verification page

### **New API Routes:**
- `server/routes/auth-new.ts` - New authentication routes
- `server/lib/email.ts` - Email sending functionality

### **Updated Files:**
- `client/App.tsx` - Added new routes
- `client/pages/Index.tsx` - Updated to English, added auth buttons
- `server/index.ts` - Added new auth routes
- `prisma/schema.prisma` - Updated User model
- `package.json` - Added bcryptjs and nodemailer dependencies

## 🔧 **Installation & Setup:**

### **1. Install Dependencies:**
```bash
pnpm install
```

### **2. Database Setup:**
```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database
pnpm seed
```

### **3. Environment Variables:**
Make sure your `.env` file includes:
```env
# Database
DATABASE_URL="your_database_url"

# JWT Secret
JWT_SECRET="your_jwt_secret"

# SMTP Configuration
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_USER="promohive@globalpromonetwork.store"
SMTP_PASS="your_smtp_password"
SMTP_FROM_NAME="PromoHive Team"
SMTP_FROM_EMAIL="promohive@globalpromonetwork.store"

# App URL
NEXT_PUBLIC_APP_URL="https://globalpromonetwork.store"
```

### **4. Build & Run:**
```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

## 🎯 **Usage:**

### **1. User Registration:**
1. Go to `/register`
2. Fill in all required fields
3. Submit form
4. Check email for verification link
5. Click verification link
6. Go to `/login` to sign in

### **2. User Login:**
1. Go to `/login`
2. Enter username/email and password
3. Click "Sign In"
4. Redirected to dashboard based on role

### **3. Admin Access:**
- First registered user becomes admin automatically
- Admin users can access `/admin` dashboard
- Regular users access `/dashboard`

## 🔐 **Security Features:**

### **1. Password Security:**
- Passwords hashed with bcryptjs
- Minimum 6 characters required
- Password confirmation validation

### **2. Email Verification:**
- JWT-based verification tokens
- 24-hour token expiration
- Email verification required before login

### **3. Form Validation:**
- Client-side validation
- Server-side validation
- Age verification (13+ years)
- Unique username/email validation

## 📧 **Email Templates:**

### **Verification Email:**
- Professional HTML template
- PromoHive branding
- Clear call-to-action button
- Fallback text link

## 🌐 **Multi-language Support:**
- English language only (as requested)
- All text converted to English
- RTL support removed
- Clean English interface

## 🚀 **Deployment:**

### **1. Build Project:**
```bash
pnpm build
```

### **2. Deploy to Server:**
```bash
# Upload files to server
scp -r dist/ root@your-server:/var/www/promohive/

# Start with PM2
pm2 start dist/server/node-build.mjs --name promohive
```

### **3. Configure Nginx:**
Use the provided `nginx-simple.conf` configuration.

## 📋 **API Endpoints:**

### **Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email` - Email verification
- `GET /api/auth/me` - Get current user

### **Response Examples:**

#### **Registration Success:**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email for verification link.",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

#### **Login Success:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "level": 0,
    "hivePoints": 500
  }
}
```

## 🎉 **Features Summary:**

- ✅ **Complete Registration System**
- ✅ **Email Verification**
- ✅ **Secure Authentication**
- ✅ **Admin Auto-Assignment**
- ✅ **Form Validation**
- ✅ **Professional UI/UX**
- ✅ **English Language Only**
- ✅ **Responsive Design**
- ✅ **Error Handling**
- ✅ **Security Best Practices**

## 🔧 **Troubleshooting:**

### **Email Not Sending:**
1. Check SMTP credentials in `.env`
2. Verify SMTP port (465 for SSL)
3. Check firewall rules
4. Test SMTP connection

### **Database Issues:**
1. Run `pnpm prisma:generate`
2. Run `pnpm prisma:migrate`
3. Check database connection
4. Verify schema changes

### **Build Issues:**
1. Clear cache: `rm -rf node_modules dist`
2. Reinstall: `pnpm install`
3. Rebuild: `pnpm build`

---

**Version:** 3.0.0  
**Last Updated:** October 13, 2025  
**Status:** ✅ Complete & Ready for Production
