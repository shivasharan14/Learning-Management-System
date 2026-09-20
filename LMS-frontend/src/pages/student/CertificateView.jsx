import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import styles from "./CertificateView.module.css";

const CertificateView = () => {
  const { certificateId } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get(`/certificates/verify/${certificateId}`)
      .then((response) => {
        setCertificate(response.data.certificate);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);

        setError(
          error.response?.data?.msg ||
            "Certificate not found"
        );

        setLoading(false);
      });
  }, [certificateId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
        <h3>Loading certificate...</h3>
        <p>Please wait while we verify your certificate.</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.errorIcon}>!</div>

        <h1>Certificate Not Found</h1>

        <p>
          We couldn't find a certificate with this ID.
        </p>

        <Link
          to="/certificates"
          className={styles.backButton}
        >
          Back to My Certificates
        </Link>
      </div>
    );
  }

  const studentName =
    certificate.student?.name || "Student";

  const courseTitle =
    certificate.course?.title || "Course";

  const instructorName =
    certificate.course?.instructor?.name ||
    "LearnHub Instructor";

  const issuedDate = new Date(
    certificate.issuedAt
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link
          to="/certificates"
          className={styles.backLink}
        >
          ← My Certificates
        </Link>

        <button
          type="button"
          className={styles.printButton}
          onClick={handlePrint}
        >
          Print / Save PDF
        </button>
      </div>

      <div className={styles.certificateWrapper}>
        <div className={styles.certificate}>
          <div className={styles.outerBorder}>
            <div className={styles.innerBorder}>
              <div className={styles.certificateContent}>
                <div className={styles.brand}>
                  <div className={styles.logoMark}>
                    L
                  </div>

                  <span>LearnHub</span>
                </div>

                <p className={styles.eyebrow}>
                  CERTIFICATE OF COMPLETION
                </p>

                <div className={styles.divider}>
                  <span></span>
                  <div className={styles.star}>✦</div>
                  <span></span>
                </div>

                <p className={styles.presented}>
                  This certificate is proudly presented to
                </p>

                <h1 className={styles.studentName}>
                  {studentName}
                </h1>

                <p className={styles.description}>
                  for successfully completing the online
                  course
                </p>

                <h2 className={styles.courseTitle}>
                  {courseTitle}
                </h2>

                <p className={styles.description}>
                  demonstrating commitment to learning and
                  successful completion of the course
                  requirements.
                </p>

                <div className={styles.signatures}>
                  <div className={styles.signatureBlock}>
                    <div className={styles.signatureLine}>
                      {instructorName}
                    </div>

                    <span>Course Instructor</span>
                  </div>

                  <div className={styles.seal}>
                    <div className={styles.sealInner}>
                      <strong>LH</strong>
                      <span>VERIFIED</span>
                    </div>
                  </div>

                  <div className={styles.signatureBlock}>
                    <div className={styles.signatureLine}>
                      {issuedDate}
                    </div>

                    <span>Date of Issue</span>
                  </div>
                </div>

                <div className={styles.certificateFooter}>
                  <div>
                    <span>Certificate ID</span>
                    <strong>
                      {certificate.certificateId}
                    </strong>
                  </div>

                  <div className={styles.verified}>
                    <span className={styles.check}>
                      ✓
                    </span>

                    <div>
                      <strong>Verified Certificate</strong>
                      <span>
                        Issued by LearnHub
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;