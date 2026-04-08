import { useState } from 'react';
import './Cadastro.css';
import { InputCustomizado } from '../../components/InputCustomizado';

import iconCar from '../../assets/icons/icon-car.svg';


import { User, CreditCard, Mail, Phone, Lock } from 'lucide-react';

export function Cadastro() {
  const [perfilSelecionado, setPerfilSelecionado] = useState<'ALUNO' | 'INSTRUTOR'>('ALUNO');

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [cnh, setCnh] = useState('');

  const handleCadastrar = (e: React.FormEvent) => {
    e.preventDefault();

    const dadosParaEnviar = {
      nome, cpf, email, telefone, senha,
      tipoPerfil: perfilSelecionado,
      ...(perfilSelecionado === 'INSTRUTOR' && { cnh })
    };

    console.log("Dados prontos para a API:", dadosParaEnviar);
    // No futuro: if(perfilSelecionado === 'ALUNO') alunoService.cadastrar(dadosParaEnviar) ...
  };

  return (
    <div className="background-tela">
      <div className="card-cadastro">

     <div className="logo-container">
       <h1 className="logo-texto">
         <img src={iconCar} alt="Logo IDrive" className="icone-carro" />
         IDrive
       </h1>
     </div>
        <h2 className="titulo">Crie sua conta</h2>
        <p className="subtitulo">Preencha os dados abaixo para começar sua jornada</p>

        <div className="seletor-perfil">
          <button
            className={perfilSelecionado === 'ALUNO' ? 'aba ativa' : 'aba'}
            onClick={() => setPerfilSelecionado('ALUNO')}
            type="button"
          >
            Aluno
          </button>
          <button
            className={perfilSelecionado === 'INSTRUTOR' ? 'aba ativa' : 'aba'}
            onClick={() => setPerfilSelecionado('INSTRUTOR')}
            type="button"
          >
            Instrutor
          </button>
        </div>

        <form onSubmit={handleCadastrar}>

          <InputCustomizado
            label="NOME COMPLETO" type="text" placeholder="Ex: João Silva"
            value={nome} onChange={setNome}
            icone={<User size={18} />}
          />

          <InputCustomizado
            label="CPF" type="text" placeholder="000.000.000-00"
            value={cpf} onChange={setCpf}
            icone={<CreditCard size={18} />}
          />

          {perfilSelecionado === 'INSTRUTOR' && (
              <InputCustomizado
                label="CNH" type="text" placeholder="Número da CNH"
                value={cnh} onChange={setCnh}
                icone={<CreditCard size={18} />}
              />
          )}

          <InputCustomizado
            label="E-MAIL" type="email" placeholder="nome@exemplo.com"
            value={email} onChange={setEmail}
            icone={<Mail size={18} />}
          />

          <InputCustomizado
            label="TELEFONE" type="text" placeholder="(83) 99999-9999"
            value={telefone} onChange={setTelefone}
            icone={<Phone size={18} />}
          />

          <InputCustomizado
            label="SENHA" type="password" placeholder="••••••••"
            value={senha} onChange={setSenha}
            icone={<Lock size={18} />}
          />

          <div className="termos-container">
            <input type="checkbox" id="termos" required />
            <label htmlFor="termos">
              Eu concordo com os <a href="#" className="link-destaque">Termos de Serviço</a> e a <a href="#" className="link-destaque">Política de Privacidade</a> do IDrive.
            </label>
          </div>

          <button type="submit" className="btn-entrar" style={{ backgroundColor: '#A83B0E' }}>
            Cadastrar
          </button>
        </form>

        <div className="rodape">
          <p>Já tem uma conta? <a href="#">Entrar</a></p>
        </div>

      </div>
    </div>
  );
}