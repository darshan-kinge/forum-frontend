import {useState, useEffect} from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext';
import './Login.css'
import config from '../../../config/config.js';
import HelmetComponent from '../../../components/helmet/HelmetComponent.jsx';
import Loader from '../../../components/loader/Loader.jsx';

const Login = () => {
  
  const navigate = useNavigate();
  
  const { isAuthenticated, isLoading } = useAuth();
  
  const [user, setUser] = useState({
    email: "",
    password: "",
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) return <Loader />

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
      const response = await fetch(`${config.serverUrl}/api/${config.apiVersion}/auth/login`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(user),
      })

      const data = await response.json()

      if(response.ok) {
        storeTokenInLS(data.token)
        console.log(data.token);  
        setUser({
          email: "",
          password: "",
        })

        alert("Login Successful!");
        window.location.href = "/admin/dashboard"
      } else {
        alert(data.details);
      }

    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="login-container">

      <HelmetComponent
        pageName="Admin Login"
        description="Login to the admin dashboard of MIT-WPU Science and Spirituality Forum"
        keywords="MIT-WPU, Science and Spirituality Forum, SNSF, Science, Spirituality, Forum, MIT, WPU, Vishwanath Karad, Rahul Karad"
      />

      <h1 className='title'>Admin Login</h1>
      <form className='login-form' onSubmit={handleSubmit}>
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
        <button className='login-submit' type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login