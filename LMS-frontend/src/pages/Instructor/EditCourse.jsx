
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'
import styles from './EditCourse.module.css'

const EditCourse = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState([])

  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState("")
  const [existingThumbnail, setExistingThumbnail] = useState("")

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch course and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryResponse, courseResponse] = await Promise.all([
          axiosInstance.get('/categories'),
          axiosInstance.get(`/courses/${courseId}`)
        ])

        setCategories(categoryResponse.data.categories || [])

        const course = courseResponse.data.course

        setTitle(course.title || "")
        setDescription(course.description || "")
        setPrice(course.price ?? "")
        setCategory(course.category?._id || course.category || "")

        setExistingThumbnail(course.thumbnail || "")
      } catch (error) {
        console.log(error)
        toast.error("Failed to load course details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId])

  // Preview URL cleanup
  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview)
      }
    }
  }, [thumbnailPreview])

  // Handle image selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP and GIF images are allowed")
      e.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      e.target.value = ""
      return
    }

    setThumbnail(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  // Remove newly selected image
  const handleRemoveThumbnail = () => {
    setThumbnail(null)
    setThumbnailPreview("")
  }

  // Update course
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !description.trim() || !category || price === "") {
      toast.error("Please fill all required fields")
      return
    }

    if (Number(price) < 0) {
      toast.error("Price cannot be negative")
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()

      formData.append("title", title)
      formData.append("description", description)
      formData.append("price", Number(price))
      formData.append("category", category)

      // Add image only when a new image is selected
      if (thumbnail) {
        formData.append("thumbnail", thumbnail)
      }

      await axiosInstance.put(
        `/courses/${courseId}`,
        formData
      )

      toast.success("Course updated successfully!")
      navigate('/instructor/dashboard')
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.msg || "Update failed")
    } finally {
      setSubmitting(false)
    }
  }

if (loading) {
  return (
    <div className={styles.loadingPage}>
      Loading course details...
    </div>
  )
}

return (
  <div className={styles.editPage}>
    <div className={styles.editContainer}>

      <div className={styles.editHeader}>
        <h1>Edit Course</h1>
        <p>Update your course details and thumbnail image.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.editForm}>

        <div className={styles.formGroup}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter course title"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter course description"
            rows="5"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Price (₹)</label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter course price"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">-- निवडा --</option>

            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Course Thumbnail */}

        <div className={styles.thumbnailSection}>
          <label className={styles.thumbnailLabel}>
            Course Thumbnail
          </label>

          <div className={styles.uploadArea}>
            <span className={styles.uploadIcon}>📸</span>

            <strong>Choose Course Thumbnail</strong>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleThumbnailChange}
              className={styles.fileInput}
            />

            <small>JPG, PNG, WEBP or GIF (Maximum 5MB)</small>
          </div>

          {(thumbnailPreview || existingThumbnail) && (
            <div className={styles.thumbnailPreviewSection}>
              <p>
                {thumbnailPreview
                  ? "New Thumbnail Preview"
                  : "Current Thumbnail"}
              </p>

              <img
                src={thumbnailPreview || existingThumbnail}
                alt="Course Thumbnail"
                className={styles.thumbnailPreview}
              />
            </div>
          )}

          {thumbnailPreview && (
            <button
              type="button"
              onClick={handleRemoveThumbnail}
              className={styles.removeImageButton}
            >
              Remove New Image
            </button>
          )}
        </div>

        {/* Buttons */}

        <div className={styles.formActions}>
          <button
            type="submit"
            disabled={submitting}
            className={styles.updateButton}
          >
            {submitting ? "Updating..." : "Update Course"}
          </button>

          <button
            type="button"
            onClick={() => navigate('/instructor/dashboard')}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  </div>
)

}

export default EditCourse
