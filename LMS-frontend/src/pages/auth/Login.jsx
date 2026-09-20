import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosInstance";
import styles from "./Login.module.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        email,
        password,
      };

      const response = await axiosInstance.post(
        "/auth/login",
        userData
      );

      dispatch(
        login({
          user: response.data.user,
          token: response.data.token,
        })
      );

      localStorage.setItem("token", response.data.token);

      toast.success("Login successful!");

      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>

      <div className={styles.loginCard}>

        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>L</span>
          LearnHub
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <h1>Welcome back</h1>

          <p>
            Sign in to continue your learning journey.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className={styles.form}>

          <div className={styles.field}>
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <div className={styles.passwordLabel}>
              <label htmlFor="password">
                Password
              </label>
            </div>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.loginButton}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        {/* Register */}
        <div className={styles.register}>
          <span>Don't have an account?</span>

          <Link to="/register">
            Create an account
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Login;