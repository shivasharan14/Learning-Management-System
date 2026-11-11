
import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: "https://learning-management-system-backend-xehh.onrender.com/api"
})

// प्रत्येक request पाठवण्याआधी token automatically पाठवतो
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

export default axiosInstance;
