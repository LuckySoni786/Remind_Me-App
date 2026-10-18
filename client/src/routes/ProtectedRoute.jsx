
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
