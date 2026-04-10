import { ReactNode } from 'react';
import './InputCustomizado.css';

interface InputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (texto: string) => void;
  temLinkEsqueceuSenha?: boolean;
  icone?: ReactNode;
  onBlur?: () => void;
  temErro?: boolean;
}

export function InputCustomizado({
  label,
  type,
  placeholder,
  value,
  onChange,
  temLinkEsqueceuSenha,
  icone,
  onBlur,
  temErro}: InputProps) {

  return (
    <div className="grupo-input">
      <div className="label-senha">
        <label>{label}</label>
        {temLinkEsqueceuSenha && (
          <a href="#" className="link-esqueceu">ESQUECEU A SENHA?</a>
        )}
      </div>

      <div className="input-com-icone">
        {icone && <span className="icone-container">{icone}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`${icone ? 'com-icone' : ''} ${temErro ? 'input-erro' : ''}`}
          required
        />
      </div>
    </div>
  );
}