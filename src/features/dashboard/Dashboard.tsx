import './Dashboard.css';
import { Sidebar } from '../../components/Sidebar';

export function Dashboard() {
  return (
    <div className="layout-app">
      <Sidebar itemAtivo="INICIO" />

      <main className="conteudo-principal">
        <header className="header-dashboard">
          <h1>Olá, João! 👋</h1>
          <p>Pronto para a sua próxima aula?</p>
        </header>

      </main>
    </div>
  );
}