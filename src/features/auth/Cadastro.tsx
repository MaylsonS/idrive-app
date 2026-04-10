import { useState } from 'react';
import './Cadastro.css';
import { InputCustomizado } from '../../components/InputCustomizado';
import iconCar from '../../assets/icons/icon-car.svg';
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

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        const cpfLimpo = extrairApenasNumeros(cpf);
        const telefoneLimpo = extrairApenasNumeros(telefone);

      if (perfilSelecionado === 'ALUNO') {
        const dadosAluno: AlunoRegistroDTO = {
          nome, cpf:cpfLimpo, email, telefone: telefoneLimpo, senha, tipoPerfil: 'ALUNO'
        };
        console.log("Enviando ALUNO para a API...", dadosAluno);

        const resposta = await alunoService.registrar(dadosAluno);
        console.log("Sucesso!", resposta);
        alert("Aluno cadastrado com sucesso!");

      } else if (perfilSelecionado === 'INSTRUTOR') {
        const dadosInstrutor: InstrutorRegistroDTO = {
          nome, cpf:cpfLimpo, email, telefone: telefoneLimpo, senha, tipoPerfil: 'INSTRUTOR', cnh
        };
        console.log("Enviando INSTRUTOR para a API...", dadosInstrutor);

        const resposta = await instrutorService.registrar(dadosInstrutor);
        console.log("Sucesso!", resposta);
        alert("Instrutor cadastrado com sucesso!");
      }
      setNome(''); setCpf(''); setEmail(''); setTelefone(''); setSenha(''); setCnh('');

    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao realizar o cadastro. Verifique o console.");
    }
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
            value={cpf}
            onChange={(texto) => setCpf(mascaraCPF(texto))}
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
            value={email} onChange={setEmail}
            icone={<Mail size={18} />}
          />

          <InputCustomizado
            label="TELEFONE" type="text" placeholder="(83) 99999-9999"
            value={telefone}
            onChange={(texto) => setTelefone(mascaraTelefone(texto))}
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