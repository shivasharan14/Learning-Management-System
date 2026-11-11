import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import styles from "./InstructorRequests.module.css";

const InstructorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);


  // Backend मधून Requests मिळवणे
  const fetchRequests = async (status) => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/role-requests/all?status=${status}`,
      );

      setRequests(response.data.requests || []);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.msg || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  // Tab बदलल्यावर Requests मिळवणे
  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  // Approve किंवा Reject करणे
  const handleAction = async (requestId, action) => {
    try {
      setActionLoading(requestId);
      setError("");

      await axiosInstance.put(`/role-requests/${action}/${requestId}`);

      setConfirmAction(null);

      await fetchRequests(activeTab);
    } catch (error) {
      setError(error.response?.data?.msg || "Action failed");
    } finally {
      setActionLoading("");
    }
  };
  return (
    <div className={styles.container}>
      <h1>Instructor Requests</h1>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={activeTab === "pending" ? styles.active : ""}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>

        <button
          className={activeTab === "approved" ? styles.active : ""}
          onClick={() => setActiveTab("approved")}
        >
          Approved
        </button>

        <button
          className={activeTab === "rejected" ? styles.active : ""}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected
        </button>
      </div>

      {/* Error Message */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Loading */}
      {loading && <p>Loading requests...</p>}

      {/* Request Cards */}
      {!loading && !error && requests.length === 0 && (
        <p className={styles.empty}>No {activeTab} requests found.</p>
      )}

      {!loading &&
        requests.map((request) => (
          <div className={styles.card} key={request._id}>
            <h3>{request.user?.name || "User not found"}</h3>

            <p>
              <strong>Email:</strong> {request.user?.email || "Not available"}
            </p>

            <p>
              <strong>Contact:</strong>{" "}
              {request.user?.contactNumber || "Not available"}
            </p>

            <p>
              <strong>Subject:</strong> {request.subject}
            </p>

            <p>
              <strong>Experience:</strong>{" "}
              {request.experience || "Not provided"}
            </p>

            <p>
              <strong>Reason:</strong> {request.reason}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className={styles[request.status]}>
                {request.status.toUpperCase()}
              </span>
            </p>

            {request.reviewedBy && (
              <p>
                <strong>Reviewed By:</strong> {request.reviewedBy.name}
              </p>
            )}

            {request.reviewedAt && (
              <p>
                <strong>Reviewed At:</strong>{" "}
                {new Date(request.reviewedAt).toLocaleDateString()}
              </p>
            )}

            {/* फक्त Pending Request वर Action Buttons */}
            {request.status === "pending" && (
              <div className={styles.actions}>
                <button
                  onClick={() =>
                    setConfirmAction({
                      id: request._id,
                      action: "approve",
                    })
                  }
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    setConfirmAction({
                      id: request._id,
                      action: "reject",
                    })
                  }
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}

        {confirmAction && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h2>
        Confirm {confirmAction.action}?
      </h2>

      <p>
        Are you sure you want to{" "}
        {confirmAction.action} this instructor request?
      </p>

      <div className={styles.modalActions}>
        <button
          onClick={() => setConfirmAction(null)}
        >
          Cancel
        </button>

        <button
          disabled={actionLoading === confirmAction.id}
          onClick={() =>
            handleAction(
              confirmAction.id,
              confirmAction.action
            )
          }
        >
          {actionLoading === confirmAction.id
            ? "Processing..."
            : "Confirm"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default InstructorRequests;
