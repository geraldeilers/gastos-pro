
import React, { useState, useEffect } from 'react';
import { Expense } from './types';
import { loadExpenses, saveExpenses, loadCategories, saveCategories, loadCorrections, saveCorrections } from './utils/storage';
import Dashboard from './components/Dashboard';
import SmartScanner from './components/PDFParser';
import ExpenseTable from './components/ExpenseTable';
import AddExpenseModal from './components/AddExpenseModal';
import CategoryManager from './components/CategoryManager';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'categories'>('dashboard');

  useEffect(() => {
    setExpenses(loadExpenses());
    setCategories(loadCategories());
    setCorrections(loadCorrections());
  }, []);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveCorrections(corrections);
  }, [corrections]);

  const handleAddMultiple = (newExps: Expense[]) => setExpenses(prev => [...prev, ...newExps]);
  
  const handleDelete = (id: string) => confirm("¿Estás seguro de eliminar este registro?") && setExpenses(prev => prev.filter(e => e.id !== id));
  
  const handleUpdateCat = (id: string, cat: string, name: string) => {
    // Si el usuario cambia la categoría en la tabla, lo tomamos como una corrección de aprendizaje para la IA
    handleSaveCorrection(name, cat);
    setExpenses(prev => prev.map(e => e.id === id ? {...e, category: cat} : e));
  };

  const handleSaveCorrection = (name: string, category: string) => {
    setCorrections(prev => ({
      ...prev,
      [name]: category
    }));
  };

  return (
    <div class="min-h-screen bg-gray-50/50">
      <header class="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Gastos Pro</h1>
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span class="text-[9px] text-gray-400 font-bold uppercase tracking-widest">IA Sincronizada</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} class="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
            + Añadir Gasto
          </button>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div class="flex bg-gray-200/50 p-1.5 rounded-2xl w-fit">
              {[
                {id: 'dashboard', label: 'Dashboard'}, 
                {id: 'list', label: 'Historial'}, 
                {id: 'categories', label: 'Categorías'}
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)} 
                  class={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'dashboard' && <Dashboard expenses={expenses} />}
            {activeTab === 'list' && (
              <ExpenseTable 
                expenses={expenses} 
                onDelete={handleDelete} 
                onUpdateCategory={handleUpdateCat} 
                userCategories={categories} 
              />
            )}
            {activeTab === 'categories' && (
              <CategoryManager 
                categories={categories} 
                onAdd={c => setCategories([...categories, c])} 
                onRemove={c => setCategories(categories.filter(x => x !== c))} 
              />
            )}
          </div>

          <aside class="space-y-6">
            <SmartScanner 
              onExpensesExtracted={handleAddMultiple} 
              userCategories={categories} 
              corrections={corrections}
            />
            
            <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Aprendizaje IA</h4>
              <p class="text-[11px] text-gray-500 leading-relaxed">
                Cada vez que corriges una categoría, la IA guarda esa regla. 
                Actualmente tienes <span class="text-indigo-600 font-bold">{Object.keys(corrections).length}</span> reglas de refinamiento activas.
              </p>
              {Object.keys(corrections).length > 0 && (
                <button 
                  onClick={() => confirm("¿Resetear aprendizaje?") && setCorrections({})}
                  class="mt-3 text-[9px] text-red-400 font-bold uppercase hover:text-red-600 transition-colors"
                >
                  Limpiar Aprendizaje
                </button>
              )}
            </div>
          </aside>
        </div>
      </main>

      {isAddModalOpen && (
        <AddExpenseModal 
          userCategories={categories} 
          corrections={corrections}
          onSaveCorrection={handleSaveCorrection}
          onAdd={exp => setExpenses([...expenses, exp])} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
