import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext(null);
const API = `http://${window.location.hostname}:3001`;

const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored || stored === 'undefined' || stored === 'null') return defaultValue;
    const parsed = JSON.parse(stored);
    return Array.isArray(defaultValue) && !Array.isArray(parsed) ? defaultValue : (parsed ?? defaultValue);
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
};

// Helper: API fetch with error handling
const api = async (path, opts = {}) => {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || 'API Error');
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// Map DB row to frontend model
const mapFornecedor = (r) => ({ id: r.id, nome: r.name, contato: r.contact, tipoInsumo: r.tipoInsumo, criadoEm: r.createdAt });
const mapIngrediente = (r) => ({ id: r.id, nome: r.name, unidade: r.unidade || 'un', precoCusto: r.precoCusto || 0, estoque: r.estoque || 0, criadoEm: r.createdAt });
const mapProduto = (r) => ({
  id: r.id, nome: r.name, precoVenda: r.precoVenda || r.price || 0, precoCusto: r.precoCusto || 0,
  estoque: r.estoque || 0, categoria: r.categoria, setorProducao: r.setorProducao,
  fichaTecnica: r.fichaTecnicaJson ? JSON.parse(r.fichaTecnicaJson) : [],
  gruposIds: r.gruposIdsJson ? JSON.parse(r.gruposIdsJson) : [],
  criadoEm: r.createdAt
});
const mapGrupo = (r) => ({
  id: r.id, nome: r.nome, min: r.minOpcoes || 0, max: r.maxOpcoes || 0,
  opcoes: r.opcoesJson ? JSON.parse(r.opcoesJson) : [], criadoEm: r.createdAt
});
const mapTurno = (r) => ({
  id: r.id, operador: r.operador, saldoInicial: r.saldoInicial || 0,
  abertoEm: r.abertoEm, fechadoEm: r.fechadoEm, saldoFinal: r.saldoFinal,
  saldoEsperado: r.saldoEsperado, diferenca: r.diferenca,
  status: r.status === 'OPEN' ? 'aberto' : 'fechado'
});
const mapTransacao = (r) => ({
  id: r.id, tipo: r.tipo, subtipo: r.subtipo, turnoId: r.turnoId,
  valor: r.valor, metodoPagamento: r.metodoPagamento, descricao: r.descricao,
  motivo: r.motivo, origem: r.origem, mesaIdentificacao: r.mesaIdentificacao,
  itens: r.itensJson ? JSON.parse(r.itensJson) : [], criadoEm: r.criadoEm
});

export function AppProvider({ children }) {
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [gruposOpcoes, setGruposOpcoes] = useState([]);
  const [mesas, setMesas] = useState(() => loadFromStorage('pdv_mesas', []));
  const [turnoAtual, setTurnoAtual] = useState(null);
  const [authToken, setAuthToken] = useState(() => loadFromStorage('pdv_auth_token', null));
  const [currentUser, setCurrentUser] = useState(() => loadFromStorage('pdv_current_user', null));
  const [loading, setLoading] = useState(true);

  // Persist auth + mesas to localStorage
  useEffect(() => { saveToStorage('pdv_auth_token', authToken); }, [authToken]);
  useEffect(() => { saveToStorage('pdv_current_user', currentUser); }, [currentUser]);
  useEffect(() => { saveToStorage('pdv_mesas', mesas); }, [mesas]);

  // Login / Logout
  const login = useCallback((token, user) => {
    setAuthToken(token);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('pdv_auth_token');
    localStorage.removeItem('pdv_current_user');
  }, []);

  // ==== LOAD ALL DATA FROM API ON MOUNT ====
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [forn, ingr, prod, grup, trans, turnoRes] = await Promise.all([
          api('/api/fornecedores'),
          api('/api/ingredientes'),
          api('/api/produtos'),
          api('/api/grupos'),
          api('/api/transacoes'),
          api('/api/turnos/atual'),
        ]);
        setFornecedores(forn.map(mapFornecedor));
        setIngredientes(ingr.map(mapIngrediente));
        setProdutos(prod.map(mapProduto));
        setGruposOpcoes(grup.map(mapGrupo));
        setTransacoes(trans.map(mapTransacao));

        if (turnoRes) {
          setTurnoAtual(mapTurno(turnoRes));
          // Load transactions for this shift
        }

        const turnosHistory = await api('/api/turnos');
        setTurnos(turnosHistory.map(mapTurno));
      } catch (err) {
        console.error('Failed to load data from API:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // === FORNECEDORES ===
  const addFornecedor = useCallback(async (dados) => {
    const id = uuidv4();
    const novo = { id, criadoEm: new Date().toISOString(), ...dados };
    setFornecedores(prev => [...prev, novo]);
    try {
      await api('/api/fornecedores', { method: 'POST', body: JSON.stringify({ id, ...dados }) });
    } catch (e) { console.error('Erro ao salvar fornecedor:', e); }
    return novo;
  }, []);

  const updateFornecedor = useCallback(async (id, dados) => {
    setFornecedores(prev => prev.map(f => f.id === id ? { ...f, ...dados } : f));
    try {
      await api(`/api/fornecedores/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
    } catch (e) { console.error('Erro ao atualizar fornecedor:', e); }
  }, []);

  const deleteFornecedor = useCallback(async (id) => {
    setFornecedores(prev => prev.filter(f => f.id !== id));
    try {
      await api(`/api/fornecedores/${id}`, { method: 'DELETE' });
    } catch (e) { console.error('Erro ao deletar fornecedor:', e); }
  }, []);

  // === PRODUTOS ===
  const addProduto = useCallback(async (dados) => {
    const id = uuidv4();
    const novo = { id, criadoEm: new Date().toISOString(), estoque: 0, ...dados };
    setProdutos(prev => [...prev, novo]);
    try {
      await api('/api/produtos', { method: 'POST', body: JSON.stringify({ id, ...dados }) });
    } catch (e) { console.error('Erro ao salvar produto:', e); }
    return novo;
  }, []);

  const updateProduto = useCallback(async (id, dados) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...dados } : p));
    try {
      await api(`/api/produtos/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
    } catch (e) { console.error('Erro ao atualizar produto:', e); }
  }, []);

  const deleteProduto = useCallback(async (id) => {
    setProdutos(prev => prev.filter(p => p.id !== id));
    try {
      await api(`/api/produtos/${id}`, { method: 'DELETE' });
    } catch (e) { console.error('Erro ao deletar produto:', e); }
  }, []);

  const ajustarEstoque = useCallback(async (id, quantidade) => {
    setProdutos(prev => prev.map(p =>
      p.id === id ? { ...p, estoque: Math.max(0, (p.estoque || 0) + (quantidade || 0)) } : p
    ));
    try {
      await api(`/api/produtos/${id}/estoque`, { method: 'PATCH', body: JSON.stringify({ quantidade }) });
    } catch (e) { console.error('Erro ao ajustar estoque:', e); }
  }, []);

  // === INGREDIENTES ===
  const addIngrediente = useCallback(async (dados) => {
    const id = uuidv4();
    const novo = { id, criadoEm: new Date().toISOString(), estoque: 0, ...dados };
    setIngredientes(prev => [...prev, novo]);
    try {
      await api('/api/ingredientes', { method: 'POST', body: JSON.stringify({ id, ...dados }) });
    } catch (e) { console.error('Erro ao salvar ingrediente:', e); }
    return novo;
  }, []);

  const updateIngrediente = useCallback(async (id, dados) => {
    setIngredientes(prev => prev.map(i => i.id === id ? { ...i, ...dados } : i));
    try {
      await api(`/api/ingredientes/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
    } catch (e) { console.error('Erro ao atualizar ingrediente:', e); }
  }, []);

  const deleteIngrediente = useCallback(async (id) => {
    setIngredientes(prev => prev.filter(i => i.id !== id));
    try {
      await api(`/api/ingredientes/${id}`, { method: 'DELETE' });
    } catch (e) { console.error('Erro ao deletar ingrediente:', e); }
  }, []);

  const ajustarEstoqueIngrediente = useCallback(async (id, quantidade) => {
    setIngredientes(prev => prev.map(i =>
      i.id === id ? { ...i, estoque: Math.max(0, (i.estoque || 0) + (quantidade || 0)) } : i
    ));
    try {
      await api(`/api/ingredientes/${id}/estoque`, { method: 'PATCH', body: JSON.stringify({ quantidade }) });
    } catch (e) { console.error('Erro ao ajustar estoque ingrediente:', e); }
  }, []);

  // === GRUPOS DE OPCOES ===
  const addGrupoOpcoes = useCallback(async (dados) => {
    const id = dados.id || uuidv4();
    const novo = { id, min: 0, max: 0, ...dados };
    setGruposOpcoes(prev => [...prev, novo]);
    try {
      await api('/api/grupos', { method: 'POST', body: JSON.stringify({ id, ...dados }) });
    } catch (e) { console.error('Erro ao salvar grupo:', e); }
    return novo;
  }, []);

  const updateGrupoOpcoes = useCallback(async (id, dados) => {
    setGruposOpcoes(prev => prev.map(g => g.id === id ? { ...g, ...dados } : g));
    try {
      await api(`/api/grupos/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
    } catch (e) { console.error('Erro ao atualizar grupo:', e); }
  }, []);

  const deleteGrupoOpcoes = useCallback(async (id) => {
    setGruposOpcoes(prev => prev.filter(g => g.id !== id));
    try {
      await api(`/api/grupos/${id}`, { method: 'DELETE' });
    } catch (e) { console.error('Erro ao deletar grupo:', e); }
  }, []);

  // === TURNO ===
  const abrirTurno = useCallback(async (saldoInicial, operador = 'Operador') => {
    const id = uuidv4();
    const turno = {
      id,
      operador,
      saldoInicial: parseFloat(saldoInicial),
      abertoEm: new Date().toISOString(),
      fechadoEm: null,
      saldoFinal: null,
      totalEntradas: 0,
      totalSaidas: 0,
      status: 'aberto',
    };
    setTurnoAtual(turno);
    try {
      await api('/api/turnos/abrir', { method: 'POST', body: JSON.stringify({ id, saldoInicial, operador }) });
    } catch (e) { console.error('Erro ao abrir turno:', e); }
    return turno;
  }, []);

  const fecharTurno = useCallback(async (saldoFinal) => {
    if (!turnoAtual) return;

    const transacoesTurno = transacoes.filter(t => t.turnoId === turnoAtual.id);
    const totalEntradas = transacoesTurno.filter(t => t.tipo === 'entrada').reduce((s, i) => s + i.valor, 0);
    const totalSaidas = transacoesTurno.filter(t => t.tipo === 'saida').reduce((s, i) => s + i.valor, 0);

    const movimentacaoLiquida = totalEntradas - totalSaidas;
    const saldoEsperadoComFundo = turnoAtual.saldoInicial + movimentacaoLiquida;
    const diferenca = parseFloat(saldoFinal) - saldoEsperadoComFundo;

    const turnoFechado = {
      ...turnoAtual,
      fechadoEm: new Date().toISOString(),
      saldoFinal: parseFloat(saldoFinal),
      saldoEsperado: saldoEsperadoComFundo,
      movimentacaoLiquida,
      diferenca,
      totalEntradas,
      totalSaidas,
      status: 'fechado',
    };
    setTurnos(prev => [...prev, turnoFechado]);
    setTurnoAtual(null);

    try {
      await api('/api/turnos/fechar', {
        method: 'POST',
        body: JSON.stringify({ id: turnoAtual.id, saldoFinal, saldoEsperado: saldoEsperadoComFundo, diferenca })
      });
    } catch (e) { console.error('Erro ao fechar turno:', e); }

    return turnoFechado;
  }, [turnoAtual, transacoes]);

  // === ESTOQUE HELPER ===
  const processarBaixaEstoque = useCallback((itens, reverso = false) => {
    const mult = reverso ? 1 : -1;
    itens.forEach(item => {
      if (item.fichaTecnica && item.fichaTecnica.length > 0) {
        item.fichaTecnica.forEach(insumo => {
          let qtdUsada = insumo.quantidade;
          if (item.ingredientesAlterados) {
            const alteracao = item.ingredientesAlterados.find(a => a.ingredienteId === insumo.ingredienteId);
            if (alteracao) {
              if (alteracao.status === 'sem') qtdUsada = 0;
              else if (alteracao.status === 'extra') qtdUsada = insumo.quantidade * 2;
            }
          }
          if (qtdUsada > 0) {
            ajustarEstoqueIngrediente(insumo.ingredienteId, (qtdUsada * item.quantidade) * mult);
          }
        });
      } else {
        ajustarEstoque(item.id, item.quantidade * mult);
      }

      if (item.opcoesSelecionadas) {
        item.opcoesSelecionadas.forEach(opt => {
          if (opt.ingredienteId) {
            const qtdPorcao = parseFloat(opt.quantidade) || 1;
            ajustarEstoqueIngrediente(opt.ingredienteId, (qtdPorcao * item.quantidade) * mult);
          }
        });
      }
    });
  }, [ajustarEstoque, ajustarEstoqueIngrediente]);

  // === MESAS / COMANDAS (kept in localStorage for now, persisted via API on close) ===
  const abrirMesa = useCallback((identificacao) => {
    const novaMesa = {
      id: uuidv4(),
      identificacao,
      criadoEm: new Date().toISOString(),
      itens: [],
      status: 'aberta'
    };
    setMesas(prev => [...prev, novaMesa]);
    return novaMesa;
  }, []);

  const adicionarItensMesa = useCallback((mesaId, novosItens) => {
    setMesas(prev => prev.map(m => {
      if (m.id === mesaId) {
        return { ...m, itens: [...m.itens, ...novosItens] };
      }
      return m;
    }));
    processarBaixaEstoque(novosItens, false);
  }, [processarBaixaEstoque]);

  const fecharMesa = useCallback(async (mesaId, metodoPagamento) => {
    const mesa = mesas.find(m => m.id === mesaId);
    if (!mesa || !turnoAtual) return null;

    const valorTotal = mesa.itens.reduce((s, i) => s + (parseFloat(i.precoTotal) || parseFloat(i.precoVenda) || 0) * parseInt(i.quantidade || 1), 0);
    const id = uuidv4();
    const transacao = {
      id,
      tipo: 'entrada',
      subtipo: 'venda',
      origem: 'mesa',
      mesaIdentificacao: mesa.identificacao,
      turnoId: turnoAtual.id,
      valor: valorTotal,
      metodoPagamento,
      itens: mesa.itens,
      criadoEm: new Date().toISOString(),
      descricao: `Venda Mesa/Comanda: ${mesa.identificacao}`,
    };

    setTransacoes(prev => [...prev, transacao]);
    setMesas(prev => prev.filter(m => m.id !== mesaId));

    try {
      await api('/api/transacoes', { method: 'POST', body: JSON.stringify(transacao) });
    } catch (e) { console.error('Erro ao salvar transação mesa:', e); }

    return transacao;
  }, [mesas, turnoAtual]);

  // === TRANSAÇÕES ===
  const addVenda = useCallback(async (itens, metodoPagamento) => {
    if (!turnoAtual) return null;
    const valor = itens.reduce((s, i) => s + (parseFloat(i.precoTotal) || parseFloat(i.precoVenda) || 0) * parseInt(i.quantidade || 1), 0);
    const id = uuidv4();
    const transacao = {
      id,
      tipo: 'entrada',
      subtipo: 'venda',
      turnoId: turnoAtual.id,
      valor,
      metodoPagamento,
      itens,
      criadoEm: new Date().toISOString(),
      descricao: `Venda: ${itens.map(i => i.nome).join(', ')}`,
    };
    setTransacoes(prev => [...prev, transacao]);
    processarBaixaEstoque(itens, false);

    try {
      await api('/api/transacoes', { method: 'POST', body: JSON.stringify(transacao) });
    } catch (e) { console.error('Erro ao salvar venda:', e); }

    return transacao;
  }, [turnoAtual, processarBaixaEstoque]);

  const addDespesa = useCallback(async (dados) => {
    if (!turnoAtual) return null;
    const id = uuidv4();
    const transacao = {
      id,
      tipo: 'saida',
      subtipo: 'despesa',
      turnoId: turnoAtual.id,
      criadoEm: new Date().toISOString(),
      ...dados,
      valor: parseFloat(dados.valor),
    };
    setTransacoes(prev => [...prev, transacao]);

    if (dados.tipoEntrada === 'ingrediente' && dados.ingredienteId && dados.quantidadeEntrada) {
      ajustarEstoqueIngrediente(dados.ingredienteId, parseFloat(dados.quantidadeEntrada));
    } else if (dados.produtoId && dados.quantidadeEntrada) {
      ajustarEstoque(dados.produtoId, parseFloat(dados.quantidadeEntrada));
    }

    try {
      await api('/api/transacoes', { method: 'POST', body: JSON.stringify(transacao) });
    } catch (e) { console.error('Erro ao salvar despesa:', e); }

    return transacao;
  }, [turnoAtual, ajustarEstoque, ajustarEstoqueIngrediente]);

  // === COMPUTED ===
  const saldoAtual = useCallback(() => {
    if (!turnoAtual) return 0;
    const tx = transacoes.filter(t => t.turnoId === turnoAtual.id);
    const entradas = tx.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0);
    const saidas = tx.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0);
    return turnoAtual.saldoInicial + entradas - saidas;
  }, [turnoAtual, transacoes]);

  const entradasDoDia = useCallback(() => {
    if (!turnoAtual) return 0;
    return transacoes.filter(t => t.turnoId === turnoAtual.id && t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0);
  }, [turnoAtual, transacoes]);

  const saidasDoDia = useCallback(() => {
    if (!turnoAtual) return 0;
    return transacoes.filter(t => t.turnoId === turnoAtual.id && t.tipo === 'saida').reduce((s, t) => s + t.valor, 0);
  }, [turnoAtual, transacoes]);

  const value = {
    loading,
    fornecedores, addFornecedor, updateFornecedor, deleteFornecedor,
    produtos, addProduto, updateProduto, deleteProduto, ajustarEstoque,
    ingredientes, addIngrediente, updateIngrediente, deleteIngrediente, ajustarEstoqueIngrediente,
    gruposOpcoes, addGrupoOpcoes, updateGrupoOpcoes, deleteGrupoOpcoes,
    mesas, abrirMesa, adicionarItensMesa, fecharMesa, processarBaixaEstoque,
    transacoes, addVenda, addDespesa,
    turnos, turnoAtual, abrirTurno, fecharTurno,
    saldoAtual, entradasDoDia, saidasDoDia,
    authToken, currentUser, login, logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
