import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import styles from "./MyCertificates.module.css";

const MyCertificates = () => {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/certificates/my")
      .then((response) => {
        setCertificates(response.data.certificates);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your certificates...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>ACHIEVEMENTS</p>

          <h1>My Certificates</h1>

          <p className={styles.subtitle}>
            Your achievements and completed courses
          </p>
        </div>

        <div className={styles.countBox}>
          <span>{certificates.length}</span>
          <small>Certificates</small>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏆</div>

          <h2>No certificates yet</h2>

          <p>
            Complete a course to earn your first certificate and
            showcase your achievement.
          </p>
        </div>
      ) : (
        <div className={styles.certificateGrid}>
          {certificates.map((cert) => (
            <div
              className={styles.certificateCard}
              key={cert._id}
            >
              <div className={styles.topSection}>
                <div className={styles.certificateIcon}>
                  🏆
                </div>

                <span className={styles.verified}>
                  ✓ Verified
                </span>
              </div>

              <div className={styles.cardContent}>
                <p className={styles.label}>
                  COURSE COMPLETED
                </p>

                <h2>{cert.course?.title}</h2>

                <div className={styles.details}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>
                      🆔
                    </span>

                    <div>
                      <span>Certificate ID</span>

                      <strong>
                        {cert.certificateId}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>
                      📅
                    </span>

                    <div>
                      <span>Issued On</span>

                      <strong>
                        {new Date(
                          cert.issuedAt
                        ).toLocaleDateString()}
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.viewButton}
                  onClick={() =>
                    navigate(
                      `/certificates/${cert.certificateId}`
                    )
                  }
                >
                  View Certificate
                  <span>↗</span>
                </button>
              </div>

              <div className={styles.cardFooter}>
                <span>Learning Platform</span>

                <span>
                  Certificate of Completion
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;