import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import styles from "./VerifyCertificate.module.css";

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!certificateId.trim()) {
      setError("Please enter a certificate ID.");
      setCertificate(null);
      return;
    }

    setLoading(true);
    setError("");
    setCertificate(null);

    try {
      const response = await axiosInstance.get(
        `/certificates/verify/${certificateId.trim()}`
      );

      setCertificate(response.data.certificate);
    } catch (error) {
      setError(
        error.response?.data?.msg ||
          "Certificate not found."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            CERTIFICATE VERIFICATION
          </span>

          <h1>Verify a Certificate</h1>

          <p>
            Enter a LearnHub certificate ID to verify
            its authenticity and view the certificate
            details.
          </p>
        </div>

        <form
          className={styles.verifyForm}
          onSubmit={handleVerify}
        >
          <label htmlFor="certificateId">
            Certificate ID
          </label>

          <div className={styles.inputGroup}>
            <input
              id="certificateId"
              type="text"
              placeholder="Example: CERT-A1B2C3D4E5"
              value={certificateId}
              onChange={(e) =>
                setCertificateId(e.target.value)
              }
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>

        {error && (
          <div className={styles.errorBox}>
            <div className={styles.errorIcon}>!</div>

            <div>
              <strong>Certificate Not Found</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {certificate && (
          <div className={styles.resultCard}>
            <div className={styles.verifiedHeader}>
              <div className={styles.successIcon}>
                ✓
              </div>

              <div>
                <span>VERIFICATION RESULT</span>
                <h2>Certificate Verified</h2>
              </div>
            </div>

            <div className={styles.details}>
              <div className={styles.detail}>
                <span>Student</span>
                <strong>
                  {certificate.student?.name ||
                    "Student"}
                </strong>
              </div>

              <div className={styles.detail}>
                <span>Course</span>
                <strong>
                  {certificate.course?.title ||
                    "Course"}
                </strong>
              </div>

              <div className={styles.detail}>
                <span>Instructor</span>
                <strong>
                  {certificate.course?.instructor?.name ||
                    "LearnHub Instructor"}
                </strong>
              </div>

              <div className={styles.detail}>
                <span>Issued On</span>
                <strong>
                  {new Date(
                    certificate.issuedAt
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </div>

              <div className={styles.detail}>
                <span>Certificate ID</span>
                <strong>
                  {certificate.certificateId}
                </strong>
              </div>

              <div className={styles.detail}>
                <span>Status</span>
                <strong className={styles.valid}>
                  ✓ Valid Certificate
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;