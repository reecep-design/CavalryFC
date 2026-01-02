import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { teamRoutes } from './routes/teams';
import { registrationRoutes } from './routes/registrations';
import { contentRoutes } from './routes/content';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Cavalry FC API is running' });
});

app.use('/api/teams', teamRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/content', contentRoutes);

// Serve Static Files (Production)
// In development, Vite handles this. In prod, Express serves the dist folder.
if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, '../../client/dist');
    console.log('Serving static files from:', distPath);

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
