import { useState } from 'react';
import './Login.css';
import { authService } from '../../services/authService';
import { InputCustomizado } from '../../components/InputCustomizado';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Enviando dados para a API...");
      const resposta = await authService.login({ email, senha });
      console.log("Sucesso! O Spring Boot respondeu:", resposta);

      // JWT AQUI
    } catch (error) {
      console.error("Erro ao fazer login. Verifique se o Spring Boot está rodando:", error);
    }
  };

  return (
    <div className="background-tela">
      <div className="card-login">

        <div className="logo-container">
          <h1 className="logo-texto"><span className="triangulo">▲</span> IDrive</h1>
        </div>
        <h2 className="titulo">Bem-vindo de volta</h2>
        <p className="subtitulo">Acesse sua conta para continuar.</p>

        <button className="btn-google">
           Entrar com Google
        </button>

        <div className="divisor">
          <span>OU E-MAIL</span>
        </div>

        <form onSubmit={handleLogin}>

          <InputCustomizado
            label="E-MAIL"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={setEmail}
          />

          <InputCustomizado
            label="SENHA"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={setSenha}
            temLinkEsqueceuSenha={true}
          />

          <button type="submit" className="btn-entrar">
            Entrar
          </button>
        </form>

        <div className="rodape">
          <p>Não tem uma conta? <a href="#">Criar conta</a></p>
          <p className="copyright">© 2026 IDRIVE</p>
        </div>

      </div>
    </div>
  );
}