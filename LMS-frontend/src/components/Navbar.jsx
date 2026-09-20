import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import styles from "./Navbar.module.css";

function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>

        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>L</span>

          <span className={styles.logoName}>
            Learn<span>Hub</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className={styles.navigation}>

          <Link to="/" className={styles.navLink}>
            Home
          </Link>

          {isAuthenticated && user?.role === "student" && (
            <>
              <Link to="/my-enrollments" className={styles.navLink}>
                My Courses
              </Link>

              <Link to="/my-progress" className={styles.navLink}>
                Progress
              </Link>

              <Link to="/my-certificates" className={styles.navLink}>
                Certificates
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === "instructor" && (
            <>
              <Link
                to="/instructor/dashboard"
                className={styles.navLink}
              >
                Dashboard
              </Link>

              <Link
                to="/instructor/overview"
                className={styles.navLink}
              >
                Overview
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === "admin" && (
            <>
              <Link
                to="/admin/dashboard"
                className={styles.navLink}
              >
                Dashboard
              </Link>

              <Link
                to="/admin/users"
                className={styles.navLink}
              >
                Users
              </Link>

              <Link
                to="/admin/courses"
                className={styles.navLink}
              >
                Courses
              </Link>
            </>
          )}

          {/* Guest */}
          {!isAuthenticated && (
            <>
              <Link to="/login" className={styles.login}>
                Sign In
              </Link>

              <Link to="/register" className={styles.getStarted}>
                Get Started
                <span>↗</span>
              </Link>
            </>
          )}

          {/* Logged-in user */}
          {isAuthenticated && (
            <div className={styles.userArea}>

              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>

                <span className={styles.userName}>
                  {user?.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className={styles.logout}
              >
                Logout
              </button>

            </div>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;