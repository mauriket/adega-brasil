/* =====================================================
   Acesso: contas do painel (e-mail + senha)
   A chave de publicação do GitHub é guardada CRIPTOGRAFADA com a senha
   de cada conta (PBKDF2-SHA256 600.000 rodadas + AES-256-GCM).
   O arquivo acesso.json é público, mas sem a senha certa ele não serve
   para nada. O e-mail não é gravado: só um resumo (SHA-256) dele.
   ===================================================== */
(function (raiz) {
  const ITER = 600000;
  const enc = new TextEncoder(), dec = new TextDecoder();
  const sub = () => {
    const c = raiz.crypto && raiz.crypto.subtle;
    if (!c) throw new Error("Este navegador não tem criptografia disponível. Abra pelo endereço https.");
    return c;
  };
  const b64 = (buf) => { let s = ""; new Uint8Array(buf).forEach((b) => { s += String.fromCharCode(b); }); return btoa(s); };
  const deB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const aleatorio = (n) => raiz.crypto.getRandomValues(new Uint8Array(n));

  const normEmail = (e) => String(e || "").trim().toLowerCase();
  const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normEmail(e));
  // Senha forte: 10+ caracteres, com letras e números
  function problemaSenha(s) {
    s = String(s || "");
    if (s.length < 10) return "A senha precisa ter pelo menos 10 caracteres.";
    if (!/[A-Za-zÀ-ÿ]/.test(s) || !/\d/.test(s)) return "A senha precisa ter letras e números.";
    return "";
  }

  async function idDoEmail(email) {
    return hex(await sub().digest("SHA-256", enc.encode("adega-brasil:" + normEmail(email))));
  }
  async function chave(senha, sal, iter, usos) {
    const base = await sub().importKey("raw", enc.encode(String(senha)), "PBKDF2", false, ["deriveKey"]);
    return sub().deriveKey({ name: "PBKDF2", salt: sal, iterations: iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, usos);
  }

  // Cria a entrada de uma conta: { id, nome, sal, iv, dados, iter, criada }
  async function criarConta({ nome, email, senha, segredo }) {
    if (!emailValido(email)) throw new Error("E-mail inválido.");
    const p = problemaSenha(senha); if (p) throw new Error(p);
    const sal = aleatorio(16), iv = aleatorio(12);
    const k = await chave(senha, sal, ITER, ["encrypt"]);
    const id = await idDoEmail(email);
    const cifra = await sub().encrypt({ name: "AES-GCM", iv, additionalData: enc.encode(id) }, k, enc.encode(JSON.stringify(segredo)));
    return { id, nome: String(nome || "").trim().slice(0, 40) || "Conta", sal: b64(sal), iv: b64(iv), dados: b64(cifra), iter: ITER, criada: new Date().toISOString() };
  }

  // Entra: devolve { conta, segredo } ou lança erro genérico (não diz se o e-mail existe)
  async function entrar(cofre, email, senha) {
    const id = await idDoEmail(email);
    const conta = ((cofre && cofre.contas) || []).find((c) => c.id === id);
    const erro = new Error("E-mail ou senha incorretos.");
    if (!conta) { await chave(senha, aleatorio(16), ITER, ["decrypt"]); throw erro; } // mesmo tempo, com ou sem conta
    try {
      const k = await chave(senha, deB64(conta.sal), conta.iter || ITER, ["decrypt"]);
      const txt = await sub().decrypt({ name: "AES-GCM", iv: deB64(conta.iv), additionalData: enc.encode(conta.id) }, k, deB64(conta.dados));
      return { conta, segredo: JSON.parse(dec.decode(txt)) };
    } catch { throw erro; }
  }

  raiz.Acesso = { criarConta, entrar, idDoEmail, emailValido, problemaSenha, normEmail, ITER };
})(typeof window !== "undefined" ? window : globalThis);
