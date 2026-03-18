import React, { useState, useRef } from 'react';
import { TrendingDown, Paperclip, CheckCircle, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

const MOTIVOS = [
    'Compra de insumos',
    'Pagamento de fornecedor',
    'Pagamento de conta (luz, água, internet)',
    'Sangria / Retirada de lucro',
    'Despesa operacional',
    'Outros',
];

export default function Despesas() {
    const { addDespesa, fornecedores, produtos, turnoAtual } = useApp();
    const fileRef = useRef(null);

    const [form, setForm] = useState({
        valor: '',
        fornecedorId: '',
        motivo: '',
        descricao: '',
        produtoId: '',
        ingredienteId: '',
        tipoEntrada: 'produto',
        quantidadeEntrada: '',
        nota: null,
    });
    const [sucesso, setSucesso] = useState(false);

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => set('nota', reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.valor || !form.motivo) return;

        addDespesa({
            valor: form.valor,
            fornecedorId: form.fornecedorId || null,
            motivo: form.motivo,
            produtoId: form.produtoId || null,
            quantidadeEntrada: form.quantidadeEntrada || 0,
            nota: form.nota,
            descricao: `${form.motivo}${form.descricao ? ': ' + form.descricao : ''}`,
        });

        setForm({ valor: '', fornecedorId: '', motivo: '', descricao: '', produtoId: '', quantidadeEntrada: '', nota: null });
        if (fileRef.current) fileRef.current.value = '';
        setSucesso(true);
        setTimeout(() => setSucesso(false), 2500);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Pagamentos e Despesas</h1>
                <p className="page-subtitle">Registre todas as saídas de caixa</p>
            </div>

            <div className="page-body" style={{ maxWidth: 680 }}>
                {!turnoAtual && (
                    <div className="card" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 20, padding: 16 }}>
                        <p style={{ color: 'var(--red)', fontWeight: 500 }}>⚠️ O caixa está fechado. Abra um turno no Dashboard primeiro.</p>
                    </div>
                )}

                {sucesso && (
                    <div className="card" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)', marginBottom: 20, padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckCircle size={20} color="var(--green)" />
                        <p style={{ color: 'var(--green)', fontWeight: 500 }}>Despesa registrada com sucesso!</p>
                    </div>
                )}

                <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <TrendingDown size={20} color="var(--red)" />
                        <h3 style={{ fontSize: 15, fontWeight: 600 }}>Nova Saída</h3>
                    </div>

                    <div className="form-row form-row-2">
                        <div className="form-group">
                            <label className="form-label">Valor *</label>
                            <input
                                className="form-control"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="0,00"
                                value={form.valor}
                                onChange={e => set('valor', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fornecedor (opcional)</label>
                            <select className="form-control" value={form.fornecedorId} onChange={e => set('fornecedorId', e.target.value)}>
                                <option value="">Nenhum</option>
                                {fornecedores.map(f => (
                                    <option key={f.id} value={f.id}>{f.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Motivo *</label>
                        <select className="form-control" value={form.motivo} onChange={e => set('motivo', e.target.value)} required>
                            <option value="">Selecione um motivo</option>
                            {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descrição Detalhada</label>
                        <input
                            className="form-control"
                            placeholder="Ex: 10kg de farinha de trigo"
                            value={form.descricao}
                            onChange={e => set('descricao', e.target.value)}
                        />
                    </div>

                    {/* Entrada de estoque */}
                    <div className="card" style={{ padding: 16, background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                        <p className="text-sm font-medium" style={{ marginBottom: 12 }}>📦 Atualizar Estoque (opcional)</p>
                        <div className="form-group mb-12">
                            <label className="form-label">Tipo de Entrada</label>
                            <div className="flex gap-8">
                                <button type="button" className={`btn btn-sm ${form.tipoEntrada !== 'ingrediente' ? 'btn-primary' : 'btn-outline'}`} onClick={() => set('tipoEntrada', 'produto')}>Produto Pronto</button>
                                <button type="button" className={`btn btn-sm ${form.tipoEntrada === 'ingrediente' ? 'btn-primary' : 'btn-outline'}`} onClick={() => set('tipoEntrada', 'ingrediente')}>Ingrediente (Insumo)</button>
                            </div>
                        </div>
                        <div className="form-row form-row-2">
                            <div className="form-group">
                                <label className="form-label">{form.tipoEntrada === 'ingrediente' ? 'Ingrediente' : 'Produto'}</label>
                                {form.tipoEntrada === 'ingrediente' ? (
                                    <select className="form-control" value={form.ingredienteId} onChange={e => set('ingredienteId', e.target.value)}>
                                        <option value="">Selecione...</option>
                                        {useApp().ingredientes.map(i => (
                                            <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>
                                        ))}
                                    </select>
                                ) : (
                                    <select className="form-control" value={form.produtoId} onChange={e => set('produtoId', e.target.value)}>
                                        <option value="">Selecione...</option>
                                        {useApp().produtos.map(p => (
                                            <option key={p.id} value={p.id}>{p.nome}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Qtd. Adicionada</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    step="0.001"
                                    placeholder="0"
                                    value={form.quantidadeEntrada}
                                    onChange={e => set('quantidadeEntrada', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Anexo */}
                    <div className="form-group">
                        <label className="form-label"><Paperclip size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />Nota Fiscal / Comprovante</label>
                        <div
                            className="attach-zone"
                            onClick={() => fileRef.current?.click()}
                        >
                            {form.nota ? (
                                <>
                                    <img src={form.nota} alt="nota" style={{ maxHeight: 180, borderRadius: 8, objectFit: 'contain' }} />
                                    <p style={{ marginTop: 8, fontSize: 12, color: 'var(--green)' }}>✓ Nota anexada</p>
                                </>
                            ) : (
                                <>
                                    <Upload size={24} style={{ marginBottom: 8 }} />
                                    <p>Clique para anexar foto da nota fiscal</p>
                                    <small style={{ fontSize: 11 }}>JPG, PNG, WEBP</small>
                                </>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-danger btn-full btn-lg"
                        disabled={!turnoAtual || !form.valor || !form.motivo}
                    >
                        <TrendingDown size={18} /> Registrar Saída de {fmt(form.valor)}
                    </button>
                </form>
            </div>
        </div>
    );
}
