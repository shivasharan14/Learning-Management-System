import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import "./AssignmentSubmissions.css";

const API_BASE_URL = "http://localhost:5003";

const AssignmentSubmissions = () => {
  const { assignmentId } = useParams();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradeInputs, setGradeInputs] = useState({});
  const [gradingId, setGradingId] = useState(null);

  // --------------------------------------------------
  // Convert relative file URL to backend URL
  // --------------------------------------------------

  const getSubmissionUrl = (url) => {
    if (!url) {
      return "#";
    }

    if (
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }

    return `${API_BASE_URL}${url}`;
  };

  // --------------------------------------------------
  // Get All Submissions
  // --------------------------------------------------

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);

        const response = await axiosInstance.get(
          `/assignments/${assignmentId}/submissions`
        );

        setSubmissions(
          response.data.submissions || []
        );
      } catch (error) {
        console.error(
          "GET SUBMISSIONS ERROR:",
          error
        );

        toast.error(
          error.response?.data?.msg ||
            "Failed to load submissions"
        );
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      loadSubmissions();
    }
  }, [assignmentId]);

  // --------------------------------------------------
  // Grade Input Change
  // --------------------------------------------------

  const handleGradeChange = (
    submissionId,
    field,
    value
  ) => {
    setGradeInputs((prev) => ({
      ...prev,

      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      },
    }));
  };

  // --------------------------------------------------
  // Submit Grade
  // --------------------------------------------------

  const handleGradeSubmit = async (submissionId) => {
    const currentSubmission =
      submissions.find(
        (submission) =>
          submission._id === submissionId
      );

    if (!currentSubmission) {
      toast.error("Submission not found");
      return;
    }

    const {
      marks,
      feedback,
    } =
      gradeInputs[submissionId] || {};

    // Marks required
    if (
      marks === undefined ||
      marks === ""
    ) {
      toast.error("Please enter marks");
      return;
    }

    // Convert marks to number
    const numericMarks = Number(marks);

    // Invalid number
    if (Number.isNaN(numericMarks)) {
      toast.error("Please enter valid marks");
      return;
    }

    // Negative marks
    if (numericMarks < 0) {
      toast.error(
        "Marks cannot be negative"
      );
      return;
    }

    // Get maximum marks
    const totalMarks =
      Number(
        currentSubmission.assignment
          ?.totalMarks
      );

    // Maximum marks validation
    if (
      !Number.isNaN(totalMarks) &&
      numericMarks > totalMarks
    ) {
      toast.error(
        `Marks cannot be greater than ${totalMarks}`
      );
      return;
    }

    try {
      setGradingId(submissionId);

      const response =
        await axiosInstance.put(
          `/assignments/submissions/${submissionId}/grade`,
          {
            marks: numericMarks,
            feedback:
              feedback?.trim() || "",
          }
        );

      toast.success(
        response.data.msg ||
          "Submission graded successfully!"
      );

      // Update only this submission
      setSubmissions((prev) =>
        prev.map((submission) =>
          submission._id === submissionId
            ? response.data.submission
            : submission
        )
      );

      // Clear input values
      setGradeInputs((prev) => {
        const updated = {
          ...prev,
        };

        delete updated[submissionId];

        return updated;
      });
    } catch (error) {
      console.error(
        "GRADE SUBMISSION ERROR:",
        error
      );

      toast.error(
        error.response?.data?.msg ||
          "Grading failed"
      );
    } finally {
      setGradingId(null);
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="submissionsPage">
        <div className="submissionsLoading">
          <div className="submissionSpinner"></div>

          <h3>
            Loading submissions...
          </h3>

          <p>
            Please wait while we fetch student
            submissions.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <div className="submissionsPage">
      <div className="submissionsContainer">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="submissionsHeader">

          <div className="headerLeft">

            <div className="headerIcon">
              📝
            </div>

            <div>
              <span className="headerEyebrow">
                ASSIGNMENT MANAGEMENT
              </span>

              <h1>
                Assignment Submissions
              </h1>

              <p>
                Review student work, provide
                feedback and assign marks.
              </p>
            </div>

          </div>

          <div className="submissionCount">
            <strong>
              {submissions.length}
            </strong>

            <span>
              {submissions.length === 1
                ? "Submission"
                : "Submissions"}
            </span>
          </div>

        </div>

        {/* ==========================================
            EMPTY STATE
        ========================================== */}

        {submissions.length === 0 ? (
          <div className="noSubmissions">

            <div className="emptyIcon">
              📂
            </div>

            <h2>
              No submissions yet
            </h2>

            <p>
              Students haven't submitted this
              assignment yet. New submissions
              will appear here.
            </p>

          </div>
        ) : (

          /* ========================================
             SUBMISSION LIST
          ======================================== */

          <div className="submissionList">

            {submissions.map(
              (submission, index) => {

                const isGraded =
                  submission.status ===
                  "graded";

                const totalMarks =
                  submission.assignment
                    ?.totalMarks;

                const isCurrentlyGrading =
                  gradingId ===
                  submission._id;

                return (
                  <div
                    className={`submissionCard ${
                      isGraded
                        ? "isGraded"
                        : "isPending"
                    }`}
                    key={submission._id}
                  >

                    {/* ==================================
                        STUDENT HEADER
                    ================================== */}

                    <div className="submissionTop">

                      <div className="studentSection">

                        <div className="studentAvatar">
                          {submission.student?.name
                            ? submission.student.name
                                .charAt(0)
                                .toUpperCase()
                            : "S"}
                        </div>

                        <div className="studentDetails">

                          <div className="studentNameRow">

                            <h3>
                              {submission.student
                                ?.name ||
                                "Unknown Student"}
                            </h3>

                            <span
                              className={`statusBadge ${
                                isGraded
                                  ? "graded"
                                  : "pending"
                              }`}
                            >
                              {isGraded
                                ? "✓ Graded"
                                : "● Pending Review"}
                            </span>

                          </div>

                          <p>
                            {submission.student
                              ?.email ||
                              "No email available"}
                          </p>

                        </div>

                      </div>

                      <div className="submissionNumber">
                        #
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>

                    </div>

                    {/* ==================================
                        SUBMISSION BODY
                    ================================== */}

                    <div className="submissionBody">

                      {/* =================================
                          FILE
                      ================================= */}

                      <div className="submissionFile">

                        <div className="fileIcon">
                          📄
                        </div>

                        <div className="fileInfo">

                          <span>
                            STUDENT SUBMISSION
                          </span>

                          <strong>
                            Submitted assignment
                          </strong>

                        </div>

                        <a
                          className="viewSubmission"
                          href={getSubmissionUrl(
                            submission.submissionUrl
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Submission
                          <span>↗</span>
                        </a>

                      </div>

                      {/* =================================
                          GRADED RESULT
                      ================================= */}

                      {isGraded ? (

                        <div className="gradedResult">

                          <div className="marksBox">

                            <span>
                              MARKS
                            </span>

                            <strong>
                              {submission.marks}
                              {totalMarks
                                ? ` / ${totalMarks}`
                                : ""}
                            </strong>

                          </div>

                          <div className="feedbackBox">

                            <span>
                              INSTRUCTOR FEEDBACK
                            </span>

                            <p>
                              {submission.feedback
                                ? submission.feedback
                                : "No feedback provided."}
                            </p>

                          </div>

                        </div>

                      ) : (

                        /* =============================
                           GRADING SECTION
                        ============================= */

                        <div className="gradingSection">

                          <div className="gradingHeader">

                            <div>

                              <span>
                                REVIEW & GRADE
                              </span>

                              <h4>
                                Evaluate this
                                submission
                              </h4>

                            </div>

                            {totalMarks !==
                              undefined &&
                              totalMarks !==
                                null && (
                                <div className="maximumMarks">
                                  Maximum:
                                  <strong>
                                    {" "}
                                    {totalMarks}
                                  </strong>
                                </div>
                              )}

                          </div>

                          <div className="gradingForm">

                            {/* MARKS */}

                            <div className="marksField">

                              <label>
                                Marks
                              </label>

                              <div className="marksInputWrapper">

                                <input
                                  type="number"
                                  min="0"
                                  max={
                                    totalMarks
                                  }
                                  step="1"
                                  placeholder="0"
                                  value={
                                    gradeInputs[
                                      submission
                                        ._id
                                    ]?.marks ||
                                    ""
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    handleGradeChange(
                                      submission._id,
                                      "marks",
                                      e.target
                                        .value
                                    )
                                  }
                                />

                                <span>
                                  /{" "}
                                  {totalMarks ??
                                    "Marks"}
                                </span>

                              </div>

                            </div>

                            {/* FEEDBACK */}

                            <div className="feedbackField">

                              <label>
                                Feedback
                              </label>

                              <input
                                type="text"
                                placeholder="Write feedback for the student..."
                                value={
                                  gradeInputs[
                                    submission
                                      ._id
                                  ]?.feedback ||
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  handleGradeChange(
                                    submission._id,
                                    "feedback",
                                    e.target
                                      .value
                                  )
                                }
                              />

                            </div>

                            {/* SUBMIT */}

                            <button
                              type="button"
                              className="gradeButton"
                              disabled={
                                isCurrentlyGrading
                              }
                              onClick={() =>
                                handleGradeSubmit(
                                  submission._id
                                )
                              }
                            >

                              {isCurrentlyGrading ? (
                                <>
                                  <span className="buttonSpinner"></span>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <span>
                                    ✓
                                  </span>
                                  Submit Grade
                                </>
                              )}

                            </button>

                          </div>

                        </div>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default AssignmentSubmissions;