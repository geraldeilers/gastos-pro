
import { Expense, DEFAULT_CATEGORIES } from "../types";

const EXPENSES_KEY = 'gastos_personales_data';
const CATEGORIES_KEY = 'gastos_categorias_data';
const CORRECTIONS_KEY = 'gastos_correcciones_ia';

export const saveExpenses = (expenses: Expense[]) => {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

export const loadExpenses = (): Expense[] => {
  const data = localStorage.getItem(EXPENSES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCategories = (categories: string[]) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const loadCategories = (): string[] => {
  const data = localStorage.getItem(CATEGORIES_KEY);
  return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
};

export const saveCorrections = (corrections: Record<string, string>) => {
  localStorage.setItem(CORRECTIONS_KEY, JSON.stringify(corrections));
};

export const loadCorrections = (): Record<string, string> => {
  const data = localStorage.getItem(CORRECTIONS_KEY);
  return data ? JSON.parse(data) : {};
};
