import 'dotenv/config';
import app from "./app";
import { prisma } from './lib/prisma';

const port = process.env.PORT || 4000

async function server() {
    try {
        await prisma.$connect()
        console.log("Database Connected Successfully");

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

    } catch (error) {
        console.error('Failed to start the server:', error);

        await prisma.$disconnect()
        process.exit(1);
    }
}

server();