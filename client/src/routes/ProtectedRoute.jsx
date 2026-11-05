
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  console.log("Auth user:", user);
console.log("Auth loading:", loading);

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
