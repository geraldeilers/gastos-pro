
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Expense, Currency } from '../types';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6', '#64748b'];
const USD_RATE = 3.7;

interface DashboardProps {
  expenses: Expense[];
}

const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const stats = useMemo(() => {
    let soles = 0;
    let dollars = 0;
    expenses.forEach(e => {
      if (e.currency === Currency.PEN) soles += e.amount;
      else dollars += e.amount;
    });
    const totalInSoles = soles + (dollars * USD_RATE);
    return { soles, dollars, totalInSoles };
  }, [expenses]);

  const dataByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach(e => {
      const amountInSoles = e.currency === Currency.PEN ? e.amount : e.amount * USD_RATE;
      categories[e.category] = (categories[e.category] || 0) + amountInSoles;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const dataByMonth = useMemo(() => {
    const months: Record<string, number> = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    expenses.forEach(e => {
      const key = `${monthNames[parseInt(e.periodMonth) - 1]} ${e.periodYear}`;
      const amountInSoles = e.currency === Currency.PEN ? e.amount : e.amount * USD_RATE;
      months[key] = (months[key] || 0) + amountInSoles;
    });

    // Ordenar por fecha cronológica (aproximada por el key)
    return Object.entries(months).map(([name, Total]) => ({ name, Total }));
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div class="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <p class="text-gray-500">No hay datos suficientes para mostrar dashboards. ¡Agrega tus primeros gastos!</p>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Stats Cards */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
          <p class="text-indigo-100 text-[10px] font-bold uppercase tracking-[0.2em]">Total Estimado (PEN)</p>
          <p class="text-3xl font-bold mt-2">S/ {stats.totalInSoles.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          <p class="text-[10px] mt-2 opacity-60">Calculado con T.C. 3.70</p>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p class="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Gasto en Soles</p>
          <p class="text-2xl font-bold text-gray-900 mt-2">S/ {stats.soles.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p class="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Gasto en Dólares</p>
          <p class="text-2xl font-bold text-gray-900 mt-2">$ {stats.dollars.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Gastos por Categoría (en PEN)</h3>
          <div class="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dataByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`S/ ${value.toFixed(2)}`, 'Monto Total']} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend - Solo 1 barra consolidada */}
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Tendencia Mensual Consolidada (PEN)</h3>
          <div class="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`S/ ${value.toFixed(2)}`, 'Gasto Total']}
                />
                <Bar 
                  dataKey="Total" 
                  fill="#4f46e5" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div class="mt-4 flex justify-center">
             <span class="text-[10px] text-gray-400 font-medium">Incluye gastos en USD convertidos a T.C. 3.70</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
