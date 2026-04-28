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
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [termosAceitos, setTermosAceitos] = useState(false);


  const handleCadastrar = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        console.log(`[CADASTRO] Iniciando disparo para a API. Perfil: ${perfilSelecionado}`);

        const cpfLimpo = extrairApenasNumeros(cpf);
        const telefoneLimpo = extrairApenasNumeros(telefone);

        if (perfilSelecionado === 'ALUNO') {
          const dadosAluno: AlunoRegistroDTO = {
            nome,
            cpf: cpfLimpo,
            email,
            telefone: telefoneLimpo,
            senha,
            tipoPerfil: 'ALUNO'
          };
          console.log("[CADASTRO] Payload do Aluno montado:", dadosAluno);

          const resposta = await alunoService.registrar(dadosAluno);
          console.log("[CADASTRO] Sucesso! Resposta do servidor:", resposta);
          alert("Aluno cadastrado com sucesso!");

        } else if (perfilSelecionado === 'INSTRUTOR') {
          const dadosInstrutor: InstrutorRegistroDTO = {
            nome,
            cpf: cpfLimpo,
            email,
            telefone: telefoneLimpo,
            senha,
            tipoPerfil: 'INSTRUTOR',
            cnh: extrairApenasNumeros(cnh)
          };
          console.log("[CADASTRO] Payload do Instrutor montado:", dadosInstrutor);

          const resposta = await instrutorService.registrar(dadosInstrutor);
          console.log("[CADASTRO] Sucesso! Resposta do servidor:", resposta);
          alert("Instrutor cadastrado com sucesso!");
        }

      } catch (error) {
        console.error(" [CADASTRO] Erro crítico na comunicação com o backend:", error);
        alert("Erro ao realizar o cadastro. Tente novamente.");
      }
    };


  const validarCampo = (nomeCampo: string, valor: string) => {
    let mensagem = '';

    switch (nomeCampo) {
      case 'nome':
        if (!valor.trim()) mensagem = 'O nome não pode estar vazio.';
        break;
      case 'cpf':
        if (extrairApenasNumeros(valor).length < 11) mensagem = 'CPF incompleto.';
        break;
      case 'telefone':
        if (extrairApenasNumeros(valor).length < 11) mensagem = 'Telefone deve ter 11 dígitos.';
        break;
      case 'email':
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!valor.trim()) {
          mensagem = 'O e-mail é obrigatório.';
        } else if (!regexEmail.test(valor)) {
          mensagem = 'E-mail inválido.';
        }
        break;
      case 'cnh':
        if (perfilSelecionado === 'INSTRUTOR' && !valor.trim()) {
          mensagem = 'A CNH é obrigatória para instrutores.';
        }
        break;
      case 'senha':
        if (valor.length < 6) mensagem = 'A senha deve ter no mínimo 6 caracteres.';
        break;
    }

    setErros(prev => ({ ...prev, [nomeCampo]: mensagem }));
  };

  const camposPreenchidos =
    nome.trim() !== '' &&
    cpf.length >= 14 &&
    email.trim() !== '' &&
    telefone.length >= 14 &&
    senha.length >= 6;

  const cnhValida = perfilSelecionado === 'ALUNO' || (perfilSelecionado === 'INSTRUTOR' && cnh.trim() !== '');

  const temErrosNoFormulario = Object.values(erros).some(erro => erro !== '');

  const formularioValido = camposPreenchidos && cnhValida && !temErrosNoFormulario && termosAceitos;





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
            onBlur={() => validarCampo('nome', nome)}
            temErro={!!erros.nome}
            icone={<User size={18} />}
          />
            {erros.nome && <span className="mensagem-erro">{erros.nome}</span>}

          <InputCustomizado
            label="CPF" type="text" placeholder="000.000.000-00"
            value={cpf} onChange={handleCpfChange}
            onBlur={() => validarCampo('cpf', cpf)}
            temErro={!!erros.cpf}
            icone={<CreditCard size={18} />}
          />
            {erros.cpf && <span className="mensagem-erro">{erros.cpf}</span>}


          {perfilSelecionado === 'INSTRUTOR' && (
              <InputCustomizado
                label="CNH" type="text" placeholder="Apenas número da CNH"
                value={cnh}
                onBlur={() => validarCampo('cnh', cnh)}
                temErro={!!erros.cnh}
                onChange={(texto) => setCnh(mascaraCNH(texto))}
                icone={<CreditCard size={18} />}
              />
            )}
            {erros.cnh && <span className="mensagem-erro">{erros.cnh}</span>}

          <InputCustomizado
            label="E-MAIL" type="email" placeholder="nome@exemplo.com"
            value={email} onChange={setEmail}
            onBlur={() => validarCampo('email', email)}
            temErro={!!erros.email}
            />
              {erros.email && <span className="mensagem-erro">{erros.email}</span>}

          <InputCustomizado
            label="TELEFONE" type="text" placeholder="(83) 99999-9999"
            value={telefone} onChange={handleTelefoneChange}
            onBlur={() => validarCampo('telefone', telefone)}
            temErro={!!erros.telefone}
            icone={<Phone size={18} />}
          />
            {erros.telefone && <span className="mensagem-erro">{erros.telefone}</span>}

          <InputCustomizado
            label="SENHA" type="password" placeholder="••••••••"
            value={senha} onChange={setSenha}
            onBlur={() => validarCampo('senha', senha)}
            temErro={!!erros.senha}
            icone={<Lock size={18} />}
          />
            {erros.senha && <span className="mensagem-erro">{erros.senha}</span>}

          <div className="termos-container">
            <input type="checkbox"
              id="termos"
              required
              onChange={(e) => setTermosAceitos(e.target.checked)}
            />
            <label htmlFor="termos">
              Eu concordo com os <a href="#" className="link-destaque">Termos de Serviço</a> e a <a href="#" className="link-destaque">Política de Privacidade</a> do IDrive.
            </label>
          </div>

          <button type="submit"
            className="btn-entrar"
            style={{ backgroundColor: '#A83B0E' }}
            disabled={!formularioValido}
            >
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