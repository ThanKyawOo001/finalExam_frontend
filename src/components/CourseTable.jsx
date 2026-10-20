//src/components/CourseTable.jsx

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useNavigate } from "react-router-dom";
import StatusChip from "./StatusChip";
import { formatPrice } from "../lib/format";

export default function CourseTable({ courses, showTeacher, emptyText, isLoading }) {
  const navigate = useNavigate();

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Course Name</TableCell>
            {showTeacher && <TableCell>Teacher</TableCell>}
            <TableCell>Topics</TableCell>
            <TableCell align="right">Duration (days)</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Students</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {courses.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                {isLoading ? "Loading..." : emptyText || "No courses found"}
              </TableCell>
            </TableRow>
          )}
          {courses.map((course) => (
            <TableRow
              key={course._id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => navigate(`/courses/${course._id}`)}
            >
              <TableCell sx={{ fontWeight: 500 }}>{course.name}</TableCell>
              {showTeacher && <TableCell>{course.teacherName}</TableCell>}
              <TableCell>{course.topics.join(", ")}</TableCell>
              <TableCell align="right">{course.duration}</TableCell>
              <TableCell align="right">{formatPrice(course.price)}</TableCell>
              <TableCell align="right">
                {course.enrolledCount} / {course.maxStudent}
              </TableCell>
              <TableCell>
                <StatusChip status={course.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
