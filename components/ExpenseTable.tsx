
import React from 'react';
import { Expense, Currency } from '../types';

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, newCategory: string, expenseName: string) => void;
  userCategories: string[];
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onDelete, onUpdateCategory, userCategories }) => {
  const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const exportToCSV = () => {
    if (expenses.length === 0) return;

    // Definir cabeceras
    const headers = ["Fecha", "Gasto", "Categoria", "Banco", "Monto", "Moneda", "Periodo"];
    
    // Crear filas
    const rows = sorted.map(exp => [
      new Date(exp.date).toLocaleDateString('es-PE'),
      `"${exp.name.replace(/"/g, '""')}"`, // Escapar comillas dobles
      `"${exp.category}"`,
      exp.bank,
      exp.amount.toFixed(2),
      exp.currency,
      `${exp.periodMonth}/${exp.periodYear}`
    ]);

    // Unir todo en un string CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Crear el blob con BOM para que Excel detecte UTF-8 correctamente (tildes y ñ)
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Crear link temporal y disparar descarga
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `historial_gastos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between px-2">
        <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest">Registros Detallados</h2>
        {expenses.length > 0 && (
          <button 
            onClick={exportToCSV}
            class="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar CSV
          </button>
        )}
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th class="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
                <th class="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gasto</th>
                <th class="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoría</th>
                <th class="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Monto</th>
                <th class="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              {sorted.map(exp => (
                <tr key={exp.id} class="hover:bg-gray-50/30 transition-colors group">
                  <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{new Date(exp.date).toLocaleDateString('es-PE')}</td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-bold text-gray-900">{exp.name}</div>
                    <div class="text-[10px] text-gray-400">{exp.bank} • {exp.periodMonth}/{exp.periodYear}</div>
                  </td>
                  <td class="px-6 py-4">
                    <select 
                      value={exp.category} 
                      onChange={e => onUpdateCategory(exp.id, e.target.value, exp.name)}
                      class="text-[11px] font-bold py-1 px-2 rounded-lg bg-indigo-50 text-indigo-700 border-none cursor-pointer focus:ring-2 focus:ring-indigo-200"
                    >
                      {userCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class={`text-sm font-bold ${exp.currency === Currency.PEN ? 'text-gray-900' : 'text-emerald-600'}`}>
                      {exp.currency === Currency.PEN ? 'S/ ' : '$ '}
                      {exp.amount.toFixed(2)}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <button onClick={() => onDelete(exp.id)} class="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} class="px-6 py-12 text-center text-gray-400 text-sm">
                    No hay registros para exportar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTable;
