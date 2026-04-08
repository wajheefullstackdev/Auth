import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import GroupList from '../pages/GroupList';
import GroupDetail from '../pages/GroupDetail';
import Ledger from '../pages/Ledger';
import Layout from '../components/Layout';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    if (isAuthenticated) return <Navigate to="/" replace />;
    return children;
};

const AppRouter = () => {
    const routes = [
        {
            path: '/login',
            element: <PublicRoute><Login /></PublicRoute>
        },
        {
            path: '/register',
            element: <PublicRoute><Register /></PublicRoute>
        },
        {
            path: '/',
            element: <ProtectedRoute><Dashboard /></ProtectedRoute>
        },
        {
            path: '/groups',
            element: <ProtectedRoute><GroupList /></ProtectedRoute>
        },
        {
            path: '/groups/:id',
            element: <ProtectedRoute><GroupDetail /></ProtectedRoute>
        },
        {
            path: '/ledger',
            element: <ProtectedRoute><Ledger /></ProtectedRoute>
        }
    ];

    const element = useRoutes(routes);
    return element;
};

export default AppRouter;
