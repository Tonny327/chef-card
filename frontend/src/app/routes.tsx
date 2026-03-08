import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AddRecipe } from './pages/AddRecipe';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: 'login',
        Component: AdminLogin,
      },
      {
        path: 'admin',
        Component: AdminDashboard,
      },
      {
        path: 'admin/new',
        Component: AddRecipe,
      }
    ],
  },
]);