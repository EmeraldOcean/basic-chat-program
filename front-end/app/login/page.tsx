"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import AuthForm from "./AuthForm";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    email: "",
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleMode = () => {
    setIsSignup((prev) => !prev);
    setError(null);
    setSignupSuccess(false);
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignup) {
        // 회원가입
        await signup(formData);
        setSignupSuccess(true);
        setLoading(false);
        
        // 로그인 페이지로 이동
        setIsSignup(false);
        setFormData({
          userId: "",
          password: "",
          email: "",
          name: "",
        });

        return;
      } else {
        // 로그인
        await login({
          userId: formData.userId,
          password: formData.password,
        });
        
        // 사용자 정보를 미리 로드
        try {
          await refreshUser();
        } catch (refreshError) {
          throw new Error("사용자 정보를 불러올 수 없습니다. 다시 시도해주세요.");
        }
        
        // 채팅방으로 이동
        router.push("/");
      }
    } catch (err) {
      let errorMessage = "오류가 발생했습니다.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // 여러 줄 메시지인 경우 첫 줄만 표시
        if (errorMessage.includes("\n")) {
          errorMessage = errorMessage.split("\n")[0];
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
    isSignup={isSignup}
    formData={formData}
    loading={loading}
    error={error}
    signupSuccess={signupSuccess}
    onSubmit={handleSubmit}
    onChange={handleChange}
    onToggleMode={handleToggleMode}
    />
  );
}
