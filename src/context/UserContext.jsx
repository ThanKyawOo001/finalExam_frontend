//src/context/UseContext.jsx

import { createContext, useEffect, useRef, useState } from "react";

// Strip trailing slashes so "https://x.app/" and "https://x.app" both work
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const TOKEN_KEY = "token";

export const UserContext = createContext();

// The login cookie is the main session. The token copy is only sent as a
// Bearer header for browsers that block cross-site cookies.
function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable, the cookie still works
  }
}

export function UserProvider({ children }) {
  const isInit = useRef(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loginErrorMsg, setLoginErrorMsg] = useState("");

  function clearUser() {
    setStoredToken(null);
    setUser(null);
    setIsLoggedIn(false);
  }

  // Every call to the backend goes through here so the cookie is always sent
  // and an expired session sends the user back to the login page.
  async function apiFetch(path, options = {}) {
    const init = {
      ...options,
      credentials: "include",
      headers: { ...(options.headers || {}) },
    };
    const token = getStoredToken();
    if (token) {
      init.headers["Authorization"] = `Bearer ${token}`;
    }
    if (options.body !== undefined && typeof options.body !== "string") {
      init.body = JSON.stringify(options.body);
      init.headers["Content-Type"] = "application/json";
    }
    try {
      const result = await fetch(`${API_URL}${path}`, init);
      let data = {};
      try {
        data = await result.json();
      } catch {
        data = {};
      }
      if (result.status === 401) {
        clearUser();
      }
      return { ok: result.ok, status: result.status, data };
    } catch (error) {
      console.log("==>apiFetch() Exception", error);
      return {
        ok: false,
        status: 0,
        data: { message: "Unable to reach the server" },
      };
    }
  }

  async function me() {
    const result = await apiFetch("/api/user");
    if (result.ok) {
      setUser(result.data.user);
      setIsLoggedIn(true);
    } else {
      clearUser();
    }
    setIsInitializing(false);
    return result.ok;
  }

  useEffect(() => {
    if (isInit.current) return;
    isInit.current = true;
    me();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    setLoginErrorMsg("");
    const result = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (result.ok) {
      setStoredToken(result.data.token);
      const ok = await me();
      if (!ok) {
        setLoginErrorMsg("Logged in, but the session could not be loaded");
      }
      return ok;
    }
    setLoginErrorMsg(result.data.message || "Login failed");
    clearUser();
    return false;
  };

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    clearUser();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        isInitializing,
        loginErrorMsg,
        login,
        logout,
        apiFetch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
