import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Pixel Icon Studio API (placeholder)'));

export default app;
