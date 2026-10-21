// A entrada pública leva ao formulário local seguro. A sessão é criada pelo
// servidor após validar o hash scrypt da senha e emitir cookie HttpOnly.
export const startLogin = () => {
  if (typeof window !== "undefined" && window.location.pathname !== "/painel") {
    window.location.href = "/painel";
  }
};
