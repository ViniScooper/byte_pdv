import React, { useState } from 'react';
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingBag,
    Clock, ChevronRight, X, CheckCircle, ShoppingCart
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

function ModalAbrirTurno({ onClose, onConfirm }) {
    const [saldo, setSaldo] = useState('');
    const [operador, setOperador] = useState('Operador');

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">🟢 Abrir Turno</h2>
                <div className="flex-col" style={{ display: 'flex', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Nome do Operador</label>
                        <input className="form-control" value={operador} onChange={e => setOperador(e.target.value)} placeholder="Ex: João" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Saldo Inicial (Fundo de Caixa)</label>
                        <input
                            className="form-control"
                            type="number"
                            min="0"
                            step="0.01"
                            value={saldo}
                            onChange={e => setSaldo(e.target.value)}
                            placeholder="0,00"
                            autoFocus
                        />
                        <span className="form-hint">Valor em dinheiro que já está na gaveta</span>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
                    <button
                        className="btn btn-success"
                        onClick={() => { if (saldo !== '') onConfirm(saldo, operador); }}
                        disabled={saldo === ''}
                    >
                        <CheckCircle size={16} /> Abrir Turno
                    </button>
                </div>
            </div>
        </div>
    );
}

function ModalFecharTurno({ onClose, onConfirm, turno }) {
    const [saldoFinal, setSaldoFinal] = useState('');
    const { entradasDoDia, saidasDoDia } = useApp();

    const entradas = entradasDoDia();
    const saidas = saidasDoDia();
    const movimentacao = entradas - saidas;

    // O que o sistema espera = Fundo + Vendas - Despesas
    const saldoEsperado = turno.saldoInicial + movimentacao;
    const diferenca = saldoFinal !== '' ? parseFloat(saldoFinal) - saldoEsperado : null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">🔴 Fechar Turno</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card" style={{ padding: 16, background: 'var(--bg-primary)' }}>
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-sm text-muted">Fundo Inicial</span>
                            <span className="text-sm">{fmt(turno.saldoInicial)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-sm text-muted">Movimentação (+/-)</span>
                            <strong className={movimentacao >= 0 ? 'text-green' : 'text-red'}>
                                {movimentacao >= 0 ? '+' : ''}{fmt(movimentacao)}
                            </strong>
                        </div>
                        <div className="divider" style={{ margin: '8px 0' }} />
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold">Saldo Total Esperado</span>
                            <strong className="text-accent">{fmt(saldoEsperado)}</strong>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Total Real na Gaveta (com fundo)</label>
                        <input
                            className="form-control"
                            type="number"
                            min="0"
                            step="0.01"
                            value={saldoFinal}
                            onChange={e => setSaldoFinal(e.target.value)}
                            placeholder="0,00"
                            autoFocus
                        />
                        <span className="form-hint">Conte todo o dinheiro da gaveta agora</span>
                    </div>

                    {diferenca !== null && (
                        <div className={`card ${Math.abs(diferenca) < 0.01 ? 'badge-green' : 'badge-red'}`} style={{ padding: 12, border: 'none' }}>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold">Diferença / Quebra</span>
                                <strong style={{ fontSize: 16 }}>
                                    {diferenca >= 0 ? '+' : ''}{fmt(diferenca)}
                                </strong>
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
                    <button
                        className="btn btn-danger"
                        onClick={() => { if (saldoFinal !== '') onConfirm(saldoFinal); }}
                        disabled={saldoFinal === ''}
                    >
                        <X size={16} /> Confirmar e Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { turnoAtual, abrirTurno, fecharTurno, saldoAtual, entradasDoDia, saidasDoDia, transacoes } = useApp();
    const navigate = useNavigate();
    const [modalAbrir, setModalAbrir] = useState(false);
    const [modalFechar, setModalFechar] = useState(false);

    const saldo = saldoAtual();
    const entradas = entradasDoDia();
    const saidas = saidasDoDia();

    const ultimasTransacoes = [...transacoes]
        .filter(t => turnoAtual ? t.turnoId === turnoAtual.id : true)
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
        .slice(0, 5);

    const handleAbrirTurno = (saldo, operador) => {
        abrirTurno(saldo, operador);
        setModalAbrir(false);
    };

    const handleFecharTurno = (saldoFinal) => {
        fecharTurno(saldoFinal);
        setModalFechar(false);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Status do Turno */}
                <div className={`turno-status-card ${turnoAtual ? 'turno-aberto' : 'turno-fechado'}`}>
                    <div className="turno-info">
                        <div className="flex items-center gap-12">
                            <div className={`status-dot ${turnoAtual ? 'green' : 'red'}`} style={{ width: 12, height: 12 }} />
                            <h2>Caixa {turnoAtual ? 'Aberto' : 'Fechado'}</h2>
                        </div>
                        {turnoAtual ? (
                            <p>
                                Operador: <strong>{turnoAtual.operador}</strong> &nbsp;·&nbsp;
                                Aberto às {new Date(turnoAtual.abertoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        ) : (
                            <p>Abra o turno para começar a registrar vendas e movimentações</p>
                        )}
                    </div>
                    <div>
                        {turnoAtual ? (
                            <button className="btn btn-danger btn-lg" onClick={() => setModalFechar(true)}>
                                <X size={18} /> Fechar Turno
                            </button>
                        ) : (
                            <button className="btn btn-success btn-lg" onClick={() => setModalAbrir(true)}>
                                <CheckCircle size={18} /> Abrir Turno
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="card-grid card-grid-4">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(79,142,247,0.15)' }}>
                            <DollarSign size={20} color="var(--accent)" />
                        </div>
                        <div className="stat-label">Saldo Atual</div>
                        <div className="stat-value" style={{ color: 'var(--accent)' }}>{fmt(saldo)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
                            <TrendingUp size={20} color="var(--green)" />
                        </div>
                        <div className="stat-label">Entradas do Turno</div>
                        <div className="stat-value text-green">{fmt(entradas)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
                            <TrendingDown size={20} color="var(--red)" />
                        </div>
                        <div className="stat-label">Saídas do Turno</div>
                        <div className="stat-value text-red">{fmt(saidas)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
                            <ShoppingBag size={20} color="var(--yellow)" />
                        </div>
                        <div className="stat-label">Transações</div>
                        <div className="stat-value" style={{ color: 'var(--yellow)' }}>
                            {transacoes.filter(t => turnoAtual ? t.turnoId === turnoAtual.id : true).length}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="font-bold mb-16" style={{ fontSize: 16 }}>Atalhos Rápidos</h3>
                    <div className="quick-actions">
                        <div
                            className="quick-action-btn"
                            onClick={() => turnoAtual ? navigate('/pdv') : setModalAbrir(true)}
                            style={{ '--icon-color': 'var(--green)' }}
                        >
                            <ShoppingCart size={28} color="var(--green)" />
                            <span>Nova Venda</span>
                            <small className="text-xs text-muted">{turnoAtual ? 'Registrar venda' : 'Abra o turno primeiro'}</small>
                        </div>
                        <div
                            className="quick-action-btn"
                            onClick={() => turnoAtual ? navigate('/despesas') : setModalAbrir(true)}
                        >
                            <TrendingDown size={28} color="var(--red)" />
                            <span>Nova Despesa/Sangria</span>
                            <small className="text-xs text-muted">{turnoAtual ? 'Registrar saída' : 'Abra o turno primeiro'}</small>
                        </div>
                    </div>
                </div>

                {/* Últimas transações */}
                <div className="card">
                    <div className="flex justify-between items-center mb-16">
                        <h3 className="font-bold" style={{ fontSize: 15 }}>Últimas Movimentações</h3>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/relatorios')}>
                            Ver tudo <ChevronRight size={14} />
                        </button>
                    </div>

                    {ultimasTransacoes.length === 0 ? (
                        <div className="empty-state">
                            <Clock size={40} />
                            <p>Nenhuma movimentação registrada neste turno</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Descrição</th>
                                        <th>Tipo</th>
                                        <th>Método</th>
                                        <th>Hora</th>
                                        <th style={{ textAlign: 'right' }}>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ultimasTransacoes.map(t => (
                                        <tr key={t.id}>
                                            <td style={{ color: 'var(--text-primary)', maxWidth: 220 }}>
                                                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {t.descricao}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${t.tipo === 'entrada' ? 'badge-green' : 'badge-red'}`}>
                                                    {t.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-blue">{t.metodoPagamento || t.subtipo}</span>
                                            </td>
                                            <td className="text-muted text-sm">
                                                {new Date(t.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 700 }}>
                                                <span className={t.tipo === 'entrada' ? 'text-green' : 'text-red'}>
                                                    {t.tipo === 'saida' ? '- ' : '+ '}{fmt(t.valor)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {modalAbrir && (
                <ModalAbrirTurno onClose={() => setModalAbrir(false)} onConfirm={handleAbrirTurno} />
            )}
            {modalFechar && (
                <ModalFecharTurno
                    onClose={() => setModalFechar(false)}
                    onConfirm={handleFecharTurno}
                    turno={turnoAtual}
                />
            )}
        </div>
    );
}
