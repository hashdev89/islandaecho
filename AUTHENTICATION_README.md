# ISLE & ECHO Authentication System

## Overview

The ISLE & ECHO website now includes a complete authentication system with admin dashboard access. This system allows users to sign in and access the admin dashboard for content management.

## Features

### Authentication
- **User Authentication**: Sign in with email and password
- **Role-based Access**: Admin and regular user roles
- **Session Management**: Persistent login using localStorage
- **Protected Routes**: Admin routes are protected from unauthorized access

### Admin Dashboard
- **Content Management**: Manage tour packages, destinations, and images
- **Interactive Maps**: 3D Mapbox integration for tour route visualization
- **Data Synchronization**: Real-time updates between frontend and backend
- **Responsive Design**: Works on desktop and mobile devices

## Demo Credentials

### Admin User
- **Email**: `admin@isleandecho.com`
- **Password**: `admin123`
- **Access**: Full admin dashboard access

### Demo User
- **Email**: Any valid email address
- **Password**: `demo123`
- **Access**: Regular user access (no admin privileges)

## How to Use

### 1. Sign In
1. Click the "Sign In" button in the header
2. Enter your credentials:
   - For admin access: `admin@isleandecho.com` / `admin123`
   - For demo access: Any email / `demo123`
3. Click "Sign In" or use the "Demo Admin Login" button

### 2. Access Admin Dashboard
- After signing in as admin, you'll see your name in the header
- Click on your name to open the user dropdown
- Select "Admin Dashboard" to access the admin panel
- Or use the "Demo Admin Login" button for quick access

### 3. Admin Dashboard Features
- **Dashboard Overview**: View statistics and quick actions
- **Tour Packages**: Create, edit, and manage tour packages
- **Destinations**: Manage destination information and coordinates
- **Images**: Upload and organize images
- **Users**: Manage user accounts (coming soon)
- **Settings**: Configure system settings (coming soon)

### 4. Sign Out
- Click on your name in the header
- Select "Sign Out" from the dropdown menu

## Technical Implementation

### Components
- `AuthContext.tsx`: Authentication state management
- `SignInModal.tsx`: Sign-in modal component
- `AdminRoute.tsx`: Route protection for admin pages
- `Header.tsx`: Updated with authentication UI

### Authentication Flow
1. User clicks "Sign In" button
2. SignInModal opens with login form
3. Credentials are validated against dummy data
4. On success, user is logged in and redirected (admin → dashboard, user → homepage)
5. User session persists in localStorage
6. Protected routes check authentication status

### Security Features
- Route protection for admin pages
- Role-based access control
- Session management
- Automatic redirect for unauthorized access

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication context
├── components/
│   ├── SignInModal.tsx          # Sign-in modal
│   ├── AdminRoute.tsx           # Route protection
│   └── Header.tsx               # Updated header with auth
├── app/
│   ├── admin/                   # Admin dashboard pages
│   └── layout.tsx               # Updated with AuthProvider
└── middleware.ts                # Route middleware
```

## Future Enhancements

- **Real Authentication**: Replace dummy authentication with real backend
- **JWT Tokens**: Implement proper JWT token management
- **Password Reset**: Add password reset functionality
- **User Registration**: Implement user registration system
- **Email Verification**: Add email verification for new accounts
- **Two-Factor Authentication**: Add 2FA for enhanced security
- **User Management**: Complete user management in admin dashboard

## Notes

- This is a demo implementation using dummy authentication
- In production, replace with proper backend authentication
- All admin routes are protected and require admin role
- Session data is stored in localStorage (consider more secure options for production)
- The system is fully responsive and works on all devices
