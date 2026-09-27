import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosInstance";
import styles from "./InstructorOverview.module.css";

const InstructorOverview = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/courses/my/overview")
      .then((response) => {
        setOverview(response.data.overview);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Failed to load overview");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loader}></div>
        <h3>Loading overview...</h3>
        <p>Preparing your instructor analytics.</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.errorIcon}>!</div>
        <h2>Unable to load overview</h2>
        <p>
          Something went wrong while loading your instructor
          statistics.
        </p>

        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Decorative background */}
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>

      <div className={styles.container}>

        {/* =====================================================
            HEADER
        ====================================================== */}
        <section className={styles.header}>
          <div className={styles.headerContent}>
            <span className={styles.eyebrow}>
              INSTRUCTOR ANALYTICS
            </span>

            <h1>Overview</h1>

            <p>
              Track your courses, students, assessments and
              grading activity from one place.
            </p>
          </div>

          <div className={styles.headerBadge}>
            <span className={styles.liveDot}></span>
            Dashboard
          </div>
        </section>


        {/* =====================================================
            STATS
        ====================================================== */}
        <section className={styles.statsGrid}>

          {/* Total Courses */}
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.purple}`}>
              📚
            </div>

            <div className={styles.statContent}>
              <span>Total Courses</span>
              <strong>{overview.totalCourses}</strong>
              <small>Your created courses</small>
            </div>
          </div>


          {/* Published */}
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.green}`}>
              ✓
            </div>

            <div className={styles.statContent}>
              <span>Published Courses</span>
              <strong>{overview.publishedCourses}</strong>
              <small>Available to students</small>
            </div>
          </div>


          {/* Students */}
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blue}`}>
              👥
            </div>

            <div className={styles.statContent}>
              <span>Total Students</span>
              <strong>{overview.totalStudents}</strong>
              <small>Across your courses</small>
            </div>
          </div>


          {/* Assignments */}
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.orange}`}>
              ✎
            </div>

            <div className={styles.statContent}>
              <span>Assignments</span>
              <strong>{overview.totalAssignments}</strong>
              <small>Created assessments</small>
            </div>
          </div>


          {/* Quizzes */}
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.indigo}`}>
              ?
            </div>

            <div className={styles.statContent}>
              <span>Total Quizzes</span>
              <strong>{overview.totalQuizzes}</strong>
              <small>Knowledge assessments</small>
            </div>
          </div>


          {/* Pending */}
          <div className={`${styles.statCard} ${styles.pendingCard}`}>
            <div className={`${styles.statIcon} ${styles.red}`}>
              !
            </div>

            <div className={styles.statContent}>
              <span>Pending Grading</span>
              <strong>{overview.pendingGrading}</strong>
              <small>Submissions waiting</small>
            </div>
          </div>

        </section>


        {/* =====================================================
            CONTENT SUMMARY
        ====================================================== */}
        <section className={styles.summarySection}>

          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>
                YOUR PLATFORM
              </span>

              <h2>Teaching Activity</h2>

              <p>
                A quick snapshot of your current teaching
                activity.
              </p>
            </div>
          </div>


          <div className={styles.activityGrid}>

            {/* Courses */}
            <div className={styles.activityCard}>
              <div className={styles.activityTop}>
                <div className={styles.activityIcon}>
                  📚
                </div>

                <span className={styles.activityLabel}>
                  Courses
                </span>
              </div>

              <div className={styles.activityValue}>
                {overview.totalCourses}
              </div>

              <p>
                {overview.publishedCourses} currently
                published
              </p>
            </div>


            {/* Student Reach */}
            <div className={styles.activityCard}>
              <div className={styles.activityTop}>
                <div className={styles.activityIcon}>
                  👥
                </div>

                <span className={styles.activityLabel}>
                  Student Reach
                </span>
              </div>

              <div className={styles.activityValue}>
                {overview.totalStudents}
              </div>

              <p>
                Students enrolled across your courses
              </p>
            </div>


            {/* Assessments */}
            <div className={styles.activityCard}>
              <div className={styles.activityTop}>
                <div className={styles.activityIcon}>
                  ✓
                </div>

                <span className={styles.activityLabel}>
                  Assessments
                </span>
              </div>

              <div className={styles.activityValue}>
                {overview.totalAssignments +
                  overview.totalQuizzes}
              </div>

              <p>
                Assignments and quizzes created
              </p>
            </div>


            {/* Grading */}
            <div className={styles.activityCard}>
              <div className={styles.activityTop}>
                <div className={styles.activityIcon}>
                  !
                </div>

                <span className={styles.activityLabel}>
                  Grading Queue
                </span>
              </div>

              <div className={styles.activityValue}>
                {overview.pendingGrading}
              </div>

              <p>
                Submissions waiting for review
              </p>
            </div>

          </div>
        </section>


        {/* =====================================================
            BOTTOM INSIGHT
        ====================================================== */}
        <section className={styles.insightCard}>

          <div className={styles.insightIcon}>
            ✦
          </div>

          <div>
            <h3>Keep your courses active</h3>

            <p>
              Regularly update your lectures, assignments and
              quizzes to keep students engaged with your
              learning content.
            </p>
          </div>

        </section>

      </div>
    </div>
  );
};

export default InstructorOverview;