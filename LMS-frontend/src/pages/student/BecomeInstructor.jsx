
import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import styles from "./BecomeInstructor.module.css";

const BecomeInstructor = () => {
  // Form मधील values सांभाळण्यासाठी
  const [formData, setFormData] = useState({
    subject: "",
    experience: "",
    reason: "",
  });

  // Submit होत असताना Button disable करण्यासाठी
  const [loading, setLoading] = useState(false);

  // Request successfully submit झाली का?
  const [submitted, setSubmitted] = useState(false);

  // Input मधील बदल handle करणे
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Form submit करणे
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/role-requests",
        formData
      );

      console.log(response.data);

      setSubmitted(true);

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.msg ||
        "Failed to submit instructor request"
      );

    } finally {
      setLoading(false);
    }
  };

  // Request submit झाली असेल तर Success Message
  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <h1>Request Submitted Successfully!</h1>

          <p>
            Your instructor request has been sent to the admin.
            Please wait for approval.
          </p>

          <span>Request Status: Pending</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      <div className={styles.formCard}>

        <h1>Become an Instructor</h1>

        <p>
          Share your knowledge and help students learn new skills.
        </p>

        <form onSubmit={handleSubmit}>

          {/* Subject */}
          <div className={styles.formGroup}>
            <label>What subject do you want to teach?</label>

            <input
              type="text"
              name="subject"
              placeholder="Example: MERN Stack"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          {/* Experience */}
          <div className={styles.formGroup}>
            <label>Your Experience</label>

            <input
              type="text"
              name="experience"
              placeholder="Example: 1 year"
              value={formData.experience}
              onChange={handleChange}
            />
          </div>

          {/* Reason */}
          <div className={styles.formGroup}>
            <label>Why do you want to become an instructor?</label>

            <textarea
              name="reason"
              placeholder="Tell us about your teaching interest..."
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default BecomeInstructor;
