import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import styles from "./Home.module.css";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/courses");
      console.log(response);
        const data = response.data?.courses || [];

        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  /* Automatic carousel */
  useEffect(() => {
    if (courses.length <= 1 || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        return (prev + 1) % courses.length;
      });
    }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [courses.length, isPaused]);

  const handleNext = () => {
    if (courses.length === 0) return;

    setCurrentIndex((prev) => {
      return (prev + 1) % courses.length;
    });
  };

  const handlePrevious = () => {
    if (courses.length === 0) return;

    setCurrentIndex((prev) => {
      return (prev - 1 + courses.length) % courses.length;
    });
  };

  const featuredCourse = courses[currentIndex];

  return (
    <main className={styles.home}>

      {/* ================= HERO ================= */}

      <section
        className={styles.hero}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >

        {featuredCourse?.thumbnail ? (
          <div
            key={featuredCourse._id}
            className={styles.heroBackground}
            style={{
              backgroundImage: `
                linear-gradient(
                  90deg,
                  rgba(247, 248, 251, 0.97) 0%,
                  rgba(247, 248, 251, 0.9) 40%,
                  rgba(247, 248, 251, 0.55) 75%,
                  rgba(247, 248, 251, 0.65) 100%
                ),
                url("${featuredCourse.thumbnail}")
              `,
            }}
          />
        ) : (
          <div className={styles.heroFallback}></div>
        )}

        <div className={styles.heroContainer}>

          {/* HERO CONTENT */}

          <div
            key={`content-${featuredCourse?._id || "empty"}`}
            className={styles.heroContent}
          >

            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Learn. Build. Grow.
            </div>

            <h1 className={styles.heroTitle}>
              Build Skills That
              <span>Move Your Future.</span>
            </h1>

            <p className={styles.heroText}>
              Learn practical skills, build real projects and
              grow your career with LearnHub.
            </p>

            {featuredCourse ? (
              <div className={styles.featuredCourse}>

                <p className={styles.featuredLabel}>
                  FEATURED COURSE
                </p>

                <h2>
                  {featuredCourse.title}
                </h2>

                {featuredCourse.description && (
                  <p className={styles.courseDescription}>
                    {featuredCourse.description.length > 150
                      ? `${featuredCourse.description.substring(
                          0,
                          150
                        )}...`
                      : featuredCourse.description}
                  </p>
                )}

                <Link
                  to={`/courses/${featuredCourse._id}`}
                  className={styles.primaryButton}
                >
                  Explore Course
                  <span>→</span>
                </Link>

              </div>
            ) : (
              <div className={styles.noCourses}>

                {loading ? (
                  <p>Loading courses...</p>
                ) : (
                  <>
                    <p>No courses available right now.</p>

                    <Link
                      to="/courses"
                      className={styles.primaryButton}
                    >
                      Browse Courses
                      <span>→</span>
                    </Link>
                  </>
                )}

              </div>
            )}

          </div>

          {/* HERO VISUAL */}

          <div className={styles.heroVisual}>

            <div className={styles.glow}></div>

            <div
              className={`${styles.ring} ${styles.ringOne}`}
            ></div>

            <div
              className={`${styles.ring} ${styles.ringTwo}`}
            ></div>

            <div className={styles.learningCard}>

              <div className={styles.learningTop}>

                <div>
                  <p>NOW LEARNING</p>

                  <h3>
                    {featuredCourse?.title ||
                      "Your Next Skill"}
                  </h3>
                </div>

                <div className={styles.playButton}>
                  ▶
                </div>

              </div>

              <div className={styles.progressSection}>

                <div className={styles.progressHeader}>
                  <span>Learning Progress</span>
                  <strong>68%</strong>
                </div>

                <div className={styles.progressTrack}>
                  <div className={styles.progressBar}></div>
                </div>

              </div>

              <div className={styles.learningBottom}>
                <span>⚡ Practical</span>
                <span>🎯 Career Focused</span>
              </div>

            </div>

          </div>

          {/* CAROUSEL CONTROLS */}

          {courses.length > 1 && (
            <div className={styles.carouselControls}>

              <button
                type="button"
                className={styles.arrowButton}
                onClick={handlePrevious}
              >
                ←
              </button>

              <div className={styles.indicators}>

                {courses.map((course, index) => (
                  <button
                    type="button"
                    key={course._id || index}
                    className={`${styles.indicator} ${
                      index === currentIndex
                        ? styles.activeIndicator
                        : ""
                    }`}
                    onClick={() =>
                      setCurrentIndex(index)
                    }
                    aria-label={`Course ${index + 1}`}
                  ></button>
                ))}

              </div>

              <button
                type="button"
                className={styles.arrowButton}
                onClick={handleNext}
              >
                →
              </button>

            </div>
          )}

        </div>
      </section>

      {/* ================= TRUST ================= */}

      <section className={styles.trustSection}>
        <div className={styles.trustContainer}>

          <div className={styles.trustItem}>
            <strong>100%</strong>
            <span>Practical Learning</span>
          </div>

          <div className={styles.trustDivider}></div>

          <div className={styles.trustItem}>
            <strong>Real</strong>
            <span>Projects & Assignments</span>
          </div>

          <div className={styles.trustDivider}></div>

          <div className={styles.trustItem}>
            <strong>Career</strong>
            <span>Focused Skills</span>
          </div>

          <div className={styles.trustDivider}></div>

          <div className={styles.trustItem}>
            <strong>Learn</strong>
            <span>At Your Own Pace</span>
          </div>

        </div>
      </section>

      {/* ================= WHY LEARNHUB ================= */}

      <section className={styles.whySection}>

        <div className={styles.sectionHeading}>

          <span>WHY LEARNHUB</span>

          <h2>
            Learning designed for
            <br />
            <strong>real-world growth.</strong>
          </h2>

          <p>
            Everything you need to turn knowledge into
            practical skills.
          </p>

        </div>

        <div className={styles.featuresGrid}>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>

            <h3>Learn by Doing</h3>

            <p>
              Work on practical assignments and projects
              instead of only watching videos.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎯</div>

            <h3>Career Focused</h3>

            <p>
              Learn skills that are useful for real-world
              development and professional growth.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📈</div>

            <h3>Track Progress</h3>

            <p>
              Monitor your learning progress and understand
              how far you have come.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🏆</div>

            <h3>Earn Certificates</h3>

            <p>
              Complete courses and showcase your achievements
              with certificates.
            </p>
          </div>

        </div>
      </section>

      {/* ================= COURSES ================= */}

      <section className={styles.coursesSection}>

        <div className={styles.sectionHeadingRow}>

          <div>
            <span>EXPLORE</span>

            <h2>
              Find your next
              <strong> skill.</strong>
            </h2>
          </div>

          <Link
            to="/courses"
            className={styles.viewAllButton}
          >
            View all courses →
          </Link>

        </div>

        {loading ? (
          <div className={styles.courseMessage}>
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className={styles.courseMessage}>
            No courses available.
          </div>
        ) : (
          <div className={styles.courseGrid}>

            {courses.slice(0, 6).map((course) => (
              <div
                key={course._id}
                className={styles.courseCard}
              >

                <div className={styles.courseImageWrapper}>

                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className={styles.courseImage}
                    />
                  ) : (
                    <div className={styles.courseImageFallback}>
                      LearnHub
                    </div>
                  )}

                  <span className={styles.courseBadge}>
                    COURSE
                  </span>

                </div>

                <div className={styles.courseCardBody}>

                  <h3>{course.title}</h3>

                  <p>
                    {course.description
                      ? course.description.length > 90
                        ? `${course.description.substring(
                            0,
                            90
                          )}...`
                        : course.description
                      : "Start learning and build practical skills."}
                  </p>

                  <Link
                    to={`/courses/${course._id}`}
                    className={styles.courseLink}
                  >
                    View Course →
                  </Link>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section className={styles.processSection}>

        <div className={styles.sectionHeading}>

          <span>HOW IT WORKS</span>

          <h2>
            Simple steps.
            <br />
            <strong>Real progress.</strong>
          </h2>

        </div>

        <div className={styles.processGrid}>

          <div className={styles.processCard}>
            <div className={styles.processNumber}>01</div>

            <div>
              <h3>Choose a Course</h3>

              <p>
                Find the course that matches your learning
                goal.
              </p>
            </div>
          </div>

          <div className={styles.processCard}>
            <div className={styles.processNumber}>02</div>

            <div>
              <h3>Start Learning</h3>

              <p>
                Watch lectures, complete assignments and
                practice.
              </p>
            </div>
          </div>

          <div className={styles.processCard}>
            <div className={styles.processNumber}>03</div>

            <div>
              <h3>Track Progress</h3>

              <p>
                Monitor your performance and continue
                improving.
              </p>
            </div>
          </div>

          <div className={styles.processCard}>
            <div className={styles.processNumber}>04</div>

            <div>
              <h3>Earn & Grow</h3>

              <p>
                Complete the course and earn your certificate.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className={styles.ctaSection}>

        <div className={styles.ctaGlow}></div>

        <div className={styles.ctaContent}>

          <span>START TODAY</span>

          <h2>
            Your next skill
            <br />
            could change everything.
          </h2>

          <p>
            Start learning practical skills and take the
            next step toward your career goals.
          </p>

          <Link
            to="/courses"
            className={styles.ctaButton}
          >
            Start Learning
            <span>→</span>
          </Link>

        </div>

      </section>

    </main>
  );
};

export default Home;