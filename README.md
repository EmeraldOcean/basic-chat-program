# 💬 Basic Chat Program

Next.js(Frontend)와 Nest.js(Backend)를 결합하여 구현한 실시간 채팅 애플리케이션입니다.

---

## 🚀 Service Architecture & Flow

백엔드와 프론트엔드 간의 데이터 흐름 및 통신 방식입니다.

```mermaid
graph LR
    subgraph "Frontend (Next.js)"
        A[Login/Sign-up Page] --> B[Chat Interface]
    end

    subgraph "Backend (Nest.js)"
        C[Auth Service]
        D[Chat Gateway / Socket.io]
    end

    A -- "1. REST API (HTTP)" --> C
    C -- "2. JWT Token" --> A
    B -- "3. Web Socket (Bi-directional)" --> D
    D -- "4. Real-time Message" --> B

---

✨ Features
현재 구현된 기능 및 향후 계획입니다.
- 회원가입 (Sign-up): 새로운 사용자 계정을 생성합니다.
- 로그인 (Login): JWT 기반 인증을 통해 서비스에 접속합니다.
- 실시간 채팅 (Chatting): Socket.io를 이용해 실시간으로 메시지를 주고받습니다.  
⚠️ Note: 현재 백엔드에는 메시지 히스토리 저장 및 유저 상세 관리 기능이 더 많이 구현되어 있으나, 프론트엔드 연동은 진행 중입니다. 추후 프론트엔드 업데이트를 통해 추가 기능을 공개할 예정입니다.

---

📸 Screenshots
로그인 페이지	회원가입 페이지	채팅창 화면
<img src="https://github.com/user-attachments/assets/93423cd9-cf2d-4336-b411-1fec48e43e13" width="250"/>	<img src="https://github.com/user-attachments/assets/4c4b0a3b-f6ed-4974-86d2-5cd46549a5b0" width="250"/>	<img src="https://github.com/user-attachments/assets/0e69357e-82e1-497d-a085-4e1188e74325" width="250"/>

---

🛠 Tech Stack
- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Nest.js, Socket.io, Passport (JWT)

--

📖 How to Run
- Backend
```bash
cd backend
npm install
npm run start

- Frontend
```bash
cd frontend
npm install
npm run start
