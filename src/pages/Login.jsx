//src/pages/Login.jsx

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useContext, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function LoginPage() {
  const email = useRef(null);
  const password = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, isLoggedIn, isInitializing, loginErrorMsg } =
    useContext(UserContext);

  if (!isInitializing && isLoggedIn) {
    return <Navigate to="/courses" replace />;
  }

  const onLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const ok = await login(email.current.value, password.current.value);
    setIsSubmitting(false);
    if (ok) navigate("/courses");
  };

  return (
    <div className="flex h-dvh justify-center items-center bg-slate-50 px-4">
      <Card sx={{ width: "100%", maxWidth: 380 }}>
        <CardContent>
          <form onSubmit={onLogin}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Online Course Service
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sign in with your username or email
            </Typography>
            <TextField
              fullWidth
              required
              sx={{ mb: 2 }}
              id="email"
              label="Username or Email"
              inputRef={email}
              autoComplete="username"
            />
            <TextField
              fullWidth
              required
              sx={{ mb: 2 }}
              type="password"
              id="password"
              label="Password"
              inputRef={password}
              autoComplete="current-password"
            />
            {loginErrorMsg && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginErrorMsg}
              </Alert>
            )}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
