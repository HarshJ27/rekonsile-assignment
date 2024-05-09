import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, adminSetusername] = useState("");
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError(null);
    // Perform login logic here
    try {
        const response = await axios.post("http://localhost:3000/auth/login", {
            name:username,
            password:password
        });

        if (response.status === 201) {
            console.log(response.data)
            const token = response.data.accessToken;
            const refreshToken = response.data.refreshToken
            // Store the token in local storage
            console.log(token);
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken)
            console.log("Logged in successfully as Admin");
            navigate("/admin");
        } else {
            console.log("Login failed");
            setError("Login Details Are Wrong!!");
            // Handle login error
        }
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                console.log("Invalid phone number");
                setError("Login Details Are Wrong!!");
            } else {
                console.error("Error logging in:", status);
                setError("Login Details Are Wrong!!");
            }
        }
    }
};
  return (
    <>
            <section class="relative mt-10 md:-mt-12">
                {/* {loading && (
                    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
                        <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
                    </div>
                )} */}
                <div class="flex flex-col items-center justify-center mt-16 lg:py-0 ">
                    <div class="md:w-full sm:w-1/2 bg-white rounded-lg shadow border-t-4 border-orange-400 md:mt-0 sm:max-w-md xl:p-0">
                        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <div className='flex justify-between items-center'>
                                <h1 class="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                  Login Form
                                </h1>
                                {/* <img src={logo} alt="" className='w-24' /> */}

                            </div>

                            <form class="space-y-4 md:space-y-6" onSubmit={handleAdminLogin}>

                                <div>
                                    <input type="text" name="name" id="name" value={username} onChange={(e) => adminSetusername(e.target.value)} placeholder="Enter unique Name" class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5" required="" />
                                </div>

                                <div>
                                    <input type={showPassword ? "text" : "password"} name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" class="bg-gray-50 border border-gray-900 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5" required="" />
                                </div>


                                <div class="flex items-center mt-2">
                                    <input type="checkbox" class="mr-2" onChange={() => setShowPassword(!showPassword)} />
                                    <label class="text-sm font-medium text-gray-900 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>Show Password</label>
                                </div>
                                <div className='w-full'>
                                    <button className='bg-orange-400 text-white w-full p-2 rounded-md'>Login</button>
                                </div>

                                <p class="text-center flex items-center justify-center text-sm font-medium text-primary-600 hover:underline">Don't have an account? <Link to={'/'} className='underline ml-1'>  Sign in</Link></p>

                            </form>
                            {/* {popupMessage && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

                                    <div className="bg-white p-4 rounded-lg shadow-md">
                                        <svg class="h-6 w-6 text-red-500 float-right -mt-2 cursor-pointer" onClick={() => setPopupMessage(null)} width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="18" y1="6" x2="6" y2="18" />  <line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        <p className="text-lg font-bold mt-4 text-green-700">{popupMessage}</p>
                                    </div>
                                </div>
                            )} */}
                        </div>
                    </div>
                    {error && (
                                    <div className="flex items-center justify-center bg-red-300 p-4 rounded-md">
                                        <p className="text-center text-sm text-red-500">{error}</p>
                                    </div>
                                )}
                </div>
            </section>
    </>
  )
}

export default Login