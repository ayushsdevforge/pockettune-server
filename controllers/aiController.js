const Transaction = require('../models/transaction');
const Bill = require('../models/bill');

// Models tried in order — fallback on 429/quota error
const Models = [
    "gemini-3-pro-preview",
    "gemini-2.5-pro",
    "gemini-2.5-flash"
];

// Call Gemini v1 REST directly; tries each model with one retry on 429
const generate = async (prompt) => {
    const apiKey = process.env.GEMINI_API_KEY;
    let lastError = null;

    for (const model of MODELS) {
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

        for (let attempt = 1; attempt <= 2; attempt++) {
            if (attempt === 2) {
                await new Promise((r) => setTimeout(r, 3000));
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            });

            const data = await response.json();

            if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text.trim();
            }

            const errCode = data.error?.code;
            const errMsg = data.error?.message || `HTTP ${response.status}`;

            if (errCode === 429) {
                lastError = `Rate limited on ${model}: ${errMsg}`;
                break;
            }

            if (errCode === 404) {
                lastError = `Model ${model} not available: ${errMsg}`;
                break;
            }

            throw new Error(errMsg);
        }
    }

    throw new Error(lastError || 'All Gemini models are currently rate-limited. Please try again in a minute.');
};

const parseJSON = (text) => {
    const clean = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
    return JSON.parse(clean);
};

// ==================== CATEGORIZE TRANSACTION ====================
const categorizeTransaction = async (req, res) => {
    try {
        const { description, amount, type } = req.body;

        if (!description) {
            return res.status(400).json({ message: 'Description is required for categorization' });
        }

        const validCategories =
            type === 'expense'
                ? ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
                    'Bills & Utilities', 'Healthcare', 'Education', 'Personal Care',
                    'Travel', 'Groceries', 'Others']
                : ['Salary', 'Freelance', 'Business', 'Investment',
                    'Rental Income', 'Gift', 'Refund', 'Others'];

        const prompt = `You are a financial transaction categorizer. 
Analyze this transaction and assign the BEST category from the list below.

Transaction details:
- Description: "${description}"
- Amount: Rs ${amount || 'unknown'}
- Type: ${type || 'expense'}

Valid categories: ${validCategories.join(', ')}

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "category": "<one of the valid categories>",
  "confidence": <number between 0 and 1>,
  "reasoning": "<one sentence explaining why>"
}`;

        const text = await generate(prompt);

        let parsed;
        try {
            parsed = parseJSON(text);
        } catch {
            return res.json({
                category: 'Others',
                confidence: 0.5,
                reasoning: 'Could not parse AI response, defaulting to Others.',
            });
        }

        if (!validCategories.includes(parsed.category)) {
            parsed.category = 'Others';
        }

        res.json(parsed);
    } catch (error) {
        console.error('AI categorize error:', error.message);
        const isRateLimit = error.message.toLowerCase().includes('rate') || error.message.includes('429');
        res.status(isRateLimit ? 429 : 500).json({
            message: isRateLimit
                ? 'AI is busy right now. Please wait a moment and try again.'
                : 'AI categorization failed',
            error: error.message,
        });
    }
};

// ==================== SPENDING INSIGHTS ====================
const getSpendingInsights = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const transactions = await Transaction.find({
            userId: req.userId,
            type: 'expense',
            date: { $gte: thirtyDaysAgo },
        }).sort({ date: -1 });

        if (transactions.length === 0) {
            return res.json({
                summary: 'No expense transactions found in the last 30 days.',
                insights: [],
                topCategory: null,
                totalSpent: 0,
                transactionCount: 0,
                tips: ['Start tracking your expenses to get personalized financial insights!'],
            });
        }

        const categoryTotals = {};
        let totalSpent = 0;
        transactions.forEach((t) => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            totalSpent += t.amount;
        });

        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
        const categoryBreakdown = Object.entries(categoryTotals)
            .map(([cat, amt]) => `${cat}: Rs ${amt.toFixed(2)}`)
            .join(', ');

        const prompt = `You are a personal finance advisor analyzing a user's spending for the last 30 days.

Total spent: Rs ${totalSpent.toFixed(2)}
Number of transactions: ${transactions.length}
Spending by category: ${categoryBreakdown}

Provide a concise financial analysis. Respond ONLY with valid JSON (no markdown, no code fences):
{
  "summary": "<2-3 sentence overall summary of spending behavior>",
  "insights": [
    "<specific insight about their spending pattern>",
    "<another insight>",
    "<a third insight>"
  ],
  "tips": [
    "<actionable money-saving tip based on their data>",
    "<another practical tip>"
  ],
  "savingsOpportunity": "<one category where they could save most, with a specific suggestion>"
}`;

        const text = await generate(prompt);

        let parsed;
        try {
            parsed = parseJSON(text);
        } catch {
            parsed = {
                summary: `You spent Rs ${totalSpent.toFixed(2)} across ${transactions.length} transactions in the last 30 days.`,
                insights: [`Your top spending category is ${topCategory?.[0] || 'unknown'} at Rs ${topCategory?.[1]?.toFixed(2) || 0}.`],
                tips: ['Review your recurring expenses to find potential savings.'],
                savingsOpportunity: topCategory?.[0] || 'Review all categories',
            };
        }

        res.json({
            ...parsed,
            topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
            totalSpent,
            transactionCount: transactions.length,
            categoryBreakdown: categoryTotals,
            period: '30 days',
        });
    } catch (error) {
        console.error('AI insights error:', error.message);
        const isRateLimit = error.message.toLowerCase().includes('rate') || error.message.includes('429');
        res.status(isRateLimit ? 429 : 500).json({
            message: isRateLimit
                ? 'AI is busy right now. Please wait a moment and try again.'
                : 'Failed to generate spending insights',
            error: error.message,
        });
    }
};

// ==================== BILL REMINDERS ====================
const getBillReminders = async (req, res) => {
    try {
        const now = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        const bills = await Bill.find({ userId: req.userId, isPaid: false });

        if (bills.length === 0) {
            return res.json({
                reminders: [],
                overdue: [],
                upcoming: [],
                future: [],
                message: 'No pending bills! You are all caught up. 🎉',
                summary: { totalOverdue: 0, totalUpcoming: 0, totalOverdueAmount: 0, totalUpcomingAmount: 0 },
            });
        }

        const overdueBills = bills.filter((b) => new Date(b.dueDate) < now);
        const upcomingBills = bills.filter((b) => new Date(b.dueDate) >= now && new Date(b.dueDate) <= sevenDaysLater);
        const futureBills = bills.filter((b) => new Date(b.dueDate) > sevenDaysLater);

        const overdueData = overdueBills.map((b) => ({
            name: b.name, amount: b.amount,
            daysOverdue: Math.floor((now - new Date(b.dueDate)) / 86400000),
            category: b.category,
        }));
        const upcomingData = upcomingBills.map((b) => ({
            name: b.name, amount: b.amount,
            dueDate: new Date(b.dueDate).toLocaleDateString('en-IN'),
            daysLeft: Math.ceil((new Date(b.dueDate) - now) / 86400000),
            category: b.category,
        }));
        const totalOverdueAmount = overdueBills.reduce((s, b) => s + b.amount, 0);
        const totalUpcomingAmount = upcomingBills.reduce((s, b) => s + b.amount, 0);

        const prompt = `You are a friendly financial assistant sending bill payment reminders.

Overdue bills (${overdueBills.length}): ${JSON.stringify(overdueData)}
Upcoming bills due within 7 days (${upcomingBills.length}): ${JSON.stringify(upcomingData)}
Total overdue amount: Rs ${totalOverdueAmount}
Total upcoming amount: Rs ${totalUpcomingAmount}

Generate personalized, friendly but urgent reminder messages. Respond ONLY with valid JSON (no markdown, no code fences):
{
  "urgentMessage": "<a brief urgent message if there are overdue bills, or null>",
  "reminderMessages": [
    {
      "billName": "<bill name>",
      "message": "<personalized friendly reminder message for this specific bill>",
      "priority": "<high|medium|low>",
      "isOverdue": <true|false>
    }
  ],
  "actionTip": "<one practical tip about managing these bills>"
}`;

        const text = await generate(prompt);

        let aiResponse;
        try {
            aiResponse = parseJSON(text);
        } catch {
            aiResponse = {
                urgentMessage: overdueBills.length > 0
                    ? `You have ${overdueBills.length} overdue bill(s) totalling Rs ${totalOverdueAmount}. Pay immediately!`
                    : null,
                reminderMessages: [],
                actionTip: 'Set up automatic payments to never miss a bill again.',
            };
        }

        res.json({
            ...aiResponse,
            overdue: overdueBills.map((b) => ({
                _id: b._id, name: b.name, amount: b.amount, dueDate: b.dueDate,
                category: b.category,
                daysOverdue: Math.floor((now - new Date(b.dueDate)) / 86400000),
            })),
            upcoming: upcomingBills.map((b) => ({
                _id: b._id, name: b.name, amount: b.amount, dueDate: b.dueDate,
                category: b.category,
                daysLeft: Math.ceil((new Date(b.dueDate) - now) / 86400000),
            })),
            future: futureBills.map((b) => ({
                _id: b._id, name: b.name, amount: b.amount, dueDate: b.dueDate, category: b.category,
            })),
            summary: { totalOverdue: overdueBills.length, totalUpcoming: upcomingBills.length, totalOverdueAmount, totalUpcomingAmount },
        });
    } catch (error) {
        console.error('AI bill reminders error:', error.message);
        const isRateLimit = error.message.toLowerCase().includes('rate') || error.message.includes('429');
        res.status(isRateLimit ? 429 : 500).json({
            message: isRateLimit
                ? 'AI is busy right now. Please wait a moment and try again.'
                : 'Failed to generate bill reminders',
            error: error.message,
        });
    }
};

module.exports = { categorizeTransaction, getSpendingInsights, getBillReminders };
