import {useState} from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext';
import './Login.css'

const Login = () => {
  
  const navigate = useNavigate();
  
  const { isAuthenticated, isLoading } = useAuth();
  
  const [user, setUser] = useState({
    email: "",
    password: "",
  })


  if (isLoading) {
      return <h1>Loading...</h1>;
  }

  // if (isAuthenticated) {
  //   return <Navigate to="/admin/dashboard" />;
  // }


  const { storeTokenInLS } = useAuth();

  const handleInput = (e) => {
    console.log(e);
    let name = e.target.name;
    let value = e.target.value;

    setUser({
      ...user,
      [name]: value,
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(user),
      })

      const data = await response.json()

      if(response.ok) {
        storeTokenInLS(data.token)

        setUser({
          email: "",
          password: "",
        })

        alert("Login Successful!");
        navigate("/admin/dashboard")
      } else {
        console.log(data.error)
      }

    } catch (error) {
      console.log(error);
      
    }
  }

  return (
    <>
        <h1 className='title'>Admin Login</h1>
        <form className='login-form' onSubmit={handleSubmit}>
          {/* <div> */}
            <label className='login-label' htmlFor="email">Email</label>
            <input
              className='login-input'
              type="email" 
              id="email" 
              name="email" 
              required
              autoComplete='off'
              onChange={handleInput}  
              
            />
          {/* </div> */}
          {/* <div> */}
            <label className='login-label' htmlFor="password">Password</label>
            <input 
              className='login-input'
              type="password" 
              id="password" 
              name="password"
              autoComplete='off'
              onChange={handleInput}
              required  
            />
          {/* </div> */}
          <button className='login-submit' type="submit">Login</button>
        </form>
    </>
  )
}

export default Login