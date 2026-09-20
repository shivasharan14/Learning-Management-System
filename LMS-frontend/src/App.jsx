import { useState } from 'react'

import './App.css'
import Navbar from './components/Navbar'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Home from './pages/Home/Home'
import CourseDetails from './pages/Home/CourseDetails'

 import InstructorDashboard from './pages/InstructorDashboard'

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "./redux/authSlice";
import axiosInstance from "./api/axiosInstance";
import PrivateRoute from './components/PrivateRoute'
import Enrollment from './pages/Enrollment'
import CreateCourse from './pages/Instructor/CreateCourse'
import AddLecture from './pages/Instructor/AddLecture'
import EnrolledStudents from './pages/Instructor/EnrolledStudents'
import AssignmentSubmissions from './pages/Instructor/AssignmentSubmissions'
import CourseAssignments from './pages/Instructor/CourseAssignments'
import CreateAssignment from './pages/Instructor/CreateAssignment'
import CreateQuiz from './pages/Instructor/CreateQuiz'
import CourseQuizzes from './pages/Instructor/CourseQuizzes'
import SubmitAssignment from './pages/student/SubmitAssignment'
import AttemptQuiz from './pages/student/AttemptQuiz'
import QuizResults from './pages/Instructor/QuizResults'
import MyProgress from './pages/student/MyProgress'
import MyCertificates from './pages/student/MyCertificates'
import EditCourse from './pages/Instructor/EditCourse'
import InstructorOverview from './pages/Instructor/InstructorOverview'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCourses from './pages/admin/AdminCourses'
import AdminUsers from './pages/admin/AdminUsers'
import VerifyCertificate from './pages/student/VerifyCertificate'
import CertificateView from './pages/student/CertificateView'


function App() {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);   // 👈 नवीन

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axiosInstance
        .get("/auth/getMe")
        .then((response) => {
          dispatch(login({ user: response.data.user, token }));
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setAuthChecked(true);   // 👈 यश/अपयश काहीही असो, "तपासणी पूर्ण झाली"
        });
    } else {
      setAuthChecked(true);   // 👈 token च नसेल तर लगेच "तपासणी पूर्ण झाली" (तपासायचं काही नाहीच)
    }
  }, [dispatch]);

  if (!authChecked) {
    return <h1>Loading...</h1>;   // 👈 तपासणी पूर्ण होईपर्यंत काहीच दाखवू नका
  }

  return (
    <BrowserRouter>
    <Navbar/>
    <Routes>
    <Route path='courses/:id' element={<PrivateRoute>
      <CourseDetails/>
    </PrivateRoute>}></Route>
    <Route path='/' element={
      <Home/>
    }></Route>
    <Route path='/my-enrollments' element={<PrivateRoute allowedRoles={["student"]}>
      <Enrollment></Enrollment>
    </PrivateRoute>}></Route>
   

<Route 
  path='/instructor/dashboard' 
  element={
    <PrivateRoute allowedRoles={["instructor"]}>
      <InstructorDashboard/>
    </PrivateRoute>
  } 
/>
<Route 
  path='/instructor/create-course' 
  element={
    <PrivateRoute allowedRoles={["instructor"]}>
      <CreateCourse/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/instructor/course/:courseId/students' 
  element={
    <PrivateRoute allowedRoles={["instructor"]}>
      <EnrolledStudents/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/instructor/add-lecture' 
  element={
    <PrivateRoute allowedRoles={["instructor"]}>
      <AddLecture/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/instructor/course/:courseId/assignments' 
  element={
    <PrivateRoute allowedRoles={["instructor"]}>
      <CourseAssignments/>
    </PrivateRoute>
  } 
/>
<Route 
  path='/instructor/assignment/:assignmentId/submissions' 
  element={
    <PrivateRoute allowedRoles={["instructor"]}>
      <AssignmentSubmissions/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/instructor/create-assignment' 
  element={
    <PrivateRoute allowedRoles={["instructor"]}>
      <CreateAssignment/>
    </PrivateRoute>
  } 
/>


<Route 
  path='/instructor/create-quiz' 
  element={
    <PrivateRoute allowedRoles={["instructor"]}>
      <CreateQuiz/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/instructor/course/:courseId/quizzes' 
  element={
    <PrivateRoute allowedRoles={["instructor"]}>
      <CourseQuizzes/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/assignment/:assignmentId/submit' 
  element={
    <PrivateRoute allowedRoles={["student"]}>
      <SubmitAssignment/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/quiz/:quizId/attempt' 
  element={
    <PrivateRoute allowedRoles={["student"]}>
      <AttemptQuiz/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/instructor/quiz/:quizId/results' 
  element={
    <PrivateRoute allowedRoles={["instructor"]}>
      <QuizResults/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/my-progress' 
  element={
    <PrivateRoute allowedRoles={["student"]}>
      <MyProgress/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/my-certificates' 
  element={
    <PrivateRoute allowedRoles={["student"]}>
      <MyCertificates/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/instructor/course/:courseId/edit' 
  element={
    <PrivateRoute allowedRoles={["instructor"]}>
      <EditCourse/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/instructor/overview' 
  element={
    <PrivateRoute allowedRoles={["instructor"]}>
      <InstructorOverview/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/admin/dashboard' 
  element={
    <PrivateRoute allowedRoles={["admin"]}>
      <AdminDashboard/>
    </PrivateRoute>
  } 
/>

<Route 
  path='/admin/users' 
  element={
    <PrivateRoute allowedRoles={["admin"]}>
      <AdminUsers/>
    </PrivateRoute>
  } 
/>

<Route
  path="/admin/courses"
  element={
    <PrivateRoute allowedRoles={["admin"]}>
      <AdminCourses/>
    </PrivateRoute>
  }
/>

<Route
  path="/certificates/:certificateId"
  element={<CertificateView />}
/>

<Route
  path="/verify-certificate"
  element={<VerifyCertificate />}
/>

<Route
  path="/assignments/:assignmentId/submissions"
  element={
    <PrivateRoute allowedRoles={["instructor"]}>
      <AssignmentSubmissions/>
    </PrivateRoute>
  }
/>

    <Route path='/login' element={<Login/>}></Route>
    <Route path="/register" element={<Register/>}>  </Route>

    </Routes>
    </BrowserRouter>
    
  )
}

export default App
