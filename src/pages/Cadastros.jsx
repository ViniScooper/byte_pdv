import React, { useState } from 'react';
import { Package, Users, Plus, Pencil, Trash2, X, Save, Carrot, ListChecks, Settings2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../context/AppContext';

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

// ========== INGREDIENTES (NOVO) ==========
function ModalIngrediente({ ingrediente, onSave, onClose }) {
    const [form, setForm] = useState(ingrediente || { nome: '', unidade: 'kg', precoCusto: '', estoque: 0 });
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">{ingrediente ? '✏️ Editar Ingrediente' : '➕ Novo Ingrediente'}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Nome do Ingrediente *</label>
                        <input className="form-control" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Frango Desfiado" required />
                    </div>
                    <div className="form-row form-row-3">
                        <div className="form-group">
                            <label className="form-label">Unidade</label>
                            <select className="form-control" value={form.unidade} onChange={e => set('unidade', e.target.value)}>
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="un">un</option>
                                <option value="L">L</option>
                                <option value="ml">ml</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Custo / Unid</label>
                            <input className="form-control" type="number" step="0.01" value={form.precoCusto} onChange={e => set('precoCusto', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Estoque</label>
                            <input className="form-control" type="number" step="0.001" value={form.estoque} onChange={e => set('estoque', e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}><X size={14} /> Cancelar</button>
                    <button className="btn btn-primary" onClick={() => form.nome && onSave(form)} disabled={!form.nome}>
                        <Save size={14} /> Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}

function TabIngredientes() {
    const { ingredientes, addIngrediente, updateIngrediente, deleteIngrediente } = useApp();
    const [modal, setModal] = useState(null);

    const handleSave = (form) => {
        const dados = { ...form, precoCusto: parseFloat(form.precoCusto || 0), estoque: parseFloat(form.estoque || 0) };
        if (modal === 'novo') addIngrediente(dados);
        else updateIngrediente(modal.id, dados);
        setModal(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-16">
                <p className="text-sm text-muted">{ingredientes.length} ingrediente(s) cadastrado(s)</p>
                <button className="btn btn-primary btn-sm" onClick={() => setModal('novo')}>
                    <Plus size={14} /> Novo Ingrediente
                </button>
            </div>
            {ingredientes.length === 0 ? (
                <div className="empty-state"><Carrot size={40} /><p>Nenhum ingrediente cadastrado</p></div>
            ) : (
                <div className="table-wrap card">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Unidade</th>
                                <th>Custo</th>
                                <th>Estoque</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredientes.map(i => (
                                <tr key={i.id}>
                                    <td style={{ fontWeight: 500 }}>{i.nome}</td>
                                    <td><span className="badge badge-blue">{i.unidade}</span></td>
                                    <td className="text-muted">{fmt(i.precoCusto)}</td>
                                    <td>
                                        <span className={`badge ${i.estoque > 1 ? 'badge-green' : i.estoque > 0 ? 'badge-yellow' : 'badge-red'}`}>
                                            {i.estoque.toFixed(2)} {i.unidade}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-8">
                                            <button className="btn btn-ghost btn-icon" onClick={() => setModal(i)}><Pencil size={14} /></button>
                                            <button className="btn btn-ghost btn-icon" style={{ color: 'var(--red)' }} onClick={() => deleteIngrediente(i.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {modal && <ModalIngrediente ingrediente={modal === 'novo' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />}
        </div>
    );
}

// ========== FORNECEDORES ==========
function ModalFornecedor({ fornecedor, onSave, onClose }) {
    const [form, setForm] = useState(fornecedor || { nome: '', contato: '', tipoInsumo: '' });
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">{fornecedor ? '✏️ Editar Fornecedor' : '➕ Novo Fornecedor'}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Nome / Razão Social *</label>
                        <input className="form-control" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Distribuidora Silva" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Contato (WhatsApp / Tel)</label>
                        <input className="form-control" value={form.contato} onChange={e => set('contato', e.target.value)} placeholder="(11) 99999-9999" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Tipo de Insumo que Fornece</label>
                        <input className="form-control" value={form.tipoInsumo} onChange={e => set('tipoInsumo', e.target.value)} placeholder="Ex: Laticínios, Bebidas, Embalagens..." />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}><X size={14} /> Cancelar</button>
                    <button className="btn btn-primary" onClick={() => form.nome && onSave(form)} disabled={!form.nome}>
                        <Save size={14} /> Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}

function TabFornecedores() {
    const { fornecedores, addFornecedor, updateFornecedor, deleteFornecedor } = useApp();
    const [modal, setModal] = useState(null);

    const handleSave = (form) => {
        if (modal === 'novo') addFornecedor(form);
        else updateFornecedor(modal.id, form);
        setModal(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-16">
                <p className="text-sm text-muted">{fornecedores.length} fornecedor(es) cadastrado(s)</p>
                <button className="btn btn-primary btn-sm" onClick={() => setModal('novo')}>
                    <Plus size={14} /> Novo Fornecedor
                </button>
            </div>
            {fornecedores.length === 0 ? (
                <div className="empty-state"><Users size={40} /><p>Nenhum fornecedor cadastrado</p></div>
            ) : (
                <div className="table-wrap card">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Contato</th>
                                <th>Tipo de Insumo</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {fornecedores.map(f => (
                                <tr key={f.id}>
                                    <td style={{ fontWeight: 500 }}>{f.nome}</td>
                                    <td>{f.contato || '-'}</td>
                                    <td><span className="badge badge-blue">{f.tipoInsumo || 'Geral'}</span></td>
                                    <td>
                                        <div className="flex gap-8">
                                            <button className="btn btn-ghost btn-icon" onClick={() => setModal(f)}><Pencil size={14} /></button>
                                            <button className="btn btn-ghost btn-icon" style={{ color: 'var(--red)' }} onClick={() => deleteFornecedor(f.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {modal && <ModalFornecedor fornecedor={modal === 'novo' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />}
        </div>
    );
}

// ========== PRODUTOS + FICHA TECNICA ==========
function ModalProduto({ produto, onSave, onClose }) {
    const { ingredientes, gruposOpcoes } = useApp();
    const [form, setForm] = useState(produto || {
        nome: '', precoCusto: '', precoVenda: '', estoque: 0,
        categoria: '', setorProducao: '', fichaTecnica: [], gruposIds: []
    });
    const [showFicha, setShowFicha] = useState(false);
    const [showGrupos, setShowGrupos] = useState(false);

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const toggleGrupo = (id) => {
        set('gruposIds', form.gruposIds?.includes(id)
            ? form.gruposIds.filter(gid => gid !== id)
            : [...(form.gruposIds || []), id]
        );
    };

    const addInsumo = () => {
        set('fichaTecnica', [...(form.fichaTecnica || []), { ingredienteId: '', quantidade: 0 }]);
    };

    const updateInsumo = (idx, k, v) => {
        const nova = [...form.fichaTecnica];
        nova[idx] = { ...nova[idx], [k]: v };
        set('fichaTecnica', nova);
    };

    const removeInsumo = (idx) => {
        set('fichaTecnica', form.fichaTecnica.filter((_, i) => i !== idx));
    };

    const margem = form.precoCusto && form.precoVenda
        ? (((parseFloat(form.precoVenda) - parseFloat(form.precoCusto)) / parseFloat(form.precoCusto)) * 100).toFixed(1)
        : null;

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 600 }}>
                <h2 className="modal-title">{produto ? '✏️ Editar Produto' : '➕ Novo Produto'}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-row form-row-2">
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Nome do Produto *</label>
                            <input className="form-control" value={form.nome} onChange={e => set('nome', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Preço Venda *</label>
                            <input className="form-control" type="number" step="0.01" value={form.precoVenda} onChange={e => set('precoVenda', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Preço Custo</label>
                            <input className="form-control" type="number" step="0.01" value={form.precoCusto} onChange={e => set('precoCusto', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Categoria</label>
                            <input className="form-control" value={form.categoria} onChange={e => set('categoria', e.target.value)} placeholder="Ex: Tapiocas" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Setor de Produção</label>
                            <select className="form-control" value={form.setorProducao || ''} onChange={e => set('setorProducao', e.target.value)}>
                                <option value="">Nenhum (Pronta Entrega)</option>
                                <option value="Cozinha">Cozinha</option>
                                <option value="Bar">Bar / Bebidas</option>
                                <option value="Chapa">Chapa</option>
                                <option value="Fritura">Fritura</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-8">
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowFicha(!showFicha)} style={{ flex: 1 }}>
                            <ListChecks size={14} /> {showFicha ? 'Esconder Ficha' : 'Ficha Técnica'}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowGrupos(!showGrupos)} style={{ flex: 1 }}>
                            <Settings2 size={14} /> {showGrupos ? 'Esconder Opcionais' : 'Vincular Opcionais'}
                        </button>
                    </div>

                    {showGrupos && (
                        <div className="card" style={{ padding: 12, background: 'var(--bg-primary)' }}>
                            <span className="text-sm font-bold block mb-12">Grupos de Opcionais (Vincular)</span>
                            <div className="flex flex-wrap gap-8">
                                {gruposOpcoes.map(g => (
                                    <button
                                        key={g.id}
                                        className={`btn btn-sm ${form.gruposIds?.includes(g.id) ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => toggleGrupo(g.id)}
                                    >
                                        {g.nome}
                                    </button>
                                ))}
                            </div>
                            {gruposOpcoes.length === 0 && <p className="text-xs text-muted">Nenhum grupo cadastrado</p>}
                        </div>
                    )}

                    {showFicha && (
                        <div className="card" style={{ padding: 12, background: 'var(--bg-primary)' }}>
                            <div className="flex justify-between items-center mb-12">
                                <span className="text-sm font-bold">Composição (Insumos)</span>
                                <button className="btn btn-ghost btn-sm" onClick={addInsumo}><Plus size={12} /> Adicionar</button>
                            </div>
                            {form.fichaTecnica?.map((item, idx) => (
                                <div key={idx} className="flex gap-8 mb-8">
                                    <select
                                        className="form-control form-control-sm"
                                        value={item.ingredienteId}
                                        onChange={e => updateInsumo(idx, 'ingredienteId', e.target.value)}
                                        style={{ flex: 2 }}
                                    >
                                        <option value="">Selecione...</option>
                                        {ingredientes.map(i => <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>)}
                                    </select>
                                    <input
                                        className="form-control form-control-sm"
                                        type="number"
                                        placeholder="Qtd"
                                        value={item.quantidade}
                                        onChange={e => updateInsumo(idx, 'quantidade', e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <button className="btn btn-ghost btn-icon" onClick={() => removeInsumo(idx)} style={{ color: 'var(--red)' }}><Trash2 size={12} /></button>
                                </div>
                            ))}
                            {form.fichaTecnica?.length === 0 && <p className="text-xs text-muted text-center">Nenhum insumo vinculado</p>}
                        </div>
                    )}

                    {!showFicha && (
                        <div className="form-row form-row-2">
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">Estoque Inicial (Itens Prontos)</label>
                                <input className="form-control" type="number" value={form.estoque} onChange={e => set('estoque', e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}><X size={14} /> Cancelar</button>
                    <button className="btn btn-primary" onClick={() => onSave(form)} disabled={!form.nome || !form.precoVenda}>
                        <Save size={14} /> Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}

function TabProdutos() {
    const { produtos, addProduto, updateProduto, deleteProduto } = useApp();
    const [modal, setModal] = useState(null);
    const [busca, setBusca] = useState('');

    const produtosFiltrados = produtos.filter(p => (p.nome?.toLowerCase() || '').includes(busca.toLowerCase()));

    const handleSave = (form) => {
        const dados = {
            ...form,
            precoVenda: parseFloat(form.precoVenda),
            precoCusto: parseFloat(form.precoCusto || 0),
            estoque: parseFloat(form.estoque || 0)
        };
        if (modal === 'novo') addProduto(dados);
        else updateProduto(modal.id, dados);
        setModal(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-16" style={{ gap: 12 }}>
                <input className="form-control" style={{ maxWidth: 280 }} placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} />
                <button className="btn btn-primary btn-sm" onClick={() => setModal('novo')}><Plus size={14} /> Novo Produto</button>
            </div>
            {produtosFiltrados.length === 0 ? (
                <div className="empty-state"><Package size={40} /><p>Nenhum produto cadastrado</p></div>
            ) : (
                <div className="table-wrap card">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Venda</th>
                                <th>Estoque / Ficha</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {produtosFiltrados.map(p => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 500 }}>{p.nome}</td>
                                    <td><span className="badge badge-blue">{p.categoria || 'Geral'}</span></td>
                                    <td className="text-green font-bold">{fmt(p.precoVenda)}</td>
                                    <td>
                                        {p.fichaTecnica?.length > 0 ? (
                                            <span className="badge badge-purple" title="Baixa via Ficha Técnica">Ficha Técnica ({p.fichaTecnica.length})</span>
                                        ) : (
                                            <span className={`badge ${p.estoque > 5 ? 'badge-green' : 'badge-red'}`}>{p.estoque} un</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex gap-8">
                                            <button className="btn btn-ghost btn-icon" onClick={() => setModal(p)}><Pencil size={14} /></button>
                                            <button className="btn btn-ghost btn-icon" style={{ color: 'var(--red)' }} onClick={() => deleteProduto(p.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {modal && <ModalProduto produto={modal === 'novo' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />}
        </div>
    );
}

// ========== MAIN ==========
export default function Cadastros() {
    const [aba, setAba] = useState('produtos');

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Cadastros</h1>
                    <p className="page-subtitle">Gerencie ingredientes, produtos e fornecedores</p>
                </div>
            </div>
            <div className="page-body">
                <div className="tabs mb-16">
                    <button className={`tab ${aba === 'produtos' ? 'active' : ''}`} onClick={() => setAba('produtos')}>
                        <Package size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Produtos
                    </button>
                    <button className={`tab ${aba === 'ingredientes' ? 'active' : ''}`} onClick={() => setAba('ingredientes')}>
                        <Carrot size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Ingredientes
                    </button>
                    <button className={`tab ${aba === 'grupos' ? 'active' : ''}`} onClick={() => setAba('grupos')}>
                        <Settings2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Opcionais
                    </button>
                    <button className={`tab ${aba === 'fornecedores' ? 'active' : ''}`} onClick={() => setAba('fornecedores')}>
                        <Users size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Fornecedores
                    </button>
                </div>
                {aba === 'produtos' && <TabProdutos />}
                {aba === 'ingredientes' && <TabIngredientes />}
                {aba === 'grupos' && <TabGruposOpcoes />}
                {aba === 'fornecedores' && <TabFornecedores />}
            </div>
        </div>
    );
}

// ========== GRUPOS DE OPCOES ==========
function ModalGrupoOpcoes({ grupo, onSave, onClose }) {
    const { ingredientes } = useApp();
    const [form, setForm] = useState(grupo || { nome: '', opcoes: [] });

    const addOpcao = () => {
        setForm(prev => ({
            ...prev,
            opcoes: [...prev.opcoes, { id: uuidv4(), nome: '', precoExtra: 0, ingredienteId: '' }]
        }));
    };

    const updateOpcao = (id, k, v) => {
        setForm(prev => ({
            ...prev,
            opcoes: prev.opcoes.map(o => o.id === id ? { ...o, [k]: k === 'precoExtra' ? (parseFloat(v) || 0) : v } : o)
        }));
    };

    const removeOpcao = (id) => {
        setForm(prev => ({ ...prev, opcoes: prev.opcoes.filter(o => o.id !== id) }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 500 }}>
                <h2 className="modal-title">{grupo ? '✏️ Editar Grupo de Opcionais' : '➕ Novo Grupo de Opcionais'}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Nome do Grupo (ex: Escolha a Proteína) *</label>
                        <input className="form-control" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
                    </div>

                    <div className="form-row form-row-2">
                        <div className="form-group">
                            <label className="form-label">Qtd. Mínima (0 = Opcional)</label>
                            <input className="form-control" type="number" min="0" value={form.min} onChange={e => setForm({ ...form, min: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Qtd. Máxima (0 = Sem Limite)</label>
                            <input className="form-control" type="number" min="0" value={form.max} onChange={e => setForm({ ...form, max: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>

                    <div className="flex gap-8 mb-8">
                        <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setForm({ ...form, min: 1, max: 1 })}>Obrigatório (Escolha 1)</button>
                        <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setForm({ ...form, min: 0, max: 0 })}>Opcional (Livre)</button>
                    </div>

                    <div className="flex justify-between items-center mb-8">
                        <span className="text-sm font-bold">Opções</span>
                        <button className="btn btn-ghost btn-sm" onClick={addOpcao}><Plus size={12} /> Adicionar Opção</button>
                    </div>

                    <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {form.opcoes.map(opt => (
                            <div key={opt.id} className="card" style={{ padding: 12, background: 'var(--bg-primary)' }}>
                                <div className="form-row form-row-2 mb-8">
                                    <div className="form-group">
                                        <label className="text-xs text-muted">Nome da Opção</label>
                                        <input className="form-control form-control-sm" value={opt.nome} onChange={e => updateOpcao(opt.id, 'nome', e.target.value)} placeholder="Ex: Frango" />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs text-muted">Preço Extra (R$)</label>
                                        <input className="form-control form-control-sm" type="number" step="0.01" value={opt.precoExtra} onChange={e => updateOpcao(opt.id, 'precoExtra', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-row form-row-2">
                                    <div className="form-group">
                                        <label className="text-xs text-muted">Vincular Ingrediente (Opcional)</label>
                                        <select className="form-control form-control-sm" value={opt.ingredienteId} onChange={e => updateOpcao(opt.id, 'ingredienteId', e.target.value)}>
                                            <option value="">Nenhum...</option>
                                            {ingredientes.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs text-muted">Qtd p/ Porção</label>
                                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                            <input
                                                className="form-control form-control-sm"
                                                type="number"
                                                step="0.001"
                                                value={opt.quantidade || ''}
                                                onChange={e => updateOpcao(opt.id, 'quantidade', parseFloat(e.target.value))}
                                                placeholder="Ex: 50"
                                            />
                                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeOpcao(opt.id)} style={{ color: 'var(--red)' }}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={() => form.nome && onSave(form)} disabled={!form.nome}>Salvar</button>
                </div>
            </div>
        </div>
    );
}

function TabGruposOpcoes() {
    const { gruposOpcoes, addGrupoOpcoes, updateGrupoOpcoes, deleteGrupoOpcoes } = useApp();
    const [modal, setModal] = useState(null);

    const handleSave = (form) => {
        // Garantir que precoExtra de todas opções são Float
        const formSanitizado = {
            ...form,
            opcoes: form.opcoes.map(o => ({ ...o, precoExtra: parseFloat(o.precoExtra) || 0 }))
        };
        if (modal === 'novo') addGrupoOpcoes(formSanitizado);
        else updateGrupoOpcoes(modal.id, formSanitizado);
        setModal(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-16">
                <p className="text-sm text-muted">{gruposOpcoes.length} grupo(s) de opcionais</p>
                <button className="btn btn-primary btn-sm" onClick={() => setModal('novo')}><Plus size={14} /> Novo Grupo</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {gruposOpcoes.map(g => (
                    <div key={g.id} className="card" style={{ padding: 16 }}>
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h3 className="font-bold">{g.nome}</h3>
                                <p className="text-xs text-muted">{g.opcoes.length} opções cadastradas</p>
                            </div>
                            <div className="flex gap-4">
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(g)}><Pencil size={12} /></button>
                                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--red)' }} onClick={() => deleteGrupoOpcoes(g.id)}><Trash2 size={12} /></button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {g.opcoes.slice(0, 4).map(o => (
                                <span key={o.id} className="badge badge-blue text-xs">{o.nome}</span>
                            ))}
                            {g.opcoes.length > 4 && <span className="text-xs text-muted">+{g.opcoes.length - 4}</span>}
                        </div>
                    </div>
                ))}
            </div>
            {modal && <ModalGrupoOpcoes grupo={modal === 'novo' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />}
        </div>
    );
}
