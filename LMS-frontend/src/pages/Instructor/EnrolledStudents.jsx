import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import styles from "./EnrolledStudents.module.css";

const EnrolledStudents = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);

    axiosInstance
      .get(`/enrollments/course/${courseId}`)
      .then((response) => {
        setStudents(response.data.enrollments || []);
      })
      .catch((error) => {
        console.log(error);

        toast.error(
          error.response?.data?.msg ||
            "Failed to load enrolled students"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [courseId]);

  const filteredStudents = students.filter((enrollment) => {
    const name =
      enrollment.student?.name?.toLowerCase() || "";

    const email =
      enrollment.student?.email?.toLowerCase() || "";

    const query = search.toLowerCase().trim();

    return (
      name.includes(query) ||
      email.includes(query)
    );
  });

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");

    if (!name.trim()) return "?";

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loader}></div>

        <h3>Loading students...</h3>

        <p>
          Fetching enrollment information for this course.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>

      <div className={styles.container}>

        {/* HEADER */}
        <section className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              COURSE MANAGEMENT
            </span>

            <h1>Enrolled Students</h1>

            <p>
              View and manage the students enrolled in
              this course.
            </p>
          </div>

          <button
            type="button"
            className={styles.backButton}
            onClick={() =>
              navigate("/instructor/dashboard")
            }
          >
            ← Dashboard
          </button>
        </section>

        {/* STATS */}
        <section className={styles.statsGrid}>

          <div className={styles.statCard}>
            <div
              className={`${styles.statIcon} ${styles.purple}`}
            >
              👥
            </div>

            <div>
              <span>Total Students</span>
              <strong>{students.length}</strong>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={`${styles.statIcon} ${styles.green}`}
            >
              ✓
            </div>

            <div>
              <span>Enrolled</span>
              <strong>{students.length}</strong>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={`${styles.statIcon} ${styles.blue}`}
            >
              ◷
            </div>

            <div>
              <span>Course Status</span>
              <strong>Active</strong>
            </div>
          </div>

        </section>

        {/* STUDENTS CARD */}
        <section className={styles.studentsSection}>

          <div className={styles.sectionHeader}>

            <div>
              <span className={styles.sectionEyebrow}>
                LEARNER DIRECTORY
              </span>

              <h2>Students</h2>

              <p>
                Students currently enrolled in this course.
              </p>
            </div>

            <div className={styles.countBadge}>
              {students.length}{" "}
              {students.length === 1
                ? "Student"
                : "Students"}
            </div>

          </div>

          {/* SEARCH */}
          {students.length > 0 && (
            <div className={styles.toolbar}>

              <div className={styles.searchBox}>
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                  >
                    ×
                  </button>
                )}
              </div>

              <span className={styles.resultCount}>
                {filteredStudents.length}{" "}
                {filteredStudents.length === 1
                  ? "result"
                  : "results"}
              </span>

            </div>
          )}

          {/* EMPTY */}
          {students.length === 0 ? (
            <div className={styles.emptyState}>

              <div className={styles.emptyIcon}>
                👥
              </div>

              <h2>No students enrolled yet</h2>

              <p>
                Once students enroll in this course,
                they will appear here.
              </p>

              <button
                type="button"
                className={styles.dashboardButton}
                onClick={() =>
                  navigate("/instructor/dashboard")
                }
              >
                Back to Dashboard
              </button>

            </div>
          ) : filteredStudents.length === 0 ? (
            <div className={styles.noResults}>

              <div className={styles.noResultsIcon}>
                ⌕
              </div>

              <h3>No students found</h3>

              <p>
                Try searching with a different name or
                email address.
              </p>

              <button
                type="button"
                onClick={() => setSearch("")}
              >
                Clear Search
              </button>

            </div>
          ) : (
            <div className={styles.studentList}>

              {/* TABLE HEADER */}
              <div className={styles.tableHeader}>
                <span>STUDENT</span>
                <span>EMAIL</span>
                <span>ENROLLED ON</span>
                <span>STATUS</span>
              </div>

              {/* STUDENTS */}
              {filteredStudents.map(
                (enrollment) => {
                  const student =
                    enrollment.student;

                  const name =
                    student?.name || "Unknown Student";

                  const email =
                    student?.email || "No email available";

                  return (
                    <div
                      key={enrollment._id}
                      className={styles.studentRow}
                    >

                      {/* STUDENT */}
                      <div className={styles.studentInfo}>

                        <div className={styles.avatar}>
                          {getInitials(name)}
                        </div>

                        <div>
                          <h3>{name}</h3>

                          <span>
                            Student
                          </span>
                        </div>

                      </div>

                      {/* EMAIL */}
                      <div className={styles.email}>
                        {email}
                      </div>

                      {/* DATE */}
                      <div className={styles.date}>
                        <span className={styles.mobileLabel}>
                          Enrolled
                        </span>

                        {formatDate(
                          enrollment.enrolledAt ||
                            enrollment.createdAt
                        )}
                      </div>

                      {/* STATUS */}
                      <div>
                        <span
                          className={styles.status}
                        >
                          <span></span>
                          Enrolled
                        </span>
                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

      </div>
    </div>
  );
};

export default EnrolledStudents;