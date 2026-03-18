import React, { useState, useMemo } from 'react';
import { BarChart3, Calendar, Image, Clock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

function toDate(str) { return new Date(str).toLocaleDateString('pt-BR'); }
function toTime(str) { return new Date(str).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }

export default function Relatorios() {
    const { transacoes, turnos, turnoAtual } = useApp();
    const [aba, setAba] = useState('transacoes');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    const todosTurnos = useMemo(() => {
        const t = [...turnos];
        if (turnoAtual) t.unshift({ ...turnoAtual, status: 'aberto' });
        return t.sort((a, b) => new Date(b.abertoEm) - new Date(a.abertoEm));
    }, [turnos, turnoAtual]);

    const txFiltradas = useMemo(() => {
        let tx = [...transacoes].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
        if (dataInicio) tx = tx.filter(t => new Date(t.criadoEm) >= new Date(dataInicio));
        if (dataFim) tx = tx.filter(t => new Date(t.criadoEm) <= new Date(dataFim + 'T23:59:59'));
        return tx;
    }, [transacoes, dataInicio, dataFim]);

    const notas = useMemo(() =>
        transacoes.filter(t => t.nota).sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)),
        [transacoes]
    );

    const totalEntradas = txFiltradas.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0);
    const totalSaidas = txFiltradas.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Relatórios e Histórico</h1>
                <p className="page-subtitle">Consulte o histórico de movimentações e turnos</p>
            </div>

            <div className="page-body">
                <div className="tabs mb-16">
                    <button className={`tab ${aba === 'transacoes' ? 'active' : ''}`} onClick={() => setAba('transacoes')}>
                        <BarChart3 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Movimentações
                    </button>
                    <button className={`tab ${aba === 'turnos' ? 'active' : ''}`} onClick={() => setAba('turnos')}>
                        <Clock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Turnos
                    </button>
                    <button className={`tab ${aba === 'notas' ? 'active' : ''}`} onClick={() => setAba('notas')}>
                        <Image size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Galeria de Notas
                    </button>
                </div>

                {/* ===== TRANSAÇÕES ===== */}
                {aba === 'transacoes' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Filtros */}
                        <div className="card" style={{ padding: 16 }}>
                            <div className="flex items-center gap-12" style={{ flexWrap: 'wrap' }}>
                                <Calendar size={16} color="var(--text-muted)" />
                                <span className="text-sm text-muted">Filtrar por período:</span>
                                <div className="flex items-center gap-8">
                                    <input type="date" className="form-control" style={{ width: 160 }} value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                                    <span className="text-muted">até</span>
                                    <input type="date" className="form-control" style={{ width: 160 }} value={dataFim} onChange={e => setDataFim(e.target.value)} />
                                </div>
                                {(dataInicio || dataFim) && (
                                    <button className="btn btn-ghost btn-sm" onClick={() => { setDataInicio(''); setDataFim(''); }}>Limpar</button>
                                )}
                            </div>
                        </div>

                        {/* Totais */}
                        <div className="card-grid card-grid-3">
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}><TrendingUp size={18} color="var(--green)" /></div>
                                <div className="stat-label">Total Entradas</div>
                                <div className="stat-value text-green">{fmt(totalEntradas)}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}><TrendingDown size={18} color="var(--red)" /></div>
                                <div className="stat-label">Total Saídas</div>
                                <div className="stat-value text-red">{fmt(totalSaidas)}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(79,142,247,0.15)' }}><DollarSign size={18} color="var(--accent)" /></div>
                                <div className="stat-label">Resultado Líquido</div>
                                <div className="stat-value" style={{ color: totalEntradas - totalSaidas >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                    {fmt(totalEntradas - totalSaidas)}
                                </div>
                            </div>
                        </div>

                        {/* Tabela */}
                        {txFiltradas.length === 0 ? (
                            <div className="empty-state card">
                                <BarChart3 size={40} />
                                <p>Nenhuma transação encontrada</p>
                            </div>
                        ) : (
                            <div className="table-wrap card">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Data/Hora</th>
                                            <th>Descrição</th>
                                            <th>Tipo</th>
                                            <th>Método</th>
                                            <th style={{ textAlign: 'right' }}>Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {txFiltradas.map(t => (
                                            <tr key={t.id}>
                                                <td className="text-muted text-xs">
                                                    {toDate(t.criadoEm)}<br />{toTime(t.criadoEm)}
                                                </td>
                                                <td style={{ color: 'var(--text-primary)', maxWidth: 260 }}>
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
                                                    <span className="badge badge-blue">{t.metodoPagamento || t.motivo || t.subtipo}</span>
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
                )}

                {/* ===== TURNOS ===== */}
                {aba === 'turnos' && (
                    <div>
                        {todosTurnos.length === 0 ? (
                            <div className="empty-state card">
                                <Clock size={40} />
                                <p>Nenhum turno registrado ainda</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {todosTurnos.map(t => (
                                    <div key={t.id} className="card" style={{ padding: 20 }}>
                                        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                                            <div>
                                                <div className="flex items-center gap-12">
                                                    <span className={`badge ${t.status === 'aberto' ? 'badge-green' : 'badge-red'}`}>
                                                        {t.status === 'aberto' ? '🟢 Aberto' : '🔴 Fechado'}
                                                    </span>
                                                    <strong style={{ fontSize: 15 }}>{t.operador}</strong>
                                                </div>
                                                <div className="text-sm text-muted mt-8">
                                                    Aberto: {toDate(t.abertoEm)} às {toTime(t.abertoEm)}
                                                    {t.fechadoEm && ` · Fechado: ${toTime(t.fechadoEm)}`}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div className="text-xs text-muted">Saldo Inicial</div>
                                                    <div className="text-accent font-bold">{fmt(t.saldoInicial)}</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div className="text-xs text-muted">Entradas</div>
                                                    <div className="text-green font-bold">{fmt(t.totalEntradas || 0)}</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div className="text-xs text-muted">Saídas</div>
                                                    <div className="text-red font-bold">{fmt(t.totalSaidas || 0)}</div>
                                                </div>
                                                {t.saldoFinal !== null && t.saldoFinal !== undefined && (
                                                    <>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div className="text-xs text-muted">Saldo Final</div>
                                                            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(t.saldoFinal)}</div>
                                                        </div>
                                                        {t.diferenca !== undefined && (
                                                            <div style={{ textAlign: 'center' }}>
                                                                <div className="text-xs text-muted">Diferença</div>
                                                                <div className={`font-bold ${t.diferenca >= 0 ? 'text-green' : 'text-red'}`}>
                                                                    {t.diferenca >= 0 ? '+' : ''}{fmt(t.diferenca)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== GALERIA ===== */}
                {aba === 'notas' && (
                    <div>
                        {notas.length === 0 ? (
                            <div className="empty-state card">
                                <Image size={40} />
                                <p>Nenhuma nota fiscal anexada ainda</p>
                                <small>Anexe notas ao registrar despesas</small>
                            </div>
                        ) : (
                            <div className="nota-gallery">
                                {notas.map(t => (
                                    <div key={t.id} className="nota-gallery-item">
                                        <img
                                            src={t.nota}
                                            alt="nota"
                                            onClick={() => window.open(t.nota, '_blank')}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <div className="nota-info">
                                            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>
                                                {fmt(t.valor)}
                                            </div>
                                            <div>{t.motivo || t.descricao}</div>
                                            <div style={{ marginTop: 4 }}>{toDate(t.criadoEm)} {toTime(t.criadoEm)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
