import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import styles from "./SubmitAssignment.module.css";
const SubmitAssignment = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState("file");
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const assignmentResponse = await axiosInstance.get(
          `/assignments/${assignmentId}`,
        );
        setAssignment(assignmentResponse.data.assignment);
        try {
          const submissionResponse = await axiosInstance.get(
            `/assignments/${assignmentId}/my-submission`,
          );
          setMySubmission(submissionResponse.data.submission);
        } catch (error) {
          setMySubmission(null);
        }
      } catch (error) {
        console.error("GET ASSIGNMENT ERROR:", error);
        toast.error(error.response?.data?.msg || "Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };
    loadAssignment();
  }, [assignmentId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    let submissionUrl = "";
    if (mode === "file") {
      if (!file) {
        toast.error("Please choose a file first.");
        return;
      }
    } else {
      if (!link.trim()) {
        toast.error("Please enter your submission link.");
        return;
      }
      submissionUrl = link.trim();
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (mode === "file") {
        formData.append("file", file);
      } else {
        formData.append("submissionUrl", submissionUrl);
      }
      const response = await axiosInstance.post(
        `/assignments/${assignmentId}/submit`,
        formData,
      );
      toast.success(response.data.msg || "Assignment submitted successfully!");
      setMySubmission(response.data.submission);
      setFile(null);
      setLink("");
    } catch (error) {
      console.error("SUBMIT ASSIGNMENT ERROR:", error);
      toast.error(error.response?.data?.msg || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className={styles.loadingPage}>
        {" "}
        <div className={styles.spinner}></div> <h2>Loading assignment...</h2>{" "}
        <p> Please wait while we load the assignment details. </p>{" "}
      </div>
    );
  }
  if (!assignment) {
    return (
      <div className={styles.notFound}>
        {" "}
        <div className={styles.notFoundIcon}> 📝 </div>{" "}
        <h1>Assignment Not Found</h1>{" "}
        <p> This assignment doesn't exist or may have been removed. </p>{" "}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          {" "}
          ← Go Back{" "}
        </button>{" "}
      </div>
    );
  }
  const dueDate = new Date(assignment.dueDate);
  const isPastDue = dueDate.getTime() < Date.now();
  const formattedDueDate = dueDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const submittedDate = mySubmission?.submittedAt
    ? new Date(mySubmission.submittedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;
  return (
    <div className={styles.page}>
      {" "}
      {/* ================= TOP BAR ================= */}{" "}
      <div className={styles.topBar}>
        {" "}
        <div className={styles.topBarInner}>
          {" "}
          <Link to={`/course/${assignment.course}`} className={styles.backLink}>
            {" "}
            ← Back to Course{" "}
          </Link>{" "}
          <span className={styles.topLabel}> ASSIGNMENT </span>{" "}
        </div>{" "}
      </div>{" "}
      {/* ================= MAIN ================= */}{" "}
      <main className={styles.container}>
        {" "}
        {/* ================= HEADER ================= */}{" "}
        <section className={styles.headerCard}>
          {" "}
          <div className={styles.headerContent}>
            {" "}
            <div className={styles.iconBox}> 📝 </div>{" "}
            <div className={styles.headerInfo}>
              {" "}
              <span className={styles.eyebrow}> COURSE ASSIGNMENT </span>{" "}
              <h1>{assignment.title}</h1>{" "}
              <p>
                {" "}
                Complete the assignment and submit your work before the due
                date.{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className={styles.metaGrid}>
            {" "}
            <div className={styles.metaCard}>
              {" "}
              <span className={styles.metaIcon}> 📅 </span>{" "}
              <div>
                {" "}
                <small>Due Date</small>{" "}
                <strong className={isPastDue ? styles.overdue : ""}>
                  {" "}
                  {formattedDueDate}{" "}
                </strong>{" "}
                <span>
                  {" "}
                  {isPastDue ? "Deadline passed" : "Submission open"}{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <div className={styles.metaCard}>
              {" "}
              <span className={styles.metaIcon}> ⭐ </span>{" "}
              <div>
                {" "}
                <small>Total Marks</small>{" "}
                <strong> {assignment.totalMarks} </strong>{" "}
                <span>Available marks</span>{" "}
              </div>{" "}
            </div>{" "}
            <div className={styles.metaCard}>
              {" "}
              <span className={styles.metaIcon}> 📊 </span>{" "}
              <div>
                {" "}
                <small>Status</small>{" "}
                <strong> {mySubmission ? "Submitted" : "Pending"} </strong>{" "}
                <span>
                  {" "}
                  {mySubmission ? "Work received" : "Not submitted yet"}{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
        {/* ================= CONTENT GRID ================= */}{" "}
        <div className={styles.contentGrid}>
          {" "}
          {/* ================= LEFT ================= */}{" "}
          <div className={styles.leftColumn}>
            {" "}
            {/* Assignment instructions */}{" "}
            <section className={styles.card}>
              {" "}
              <div className={styles.cardHeader}>
                {" "}
                <div>
                  {" "}
                  <span className={styles.sectionLabel}>
                    {" "}
                    INSTRUCTIONS{" "}
                  </span>{" "}
                  <h2>Assignment Details</h2>{" "}
                </div>{" "}
              </div>{" "}
              <div className={styles.description}>
                {" "}
                {assignment.description}{" "}
              </div>{" "}
              {assignment.attachmentUrl && (
                <a
                  href={assignment.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.attachment}
                >
                  {" "}
                  <span className={styles.attachmentIcon}> 📎 </span>{" "}
                  <span>
                    {" "}
                    <strong> Assignment Attachment </strong>{" "}
                    <small> Open attached resource </small>{" "}
                  </span>{" "}
                  <span className={styles.arrow}> ↗ </span>{" "}
                </a>
              )}{" "}
            </section>{" "}
            {/* ================= SUBMISSION ================= */}{" "}
            <section className={styles.card}>
              {" "}
              <div className={styles.cardHeader}>
                {" "}
                <div>
                  {" "}
                  <span className={styles.sectionLabel}> YOUR WORK </span>{" "}
                  <h2>
                    {" "}
                    {mySubmission
                      ? "Your Submission"
                      : "Submit Assignment"}{" "}
                  </h2>{" "}
                </div>{" "}
                {mySubmission && (
                  <span
                    className={
                      mySubmission.status === "graded"
                        ? styles.gradedBadge
                        : styles.submittedBadge
                    }
                  >
                    {" "}
                    ✓{" "}
                    {mySubmission.status === "graded"
                      ? "Graded"
                      : "Submitted"}{" "}
                  </span>
                )}{" "}
              </div>{" "}
              {mySubmission ? (
                <div className={styles.submissionResult}>
                  {" "}
                  <div className={styles.successBox}>
                    {" "}
                    <div className={styles.successIcon}> ✓ </div>{" "}
                    <div>
                      {" "}
                      <strong> Assignment submitted </strong>{" "}
                      <p> Your submission was received successfully. </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className={styles.submissionDetails}>
                    {" "}
                    <div>
                      {" "}
                      <span> Submitted On </span>{" "}
                      <strong> {submittedDate} </strong>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <span>Status</span>{" "}
                      <strong>
                        {" "}
                        {mySubmission.status === "graded"
                          ? "Graded"
                          : "Under Review"}{" "}
                      </strong>{" "}
                    </div>{" "}
                  </div>{" "}
                  <a
                    href={mySubmission.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewSubmission}
                  >
                    {" "}
                    View Your Submission <span>↗</span>{" "}
                  </a>{" "}
                  {mySubmission.status === "graded" && (
                    <div className={styles.gradeBox}>
                      {" "}
                      <div>
                        {" "}
                        <span> YOUR SCORE </span>{" "}
                        <strong>
                          {" "}
                          {mySubmission.marks}{" "}
                          <small> / {assignment.totalMarks} </small>{" "}
                        </strong>{" "}
                      </div>{" "}
                      {mySubmission.feedback && (
                        <div className={styles.feedback}>
                          {" "}
                          <span> INSTRUCTOR FEEDBACK </span>{" "}
                          <p> {mySubmission.feedback} </p>{" "}
                        </div>
                      )}{" "}
                    </div>
                  )}{" "}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  {" "}
                  {/* Submission type */}{" "}
                  <div className={styles.modeSelector}>
                    {" "}
                    <button
                      type="button"
                      className={
                        mode === "file" ? styles.modeActive : styles.modeButton
                      }
                      onClick={() => setMode("file")}
                    >
                      {" "}
                      <span>📁</span>{" "}
                      <div>
                        {" "}
                        <strong> Upload File </strong>{" "}
                        <small> PDF, DOC, ZIP, etc. </small>{" "}
                      </div>{" "}
                    </button>{" "}
                    <button
                      type="button"
                      className={
                        mode === "link" ? styles.modeActive : styles.modeButton
                      }
                      onClick={() => setMode("link")}
                    >
                      {" "}
                      <span>🔗</span>{" "}
                      <div>
                        {" "}
                        <strong> Submit Link </strong>{" "}
                        <small> GitHub, Drive, etc. </small>{" "}
                      </div>{" "}
                    </button>{" "}
                  </div>{" "}
                  {/* File */}{" "}
                  {mode === "file" ? (
                    <div className={styles.uploadArea}>
                      {" "}
                      <input
                        id="assignmentFile"
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />{" "}
                      <label
                        htmlFor="assignmentFile"
                        className={styles.uploadLabel}
                      >
                        {" "}
                        <div className={styles.uploadIcon}>
                          {" "}
                          {file ? "✓" : "↑"}{" "}
                        </div>{" "}
                        <strong>
                          {" "}
                          {file
                            ? file.name
                            : "Choose your assignment file"}{" "}
                        </strong>{" "}
                        <span>
                          {" "}
                          {file
                            ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                            : "Click here to browse files"}{" "}
                        </span>{" "}
                      </label>{" "}
                    </div>
                  ) : (
                    <div className={styles.inputWrapper}>
                      {" "}
                      <label htmlFor="submissionLink">
                        {" "}
                        Submission Link{" "}
                      </label>{" "}
                      <div className={styles.textInput}>
                        {" "}
                        <span>🔗</span>{" "}
                        <input
                          id="submissionLink"
                          type="url"
                          placeholder="https://github.com/..."
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                        />{" "}
                      </div>{" "}
                      <small>
                        {" "}
                        Make sure your link is accessible to the
                        instructor.{" "}
                      </small>{" "}
                    </div>
                  )}{" "}
                  {/* Submit */}{" "}
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={submitting}
                  >
                    {" "}
                    {submitting ? (
                      <>
                        {" "}
                        <span className={styles.buttonSpinner}></span>{" "}
                        Submitting...{" "}
                      </>
                    ) : (
                      <>
                        {" "}
                        Submit Assignment <span>→</span>{" "}
                      </>
                    )}{" "}
                  </button>{" "}
                </form>
              )}{" "}
            </section>{" "}
          </div>{" "}
          {/* ================= RIGHT ================= */}{" "}
          <aside className={styles.rightColumn}>
            {" "}
            <div className={styles.sideCard}>
              {" "}
              <div className={styles.sideIcon}> ⏱ </div>{" "}
              <span className={styles.sectionLabel}> DEADLINE </span>{" "}
              <h3>
                {" "}
                {isPastDue
                  ? "Submission Deadline Passed"
                  : "Don't miss the deadline"}{" "}
              </h3>{" "}
              <p>
                {" "}
                {isPastDue
                  ? "The due date for this assignment has passed. Contact your instructor if you need assistance."
                  : `Your assignment is due on ${formattedDueDate}. Make sure your work is submitted before the deadline.`}{" "}
              </p>{" "}
            </div>{" "}
            <div className={styles.sideCard}>
              {" "}
              <div className={styles.sideIcon}> ✓ </div>{" "}
              <span className={styles.sectionLabel}> SUBMISSION TIPS </span>{" "}
              <ul className={styles.tips}>
                {" "}
                <li> Check your work before submitting. </li>{" "}
                <li> Make sure uploaded files open correctly. </li>{" "}
                <li>
                  {" "}
                  If using a link, verify that the instructor can access
                  it.{" "}
                </li>{" "}
                <li> Submit before the due date. </li>{" "}
              </ul>{" "}
            </div>{" "}
            <div className={styles.sideCard}>
              {" "}
              <span className={styles.sectionLabel}> GRADING </span>{" "}
              <div className={styles.gradingInfo}>
                {" "}
                <strong> {assignment.totalMarks} </strong>{" "}
                <span> Maximum marks </span>{" "}
              </div>{" "}
              <p>
                {" "}
                Your instructor will review your submission and provide marks
                and feedback.{" "}
              </p>{" "}
            </div>{" "}
          </aside>{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
};
export default SubmitAssignment;
