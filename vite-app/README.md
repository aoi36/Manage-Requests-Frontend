# File Sharing App - React + Vite

A simple React + Vite application with role-based authentication (Admin/User) for managing file uploads.

## Features

- ✅ Simple Vite + React setup
- ✅ JWT-based authentication (login, logout, refresh)
- ✅ Role-based access control (Admin/User)
- ✅ Automatic token refresh on 401 errors
- ✅ Context API for state management
- ✅ Axios for API calls
- ✅ No Tailwind - Pure CSS styling

## Project Structure

```
src/
├── components/
│   └── PrivateRoute.jsx      # Protected route component
├── context/
│   └── AuthContext.jsx        # Auth state management
├── pages/
│   ├── Login.jsx              # Login page
│   └── Dashboard.jsx          # Dashboard page
├── services/
│   ├── api.js                 # Axios instance with interceptors
│   └── authService.js         # Authentication service
├── styles/
│   ├── index.css              # Global styles
│   ├── login.css              # Login page styles
│   └── dashboard.css          # Dashboard styles
├── App.jsx                    # Main app component
└── main.jsx                   # Entry point
```

## Installation

1. Navigate to the project directory:
```bash
cd vite-app
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

## Development

Start the development server:
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

The app will be available at `http://localhost:5173`

## Building

Build for production:
```bash
npm run build
# or
pnpm build
# or
yarn build
```

## API Configuration

Update the `API_BASE_URL` in `src/services/api.js` to match your backend server:

```javascript
const API_BASE_URL = 'http://localhost:8080/api'
```

## Authentication Flow

1. **Login**: User submits credentials → Backend returns accessToken, refreshToken, and userId
2. **Token Decoding**: AccessToken is decoded to extract the user role (ROLE_ADMIN or ROLE_USER)
3. **Protected Routes**: Dashboard is only accessible to authenticated users
4. **Admin Check**: Some features are only available to users with ROLE_ADMIN
5. **Token Refresh**: When access token expires (401), automatically refresh using the refresh token
6. **Logout**: Clear all tokens and local storage

## Token Storage

- **accessToken**: Stored in localStorage, sent in Authorization header
- **refreshToken**: Stored in localStorage, used to refresh access token
- **userId**: Stored in localStorage for user identification
- **userRole**: Stored in localStorage (decoded from accessToken)

## Key Components

### AuthContext
Manages authentication state and provides auth methods:
- `login(username, password)`
- `logout()`
- `refresh()`
- `isAuthenticated` boolean
- `isAdmin` boolean

### PrivateRoute
Protects routes that require authentication or admin privileges.

### API Interceptors
Automatically:
- Add Authorization header to requests
- Handle 401 errors by refreshing the token
- Clear tokens and redirect to login on refresh failure

## Next Steps

Once the base is working:
1. Create Admin registration page (admin only)
2. Create User file upload page
3. Add file management features
4. Add user profile page
5. Add error handling and notifications

## Testing

Test credentials (set up in your backend):
- Admin: `admin` / `adminpass` (role: ROLE_ADMIN)
- User: `user` / `userpass` (role: ROLE_USER)
