# PropertyMS - Property Management System (Frontend)

A modern React-based frontend application for managing rental properties, tenants, and maintenance requests.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Overview

PropertyMS is a comprehensive property management solution designed for property owners, managers, and tenants. This frontend application provides an intuitive interface for managing:

- **Buildings** - Add and manage multiple properties
- **Units** - Track individual rental units within buildings
- **Tenants** - Manage tenant information and profiles
- **Tenancies** - Handle rental contracts and agreements
- **Maintenance Requests** - Submit and track maintenance issues

## 🚀 Features

### For Administrators
- Full system access and user management
- View all buildings, units, and tenancies
- Manage maintenance request statuses
- User role assignment

### For Property Owners
- Manage owned buildings and units
- View tenancies for owned properties
- Handle maintenance requests for their properties
- Track rental income

### For Tenants
- View personal tenancy information
- Submit maintenance requests
- Track request status and resolution
- Update profile information

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v7** - Client-side routing
- **Redux Toolkit** - State management
- **React Bootstrap** - UI components
- **Bootstrap 5** - CSS framework
- **Bootstrap Icons** - Icon library
- **React Hook Form** - Form handling

## 🎨 Design

- **Primary Color**: Navy (#1a365d)
- **Secondary Color**: Beige (#d4b896)
- **Clean, modern interface** with no gradients
- **Responsive design** for all screen sizes

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on port 5000

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahmadabdelnby/PropertyMS-React.git
   cd PropertyMS-React
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Sidebar, Header, Footer)
│   └── common/         # Common components (LoadingSpinner, etc.)
├── pages/              # Page components
│   ├── auth/           # Login page
│   ├── dashboard/      # Dashboard
│   ├── users/          # User management
│   ├── buildings/      # Building management
│   ├── units/          # Unit management
│   ├── tenancies/      # Tenancy management
│   ├── maintenance/    # Maintenance requests
│   └── profile/        # User profile
├── services/           # API services
├── store/              # Redux store and slices
│   └── slices/         # Redux Toolkit slices
├── App.jsx             # Main app component with routing
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🔐 Authentication

The application uses JWT-based authentication. Users must log in to access the system. Role-based access control ensures users only see features relevant to their role.

### User Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access, user management |
| **OWNER** | Manage own buildings, units, view tenancies |
| **TENANT** | View own tenancies, submit maintenance requests |

## 🔗 API Integration

The frontend communicates with the backend API via a proxy configuration in Vite:

```javascript
// vite.config.js
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🤝 Related Projects

- [PropertyMS Backend](https://github.com/ahmadabdelnby/Tenant-Management-Node-Project) - Node.js/Express API with MySQL

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Ahmad Abdelnaby**

---

⭐ Star this repository if you find it helpful!
