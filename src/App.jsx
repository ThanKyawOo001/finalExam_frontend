//src/App.jsx

import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireRole from "./components/RequireRole";
import LoginPage from "./pages/Login";
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import CourseForm from "./pages/CourseForm";
import MyCourses from "./pages/MyCourses";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/courses" replace />} />
          <Route path="courses" element={<CourseList />} />
          <Route
            path="courses/new"
            element={
              <RequireRole role="Teacher">
                <CourseForm />
              </RequireRole>
            }
          />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          <Route
            path="courses/:courseId/edit"
            element={
              <RequireRole role="Teacher">
                <CourseForm />
              </RequireRole>
            }
          />
          <Route
            path="my-courses"
            element={
              <RequireRole role="Student">
                <MyCourses />
              </RequireRole>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
