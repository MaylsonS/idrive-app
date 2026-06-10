import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { perfilService } from '../../services/perfilService';
import './Dashboard.css';

export default function Dashboard() {
    const [primeiroNome, setPrimeiroNome] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        perfilService.meuPerfil()
            .then(dados => {
                const nomeCurto = dados.nome ? dados.nome.split(' ')[0] : 'Instrutor';
                setPrimeiroNome(nomeCurto);
            })
            .catch(erro => console.error("Erro ao carregar nome:", erro))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="layout-app">
            <Sidebar itemAtivo="INICIO" />

            {/* Aqui entra a classe com o margin-left de 260px */}
            <main className="conteudo-principal">

                <header className="header-dashboard">
                    <p className="dash-eyebrow">
                        Visão Geral
                    </p>
                    <h1>
                        {loading ? 'Carregando...' : `Bem-vindo, ${primeiroNome}.`}
                    </h1>
                    <p>
                        Acompanhe o desempenho das suas aulas, avaliações e gerencie sua agenda profissional.
                    </p>
                </header>

                <div className="dash-content-wrapper">

                    <div className="dash-card-resumo">
                        <h3 className="dash-card-titulo">Resumo de Desempenho</h3>
                        <p className="dash-card-texto">
                            (Coloque os seus cards de métricas, gráficos e tabelas aqui dentro)
                        </p>
                    </div>

                </div>

            </main>
        </div>
    );
}