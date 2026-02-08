const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100";

export interface CreateUserDto {
  userId: string;
  password: string;
  email: string;
  name: string;
}

export interface LoginUserDto {
  userId: string;
  password: string;
}

export interface LoginResponseDto {
  userSeqId: number;
  accessToken: string;
  refreshToken: string;
}

export interface UserResponseDto {
  seqId: number;
  userId: string;
  email: string;
  name: string;
  createDate: Date;
}

// 토큰 저장
export function setAccessToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
}

// 토큰 가져오기
export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
}

// 토큰 제거
export function removeAccessToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
  }
}

// API 요청 헬퍼
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;

  try {
    const fetchOptions = {
      ...options,
      headers,
      credentials: "include" as RequestCredentials, // 쿠키 포함
    };
    
    const response = await fetch(url, fetchOptions);

    // 401 Unauthorized 에러 발생 시 토큰 재발급 시도
    if (response.status === 401 && retryCount === 0) {
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // 새 토큰으로 원래 요청 재시도
        headers["Authorization"] = `Bearer ${newToken}`;
        return apiRequest<T>(endpoint, { ...options, headers }, 1);
      } else {
        // 토큰 재발급 실패 시 로그아웃 처리
        removeAccessToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("토큰이 만료되었습니다. 다시 로그인해주세요.");
      }
    }

    if (!response.ok) {
      let errorText = "";
      try {
        errorText = await response.text();
        // JSON 응답인 경우 파싱 시도
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorText = errorJson.message;
          } else if (Array.isArray(errorJson.message)) {
            errorText = errorJson.message.join(", ");
          }
        } catch {
          // JSON이 아니면 텍스트 그대로 사용
        }
      } catch (e) {
        errorText = `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    // 응답이 비어있을 수 있음
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data;
    }
    const text = await response.text();
    return text as unknown as T;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `백엔드 서버에 연결할 수 없습니다.\n` +
        `서버가 실행 중인지 확인하세요: ${API_BASE}\n` +
        `오류: ${error.message}`
      );
    }
    throw error;
  }
}

// 회원가입
export async function signup(data: CreateUserDto): Promise<UserResponseDto> {
  return apiRequest<UserResponseDto>("/user/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 로그인
export async function login(data: LoginUserDto): Promise<LoginResponseDto> {
  const url = `${API_BASE}/user/login`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorText = "";
      try {
        errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorText = errorJson.message;
          } else if (Array.isArray(errorJson.message)) {
            errorText = errorJson.message.join(", ");
          }
        } catch {
          // JSON이 아니면 텍스트 그대로 사용
        }
      } catch (e) {
        errorText = `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Authorization 헤더에서 토큰 추출
    const authHeader = response.headers.get("Authorization");
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      setAccessToken(token);
      result.accessToken = token;
    } else {
      // 응답 본문에 토큰이 있는지 확인
      if (result.accessToken) {
        setAccessToken(result.accessToken);
      }
    }

    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `백엔드 서버에 연결할 수 없습니다.\n` +
        `서버가 실행 중인지 확인하세요: ${API_BASE}\n` +
        `오류: ${error.message}`
      );
    }
    throw error;
  }
}

// 로그아웃
export async function logout(): Promise<void> {
  await apiRequest("/user/logout", {
    method: "POST",
  });
  removeAccessToken();
}

// Access Token 재발급
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/user/update-token`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 쿠키에서 refreshToken 읽기
    });

    if (!response.ok) {
      return null;
    }

    // Authorization 헤더에서 새 토큰 추출
    const authHeader = response.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      setAccessToken(token);
      return token;
    }

    return null;
  } catch (error) {
    return null;
  }
}

// 사용자 정보 가져오기
export async function getUserInfo(): Promise<UserResponseDto> {
  return apiRequest<UserResponseDto>("/user/info");
}

// 사용자 목록 가져오기
export async function getUsers(): Promise<UserResponseDto[]> {
  return apiRequest<UserResponseDto[]>("/user", {
    method: "GET",
  });
}
