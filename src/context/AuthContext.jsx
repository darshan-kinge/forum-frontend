import { useEffect, useState } from "react";
import { createContext, useContext } from "react";
import config from "../config/config.js";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const AuthorizationToken = `Bearer ${token}`

    const storeTokenInLS = (serverToken) => {
        setToken(serverToken);
        return localStorage.setItem("token", serverToken);
    };

    const LogoutUser = () => {
        setToken("");
        localStorage.removeItem("token");
    }
    const userAuthentication = async() => {
        try {
            setIsLoading(true)
            const response = await fetch(`${config.serverUrl}/api/v1/auth/user`, {
                method: "GET",
                headers: {
                    Authorization: AuthorizationToken,
                }
            })
            
            if(response.ok) {
                const data = await response.json();
                console.log(data);
                
                setUser(data.userData)

                const isAuthenticated = data.userData.isAdmin;
                setIsAuthenticated(isAuthenticated);

                setIsLoading(false)
            } else {
                console.log('Error fetching user data');
                setIsLoading(false);
            }

        } catch (error) {
            console.log("Error fetching the user data");
        }
    }

    useEffect(() => {
        userAuthentication();
    }, [])

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