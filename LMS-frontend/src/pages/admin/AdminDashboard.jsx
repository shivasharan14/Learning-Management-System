
import styles from "./AdminDashboard.module.css";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/admin/dashboard")
      .then((response) => {
        setStats(response.data.stats);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loader}></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>

      {/* Background glow */}
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>

      <div className={styles.container}>

        {/* Header */}
        <section className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              ADMIN CONTROL CENTER
            </span>

            <h1>
              Dashboard
              <span>.</span>
            </h1>

            <p>
              Monitor your LMS platform and manage everything from one place.
            </p>
          </div>

          <div className={styles.adminBadge}>
            <div className={styles.adminAvatar}>
              A
            </div>

            <div>
              <strong>Administrator</strong>
              <span>System Control</span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className={styles.quickActions}>

          <Link
            to="/admin/users"
            className={styles.managementCard}
          >
            <div className={`${styles.managementIcon} ${styles.userIcon}`}>
              👥
            </div>

            <div>
              <span>USER MANAGEMENT</span>
              <h3>Manage Users</h3>
              <p>
                View, control and manage platform users.
              </p>
            </div>

            <div className={styles.actionArrow}>
              →
            </div>
          </Link>

          <Link
            to="/admin/courses"
            className={styles.managementCard}
          >
            <div className={`${styles.managementIcon} ${styles.courseIcon}`}>
              ◈
            </div>

            <div>
              <span>COURSE MANAGEMENT</span>
              <h3>Manage Courses</h3>
              <p>
                Review, publish and manage courses.
              </p>
            </div>

            <div className={styles.actionArrow}>
              →
            </div>
          </Link>

        </section>

        {/* Analytics Header */}
        <section className={styles.analyticsHeader}>
          <div>
            <span className={styles.sectionLabel}>
              PLATFORM OVERVIEW
            </span>

            <h2>System Analytics</h2>
          </div>

          <div className={styles.liveStatus}>
            <span></span>
            Live Data
          </div>
        </section>

        {/* Stats */}
        {stats && (
          <section className={styles.statsGrid}>

            {/* Users */}
            <div className={`${styles.statCard} ${styles.largeCard}`}>
              <div className={styles.statTop}>
                <div className={`${styles.statIcon} ${styles.purple}`}>
                  👥
                </div>

                <span className={styles.cardLabel}>
                  USERS
                </span>
              </div>

              <div className={styles.statBottom}>
                <div>
                  <span>Total Users</span>
                  <strong>{stats.totalUsers}</strong>
                </div>

                <div className={styles.miniStats}>
                  <div>
                    <small>Students</small>
                    <b>{stats.totalStudents}</b>
                  </div>

                  <div>
                    <small>Instructors</small>
                    <b>{stats.totalInstructors}</b>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses */}
            <div className={`${styles.statCard} ${styles.largeCard}`}>
              <div className={styles.statTop}>
                <div className={`${styles.statIcon} ${styles.mint}`}>
                  ◈
                </div>

                <span className={styles.cardLabel}>
                  COURSES
                </span>
              </div>

              <div className={styles.statBottom}>
                <div>
                  <span>Total Courses</span>
                  <strong>{stats.totalCourses}</strong>
                </div>

                <div className={styles.publishedBox}>
                  <small>Published</small>
                  <b>{stats.publishedCourses}</b>
                </div>
              </div>

              <div className={styles.progressBar}>
                <div
                  style={{
                    width:
                      stats.totalCourses > 0
                        ? `${Math.min(
                            (stats.publishedCourses /
                              stats.totalCourses) *
                              100,
                            100
                          )}%`
                        : "0%",
                  }}
                ></div>
              </div>
            </div>

            {/* Enrollments */}
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={`${styles.statIcon} ${styles.blue}`}>
                  ↗
                </div>

                <span className={styles.cardLabel}>
                  ACTIVITY
                </span>
              </div>

              <span className={styles.statName}>
                Total Enrollments
              </span>

              <strong className={styles.bigNumber}>
                {stats.totalEnrollments}
              </strong>

              <p className={styles.statDescription}>
                Student course enrollments
              </p>
            </div>

            {/* Assignments */}
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={`${styles.statIcon} ${styles.orange}`}>
                  ✎
                </div>

                <span className={styles.cardLabel}>
                  CONTENT
                </span>
              </div>

              <span className={styles.statName}>
                Assignments
              </span>

              <strong className={styles.bigNumber}>
                {stats.totalAssignments}
              </strong>

              <p className={styles.statDescription}>
                Assignments created
              </p>
            </div>

            {/* Quizzes */}
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={`${styles.statIcon} ${styles.pink}`}>
                  ?
                </div>

                <span className={styles.cardLabel}>
                  ASSESSMENTS
                </span>
              </div>

              <span className={styles.statName}>
                Quizzes
              </span>

              <strong className={styles.bigNumber}>
                {stats.totalQuizzes}
              </strong>

              <p className={styles.statDescription}>
                Quizzes available
              </p>
            </div>

          </section>
        )}

        {/* Bottom insight */}
        {stats && (
          <section className={styles.insightSection}>

            <div className={styles.insightContent}>
              <div className={styles.insightIcon}>
                ✦
              </div>

              <div>
                <span>PLATFORM SNAPSHOT</span>

                <h3>
                  Your learning platform at a glance
                </h3>

                <p>
                  {stats.totalUsers} users are currently part of
                  LearnHub, with {stats.totalStudents} students and{" "}
                  {stats.totalInstructors} instructors.
                </p>
              </div>
            </div>

            <Link
              to="/admin/users"
              className={styles.insightButton}
            >
              View Users →
            </Link>

          </section>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;

