(() => {
  const API = "https://uat-api.kincore.com/api";
  const APP = "https://uat-app.kincore.com";
  const root = document.documentElement;
  const page = document.body;
  const statusEl = document.getElementById("auth-status");
  const form = document.getElementById("auth-form");
  const title = document.getElementById("card-title");
  const submitBtn = document.getElementById("submit-btn");
  const switchBtn = document.getElementById("switch-mode");
  const forgotBtn = document.getElementById("forgot-btn");

  const copy = {
    en: {
      headline: "Kincore",
      tagline: "Preserve your family story and connect every generation.",
      logIn: "Log In",
      signUp: "Create New Account",
      email: "Email Address",
      password: "Password",
      first: "First Name",
      last: "Last Name",
      forgot: "Forgotten Password?",
      or: "Or continue with",
      google: "Continue With Google",
      facebook: "Continue With Facebook",
      haveAccount: "Already Have An Account? Log In",
      newHere: "New To Kincore? Create An Account",
      createHint: "Create a family space for your relatives.",
      signingIn: "Signing you in…",
      creating: "Creating your account…",
      sentReset: "If that email exists, a reset link is on its way.",
    },
    zh: {
      headline: "Kincore",
      tagline: "保存家族故事，连接每一代人。",
      logIn: "登录",
      signUp: "创建新账户",
      email: "电子邮箱",
      password: "密码",
      first: "名",
      last: "姓",
      forgot: "忘记密码？",
      or: "或使用以下方式继续",
      google: "使用 Google 继续",
      facebook: "使用 Facebook 继续",
      haveAccount: "已有账户？登录",
      newHere: "还没有账户？创建账户",
      createHint: "为亲人创建一个家庭空间。",
      signingIn: "正在登录…",
      creating: "正在创建账户…",
      sentReset: "如果该邮箱存在，重置链接已发送。",
    },
    ms: {
      headline: "Kincore",
      tagline: "Pelihara cerita keluarga dan hubungkan setiap generasi.",
      logIn: "Log Masuk",
      signUp: "Cipta Akaun Baharu",
      email: "E-mel",
      password: "Kata Laluan",
      first: "Nama Pertama",
      last: "Nama Keluarga",
      forgot: "Lupa Kata Laluan?",
      or: "Atau teruskan dengan",
      google: "Teruskan Dengan Google",
      facebook: "Teruskan Dengan Facebook",
      haveAccount: "Sudah Ada Akaun? Log Masuk",
      newHere: "Baharu Di Kincore? Cipta Akaun",
      createHint: "Cipta ruang keluarga untuk saudara-mara anda.",
      signingIn: "Sedang log masuk…",
      creating: "Sedang mencipta akaun…",
      sentReset: "Jika e-mel itu wujud, pautan set semula sedang dihantar.",
    },
    ja: {
      headline: "Kincore",
      tagline: "家族の物語を守り、すべての世代をつなぎます。",
      logIn: "ログイン",
      signUp: "新しいアカウントを作成",
      email: "メールアドレス",
      password: "パスワード",
      first: "名",
      last: "姓",
      forgot: "パスワードをお忘れですか？",
      or: "または次で続行",
      google: "Google で続行",
      facebook: "Facebook で続行",
      haveAccount: "アカウントをお持ちですか？ログイン",
      newHere: "Kincore は初めてですか？アカウント作成",
      createHint: "ご家族のためのスペースを作成できます。",
      signingIn: "ログインしています…",
      creating: "アカウントを作成しています…",
      sentReset: "そのメールが存在する場合、リセット用リンクを送信します。",
    },
    es: {
      headline: "Kincore",
      tagline: "Conserva la historia de tu familia y conecta cada generación.",
      logIn: "Iniciar Sesión",
      signUp: "Crear Cuenta Nueva",
      email: "Correo electrónico",
      password: "Contraseña",
      first: "Nombre",
      last: "Apellido",
      forgot: "¿Olvidaste la contraseña?",
      or: "O continúa con",
      google: "Continuar Con Google",
      facebook: "Continuar Con Facebook",
      haveAccount: "¿Ya tienes cuenta? Inicia sesión",
      newHere: "¿Nuevo en Kincore? Crea una cuenta",
      createHint: "Crea un espacio familiar para tus parientes.",
      signingIn: "Iniciando sesión…",
      creating: "Creando tu cuenta…",
      sentReset: "Si ese correo existe, enviaremos un enlace de restablecimiento.",
    },
  };

  const lang = () => localStorage.getItem("kincore-lang") || "en";
  const t = () => copy[lang()] || copy.en;
  const isSignup = () => page.classList.contains("is-signup");

  const setStatus = (msg, kind) => {
    statusEl.textContent = msg || "";
    statusEl.className = "login-status" + (kind ? " " + kind : "");
  };

  const applyCopy = () => {
    const c = t();
    document.getElementById("brand-title").textContent = c.headline;
    document.getElementById("brand-tagline").textContent = c.tagline;
    document.getElementById("label-email").textContent = c.email;
    document.getElementById("label-password").textContent = c.password;
    document.getElementById("label-first").textContent = c.first;
    document.getElementById("label-last").textContent = c.last;
    forgotBtn.textContent = c.forgot;
    document.getElementById("google-btn").textContent = c.google;
    document.getElementById("facebook-btn").textContent = c.facebook;
    document.getElementById("create-hint").textContent = c.createHint;
    document.getElementById("or-label").textContent = c.or;
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.setAttribute("aria-current", btn.getAttribute("data-lang") === lang() ? "true" : "false");
    });
    syncMode();
  };

  const syncMode = () => {
    const c = t();
    const signup = isSignup();
    title.textContent = signup ? c.signUp : c.logIn;
    submitBtn.textContent = signup ? c.signUp : c.logIn;
    switchBtn.textContent = signup ? c.haveAccount : c.newHere;
    document.getElementById("first-name").required = signup;
    document.getElementById("last-name").required = signup;
  };

  const goToApp = (token, familyId) => {
    const params = new URLSearchParams();
    params.set("kincore_token", token);
    if (familyId) params.set("kincore_family", familyId);
    window.location.href = APP + "/?" + params.toString();
  };

  const incoming = new URLSearchParams(window.location.search);
  if (incoming.get("view") === "signup") page.classList.add("is-signup");
  const inboundToken = incoming.get("token") || incoming.get("kincore_token");
  if (inboundToken) {
    goToApp(inboundToken, incoming.get("family_id") || incoming.get("kincore_family"));
    return;
  }
  if (incoming.get("error")) setStatus(incoming.get("error"), "err");

  applyCopy();

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem("kincore-lang", btn.getAttribute("data-lang"));
      root.lang = btn.getAttribute("data-lang") === "zh" ? "zh" : btn.getAttribute("data-lang");
      applyCopy();
    });
  });

  switchBtn.addEventListener("click", () => {
    page.classList.toggle("is-signup");
    history.replaceState(null, "", isSignup() ? "/login.html?view=signup" : "/login.html");
    setStatus("");
    syncMode();
  });

  const startOAuth = (provider) => {
    const redirect = window.location.origin + "/login.html";
    window.location.href =
      API +
      "/auth/" +
      provider +
      "?mode=login&client_type=app&redirect_to=" +
      encodeURIComponent(redirect);
  };

  document.getElementById("google-btn").addEventListener("click", () => startOAuth("google"));
  document.getElementById("facebook-btn").addEventListener("click", () => startOAuth("facebook"));

  forgotBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    if (!email) {
      setStatus(t().email, "err");
      return;
    }
    try {
      const res = await fetch(API + "/auth/app/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send reset email");
      setStatus(t().sentReset, "ok");
    } catch (err) {
      setStatus(err.message, "err");
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus(isSignup() ? t().creating : t().signingIn);
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
      if (isSignup()) {
        const res = await fetch(API + "/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            first_name: document.getElementById("first-name").value.trim(),
            last_name: document.getElementById("last-name").value.trim(),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Could not create account");
        if (data.requires_email_confirmation) {
          setStatus(data.message || "Check your email to confirm, then log in.", "ok");
          page.classList.remove("is-signup");
          syncMode();
          return;
        }
      }

      const res = await fetch(API + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (!data.token) throw new Error("Login succeeded but no session was returned.");
      goToApp(data.token, data.user && (data.user.family_id || data.user.family_space_id));
    } catch (err) {
      setStatus(err.message, "err");
    }
  });
})();
