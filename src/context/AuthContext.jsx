import { useEffect, useState } from "react";
import { createContext, useContext } from "react";
import api from "../utils/api.js";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const AuthorizationToken = `Bearer ${token}`

    const storeTokenInLS = (serverToken) => {
        setToken(serverToken);
        // console.log(serverToken);
        return localStorage.setItem("token", serverToken);
    };

    const LogoutUser = () => {
        setToken("");
        localStorage.removeItem("token");
    }
    const userAuthentication = async() => {
        try {
            setIsLoading(true)
            const response = await api.get('/auth/user');
            const data = response.data;
            
            setUser(data.userData)

            const isAuthenticated = data.userData.isAdmin;
            setIsAuthenticated(isAuthenticated);

            setIsLoading(false)
        } catch (error) {
            console.log("Error fetching the user data:", error);
            setIsLoading(false);
            setIsAuthenticated(false);
        }
    }

    useEffect(() => {
        if (token) {
            userAuthentication();
        } else {
            setIsLoading(false);
            setIsAuthenticated(false);
        }
    }, [token])

    return (
        <AuthContext.Provider value={{ isAuthenticated, storeTokenInLS, LogoutUser, user, isLoading, AuthorizationToken }}>
            {children}
        </AuthContext.Provider>
    )

}

export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
      throw new Error("useAuth used outside of the Provider");
    }
    return authContextValue;
};