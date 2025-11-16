const express = require('express');
require('dotenv').config();
const cors = require('cors');
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');
const expenseRouter = require('./routes/expense');
const incomeRouter = require('./routes/income');
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

app.use('/api/income', incomeRouter);
app.use('/api/auth', authRouter);
app.use('/api', dashboardRouter);
app.use('/api/expense', expenseRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
