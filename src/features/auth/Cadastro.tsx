import { useState } from 'react';
import './Cadastro.css';
import { InputCustomizado } from '../../components/InputCustomizado';

import iconCar from '../../assets/icons/Icon-car.svg';


import { User, CreditCard, Mail, Phone, Lock } from 'lucide-react';

import { mascaraCPF, mascaraTelefone, mascaraCNH, extrairApenasNumeros } from '../../utils/masks';

import { alunoService } from '../../services/alunoService';
import { instrutorService } from '../../services/instrutorService';

import type { AlunoRegistroDTO } from '../../services/alunoService';
import type { InstrutorRegistroDTO } from '../../services/instrutorService';

export function Cadastro() {
  const [perfilSelecionado, setPerfilSelecionado] = useState<'ALUNO' | 'INSTRUTOR'>('ALUNO');

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [cnh, setCnh] = useState('');
  const [erroEmail, setErroEmail] = useState('');

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();

    const dadosParaEnviar = {
      nome, cpf, email, telefone, senha,
      tipoPerfil: perfilSelecionado,
      ...(perfilSelecionado === 'INSTRUTOR' && { cnh })
    };

    console.log("Dados prontos para a API:", dadosParaEnviar);
    // No futuro: if(perfilSelecionado === 'ALUNO') alunoService.cadastrar(dadosParaEnviar) ...
  };

  function handleCpfChange(valorBruto: string): void {
    let numeros = valorBruto.replace(/\D/g, '');
    if (numeros.length > 11) {
      numeros = numeros.slice(0, 11);
    }
    const cpfFormatado = numeros
      .replace(/(\d{3})(\d)/, '$1.$2')       
      .replace(/(\d{3})(\d)/, '$1.$2')       
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    setCpf(cpfFormatado);
  }

  function handleTelefoneChange(valorBruto: string): void {
    let numeros = valorBruto.replace(/\D/g, '');

    if (numeros.length > 11) {
      numeros = numeros.slice(0, 11);
    }
    const telefoneFormatado = numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');

    setTelefone(telefoneFormatado);
  }

  const validarEmail = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email) && email.length > 0) {
      setErroEmail('Por favor, insira um e-mail válido.');
    } else {
      setErroEmail(''); 
    }
  }

  const handleEmailChange = (valor: string) => {
    setEmail(valor);
    
    if (erroEmail) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (regex.test(valor)) {
        setErroEmail('');
      }
    }
  }


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
            value={cpf} onChange={handleCpfChange}
            icone={<CreditCard size={18} />}
          />

          {perfilSelecionado === 'INSTRUTOR' && (
              <InputCustomizado
                label="CNH" type="text" placeholder="Apenas número da CNH"
                value={cnh}
                onChange={(texto) => setCnh(mascaraCNH(texto))}
                icone={<CreditCard size={18} />}
              />
          )}

          <InputCustomizado
            label="E-MAIL" type="email" placeholder="nome@exemplo.com"
            value={email} onChange={handleEmailChange} onBlur={validarEmail}
            temErro={!!erroEmail} icone={<Mail size={18} />}
            />
            {erroEmail && <span className="mensagem-erro">{erroEmail}</span>}

          <InputCustomizado
            label="TELEFONE" type="text" placeholder="(83) 99999-9999"
            value={telefone} onChange={handleTelefoneChange}
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