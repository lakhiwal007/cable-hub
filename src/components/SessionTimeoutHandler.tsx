import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/apiClient";

const SessionTimeoutHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      if (apiClient.isAuthenticated() && apiClient.isSessionExpired()) {
        apiClient.logout().finally(() => {
          navigate("/login");
        });
      }
    }, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, [navigate]);

  return null;
};

export default SessionTimeoutHandler; 