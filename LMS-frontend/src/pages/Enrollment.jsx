import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { Link } from "react-router-dom";
import styles from "./Enrollment.module.css";

const Enrollment = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/enrollments/my")
      .then((response) => {
        setEnrollments(response.data.enrollments);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your courses...</p>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📚</div>

        <h1>No Courses Yet</h1>

        <p>
          You haven't enrolled in any courses yet.
          Start learning and build your skills today.
        </p>

        <Link to="/" className={styles.exploreButton}>
          Explore Courses →
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <span className={styles.label}>LEARNING DASHBOARD</span>

          <h1>My Courses</h1>

          <p>
            Continue your learning journey and keep building your skills.
          </p>
        </div>

        <div className={styles.courseCount}>
          <strong>{enrollments.length}</strong>
          <span>
            {enrollments.length === 1 ? "Course" : "Courses"}
          </span>
        </div>
      </div>

      {/* Course Grid */}
      <div className={styles.courseGrid}>

        {enrollments.map((enrollment) => {

          const course = enrollment.course;

          const progress = enrollment.progress || 0;

          return (
            <div className={styles.card} key={enrollment._id}>

              {/* Course Header */}
              <div className={styles.cardTop}>
                <div className={styles.courseIcon}>
                  📖
                </div>

                {enrollment.completed ? (
                  <span className={styles.completedBadge}>
                    ✓ Completed
                  </span>
                ) : (
                  <span className={styles.learningBadge}>
                    In Progress
                  </span>
                )}
              </div>

              {/* Course Content */}
              <div className={styles.content}>

                <h2>{course?.title}</h2>

                <p className={styles.description}>
                  {course?.description}
                </p>

                {/* Progress */}
                <div className={styles.progressSection}>

                  <div className={styles.progressHeader}>
                    <span>Your Progress</span>

                    <strong>{progress}%</strong>
                  </div>

                  <div className={styles.progressBar}>
                    <div
                      className={styles.progress}
                      style={{
                        width: `${progress}%`,
                      }}
                    ></div>
                  </div>

                </div>

                {/* Enrollment Date */}
                <p className={styles.enrolledDate}>
                  Enrolled on{" "}
                  {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </p>

                {/* Button */}
                <Link
                  to={`/courses/${course?._id}`}
                  className={styles.continueButton}
                >
                  {enrollment.completed
                    ? "Review Course"
                    : "Continue Learning"}
                  <span>→</span>
                </Link>

              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
};

export default Enrollment;