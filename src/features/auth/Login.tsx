import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { authService } from '../../services/authService';
import { InputCustomizado } from '../../components/InputCustomizado';
import { useAuthContext } from '../../contexts/AuthContext';

function decodificarPerfil(token: string): 'ALUNO' | 'INSTRUTOR' | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.tipoPerfil ?? null;
    } catch {
        return null;
    }
}

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const navigate = useNavigate();
    const { storeToken } = useAuthContext();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const resposta = await authService.login({ email, senha });
            const perfil = decodificarPerfil(resposta.token);
            storeToken(resposta.token, perfil);
            navigate('/anuncios');
        } catch (error) {
            console.error("Erro ao fazer login:", error);
            alert("E-mail ou senha incorretos.");
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

                <button className="btn-google">Entrar com Google</button>

                <div className="divisor"><span>OU E-MAIL</span></div>

                <form onSubmit={handleLogin}>
                    <InputCustomizado label="E-MAIL" type="email" placeholder="seu@email.com" value={email} onChange={setEmail} />
                    <InputCustomizado label="SENHA" type="password" placeholder="••••••••" value={senha} onChange={setSenha} temLinkEsqueceuSenha={true} />
                    <button type="submit" className="btn-entrar">Entrar</button>
                </form>

                <div className="rodape">
                    <p>Não tem uma conta? <Link to="/cadastro">Criar conta</Link></p>
                    <p className="copyright">© 2026 IDRIVE</p>
                </div>
            </div>
        </div>
    );
}
