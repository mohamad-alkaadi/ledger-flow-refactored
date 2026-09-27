import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_BUDGET_CONFIGS, INITIAL_TRANSACTIONS } from './src/data/mockData.ts';
import { MonthlyBudgetConfig, Transaction } from './src/types/expense.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let transactions: Transaction[] = [...INITIAL_TRANSACTIONS];
let budgetConfigs: Record<string, MonthlyBudgetConfig> = { ...DEFAULT_BUDGET_CONFIGS };

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/transactions', (req, res) => {
    const { month, category, type, search } = req.query;
    let filtered = [...transactions];

    if (month && typeof month === 'string') {
      filtered = filtered.filter((t) => t.date.startsWith(month));
    }

    if (category && typeof category === 'string' && category !== 'all') {
      filtered = filtered.filter((t) => t.category === category);
    }

    if (type && typeof type === 'string' && type !== 'all') {
      filtered = filtered.filter((t) => t.type === type);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.merchant.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({ transactions: filtered });
  });

  app.post('/api/transactions', (req, res) => {
    const data = req.body;
    if (!data.amount || !data.category || !data.date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: data.date,
      description: data.description || 'Expense',
      merchant: data.merchant || 'General Merchant',
      amount: parseFloat(data.amount),
      type: data.type || 'expense',
      category: data.category,
      paymentMethod: data.paymentMethod || 'credit_card',
      notes: data.notes || '',
      status: data.status || 'completed',
    };

    transactions.unshift(newTx);
    res.status(201).json({ transaction: newTx });
  });

  app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const current = transactions[index];
    transactions[index] = {
      ...current,
      ...req.body,
      amount: req.body.amount !== undefined ? parseFloat(req.body.amount) : current.amount,
    };

    res.json({ transaction: transactions[index] });
  });

  app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = transactions.length;
    transactions = transactions.filter((t) => t.id !== id);

    if (transactions.length === initialLen) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ success: true, deletedId: id });
  });

  app.get('/api/budgets/:month', (req, res) => {
    const { month } = req.params;
    const config = budgetConfigs[month] || {
      month,
      totalBudget: 4500,
      categoryBudgets: { ...budgetConfigs['2026-09'].categoryBudgets },
    };
    res.json({ budget: config });
  });

  app.put('/api/budgets/:month', (req, res) => {
    const { month } = req.params;
    const { totalBudget, categoryBudgets } = req.body;

    budgetConfigs[month] = {
      month,
      totalBudget: parseFloat(totalBudget) || 4500,
      categoryBudgets: categoryBudgets || {},
    };

    res.json({ budget: budgetConfigs[month] });
  });

  app.post('/api/reset', (req, res) => {
    transactions = [...INITIAL_TRANSACTIONS];
    budgetConfigs = { ...DEFAULT_BUDGET_CONFIGS };
    res.json({ success: true, message: 'Reset to initial mock dataset' });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Expense Tracker server ready at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
