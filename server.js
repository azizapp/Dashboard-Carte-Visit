import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
    setHeaders: (res, filepath) => {
        // Set correct MIME types
        if (filepath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filepath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filepath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        } else if (filepath.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml');
        } else if (filepath.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (filepath.endsWith('.jpg') || filepath.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (filepath.endsWith('.ico')) {
            res.setHeader('Content-Type', 'image/x-icon');
        } else if (filepath.endsWith('.woff')) {
            res.setHeader('Content-Type', 'font/woff');
        } else if (filepath.endsWith('.woff2')) {
            res.setHeader('Content-Type', 'font/woff2');
        }
    }
}));

// Handle SPA routing - send index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
