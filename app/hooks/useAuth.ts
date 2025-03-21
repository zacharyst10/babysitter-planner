"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: "parent" | "babysitter" | "admin";
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching user data
    // In a real application, this would make a request to your auth API
    const checkAuth = async () => {
      try {
        // Mock authentication check
        // Replace this with your actual auth check logic
        const loggedIn = localStorage.getItem("isLoggedIn") === "true";

        if (loggedIn) {
          // Mock user data
          const userData = localStorage.getItem("userData");
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email?: string) => {
    setIsLoading(true);
    try {
      // Mock sign in - replace with actual API call
      // For demo purposes, we'll just create a mock user if no credentials are provided
      const mockUser = {
        id: 1,
        name: "Demo User",
        email: email || "user@example.com",
        role: "parent" as const,
      };

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userData", JSON.stringify(mockUser));
      setUser(mockUser);

      // Just go to the main user page
      router.push("/");
      return { success: true };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "Authentication failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userData");
    setUser(null);
    router.push("/");
  };

  return {
    user,
    isLoading,
    signIn,
    signOut,
  };
}
