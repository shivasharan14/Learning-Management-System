
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import axiosInstance from "../../api/axiosInstance";
import styles from "./CourseDetails.module.css";


// =====================================================
// HORIZONTAL CAROUSEL
// =====================================================

const HorizontalCarousel = ({ children }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const amount = scrollRef.current.clientWidth * 0.85;

    scrollRef.current.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.carouselWrapper}>
      <button
        type="button"
        className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
        onClick={() => scroll("prev")}
        aria-label="Previous"
      >
        ←
      </button>

      <div
        ref={scrollRef}
        className={styles.carouselTrack}
      >
        {children}
      </div>

      <button
        type="button"
        className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
        onClick={() => scroll("next")}
        aria-label="Next"
      >
        →
      </button>
    </div>
  );
};


// =====================================================
// COURSE DETAILS
// =====================================================

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // REDUX USER
  // =====================================================

  const user = useSelector(
    (state) =>
      state.auth?.user ||
      state.user?.user ||
      state.auth?.currentUser ||
      null
  );

  const isAuthenticated = useSelector(
    (state) =>
      state.auth?.isAuthenticated ??
      !!(
        state.auth?.token ||
        state.auth?.accessToken
      )
  );

  // =====================================================
  // BASIC STATES
  // =====================================================

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [enrolling, setEnrolling] = useState(false);

  // =====================================================
  // CONTENT STATES
  // =====================================================

  const [lectures, setLectures] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // =====================================================
  // PROGRESS
  // =====================================================

  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);

  // =====================================================
  // LOADING
  // =====================================================

  const [lecturesLoading, setLecturesLoading] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [quizzesLoading, setQuizzesLoading] = useState(false);

  // =====================================================
  // VIDEO
  // =====================================================

  const [selectedVideo, setSelectedVideo] = useState(null);

  // =====================================================
  // ACCESS
  //
  // null  = checking
  // true  = access granted
  // false = not enrolled
  // =====================================================

  const [courseAccess, setCourseAccess] = useState(null);


  // =====================================================
  // HELPERS
  // =====================================================

  const getSafeText = (value, fallback = "") => {
    if (value === null || value === undefined) {
      return fallback;
    }

    if (typeof value === "string") {
      return value;
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }

    return fallback;
  };


  const getId = (value) => {
    if (!value) return null;

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return value._id || value.id || null;
    }

    return null;
  };


  const getCourseFromResponse = (responseData) => {
    if (!responseData) return null;

    return (
      responseData.course ||
      responseData.data?.course ||
      responseData.data ||
      responseData
    );
  };


  const getArrayFromResponse = (
    responseData,
    key
  ) => {
    if (!responseData) return [];

    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (Array.isArray(responseData[key])) {
      return responseData[key];
    }

    if (Array.isArray(responseData.data?.[key])) {
      return responseData.data[key];
    }

    if (Array.isArray(responseData.data)) {
      return responseData.data;
    }

    return [];
  };


  const getInstructorName = () => {
    if (!course?.instructor) {
      return "Instructor";
    }

    if (typeof course.instructor === "string") {
      return "Instructor";
    }

    return (
      course.instructor.name ||
      course.instructor.fullName ||
      course.instructor.username ||
      "Instructor"
    );
  };


  // =====================================================
  // ROLE
  // =====================================================

  const userRole = String(
    user?.role ||
    user?.userRole ||
    ""
  ).toLowerCase();

  const isAdmin = userRole === "admin";


  // =====================================================
  // CURRENT USER ID
  // =====================================================

  const currentUserId = getId(
    user?._id || user?.id
  );


  // =====================================================
  // COURSE OWNER
  // =====================================================

  const courseInstructorId = getId(
    course?.instructor
  );

  const isCourseOwner =
    !!currentUserId &&
    !!courseInstructorId &&
    String(currentUserId) ===
      String(courseInstructorId);


  // =====================================================
  // PRIVILEGED ACCESS
  //
  // Owner + Admin = direct content access
  // =====================================================

  const hasPrivilegedAccess =
    isAdmin || isCourseOwner;


  // =====================================================
  // CAN ENROLL
  //
  // Student + Instructor can enroll
  // Admin / Owner don't need enrollment
  // =====================================================

  const canEnroll =
    !!isAuthenticated &&
    !isAdmin &&
    !isCourseOwner;


  // =====================================================
  // CONTENT ACCESS
  // =====================================================

  const canViewContent =
    hasPrivilegedAccess ||
    courseAccess === true;


  // =====================================================
  // FETCH COURSE
  //
  // IMPORTANT:
  // This is independent from enrollment.
  //
  // Therefore Overview will ALWAYS render
  // once course information is loaded.
  // =====================================================

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const getCourse = async () => {
      setLoading(true);

      try {
        const response =
          await axiosInstance.get(
            `/courses/${id}`
          );

        console.log(
          "COURSE RESPONSE:",
          response.data
        );

        const loadedCourse =
          getCourseFromResponse(
            response.data
          );

        if (!cancelled) {
          setCourse(loadedCourse);
        }
      } catch (error) {
        console.error(
          "GET COURSE ERROR:",
          error
        );

        if (!cancelled) {
          toast.error(
            error.response?.data?.msg ||
              "Failed to load course"
          );

          setCourse(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    getCourse();

    return () => {
      cancelled = true;
    };
  }, [id]);


  // =====================================================
  // RESET ACCESS
  // =====================================================

  useEffect(() => {
    if (!course) {
      setCourseAccess(null);
      return;
    }

    // Logged out
    if (!isAuthenticated) {
      setCourseAccess(false);
      return;
    }

    // Admin / course owner
    if (hasPrivilegedAccess) {
      setCourseAccess(true);
      return;
    }

    // Other student/instructor:
    // access needs to be checked
    setCourseAccess(null);
  }, [
    course,
    isAuthenticated,
    hasPrivilegedAccess,
  ]);


  // =====================================================
  // ACCESS CHECK
  //
  // We use lectures endpoint because backend already
  // checks:
  //
  // owner OR admin OR enrollment
  //
  // 200 = access
  // 403 = not enrolled
  // =====================================================

  useEffect(() => {
    if (
      !id ||
      !course ||
      !isAuthenticated
    ) {
      return;
    }

    if (hasPrivilegedAccess) {
      return;
    }

    if (courseAccess !== null) {
      return;
    }

    let cancelled = false;

    const checkCourseAccess = async () => {
      setLecturesLoading(true);

      try {
        console.log(
          "CHECKING COURSE ACCESS:",
          id
        );

        const response =
          await axiosInstance.get(
            `/lectures/course/${id}`
          );

        console.log(
          "ACCESS PROBE RESPONSE:",
          response.data
        );

        const loadedLectures =
          getArrayFromResponse(
            response.data,
            "lectures"
          );

        if (!cancelled) {
          setLectures(
            loadedLectures
          );

          setCourseAccess(true);
        }
      } catch (error) {
        console.log(
          "COURSE ACCESS PROBE ERROR:",
          error.response?.data ||
            error.message
        );

        if (!cancelled) {
          if (
            error.response?.status === 403
          ) {
            setCourseAccess(false);
          } else {
            setCourseAccess(false);
          }

          setLectures([]);
        }
      } finally {
        if (!cancelled) {
          setLecturesLoading(false);
        }
      }
    };

    checkCourseAccess();

    return () => {
      cancelled = true;
    };
  }, [
    id,
    course,
    isAuthenticated,
    hasPrivilegedAccess,
    courseAccess,
  ]);


  // =====================================================
  // FETCH CONTENT
  //
  // Only after access is confirmed.
  // =====================================================

  useEffect(() => {
    if (
      !id ||
      !course ||
      !isAuthenticated
    ) {
      setLectures([]);
      setAssignments([]);
      setQuizzes([]);

      setLecturesLoading(false);
      setAssignmentsLoading(false);
      setQuizzesLoading(false);

      return;
    }

    if (
      !hasPrivilegedAccess &&
      courseAccess !== true
    ) {
      return;
    }

    let cancelled = false;

    const getCourseContent = async () => {
      setLecturesLoading(true);
      setAssignmentsLoading(true);
      setQuizzesLoading(true);

      try {
        console.log(
          "FETCHING COURSE CONTENT:",
          id
        );

        const [
          lectureResponse,
          assignmentResponse,
          quizResponse,
        ] = await Promise.allSettled([
          axiosInstance.get(
            `/lectures/course/${id}`
          ),

          axiosInstance.get(
            `/assignments/course/${id}`
          ),

          axiosInstance.get(
            `/quizzes/course/${id}`
          ),
        ]);

        if (cancelled) return;


        // =================================================
        // LECTURES
        // =================================================

        if (
          lectureResponse.status ===
          "fulfilled"
        ) {
          console.log(
            "LECTURES RESPONSE:",
            lectureResponse.value.data
          );

          const loadedLectures =
            getArrayFromResponse(
              lectureResponse.value.data,
              "lectures"
            );

          setLectures(
            loadedLectures
          );
        } else {
          console.error(
            "GET LECTURES ERROR:",
            lectureResponse.reason
              ?.response?.data ||
              lectureResponse.reason?.message
          );

          setLectures([]);
        }


        // =================================================
        // ASSIGNMENTS
        // =================================================

        if (
          assignmentResponse.status ===
          "fulfilled"
        ) {
          console.log(
            "ASSIGNMENTS RESPONSE:",
            assignmentResponse.value.data
          );

          const loadedAssignments =
            getArrayFromResponse(
              assignmentResponse.value.data,
              "assignments"
            );

          setAssignments(
            loadedAssignments
          );
        } else {
          console.error(
            "GET ASSIGNMENTS ERROR:",
            assignmentResponse.reason
              ?.response?.data ||
              assignmentResponse.reason?.message
          );

          setAssignments([]);
        }


        // =================================================
        // QUIZZES
        // =================================================

        if (
          quizResponse.status ===
          "fulfilled"
        ) {
          console.log(
            "QUIZZES RESPONSE:",
            quizResponse.value.data
          );

          const loadedQuizzes =
            getArrayFromResponse(
              quizResponse.value.data,
              "quizzes"
            );

          setQuizzes(
            loadedQuizzes
          );
        } else {
          console.error(
            "GET QUIZZES ERROR:",
            quizResponse.reason
              ?.response?.data ||
              quizResponse.reason?.message
          );

          setQuizzes([]);
        }

      } catch (error) {
        console.error(
          "GET COURSE CONTENT ERROR:",
          error
        );
      } finally {
        if (!cancelled) {
          setLecturesLoading(false);
          setAssignmentsLoading(false);
          setQuizzesLoading(false);
        }
      }
    };

    getCourseContent();

    return () => {
      cancelled = true;
    };

  }, [
    id,
    course,
    isAuthenticated,
    hasPrivilegedAccess,
    courseAccess,
  ]);


  // =====================================================
  // PROGRESS
  //
  // Progress is only relevant for enrolled learners.
  // Owner/Admin don't need progress.
  // =====================================================

  useEffect(() => {
    if (
      !id ||
      !course ||
      !isAuthenticated ||
      hasPrivilegedAccess ||
      courseAccess !== true
    ) {
      setProgress(null);
      setProgressLoading(false);
      return;
    }

    let cancelled = false;

    const getProgress = async () => {
      setProgressLoading(true);

      try {
        const response =
          await axiosInstance.get(
            `/progress/course/${id}`
          );

        console.log(
          "PROGRESS RESPONSE:",
          response.data
        );

        const loadedProgress =
          response.data?.progress ||
          response.data?.data?.progress ||
          response.data?.data ||
          null;

        if (!cancelled) {
          setProgress(
            loadedProgress
          );
        }
      } catch (error) {
        console.log(
          "GET PROGRESS ERROR:",
          error.response?.data ||
            error.message
        );

        if (!cancelled) {
          setProgress(null);
        }
      } finally {
        if (!cancelled) {
          setProgressLoading(false);
        }
      }
    };

    getProgress();

    return () => {
      cancelled = true;
    };
  }, [
    id,
    course,
    isAuthenticated,
    hasPrivilegedAccess,
    courseAccess,
  ]);


  // =====================================================
  // ENROLL
  // =====================================================

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.info(
        "Please login to enroll in this course."
      );

      navigate("/login");
      return;
    }

    if (!canEnroll || enrolling) {
      return;
    }

    try {
      setEnrolling(true);

      console.log(
        "ENROLLING COURSE:",
        id
      );

      const response =
        await axiosInstance.post(
          "/enrollments",
          {
            course: id,
          }
        );

      console.log(
        "ENROLL RESPONSE:",
        response.data
      );

      toast.success(
        response.data?.msg ||
          "Successfully enrolled in the course!"
      );

      // Unlock content immediately
      setCourseAccess(true);

    } catch (error) {
      console.error(
        "ENROLL ERROR:",
        error
      );

      toast.error(
        error.response?.data?.msg ||
          "Failed to enroll in course"
      );
    } finally {
      setEnrolling(false);
    }
  };


  // =====================================================
  // VIDEO URL
  // =====================================================

  const getVideoUrl = (lecture) => {
    if (!lecture) return "";

    return (
      lecture.videoUrl ||
      lecture.video ||
      lecture.videoURL ||
      lecture.url ||
      lecture.fileUrl ||
      lecture.file ||
      ""
    );
  };


  // =====================================================
  // RESOURCE URL
  // =====================================================

  const getResourceUrl = (item) => {
    if (!item) return "";

    return (
      item.fileUrl ||
      item.fileURL ||
      item.url ||
      item.file ||
      item.resourceUrl ||
      ""
    );
  };


  // =====================================================
  // COUNTS
  //
  // IMPORTANT:
  // Overview does NOT depend on access.
  //
  // If content is locked, use counts coming from
  // course API if available.
  // =====================================================

  const lectureCount =
    canViewContent
      ? lectures.length
      : Number(
          course?.lectureCount ||
          course?.lecturesCount ||
          course?.totalLectures ||
          course?.numberOfLectures ||
          0
        );

  const assignmentCount =
    canViewContent
      ? assignments.length
      : Number(
          course?.assignmentCount ||
          course?.assignmentsCount ||
          course?.totalAssignments ||
          0
        );

  const quizCount =
    canViewContent
      ? quizzes.length
      : Number(
          course?.quizCount ||
          course?.quizzesCount ||
          course?.totalQuizzes ||
          0
        );


  // =====================================================
  // PROGRESS %
  // =====================================================

  const progressPercentage =
    Number(
      progress?.percentage ??
      progress?.progressPercentage ??
      progress?.completionPercentage ??
      progress?.percent ??
      0
    );


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>

          <p>
            Loading course...
          </p>
        </div>
      </div>
    );
  }


  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!course) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <h2>
            Course not found
          </h2>

          <p>
            The course you are looking for
            does not exist or could not be
            loaded.
          </p>

          <Link
            to="/courses"
            className={styles.primaryButton}
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }


  // =====================================================
  // COURSE DATA
  // =====================================================

  const courseTitle =
    getSafeText(
      course.title ||
        course.name,
      "Untitled Course"
    );

  const courseDescription =
    getSafeText(
      course.description,
      "No course description available."
    );

  const courseCategory =
    getSafeText(
      course.category?.name ||
        course.category,
      "General"
    );

  const courseLevel =
    getSafeText(
      course.level,
      "All Levels"
    );

  const instructorName =
    getInstructorName();

  const thumbnail =
    course.thumbnail ||
    course.image ||
    course.imageUrl ||
    course.coverImage ||
    "";

  const coursePrice =
    course.price ??
    course.amount ??
    0;


  // =====================================================
  // WHAT YOU WILL LEARN
  // =====================================================

  const whatYouLearn =
    Array.isArray(
      course.whatYouWillLearn
    )
      ? course.whatYouWillLearn
      : Array.isArray(
          course.learningOutcomes
        )
      ? course.learningOutcomes
      : Array.isArray(
          course.objectives
        )
      ? course.objectives
      : [];


  // =====================================================
  // COURSE INCLUDES
  // =====================================================

  const courseIncludes = [
    lectureCount > 0
      ? `${lectureCount} video lecture${
          lectureCount > 1
            ? "s"
            : ""
        }`
      : "Video lectures",

    assignmentCount > 0
      ? `${assignmentCount} assignment${
          assignmentCount > 1
            ? "s"
            : ""
        }`
      : "Assignments",

    quizCount > 0
      ? `${quizCount} quiz${
          quizCount > 1
            ? "zes"
            : ""
        }`
      : "Quizzes",

    "Course progress tracking",
  ];


  // =====================================================
  // LECTURE GROUPS
  // =====================================================

  const videoLectures =
    lectures.filter((lecture) => {
      const type = String(
        lecture.type ||
        lecture.contentType ||
        lecture.materialType ||
        "video"
      ).toLowerCase();

      return (
        type === "video" ||
        !!getVideoUrl(lecture)
      );
    });


  const pdfLectures =
    lectures.filter((lecture) => {
      const type = String(
        lecture.type ||
        lecture.contentType ||
        lecture.materialType ||
        ""
      ).toLowerCase();

      return (
        type === "pdf" ||
        type === "document"
      );
    });


  const pptLectures =
    lectures.filter((lecture) => {
      const type = String(
        lecture.type ||
        lecture.contentType ||
        lecture.materialType ||
        ""
      ).toLowerCase();

      return (
        type === "ppt" ||
        type === "pptx" ||
        type === "presentation"
      );
    });


  const otherLectures =
    lectures.filter((lecture) => {
      const type = String(
        lecture.type ||
        lecture.contentType ||
        lecture.materialType ||
        ""
      ).toLowerCase();

      return (
        type !== "video" &&
        type !== "pdf" &&
        type !== "document" &&
        type !== "ppt" &&
        type !== "pptx" &&
        type !== "presentation" &&
        !getVideoUrl(lecture)
      );
    });


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className={styles.page}>

      {/* =================================================
          HERO
      ================================================= */}

      <section className={styles.heroSection}>

        <div className={styles.heroOverlay}></div>

        <div className={styles.container}>

          <div className={styles.breadcrumb}>
            <Link to="/">
              Home
            </Link>

            <span>/</span>

            <Link to="/courses">
              Courses
            </Link>

            <span>/</span>

            <span>
              {courseTitle}
            </span>
          </div>


          <div className={styles.heroGrid}>

            {/* LEFT */}

            <div className={styles.heroContent}>

              <div className={styles.categoryBadge}>
                {courseCategory}
              </div>

              <h1>
                {courseTitle}
              </h1>

              <p className={styles.heroDescription}>
                {courseDescription}
              </p>


              <div className={styles.instructorInfo}>

                <div className={styles.instructorAvatar}>
                  {instructorName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <span>
                    Created by
                  </span>

                  <strong>
                    {instructorName}
                  </strong>
                </div>

              </div>


              <div className={styles.courseMeta}>

                <div className={styles.metaItem}>
                  <span>📚</span>

                  <strong>
                    {lectureCount}
                  </strong>

                  <small>
                    Lectures
                  </small>
                </div>


                <div className={styles.metaItem}>
                  <span>📝</span>

                  <strong>
                    {assignmentCount}
                  </strong>

                  <small>
                    Assignments
                  </small>
                </div>


                <div className={styles.metaItem}>
                  <span>❓</span>

                  <strong>
                    {quizCount}
                  </strong>

                  <small>
                    Quizzes
                  </small>
                </div>


                <div className={styles.metaItem}>
                  <span>🎯</span>

                  <strong>
                    {courseLevel}
                  </strong>

                  <small>
                    Level
                  </small>
                </div>

              </div>

            </div>


            {/* =================================================
                RIGHT CARD
            ================================================= */}

            <div className={styles.enrollmentCard}>

              {thumbnail ? (
                <div className={styles.courseThumbnail}>
                  <img
                    src={thumbnail}
                    alt={courseTitle}
                  />
                </div>
              ) : (
                <div className={styles.courseThumbnailPlaceholder}>
                  <span>📚</span>
                </div>
              )}


              <div className={styles.enrollmentBody}>

                {hasPrivilegedAccess ? (
                  <>
                    <div className={styles.accessBadge}>
                      ✓ Full Access
                    </div>

                    <h3>
                      Manage Course
                    </h3>

                    <p>
                      You have full access to
                      this course.
                    </p>
                  </>
                ) : courseAccess === true ? (
                  <>
                    <div className={styles.accessBadge}>
                      ✓ Enrolled
                    </div>

                    <h3>
                      You are enrolled
                    </h3>

                    <p>
                      Continue learning from
                      where you left off.
                    </p>
                  </>
                ) : (
                  <>
                    <span className={styles.price}>
                      {Number(coursePrice) > 0
                        ? `₹${coursePrice}`
                        : "Free"}
                    </span>

                    <h3>
                      Start learning today
                    </h3>

                    <p>
                      Enroll in this course to
                      unlock all lectures,
                      assignments and quizzes.
                    </p>

                    {!isAuthenticated ? (
                      <button
                        type="button"
                        className={styles.enrollButton}
                        onClick={() =>
                          navigate("/login")
                        }
                      >
                        Login to Enroll
                      </button>
                    ) : canEnroll ? (
                      <button
                        type="button"
                        className={styles.enrollButton}
                        onClick={handleEnroll}
                        disabled={enrolling}
                      >
                        {enrolling
                          ? "Enrolling..."
                          : "Enroll Now"}
                      </button>
                    ) : null}
                  </>
                )}

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =================================================
          MAIN
          IMPORTANT:
          Overview is ALWAYS visible.
      ================================================= */}

      <main className={styles.container}>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        <section className={styles.overviewSection}>

          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                COURSE OVERVIEW
              </span>

              <h2>
                About this course
              </h2>
            </div>
          </div>


          <div className={styles.overviewGrid}>

            <div className={styles.overviewCard}>
              <div className={styles.overviewIcon}>
                📚
              </div>

              <div>
                <strong>
                  {lectureCount}
                </strong>

                <span>
                  Video Lectures
                </span>
              </div>
            </div>


            <div className={styles.overviewCard}>
              <div className={styles.overviewIcon}>
                📄
              </div>

              <div>
                <strong>
                  {assignmentCount}
                </strong>

                <span>
                  Assignments
                </span>
              </div>
            </div>


            <div className={styles.overviewCard}>
              <div className={styles.overviewIcon}>
                🧠
              </div>

              <div>
                <strong>
                  {quizCount}
                </strong>

                <span>
                  Quizzes
                </span>
              </div>
            </div>


            <div className={styles.overviewCard}>
              <div className={styles.overviewIcon}>
                🎓
              </div>

              <div>
                <strong>
                  {courseLevel}
                </strong>

                <span>
                  Course Level
                </span>
              </div>
            </div>

          </div>


          <div className={styles.descriptionBox}>
            <h3>
              Course Description
            </h3>

            <p>
              {courseDescription}
            </p>
          </div>

        </section>


        {/* =================================================
            WHAT YOU WILL LEARN
        ================================================= */}

        {whatYouLearn.length > 0 && (
          <section className={styles.learningSection}>

            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  LEARNING OUTCOMES
                </span>

                <h2>
                  What you'll learn
                </h2>
              </div>
            </div>


            <div className={styles.learningGrid}>

              {whatYouLearn.map(
                (item, index) => (
                  <div
                    key={index}
                    className={styles.learningItem}
                  >
                    <span>✓</span>

                    <p>
                      {typeof item === "string"
                        ? item
                        : item?.title ||
                          item?.text ||
                          item?.description ||
                          ""}
                    </p>
                  </div>
                )
              )}

            </div>

          </section>
        )}


        {/* =================================================
            COURSE INCLUDES
        ================================================= */}

        <section className={styles.includesSection}>

          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                COURSE FEATURES
              </span>

              <h2>
                Course includes
              </h2>
            </div>
          </div>


          <div className={styles.includesGrid}>

            {courseIncludes.map(
              (item, index) => (
                <div
                  key={index}
                  className={styles.includeItem}
                >
                  <span>
                    ✓
                  </span>

                  <p>
                    {item}
                  </p>
                </div>
              )
            )}

          </div>

        </section>


        {/* =================================================
            LOCKED CONTENT
        ================================================= */}

        {!canViewContent && (
          <section className={styles.lockedSection}>

            <div className={styles.lockedIcon}>
              🔒
            </div>

            <div className={styles.lockedContent}>

              <span className={styles.lockedBadge}>
                CONTENT LOCKED
              </span>

              <h2>
                Enroll to unlock the full course
              </h2>

              <p>
                You can see the complete course
                overview, but lectures,
                assignments and quizzes are
                available after enrollment.
              </p>


              <div className={styles.lockedFeatures}>

                <div>
                  <span>✓</span>
                  Video lectures
                </div>

                <div>
                  <span>✓</span>
                  Course materials
                </div>

                <div>
                  <span>✓</span>
                  Assignments
                </div>

                <div>
                  <span>✓</span>
                  Quizzes
                </div>

                <div>
                  <span>✓</span>
                  Progress tracking
                </div>

              </div>


              {!isAuthenticated ? (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() =>
                    navigate("/login")
                  }
                >
                  Login to Continue
                </button>
              ) : canEnroll ? (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling
                    ? "Enrolling..."
                    : "Enroll Now"}
                </button>
              ) : null}

            </div>

          </section>
        )}


        {/* =================================================
            UNLOCKED CONTENT
        ================================================= */}

        {canViewContent && (
          <section className={styles.contentSection}>

            {/* =================================================
                PROGRESS
            ================================================= */}

            {!hasPrivilegedAccess &&
              progress && (
                <div className={styles.progressCard}>

                  <div className={styles.progressTop}>

                    <div>
                      <span>
                        YOUR PROGRESS
                      </span>

                      <h3>
                        Keep learning
                      </h3>
                    </div>

                    <strong>
                      {progressPercentage}%
                    </strong>

                  </div>


                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            progressPercentage
                          )
                        )}%`,
                      }}
                    />
                  </div>

                </div>
              )}


            {/* =================================================
                VIDEO LECTURES
            ================================================= */}

            <section className={styles.materialSection}>

              <div className={styles.contentSectionHeader}>

                <div>
                  <span className={styles.sectionEyebrow}>
                    LEARN
                  </span>

                  <h2>
                    Video Lectures
                  </h2>

                  <p>
                    Watch the course lectures
                    and learn step by step.
                  </p>
                </div>

                <span className={styles.countBadge}>
                  {videoLectures.length}
                </span>

              </div>


              {lecturesLoading &&
              videoLectures.length === 0 ? (
                <div className={styles.loadingInline}>
                  Loading lectures...
                </div>
              ) : videoLectures.length === 0 ? (
                <div className={styles.emptyContent}>
                  <span>🎥</span>

                  <h3>
                    No video lectures yet
                  </h3>

                  <p>
                    The instructor has not
                    added any video lectures.
                  </p>
                </div>
              ) : (
                <HorizontalCarousel>

                  {videoLectures.map(
                    (lecture, index) => (
                      <article
                        key={
                          lecture?._id ||
                          lecture?.id ||
                          index
                        }
                        className={
                          styles.contentCard
                        }
                      >

                        <div
                          className={
                            styles.contentCardIcon
                          }
                        >
                          ▶
                        </div>

                        <div
                          className={
                            styles.contentCardBody
                          }
                        >

                          <span
                            className={
                              styles.cardNumber
                            }
                          >
                            Lecture{" "}
                            {index + 1}
                          </span>

                          <h3>
                            {lecture?.title ||
                              lecture?.name ||
                              `Lecture ${index + 1}`}
                          </h3>

                          <p>
                            {lecture?.description ||
                              "Watch this lecture to continue learning."}
                          </p>


                          <button
                            type="button"
                            className={
                              styles.cardButton
                            }
                            onClick={() =>
                              setSelectedVideo(
                                getVideoUrl(
                                  lecture
                                )
                              )
                            }
                            disabled={
                              !getVideoUrl(
                                lecture
                              )
                            }
                          >
                            Watch Lecture →
                          </button>

                        </div>

                      </article>
                    )
                  )}

                </HorizontalCarousel>
              )}

            </section>


            {/* =================================================
                PDF MATERIAL
            ================================================= */}

            <section className={styles.materialSection}>

              <div className={styles.contentSectionHeader}>

                <div>
                  <span className={styles.sectionEyebrow}>
                    RESOURCES
                  </span>

                  <h2>
                    PDF Materials
                  </h2>

                  <p>
                    Download and study course
                    documents.
                  </p>
                </div>

                <span className={styles.countBadge}>
                  {pdfLectures.length}
                </span>

              </div>


              {pdfLectures.length === 0 ? (
                <div className={styles.emptyContent}>
                  <span>📄</span>

                  <h3>
                    No PDF materials
                  </h3>

                  <p>
                    No PDF resources have been
                    added yet.
                  </p>
                </div>
              ) : (
                <HorizontalCarousel>

                  {pdfLectures.map(
                    (lecture, index) => (
                      <article
                        key={
                          lecture?._id ||
                          index
                        }
                        className={
                          styles.resourceCard
                        }
                      >

                        <div
                          className={
                            styles.resourceIcon
                          }
                        >
                          PDF
                        </div>

                        <span>
                          Document{" "}
                          {index + 1}
                        </span>

                        <h3>
                          {lecture?.title ||
                            lecture?.name ||
                            `PDF ${index + 1}`}
                        </h3>

                        <a
                          href={getResourceUrl(
                            lecture
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className={
                            styles.cardButton
                          }
                        >
                          Open PDF →
                        </a>

                      </article>
                    )
                  )}

                </HorizontalCarousel>
              )}

            </section>


            {/* =================================================
                PPT MATERIAL
            ================================================= */}

            <section className={styles.materialSection}>

              <div className={styles.contentSectionHeader}>

                <div>
                  <span className={styles.sectionEyebrow}>
                    RESOURCES
                  </span>

                  <h2>
                    PPT Materials
                  </h2>

                  <p>
                    Presentation files for
                    additional learning.
                  </p>
                </div>

                <span className={styles.countBadge}>
                  {pptLectures.length}
                </span>

              </div>


              {pptLectures.length === 0 ? (
                <div className={styles.emptyContent}>
                  <span>📊</span>

                  <h3>
                    No PPT materials
                  </h3>

                  <p>
                    No presentation resources
                    have been added yet.
                  </p>
                </div>
              ) : (
                <HorizontalCarousel>

                  {pptLectures.map(
                    (lecture, index) => (
                      <article
                        key={
                          lecture?._id ||
                          index
                        }
                        className={
                          styles.resourceCard
                        }
                      >

                        <div
                          className={
                            styles.resourceIcon
                          }
                        >
                          PPT
                        </div>

                        <span>
                          Presentation{" "}
                          {index + 1}
                        </span>

                        <h3>
                          {lecture?.title ||
                            lecture?.name ||
                            `Presentation ${index + 1}`}
                        </h3>

                        <a
                          href={getResourceUrl(
                            lecture
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className={
                            styles.cardButton
                          }
                        >
                          Open PPT →
                        </a>

                      </article>
                    )
                  )}

                </HorizontalCarousel>
              )}

            </section>


            {/* =================================================
                OTHER MATERIAL
            ================================================= */}

            {otherLectures.length > 0 && (
              <section
                className={
                  styles.materialSection
                }
              >

                <div
                  className={
                    styles.contentSectionHeader
                  }
                >
                  <div>
                    <span
                      className={
                        styles.sectionEyebrow
                      }
                    >
                      RESOURCES
                    </span>

                    <h2>
                      Other Materials
                    </h2>
                  </div>

                  <span
                    className={
                      styles.countBadge
                    }
                  >
                    {otherLectures.length}
                  </span>
                </div>


                <HorizontalCarousel>

                  {otherLectures.map(
                    (lecture, index) => (
                      <article
                        key={
                          lecture?._id ||
                          index
                        }
                        className={
                          styles.resourceCard
                        }
                      >

                        <div
                          className={
                            styles.resourceIcon
                          }
                        >
                          📎
                        </div>

                        <span>
                          Resource{" "}
                          {index + 1}
                        </span>

                        <h3>
                          {lecture?.title ||
                            lecture?.name ||
                            `Resource ${index + 1}`}
                        </h3>

                        {getResourceUrl(
                          lecture
                        ) ? (
                          <a
                            href={getResourceUrl(
                              lecture
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className={
                              styles.cardButton
                            }
                          >
                            Open Resource →
                          </a>
                        ) : (
                          <span
                            className={
                              styles.noResource
                            }
                          >
                            No file available
                          </span>
                        )}

                      </article>
                    )
                  )}

                </HorizontalCarousel>

              </section>
            )}


            {/* =================================================
                ASSIGNMENTS
            ================================================= */}

            <section className={styles.materialSection}>

              <div className={styles.contentSectionHeader}>

                <div>
                  <span className={styles.sectionEyebrow}>
                    PRACTICE
                  </span>

                  <h2>
                    Assignments
                  </h2>

                  <p>
                    Complete assignments to
                    practice what you learn.
                  </p>
                </div>

                <span className={styles.countBadge}>
                  {assignments.length}
                </span>

              </div>


              {assignmentsLoading ? (
                <div className={styles.loadingInline}>
                  Loading assignments...
                </div>
              ) : assignments.length === 0 ? (
                <div className={styles.emptyContent}>
                  <span>📝</span>

                  <h3>
                    No assignments yet
                  </h3>

                  <p>
                    The instructor has not
                    added any assignments.
                  </p>
                </div>
              ) : (
                <HorizontalCarousel>

                  {assignments.map(
                    (
                      assignment,
                      index
                    ) => (
                      <article
                        key={
                          assignment?._id ||
                          assignment?.id ||
                          index
                        }
                        className={
                          styles.activityCard
                        }
                      >

                        <div
                          className={
                            styles.activityIcon
                          }
                        >
                          📝
                        </div>

                        <span
                          className={
                            styles.cardNumber
                          }
                        >
                          Assignment{" "}
                          {index + 1}
                        </span>

                        <h3>
                          {assignment?.title ||
                            assignment?.name ||
                            `Assignment ${index + 1}`}
                        </h3>

                        <p>
                          {assignment?.description ||
                            "Complete this assignment to test your understanding."}
                        </p>

                        <Link
                          to={`/assignment/${assignment?._id}`}
                          className={
                            styles.cardButton
                          }
                        >
                          View Assignment →
                        </Link>

                      </article>
                    )
                  )}

                </HorizontalCarousel>
              )}

            </section>


            {/* =================================================
                QUIZZES
            ================================================= */}

            <section className={styles.materialSection}>

              <div className={styles.contentSectionHeader}>

                <div>
                  <span className={styles.sectionEyebrow}>
                    TEST YOUR KNOWLEDGE
                  </span>

                  <h2>
                    Quizzes
                  </h2>

                  <p>
                    Test your knowledge with
                    course quizzes.
                  </p>
                </div>

                <span className={styles.countBadge}>
                  {quizzes.length}
                </span>

              </div>


              {quizzesLoading ? (
                <div className={styles.loadingInline}>
                  Loading quizzes...
                </div>
              ) : quizzes.length === 0 ? (
                <div className={styles.emptyContent}>
                  <span>❓</span>

                  <h3>
                    No quizzes yet
                  </h3>

                  <p>
                    No quizzes are available
                    for this course.
                  </p>
                </div>
              ) : (
                <HorizontalCarousel>

                  {quizzes.map(
                    (quiz, index) => (
                      <article
                        key={
                          quiz?._id ||
                          quiz?.id ||
                          index
                        }
                        className={
                          styles.activityCard
                        }
                      >

                        <div
                          className={
                            styles.activityIcon
                          }
                        >
                          ❓
                        </div>

                        <span
                          className={
                            styles.cardNumber
                          }
                        >
                          Quiz{" "}
                          {index + 1}
                        </span>

                        <h3>
                          {quiz?.title ||
                            quiz?.name ||
                            `Quiz ${index + 1}`}
                        </h3>

                        <p>
                          {quiz?.description ||
                            "Test your knowledge from this course."}
                        </p>

                        <Link
                          to={`/quiz/${quiz?._id}/attempt`}
                          className={
                            styles.cardButton
                          }
                        >
                          Attempt Quiz →
                        </Link>

                      </article>
                    )
                  )}

                </HorizontalCarousel>
              )}

            </section>


            {/* =================================================
                COMPLETE EMPTY STATE
            ================================================= */}

            {!lecturesLoading &&
              !assignmentsLoading &&
              !quizzesLoading &&
              lectures.length === 0 &&
              assignments.length === 0 &&
              quizzes.length === 0 && (
                <div
                  className={
                    styles.emptyContent
                  }
                >
                  <span>📚</span>

                  <h3>
                    Course content is not
                    available yet
                  </h3>

                  <p>
                    The instructor has not
                    added any learning
                    materials to this course.
                  </p>
                </div>
              )}

          </section>
        )}

      </main>


      {/* =================================================
          VIDEO MODAL
      ================================================= */}

      {selectedVideo && (
        <div
          className={styles.videoModal}
          onClick={() =>
            setSelectedVideo(null)
          }
        >

          <div
            className={styles.videoModalContent}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className={
                styles.videoCloseButton
              }
              onClick={() =>
                setSelectedVideo(null)
              }
              aria-label="Close video"
            >
              ×
            </button>

            <video
              src={selectedVideo}
              controls
              autoPlay
              className={
                styles.videoPlayer
              }
            />

          </div>

        </div>
      )}

    </div>
  );
};

export default CourseDetails;

