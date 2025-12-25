
import React, { useState, useEffect } from 'react';
import { Expense, Bank, Currency } from '../types';
import { categorizeExpenseName } from '../services/geminiService';

interface AddExpenseModalProps {
  onAdd: (expense: Expense) => void;
  onClose: () => void;
  userCategories: string[];
  corrections: Record<string, string>;
  onSaveCorrection: (name: string, category: string) => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ 
  onAdd, 
  onClose, 
  userCategories, 
  corrections, 
  onSaveCorrection 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: userCategories[0],
    date: new Date().toISOString().split('T')[0],
    currency: Currency.PEN,
    amount: '',
    bank: Bank.BCP,
    periodMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    periodYear: new Date().getFullYear().toString()
  });
  const [categorizing, setCategorizing] = useState(false);
  const [lastAISuggestion, setLastAISuggestion] = useState<string | null>(null);
  const [hasLearned, setHasLearned] = useState(false);

  // Efecto para búsqueda instantánea en correcciones previas (Aprendizaje Instantáneo)
  useEffect(() => {
    const nameKey = formData.name.trim();
    if (nameKey && corrections[nameKey]) {
      const savedCategory = corrections[nameKey];
      if (formData.category !== savedCategory) {
        setFormData(prev => ({ ...prev, category: savedCategory }));
        setLastAISuggestion(savedCategory);
      }
    }
  }, [formData.name, corrections]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;
    
    // Si la categoría actual es distinta a lo que la IA sugirió inicialmente,
    // guardamos el aprendizaje antes de cerrar.
    if (lastAISuggestion && formData.category !== lastAISuggestion) {
      onSaveCorrection(formData.name, formData.category);
    }

    onAdd({
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      amount: parseFloat(formData.amount)
    } as Expense);
    onClose();
  };

  const handleSuggest = async () => {
    const name = formData.name.trim();
    if (!name) return;

    // Si ya tenemos una corrección exacta, no necesitamos llamar a la API
    if (corrections[name]) {
      setFormData(prev => ({ ...prev, category: corrections[name] }));
      setLastAISuggestion(corrections[name]);
      return;
    }

    setCategorizing(true);
    setHasLearned(false);
    
    try {
      const cat = await categorizeExpenseName(name, userCategories, corrections);
      setFormData(prev => ({ ...prev, category: cat }));
      setLastAISuggestion(cat);
    } catch (error) {
      console.error("Error sugiriendo categoría:", error);
    } finally {
      setCategorizing(false);
    }
  };

  const handleManualUpdateIA = () => {
    if (!formData.name || !formData.category) return;
    onSaveCorrection(formData.name.trim(), formData.category);
    setHasLearned(true);
    setTimeout(() => setHasLearned(false), 3000);
  };

  return (
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden p-8 space-y-6 animate-in fade-in zoom-in duration-200">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900">Nuevo Gasto Manual</h3>
          <button onClick={onClose} class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Descripción</label>
            <div class="flex gap-2">
              <input 
                required 
                type="text" 
                class="flex-1 rounded-xl border-gray-100 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                onBlur={() => !categorizing && formData.name.trim() && handleSuggest()}
                placeholder="Ej: Starbucks o Supermercado"
              />
              <button 
                type="button" 
                onClick={handleSuggest} 
                disabled={categorizing}
                title="Consultar a la IA"
                class="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {categorizing ? (
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <span class="text-xs font-bold">IA</span>
                )}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Categoría</label>
              <select 
                class="w-full rounded-xl border-gray-100 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                value={formData.category} 
                onChange={e => {
                  setFormData({...formData, category: e.target.value});
                  setHasLearned(false);
                }}
              >
                {userCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              
              {lastAISuggestion && (
                <div class="mt-2 flex items-center justify-between animate-in slide-in-from-top-1 duration-300">
                  <p class="text-[9px] text-indigo-500 font-medium italic">
                    {formData.category === lastAISuggestion ? '✓ Sugerencia IA aplicada' : '✎ Corregido manualmente'}
                  </p>
                  <button 
                    type="button"
                    onClick={handleManualUpdateIA}
                    disabled={hasLearned}
                    class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${hasLearned ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'}`}
                  >
                    {hasLearned ? (
                      <>
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        ¡Actualizado!
                      </>
                    ) : (
                      <>
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Actualizar IA
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Monto</label>
              <input 
                required 
                type="number" 
                step="0.01" 
                class="w-full rounded-xl border-gray-100 bg-gray-50 focus:ring-indigo-500 transition-all" 
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})} 
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Moneda</label>
              <select class="w-full rounded-xl border-gray-100 bg-gray-50 focus:ring-indigo-500 transition-all" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value as Currency})}>
                <option value={Currency.PEN}>Soles (S/)</option>
                <option value={Currency.USD}>Dólares ($)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha del Gasto</label>
              <input type="date" class="w-full rounded-xl border-gray-100 bg-gray-50 focus:ring-indigo-500 transition-all" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" onClick={onClose} class="flex-1 py-3 font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancelar</button>
            <button type="submit" class="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Guardar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
