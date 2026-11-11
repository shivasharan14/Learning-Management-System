
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";
import { login } from "../../redux/authSlice";

import styles from "./MyInstructorRequest.module.css";

const MyInstructorRequest = () => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchMyRequest = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Get logged-in user's request
      const response = await axiosInstance.get(
        "/role-requests/my-request"
      );

      setRequest(response.data.request);

      // 2. Get latest user information from backend
      const userResponse = await axiosInstance.get(
        "/auth/getMe"
      );

      const updatedUser = userResponse.data.user;
      const token = localStorage.getItem("token");

      // 3. Update Redux with latest user role
      dispatch(
        login({
          user: updatedUser,
          token,
        })
      );

      // 4. If approved, open instructor dashboard
      if (updatedUser.role === "instructor") {
        navigate("/instructor/dashboard", {
          replace: true,
        });
      }

    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.msg ||
        "Failed to load your request"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequest();
  }, []);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2>{error}</h2>
        <button onClick={fetchMyRequest}>
          Try Again
        </button>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>My Instructor Request</h1>

        <p>
          Subject: <strong>{request.subject}</strong>
        </p>

        <p>
          Experience:{" "}
          <strong>{request.experience || "Not provided"}</strong>
        </p>

        <p>
          Reason: <strong>{request.reason}</strong>
        </p>

        <div
          className={`${styles.status} ${styles[request.status]}`}
        >
          Status: {request.status.toUpperCase()}
        </div>

        {request.reviewedBy && (
          <p>
            Reviewed by: <strong>{request.reviewedBy.name}</strong>
          </p>
        )}

        {request.reviewedAt && (
          <p>
            Reviewed on:{" "}
            <strong>
              {new Date(request.reviewedAt).toLocaleDateString()}
            </strong>
          </p>
        )}

        <button onClick={fetchMyRequest}>
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default MyInstructorRequest;
