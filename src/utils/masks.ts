export const mascaraCPF = (valor: string) => {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const mascaraTelefone = (valor: string) => {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export const mascaraCNH = (valor: string) => {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11);
};

export const extrairApenasNumeros = (valor: string) => {
  return valor.replace(/\D/g, '');
};