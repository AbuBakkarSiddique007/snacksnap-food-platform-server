import express from 'express';
import { toNodeHandler } from 'better-auth/node';

import cors from 'cors';
import { auth } from './lib/auth';
import { categoryRouter } from './modules/category/category.route';

const port = process.env.PORT || 4000;

const app = express();

app.use(cors({
  origin: process.env.APP_URL,
  credentials: true
}));


app.use(express.json());

// Better-Auth Middleware :
app.use('/api/auth', toNodeHandler(auth));

app.use('/api/admin/categories', categoryRouter);

app.get('/', (req, res) => {
    res.status(200).send('SnackSnap Server is running!');
});

app.listen(port, () => {
    console.log(`Better Auth app listening on port ${port}`);
});

export default app;
