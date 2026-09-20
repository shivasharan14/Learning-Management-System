import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

import styles from "./Register.module.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !contact || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name,
        email,
        contactNumber: contact,
        password,
      };

      const response = await axiosInstance.post(
        "/auth/register",
        userData
      );

      dispatch(
        login({
          user: response.data.user,
          token: response.data.token,
        })
      );

      localStorage.setItem("token", response.data.token);

      toast.success("Registration successful!");
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Registration failed"
      );

      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.registerCard}>

        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>L</span>
          LearnHub
        </Link>

        <div className={styles.header}>
          <h1>Create your account</h1>
          <p>
            Join LearnHub and start your learning journey today.
          </p>
        </div>

        <form onSubmit={handleRegister} className={styles.form}>

          <div className={styles.field}>
            <label htmlFor="name">Full Name</label>

            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email Address</label>

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
            <label htmlFor="contact">Contact Number</label>

            <input
              id="contact"
              type="tel"
              placeholder="Enter your contact number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              autoComplete="tel"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.registerButton}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <div className={styles.login}>
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;