import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    // Enhanced auth check with loading state
    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setAuthChecked(true);
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/user/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Auth verification error:', error);
                localStorage.removeItem('token');
            } finally {
                setAuthChecked(true);
            }
        };

        verifyAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                return errorData.message || 'Login failed';
            }

            const { token } = await response.json();
            localStorage.setItem('token', token);
            
            // Immediately fetch user data after login
            const userResponse = await fetch(`${BACKEND_URL}/user/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                setUser(userData.user);
                navigate("/profile");
                return null;
            }
            return 'Failed to fetch user data after login';
        } catch (error) {
            console.error('Login error:', error);
            return 'Network error occurred';
        }
    };

    const register = async ({ username, firstname, lastname, password }) => {
        try {
            const response = await fetch(`${BACKEND_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, firstname, lastname, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                return errorData.message || 'Registration failed';
            }

            navigate("/success");
            return null;
        } catch (error) {
            console.error('Registration error:', error);
            return 'Network error occurred';
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate("/");
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            authChecked,
            login, 
            logout, 
            register 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};