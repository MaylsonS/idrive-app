import './InputCustomizado.css';

interface InputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (texto: string) => void;
  temLinkEsqueceuSenha?: boolean;
}

export function InputCustomizado({
  label,
  type,
  placeholder,
  value,
  onChange,
  temLinkEsqueceuSenha }: InputProps) {

  return (
    <div className="grupo-input">

      <div className="label-senha">
        <label>{label}</label>

        {temLinkEsqueceuSenha && (
          <a href="#" className="link-esqueceu">ESQUECEU A SENHA?</a>
        )}
      </div>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}