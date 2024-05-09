import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJwt } from 'react-jwt'
import axios from "axios";

const Admin = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
    return;
  }

  // useEffect(() => {
  //   const token = localStorage.getItem("token");

  //   if (!token) {

  //     navigate("/login");
  //   } else {
  //     const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds

  //     if (tokenExpiration && tokenExpiration < Date.now()) {
  //       // Token expired, remove from local storage and redirect to login page
  //       localStorage.removeItem("token");
  //       navigate("/login");
  //     }
  //   }
  // }, [decodedToken])

  useEffect(() => {
    const checkTokenValidity = () => {
      if (!token) {
        navigate("/login");
        return;
      }

      const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds

      if (tokenExpiration && tokenExpiration < Date.now() + (60 * 15 * 1000)) {

        refreshToken();
      }
    };

    const refreshToken = async () => {
      try {
        // Call your API to refresh the token using Axios
        const response = await axios.post('https://rekonsile-assignment-backend.onrender.com/auth/refresh', {
          refreshToken: localStorage.getItem('refreshToken') // Assuming you have a refreshToken stored
        });

        if (response.status === 201) {
          // Refresh token successfully, update localStorage with new token
          localStorage.setItem('token', response.data.accessToken);
          // localStorage.setItem('refreshToken', response.data.refreshToken);
        } else {
          // Handle refresh token failure
          throw new Error('Failed to refresh token');
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        // Redirect to login page
        navigate("/login");
      }
    };

    const myInfo = async () => {
      try {
        const response = await axios.get('https://rekonsile-assignment-backend.onrender.com/auth/admin', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if(response.status === 201) {
          const mainInfo = response.data;
          console.log("Details", mainInfo.user.name)
          setUserDetails(mainInfo.user.name);
        }
      } catch(error) {
        console.log(error);
      }
    }

    myInfo();
    checkTokenValidity();
  }, [decodedToken, navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    console.log("Logging out");
};
  return (
    <div className="flex justify-center items-center h-[100vh]">
      <div className="text-gray-700 text-5xl">Welcome Admin {userDetails}...</div>
      <button className="px-5 py-3 bg-gray-300 hover:bg-gray-500 rounded-md" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Admin;
