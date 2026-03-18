import React, { useState, useMemo } from 'react';
import { Plus, Minus, Trash2, CheckCircle, Settings2, Sparkles, X, Search, ShoppingCart, Printer } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../context/AppContext';
import Impressao from '../components/Impressao';

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

const PAGAMENTOS = ['Dinheiro', 'Pix', 'Crédito', 'Débito'];

export default function PDV() {
    const { produtos, addVenda, turnoAtual, mesas, abrirMesa, adicionarItensMesa, fecharMesa } = useApp();
    const [busca, setBusca] = useState('');
    const [carrinho, setCarrinho] = useState([]);
    const [metodo, setMetodo] = useState('');
    const [sucesso, setSucesso] = useState(false);
    const [modalConfig, setModalConfig] = useState(null);
    const [printData, setPrintData] = useState(null); // Estado para controle de impressão
    const [imprimirCozinha, setImprimirCozinha] = useState(true); // Estado para imprimir ou não vias da cozinha

    // Mesas State
    const [modoMesas, setModoMesas] = useState(false);
    const [mesaAtivaId, setMesaAtivaId] = useState(null);
    const [novaMesaTexto, setNovaMesaTexto] = useState('');

    const mesaAtiva = useMemo(() => mesas.find(m => m.id === mesaAtivaId), [mesas, mesaAtivaId]);

    const produtosFiltrados = useMemo(() =>
        produtos.filter(p =>
            (p.nome?.toLowerCase() || '').includes(busca.toLowerCase()) && p.precoVenda > 0
        ),
        [produtos, busca]
    );

    const abrirConfiguracao = (produto) => {
        if (produto.estoque <= 0 && (!produto.fichaTecnica || produto.fichaTecnica.length === 0)) {
            alert(`⚠️ O produto "${produto.nome}" não pode ser vendido!\n\nEle está com ESTOQUE ZERADO e não possui Ficha Técnica.\nVá na aba 'Cadastros' e adicione estoque para poder vender.`);
            return;
        }

        // Se o produto tiver grupos de opções ou ficha técnica, abre o modal
        if ((produto.gruposIds && produto.gruposIds.length > 0) || (produto.fichaTecnica && produto.fichaTecnica.length > 0)) {
            setModalConfig({ ...produto, opcoesSelecionadas: [], ingredientesAlterados: [] });
        } else {
            adicionarAoCarrinho(produto);
        }
    };

    const adicionarAoCarrinho = (produto, opcoes = [], ingredientesAlterados = []) => {
        const itemCarrinho = {
            ...produto,
            idCarrinho: uuidv4(), // ID único para o item no carrinho
            opcoesSelecionadas: opcoes,
            ingredientesAlterados,
            precoTotal: parseFloat(produto.precoVenda || 0) + opcoes.reduce((s, o) => s + (parseFloat(o.precoExtra) || 0), 0),
            quantidade: 1
        };

        setCarrinho(prev => [...prev, itemCarrinho]);
        setModalConfig(null);
    };

    const alterarQtd = (idCarrinho, delta) => {
        setCarrinho(prev => {
            const item = prev.find(i => i.idCarrinho === idCarrinho);
            const novaQtd = item.quantidade + delta;
            if (novaQtd <= 0) return prev.filter(i => i.idCarrinho !== idCarrinho);
            return prev.map(i => i.idCarrinho === idCarrinho ? { ...i, quantidade: novaQtd } : i);
        });
    };

    const removerItem = (idCarrinho) => setCarrinho(prev => prev.filter(i => i.idCarrinho !== idCarrinho));
    const limparCarrinho = () => { setCarrinho([]); setMetodo(''); };

    const totalCarrinho = carrinho.reduce((s, i) => s + (parseFloat(i.precoTotal) || 0) * parseInt(i.quantidade || 1), 0);
    const totalMesa = mesaAtiva ? mesaAtiva.itens.reduce((s, i) => s + (parseFloat(i.precoTotal) || parseFloat(i.precoVenda) || 0) * parseInt(i.quantidade || 1), 0) : 0;
    const totalGeral = totalMesa + totalCarrinho;

    // Trigger de impressão
    React.useEffect(() => {
        if (printData && printData.length > 0) {
            setTimeout(() => {
                window.print();
                setPrintData(null); // Reseta após tentar imprimir
            }, 300);
        }
    }, [printData]);

    const finalizar = () => {
        if (!turnoAtual || !metodo) return;

        if (mesaAtiva) {
            const jobs = [];

            // Se está numa mesa e tem itens no carrinho, deveria "Lançar" primeiro, mas se clicou no verde é pra cobrar tudo.
            if (carrinho.length > 0) {
                adicionarItensMesa(mesaAtiva.id, carrinho);
                if (imprimirCozinha) {
                    jobs.push({ dados: { itens: carrinho, mesaIdentificacao: mesaAtiva.identificacao }, tipo: 'cozinha' });
                }
            }
            const tx = fecharMesa(mesaAtiva.id, metodo);
            
            if (imprimirCozinha) {
                jobs.push({ dados: tx, tipo: 'cliente' });
                if (jobs.length > 0) setPrintData(jobs);
            }

            setMesaAtivaId(null);
            setModoMesas(true);
        } else {
            if (carrinho.length === 0) return;
            const tx = addVenda(carrinho, metodo);
            
            if (imprimirCozinha) {
                const jobs = [
                    { dados: { itens: carrinho, mesaIdentificacao: false }, tipo: 'cozinha' },
                    { dados: tx, tipo: 'cliente' }
                ];
                setPrintData(jobs);
            }
        }

        limparCarrinho();
        setSucesso(true);
        setTimeout(() => setSucesso(false), 2500);
    };

    const handleLancarNaMesa = () => {
        if (!mesaAtiva || carrinho.length === 0) return;
        adicionarItensMesa(mesaAtiva.id, carrinho);

        // Imprimir comanda de produção pra cozinha
        setPrintData([{
            dados: { itens: carrinho, mesaIdentificacao: mesaAtiva.identificacao },
            tipo: 'cozinha'
        }]);

        setCarrinho([]);
        setSucesso(true);
        setTimeout(() => setSucesso(false), 2000);
    };

    const handleAbrirMesa = () => {
        if (!novaMesaTexto) return;
        const m = abrirMesa(novaMesaTexto);
        setNovaMesaTexto('');
        setMesaAtivaId(m.id);
        setModoMesas(false); // Volta pros produtos para já bipar
    };

    // Dicas inteligentes
    const dicas = useMemo(() => {
        const lista = [];
        if (carrinho.some(i => i.categoria?.toLowerCase()?.includes('tapioca'))) {
            lista.push("Sugerir Suco Natural para acompanhar a Tapioca? 🥤");
        }
        if (totalCarrinho > 50) {
            lista.push("Oferecer sobremesa com 10% de desconto? 🍰");
        }
        return lista;
    }, [carrinho, totalCarrinho]);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Ponto de Venda</h1>
                <p className="page-subtitle">Selecione os produtos e finalize a venda</p>
            </div>

            <div className="page-body">
                {!turnoAtual && (
                    <div className="card" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 20, padding: 16 }}>
                        <p style={{ color: 'var(--red)', fontWeight: 500 }}>⚠️ O caixa está fechado. Abra um turno no Dashboard para registrar vendas.</p>
                    </div>
                )}

                {sucesso && (
                    <div className="card" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)', marginBottom: 20, padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckCircle size={20} color="var(--green)" />
                        <p style={{ color: 'var(--green)', fontWeight: 500 }}>Venda registrada com sucesso!</p>
                    </div>
                )}

                <div className="pdv-layout">
                    {/* Painel Esquerdo: Produtos ou Mesas */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>

                        <div className="tabs" style={{ marginBottom: 0 }}>
                            <button className={`tab ${!modoMesas ? 'active' : ''}`} onClick={() => setModoMesas(false)}>🍞 Produtos</button>
                            <button className={`tab ${modoMesas ? 'active' : ''}`} onClick={() => setModoMesas(true)}>🍽️ Mesas / Comandas</button>
                        </div>

                        {!modoMesas ? (
                            <>
                                <div className="search-bar">
                                    <Search size={16} />
                                    <input
                                        className="form-control"
                                        placeholder="Buscar produto..."
                                        value={busca}
                                        onChange={e => setBusca(e.target.value)}
                                    />
                                </div>

                                {produtosFiltrados.length === 0 ? (
                                    <div className="empty-state">
                                        <ShoppingCart size={40} />
                                        <p>Nenhum produto encontrado</p>
                                        <small>Cadastre produtos na aba Cadastros</small>
                                    </div>
                                ) : (
                                    <div className="produtos-grid">
                                        {produtosFiltrados.map(produto => (
                                            <div
                                                key={produto.id}
                                                className={`produto-card ${produto.estoque <= 0 && (!produto.fichaTecnica || produto.fichaTecnica.length === 0) ? 'sem-estoque' : ''}`}
                                                onClick={() => abrirConfiguracao(produto)}
                                            >
                                                <div className="produto-card-nome">{produto.nome}</div>
                                                <div className="produto-card-preco">{fmt(produto.precoVenda)}</div>
                                                <div className="produto-card-estoque">
                                                    {produto.fichaTecnica?.length > 0
                                                        ? 'Feito na hora 👩‍🍳'
                                                        : (produto.estoque > 0 ? `${produto.estoque} em estoque` : 'Sem estoque')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="card" style={{ padding: 16, display: 'flex', gap: 8 }}>
                                    <input
                                        className="form-control"
                                        placeholder="Ex: Mesa 12, Comanda 45"
                                        value={novaMesaTexto}
                                        onChange={e => setNovaMesaTexto(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAbrirMesa()}
                                    />
                                    <button className="btn btn-primary" onClick={handleAbrirMesa}>Abrir Mesa</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    {mesas.map(m => (
                                        <div
                                            key={m.id}
                                            className="card"
                                            style={{ padding: 16, cursor: 'pointer', border: mesaAtivaId === m.id ? '2px solid var(--primary)' : '1px solid var(--border)' }}
                                            onClick={() => { setMesaAtivaId(m.id); setModoMesas(false); }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <h3 style={{ margin: 0 }}>🍽️ {m.identificacao}</h3>
                                                <span className="badge badge-yellow text-xs">{m.itens.length} itens</span>
                                            </div>
                                            <div className="text-green font-bold">{fmt(m.itens.reduce((s, i) => s + (i.precoTotal || i.precoVenda) * i.quantidade, 0))}</div>
                                        </div>
                                    ))}
                                    {mesas.length === 0 && <p className="text-muted text-sm">Nenhuma mesa ativa no momento.</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Carrinho */}
                    <div className="cart-panel">
                        <div className="cart-header">
                            <h3>{mesaAtiva ? `🧾 Comanda: ${mesaAtiva.identificacao}` : '🛒 Carrinho'}</h3>
                            <div className="flex gap-8">
                                {carrinho.length > 0 && (
                                    <button className="btn btn-ghost btn-sm" onClick={limparCarrinho}>
                                        <Trash2 size={14} /> Limpar
                                    </button>
                                )}
                                {mesaAtiva && (
                                    <button className="btn btn-ghost btn-sm" onClick={() => setMesaAtivaId(null)}>
                                        <X size={14} /> Fechar
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="cart-items">
                            {/* Itens já lançados na mesa */}
                            {mesaAtiva && mesaAtiva.itens.map((item, idx) => (
                                <div key={idx} className="cart-item" style={{ opacity: 0.7, borderLeft: '3px solid var(--accent)' }}>
                                    <div className="cart-item-info">
                                        <div className="cart-item-nome">{item.nome} <span className="text-xs badge badge-blue">Lançado</span></div>
                                        {item.opcoesSelecionadas?.length > 0 && (
                                            <div className="text-xs text-muted">
                                                + {item.opcoesSelecionadas.map(o => o.nome).join(', ')}
                                            </div>
                                        )}
                                        {item.ingredientesAlterados?.map(alt => (
                                            <div key={alt.ingredienteId} className="text-xs font-bold" style={{ color: alt.status === 'sem' ? 'var(--red)' : 'var(--green)' }}>
                                                {alt.status === 'sem' ? '- Sem' : '+ Extra'} {alt.nome}
                                            </div>
                                        ))}
                                        <div className="cart-item-preco">
                                            {fmt(item.precoTotal || item.precoVenda)} × {item.quantidade} = <strong style={{ color: 'var(--green)' }}>{fmt((item.precoTotal || item.precoVenda) * item.quantidade)}</strong>
                                        </div>
                                    </div>
                                    <div className="cart-qty">
                                        <span style={{ minWidth: 20, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{item.quantidade}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Novos Itens no Carrinho (Não lançados) */}
                            {carrinho.length === 0 && (!mesaAtiva || mesaAtiva.itens.length === 0) ? (
                                <div className="empty-state" style={{ padding: 32 }}>
                                    <ShoppingCart size={32} />
                                    <p>{mesaAtiva ? 'Nenhum item adicionado' : 'Carrinho vazio'}</p>
                                </div>
                            ) : (
                                carrinho.map(item => (
                                    <div key={item.idCarrinho} className="cart-item" style={{ borderLeft: mesaAtiva ? '3px solid var(--primary)' : 'none' }}>
                                        <div className="cart-item-info">
                                            <div className="cart-item-nome">{item.nome} {mesaAtiva && <span className="text-xs badge badge-green">Novo</span>}</div>
                                            {item.opcoesSelecionadas?.length > 0 && (
                                                <div className="text-xs text-muted">
                                                    + {item.opcoesSelecionadas.map(o => o.nome).join(', ')}
                                                </div>
                                            )}
                                            {item.ingredientesAlterados?.map(alt => (
                                                <div key={alt.ingredienteId} className="text-xs font-bold" style={{ color: alt.status === 'sem' ? 'var(--red)' : 'var(--green)' }}>
                                                    {alt.status === 'sem' ? '- Sem' : '+ Extra'} {alt.nome}
                                                </div>
                                            ))}
                                            <div className="cart-item-preco">
                                                {fmt(item.precoTotal)} × {item.quantidade} = <strong style={{ color: 'var(--green)' }}>{fmt(item.precoTotal * item.quantidade)}</strong>
                                            </div>
                                        </div>
                                        <div className="cart-qty">
                                            <button className="qty-btn" onClick={() => alterarQtd(item.idCarrinho, -1)}><Minus size={10} /></button>
                                            <span style={{ minWidth: 20, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{item.quantidade}</span>
                                            <button className="qty-btn" onClick={() => alterarQtd(item.idCarrinho, 1)}><Plus size={10} /></button>
                                            <button className="qty-btn" onClick={() => removerItem(item.idCarrinho)} style={{ marginLeft: 2 }}>
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="cart-footer">
                            {dicas.length > 0 && (
                                <div className="card" style={{ padding: 10, marginBottom: 16, background: 'var(--accent-glow)', border: '1px dashed var(--accent)', display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <Sparkles size={16} color="var(--accent)" />
                                    <div style={{ flex: 1 }}>
                                        <div className="text-xs font-bold" style={{ color: 'var(--accent)', textTransform: 'uppercase' }}>Dica do Chefe</div>
                                        <div className="text-sm">{dicas[0]}</div>
                                    </div>
                                </div>
                            )}

                            <div className="cart-total">
                                <span>Total a Pagar</span>
                                <strong>{fmt(totalGeral)}</strong>
                            </div>

                            <div style={{ marginBottom: 8 }}>
                                <div className="form-label" style={{ marginBottom: 6 }}>Forma de Pagamento</div>
                                <div className="payment-methods">
                                    {PAGAMENTOS.map(p => (
                                        <button
                                            key={p}
                                            className={`payment-btn ${metodo === p ? 'selected' : ''}`}
                                            onClick={() => setMetodo(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Printer size={18} color="var(--text-muted)" />
                                    <span style={{ fontSize: 14, fontWeight: 500 }}>Imprimir via da Cozinha</span>
                                </div>
                                <label className="flex items-center" style={{ cursor: 'pointer' }}>
                                    <div style={{
                                        width: 44, height: 24, background: imprimirCozinha ? 'var(--green)' : 'var(--muted)',
                                        borderRadius: 24, position: 'relative', transition: '0.3s'
                                    }}>
                                        <div style={{
                                            width: 20, height: 20, background: '#fff', borderRadius: '50%',
                                            position: 'absolute', top: 2, left: imprimirCozinha ? 22 : 2, transition: '0.3s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        style={{ display: 'none' }} 
                                        checked={imprimirCozinha} 
                                        onChange={(e) => setImprimirCozinha(e.target.checked)} 
                                    />
                                </label>
                            </div>

                            {mesaAtiva && carrinho.length > 0 ? (
                                <button
                                    className="btn btn-primary btn-full btn-lg"
                                    onClick={handleLancarNaMesa}
                                    style={{ marginBottom: 8 }}
                                >
                                    <Plus size={18} />
                                    Lançar Itens na Mesa
                                </button>
                            ) : null}

                            <button
                                className={`btn ${mesaAtiva ? 'btn-success' : 'btn-success'} btn-full btn-lg`}
                                onClick={finalizar}
                                disabled={!turnoAtual || (!mesaAtiva && carrinho.length === 0) || (mesaAtiva && totalGeral === 0) || !metodo}
                            >
                                <CheckCircle size={18} />
                                Finalizar Venda
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {modalConfig && (
                <ModalCustomizar
                    produto={modalConfig}
                    onConfirm={adicionarAoCarrinho}
                    onClose={() => setModalConfig(null)}
                />
            )}

            {/* Invisível na tela, visível apenas na impressão (@media print) */}
            {printData && (
                <Impressao jobs={printData} />
            )}
        </div>
    );
}

function ModalCustomizar({ produto, onConfirm, onClose }) {
    const { gruposOpcoes, ingredientes } = useApp();
    const [selecionadas, setSelecionadas] = useState([]);
    const [ingredientesAlterados, setIngredientesAlterados] = useState([]);

    const gruposDoProduto = gruposOpcoes.filter(g => produto.gruposIds?.includes(g.id));

    const toggleIngredienteFicha = (ingred, status) => {
        setIngredientesAlterados(prev => {
            const existe = prev.find(i => i.ingredienteId === ingred.id);
            if (existe && existe.status === status) {
                return prev.filter(i => i.ingredienteId !== ingred.id); // volta pro padrão
            }
            return [...prev.filter(i => i.ingredienteId !== ingred.id), { ingredienteId: ingred.id, nome: ingred.nome, status }];
        });
    };

    const handleAdd = (grupo, opt) => {
        const noGrupo = selecionadas.filter(o => grupo.opcoes.some(go => go.id === o.id));
        const max = parseInt(grupo.max) || 0;

        // Regra de Máximo
        if (max === 1) {
            // Comportamento de Radio: remove outros do mesmo grupo e adiciona este
            setSelecionadas(prev => [
                ...prev.filter(o => !grupo.opcoes.some(go => go.id === o.id)),
                opt
            ]);
        } else if (max > 0 && noGrupo.length >= max) {
            // Apenas ignora se já atingiu o máximo
            return;
        } else {
            // Permite adicionar repetidos (ex: 2 carnes)
            setSelecionadas(prev => [...prev, { ...opt, _uid: uuidv4() }]); // uid unico pra permitir o mesmo item 2x
        }
    };

    const handleRemove = (optId) => {
        // Remove apenas a última instância deste ID (pra não remover 2 carnes de uma vez)
        setSelecionadas(prev => {
            const index = prev.map(p => p.id).lastIndexOf(optId);
            if (index === -1) return prev;
            const newArr = [...prev];
            newArr.splice(index, 1);
            return newArr;
        });
    };

    const isValido = () => {
        return gruposDoProduto.every(grupo => {
            const noGrupo = selecionadas.filter(o => grupo.opcoes.some(go => go.id === o.id));
            return noGrupo.length >= (grupo.min || 0);
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 450 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 className="modal-title" style={{ margin: 0 }}>🥙 {produto.nome}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
                    {/* Ingredientes Básicos (Ficha Técnica) */}
                    {produto.fichaTecnica && produto.fichaTecnica.length > 0 && (
                        <div>
                            <div className="flex justify-between items-end mb-8">
                                <label className="form-label" style={{ marginBottom: 0 }}>Ingredientes Padrão</label>
                                <span className="text-xs text-muted">Adicione ou Remova</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                                {produto.fichaTecnica.map(itemFT => {
                                    const ingred = ingredientes.find(i => i.id === itemFT.ingredienteId);
                                    if (!ingred) return null;
                                    const alteracao = ingredientesAlterados.find(a => a.ingredienteId === ingred.id);
                                    const status = alteracao ? alteracao.status : 'padrao';

                                    return (
                                        <div key={ingred.id} className="card" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: status === 'sem' ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-primary)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: 13, textDecoration: status === 'sem' ? 'line-through' : 'none', opacity: status === 'sem' ? 0.6 : 1, fontWeight: 500 }}>
                                                    {ingred.nome}
                                                </span>
                                                <span className="text-xs text-muted">Estoque: {ingred.estoque} {ingred.unidade}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 2, borderRadius: 6 }}>
                                                <button className={`btn btn-sm ${status === 'sem' ? 'btn-danger' : 'btn-ghost'}`} onClick={() => toggleIngredienteFicha(ingred, 'sem')} style={{ padding: '4px 8px', fontSize: 11 }}>Sem</button>
                                                <button className={`btn btn-sm ${status === 'padrao' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setIngredientesAlterados(prev => prev.filter(a => a.ingredienteId !== ingred.id))} style={{ padding: '4px 8px', fontSize: 11 }}>Padrão</button>
                                                <button className={`btn btn-sm ${status === 'extra' ? 'btn-success' : 'btn-ghost'}`} onClick={() => toggleIngredienteFicha(ingred, 'extra')} style={{ padding: '4px 8px', fontSize: 11 }}>Extra</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Modificadores Opcionais (Grupos) */}
                    {gruposDoProduto.map(grupo => {
                        const noGrupo = selecionadas.filter(o => grupo.opcoes.some(go => go.id === o.id));
                        const falta = Math.max(0, (grupo.min || 0) - noGrupo.length);

                        return (
                            <div key={grupo.id}>
                                <div className="flex justify-between items-end mb-8">
                                    <label className="form-label" style={{ marginBottom: 0 }}>
                                        {grupo.nome}
                                        {grupo.min > 0 && <span style={{ color: 'var(--red)', marginLeft: 4 }}>*</span>}
                                    </label>
                                    <span className="text-xs text-muted">
                                        {parseInt(grupo.max) > 0
                                            ? (noGrupo.length >= parseInt(grupo.max) ? '✓ Pronto' : (grupo.min > 0 && falta > 0 ? `Falta ${falta} (Máx: ${grupo.max})` : `Pode +${parseInt(grupo.max) - noGrupo.length} (Máx: ${grupo.max})`))
                                            : (grupo.min > 0 && falta > 0 ? `Escolha mín. ${falta}` : 'Opcional (Sem Limite)')}
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                                    {grupo.opcoes.map(opt => {
                                        const selecionadosDesseOpt = selecionadas.filter(o => o.id === opt.id).length;
                                        const ingredOpt = opt.ingredienteId ? ingredientes.find(i => i.id === opt.ingredienteId) : null;

                                        if (parseInt(grupo.max) === 1) {
                                            // Layout Checkbox/Radio para max = 1 (Novo Design Card)
                                            const qtdNecessaria = parseFloat(opt.quantidade) || 1;
                                            const porcoesDisponiveis = ingredOpt ? Math.floor(ingredOpt.estoque / qtdNecessaria) : 999;
                                            const semEstoque = ingredOpt && porcoesDisponiveis <= 0;

                                            return (
                                                <div
                                                    key={opt.id}
                                                    className="card"
                                                    style={{
                                                        padding: '12px 16px',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        cursor: semEstoque ? 'not-allowed' : 'pointer',
                                                        border: selecionadosDesseOpt > 0 ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                        background: selecionadosDesseOpt > 0 ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                                                        opacity: semEstoque ? 0.5 : 1
                                                    }}
                                                    onClick={() => !semEstoque && handleAdd(grupo, opt)}
                                                >
                                                    <div style={{ textAlign: 'left' }}>
                                                        <div style={{ fontWeight: 600 }}>{opt.nome}</div>
                                                        {ingredOpt && (
                                                            <div className="text-xs" style={{ color: semEstoque ? 'var(--red)' : 'var(--text-muted)' }}>
                                                                {semEstoque ? 'Esgotado' : `Estoque: ${porcoesDisponiveis} porção(ões)`}
                                                                <span className="text-muted" style={{ marginLeft: 4, opacity: 0.6 }}>({ingredOpt.estoque} {ingredOpt.unidade})</span>
                                                            </div>
                                                        )}
                                                        {opt.precoExtra > 0 && <div className="text-xs text-muted">+{fmt(opt.precoExtra)}</div>}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <div style={{
                                                            width: 20,
                                                            height: 20,
                                                            border: selecionadosDesseOpt > 0 ? '6px solid var(--primary)' : '2px solid var(--muted)',
                                                            borderRadius: '50%',
                                                            background: 'transparent',
                                                            transition: 'all 0.2s',
                                                            opacity: selecionadosDesseOpt > 0 ? 1 : 0.6
                                                        }} />
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Layout de Incremento (+ / -) para múltiplos
                                        const qtdNecessaria = parseFloat(opt.quantidade) || 1;

                                        // Cálculo de estoque dinâmico (Estoque total - o que já foi selecionado agora)
                                        const selecionadosAgora = selecionadas.filter(o => o.id === opt.id).length;
                                        const estoqueRestanteBruto = ingredOpt ? (ingredOpt.estoque - (selecionadosAgora * qtdNecessaria)) : 999;
                                        const porcoesRestantes = Math.floor(estoqueRestanteBruto / qtdNecessaria);

                                        const maxAtingido = parseInt(grupo.max) > 0 && noGrupo.length >= parseInt(grupo.max);
                                        const semEstoque = ingredOpt && porcoesRestantes <= 0;

                                        return (
                                            <div
                                                key={opt.id}
                                                className="card"
                                                style={{
                                                    padding: '12px 16px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    opacity: (semEstoque && selecionadosDesseOpt === 0) ? 0.5 : 1,
                                                    border: selecionadosDesseOpt > 0 ? '1px solid var(--primary)' : '1px solid var(--border)',
                                                    background: selecionadosDesseOpt > 0 ? 'var(--bg-secondary)' : 'var(--bg-primary)'
                                                }}
                                            >
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontWeight: 600, color: selecionadosDesseOpt > 0 ? 'var(--primary)' : 'inherit' }}>{opt.nome}</div>
                                                    {ingredOpt && (
                                                        <div className="text-xs" style={{ color: semEstoque ? 'var(--red)' : (selecionadosDesseOpt > 0 ? 'var(--green)' : 'var(--text-muted)') }}>
                                                            {semEstoque
                                                                ? (selecionadosDesseOpt > 0 ? '✓ Limite do estoque atingido' : 'Esgotado')
                                                                : `Restam: ${porcoesRestantes} porção(ões)`
                                                            }
                                                            <span className="text-muted" style={{ marginLeft: 4, opacity: 0.6 }}>({ingredOpt.estoque} {ingredOpt.unidade} total)</span>
                                                        </div>
                                                    )}
                                                    {opt.precoExtra > 0 && <div className="text-xs text-muted">+{fmt(opt.precoExtra)}</div>}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    {selecionadosDesseOpt > 0 && (
                                                        <button
                                                            className="btn btn-ghost btn-sm btn-icon"
                                                            onClick={() => handleRemove(opt.id)}
                                                            style={{ padding: 4, width: 28, height: 28, border: '1px solid var(--border)' }}
                                                        >
                                                            -
                                                        </button>
                                                    )}
                                                    {selecionadosDesseOpt > 0 && <span style={{ fontWeight: 'bold', minWidth: 20, textAlign: 'center', fontSize: 16 }}>{selecionadosDesseOpt}</span>}
                                                    <button
                                                        className="btn btn-primary btn-sm btn-icon"
                                                        onClick={() => !maxAtingido && !semEstoque && handleAdd(grupo, opt)}
                                                        disabled={maxAtingido || semEstoque}
                                                        style={{
                                                            padding: 4,
                                                            width: 32,
                                                            height: 32,
                                                            opacity: (maxAtingido || semEstoque) ? 0.3 : 1,
                                                            cursor: (maxAtingido || semEstoque) ? 'not-allowed' : 'pointer',
                                                            boxShadow: selecionadosDesseOpt > 0 ? '0 0 10px var(--primary-glow)' : 'none'
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    {gruposDoProduto.length === 0 && <p className="text-center text-muted">Nenhuma opção disponível</p>}
                </div>

                <div className="modal-footer" style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                        <div className="text-xs text-muted">Total do Item</div>
                        <div className="font-bold text-green" style={{ fontSize: 18 }}>
                            {fmt(parseFloat(produto.precoVenda) + selecionadas.reduce((s, o) => s + (parseFloat(o.precoExtra) || 0), 0))}
                        </div>
                    </div>
                    <button
                        className="btn btn-success btn-lg"
                        onClick={() => onConfirm(produto, selecionadas, ingredientesAlterados)}
                        disabled={!isValido()}
                        style={{ padding: '0 32px' }}
                    >
                        <Plus size={18} /> Adicionar
                    </button>
                </div>
            </div>
        </div>
    );
}
