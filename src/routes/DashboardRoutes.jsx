import { Suspense } from 'react';
import General from '../Layout/General';
import Dashboard from '../pages/Case1';
import ErrorPage from '../pages/Error';
import Case2 from '../pages/Case2';

export const DashboardRoutes = [
  {
    id: 'dashboard',
    path: '/',
    element: <General />,
    errorElement: <ErrorPage />,
    children: [
      {
        id: 'case1',
        path: '/case-1',
        element: (
          <Suspense>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        id: 'case2',
        path: '/case-2',
        element: (
          <Suspense>
            <Case2 />
          </Suspense>
        ),
      },
    ],
  },
];
