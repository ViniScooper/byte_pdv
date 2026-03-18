import React from 'react';

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

function PrintJob({ dados, tipo }) {
    if (!dados || !dados.itens || dados.itens.length === 0) return null;

    // Agrupa itens por setor pra cozinha
    const setores = {};
    if (tipo === 'cozinha') {
        dados.itens.forEach(item => {
            const s = item.setorProducao || 'Geral';
            if (!setores[s]) setores[s] = [];
            setores[s].push(item);
        });
    }

    return tipo === 'cliente' ? (
        <div className="print-ticket">
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <h2>PDV Byte</h2>
                <p style={{ margin: 0 }}>Cupom Não-Fiscal</p>
                <p style={{ margin: 0, fontSize: '0.8rem' }}>{new Date().toLocaleString()}</p>
                {dados.mesaIdentificacao && <h3>Comanda: {dados.mesaIdentificacao}</h3>}
            </div>
            <div style={{ borderBottom: '1px dashed #000', marginBottom: 8, paddingBottom: 8 }}>
                {dados.itens.map((item, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>
                        <div>{item.quantidade}x {item.nome} - {fmt(item.precoTotal * item.quantidade)}</div>
                        {item.opcoesSelecionadas?.map((opt, oid) => (
                            <div key={oid} style={{ paddingLeft: 16, fontSize: '0.8rem' }}>+ {opt.nome}</div>
                        ))}
                        {item.ingredientesAlterados?.map((alt, aid) => (
                            <div key={`alt-${aid}`} style={{ paddingLeft: 16, fontSize: '0.8rem' }}>
                                {alt.status === 'sem' ? '- SEM' : '+ EXTRA'} {alt.nome.toUpperCase()}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {dados.valor !== undefined && (
                <>
                    <div>Total: <strong>{fmt(dados.valor)}</strong></div>
                    <div>Pagamento: {dados.metodoPagamento}</div>
                </>
            )}
        </div>
    ) : (
        Object.keys(setores).map((setor, index) => {
            const totalSetor = setores[setor].reduce((acc, item) => acc + (item.precoTotal * item.quantidade), 0);
            return (
                <div key={setor} className="print-ticket" style={{ pageBreakBefore: index > 0 ? 'always' : 'auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '2px dashed #000', paddingBottom: 8 }}>
                        <h2 style={{ fontSize: '1.5rem', margin: 0, textTransform: 'uppercase' }}>SETOR: {setor}</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem' }}>{new Date().toLocaleString()}</p>
                        {dados.mesaIdentificacao ? <h3>Comanda: {dados.mesaIdentificacao}</h3> : <h3>Senha / Balcão</h3>}
                    </div>
                    <div>
                        {setores[setor].map((item, i) => (
                            <div key={i} style={{ marginBottom: 12, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {item.quantidade}x {item.nome} - {fmt(item.precoTotal * item.quantidade)}
                                </div>
                                {item.opcoesSelecionadas?.map((opt, oid) => (
                                    <div key={oid} style={{ paddingLeft: 16, fontSize: '1rem', fontWeight: 'bold' }}>
                                        + {opt.nome} {opt.precoExtra > 0 ? `(${fmt(opt.precoExtra)})` : ''}
                                    </div>
                                ))}
                                {item.ingredientesAlterados?.map((alt, aid) => (
                                    <div key={`alt-${aid}`} style={{ paddingLeft: 16, fontSize: '1rem', fontWeight: 'bold' }}>
                                        {alt.status === 'sem' ? '- SEM' : '+ EXTRA'} {alt.nome.toUpperCase()}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 12, paddingTop: 8, borderTop: '2px dashed #000', textAlign: 'right', fontSize: '1.2rem' }}>
                        Total Setor: <strong>{fmt(totalSetor)}</strong>
                    </div>
                </div>
            );
        })
    );
}

export default function Impressao({ jobs = [] }) {
    if (!jobs || jobs.length === 0) return null;

    return (
        <div id="print-area">
            {jobs.map((job, idx) => (
                <div key={idx} style={{ pageBreakBefore: idx > 0 ? 'always' : 'auto' }}>
                    <PrintJob dados={job.dados} tipo={job.tipo} />
                </div>
            ))}
        </div>
    );
}
