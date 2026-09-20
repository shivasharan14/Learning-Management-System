import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, token } = useSelector(
    (state) => state.auth
  );

  // User is not logged in
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // User role is not allowed
  if (
    allowedRoles &&
    !allowedRoles.includes(user?.role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};

export default PrivateRoute;