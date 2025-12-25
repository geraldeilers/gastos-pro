
import React, { useState } from 'react';

interface CategoryManagerProps {
  categories: string[];
  onAdd: (category: string) => void;
  onRemove: (category: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAdd, onRemove }) => {
  const [newCat, setNewCat] = useState('');

  const handleAdd = () => {
    if (newCat.trim() && !categories.includes(newCat.trim())) {
      onAdd(newCat.trim());
      setNewCat('');
    }
  };

  return (
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      <div>
        <h3 class="text-lg font-bold text-gray-800">Gestionar Categorías</h3>
        <p class="text-xs text-gray-500">Añade o elimina etiquetas para organizar tus gastos.</p>
      </div>

      <div class="flex gap-2">
        <input 
          type="text" 
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="Ej: Mascotas"
          class="flex-1 rounded-xl border-gray-100 bg-gray-50 focus:ring-indigo-500 text-sm"
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button 
          onClick={handleAdd}
          class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
        >
          Añadir
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map(cat => (
          <div key={cat} class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
            <span class="text-xs font-medium text-gray-700">{cat}</span>
            <button 
              onClick={() => onRemove(cat)}
              class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
