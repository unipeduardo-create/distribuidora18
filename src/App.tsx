@@
-import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
+import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
 import { useAuth } from './hooks/useAuth';
 import { useDistributors } from './hooks/useDistributors';
 import Layout from './components/Layout';
 import Login from './pages/Login';
 import Register from './pages/Register';
 import Dashboard from './pages/Dashboard';
 import DistributorForm from './pages/DistributorForm';
 import DistributorDetail from './pages/DistributorDetail';
+import ForgotPassword from './pages/ForgotPassword';
+import ResetPassword from './pages/ResetPassword';
@@
       <Route
         path="/login"
         element={
           <PublicRoute>
             <Login onLogin={login} />
           </PublicRoute>
         }
       />
+      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
+      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
