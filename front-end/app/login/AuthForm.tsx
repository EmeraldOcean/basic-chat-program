interface AuthFormProps {
  isSignup: boolean;
  formData: any;
  loading: boolean;
  error: string | null;
  signupSuccess: boolean;
  onSubmit: (e: React.SyntheticEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleMode: () => void;
}

export default function AuthForm({
  isSignup, formData, loading, error, signupSuccess, onSubmit, onChange, onToggleMode
}: AuthFormProps) {
    return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-800">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {isSignup ? "회원가입" : "로그인"}
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {signupSuccess && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            회원가입이 완료되었습니다! 로그인해주세요.
          </div>
        )}


        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="form-label">
              사용자 ID
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={onChange}
              required
              className="form-input"
              placeholder="사용자 ID"
            />
          </div>

          <div>
            <label className="form-label">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              required
              className="form-input"
              placeholder="비밀번호"
            />
            {isSignup && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                5-20자, 특수문자 1개 이상 포함
              </p>
            )}
          </div>

          {isSignup && (
            <>
              <div>
                <label className="form-label">
                  이메일
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  required
                  className="form-input"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="form-label">
                  이름
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  required
                  className="form-input"
                  placeholder="이름"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "처리 중..." : isSignup ? "회원가입" : "로그인"}
          </button>
        </form>

        <div className="mt-4 space-y-2 text-center">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            {isSignup ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
          </button>
        </div>
      </div>
    </div>
  );
}