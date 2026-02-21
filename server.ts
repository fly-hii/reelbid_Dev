import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Join item specific room
        socket.on('joinRoom', (itemId) => {
            socket.join(itemId);
            console.log(`Socket ${socket.id} joined room ${itemId}`);
        });

        socket.on('leaveRoom', (itemId) => {
            socket.leave(itemId);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    // Export io to be used in other files potentially, or attach it to global
    // In a real app we might use a Redis adapter for cross-instance socket.io
    (global as any).io = io;

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
