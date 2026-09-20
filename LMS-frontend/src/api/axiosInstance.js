import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: "http://localhost:5003/api"
})

// प्रत्येक request पाठवण्याआधी हे automatically चालतं
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default axiosInstance;