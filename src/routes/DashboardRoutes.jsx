import { Suspense } from 'react';
import General from '../Layout/General';
import Dashboard from '../pages/Dashboard';
import ErrorPage from '../pages/Error';

export const DashboardRoutes = [
  {
    id: 'dashboard',
    path: '/',
    element: <General />,
    errorElement: <ErrorPage />,
    children: [
      {
        id: 'home',
        path: '/',
        element: (
          <Suspense>
            <Dashboard />
          </Suspense>
        ),
      },
    ],
  },
];
