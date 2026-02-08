import 'dotenv/config';
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import { UserRole } from "../middleware/auth";

async function seedAdmin() {
    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "abubakkar.cce25.iiuc@gmail.com";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "password12345";

    try {
        const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

        if (existingAdmin) {

            console.log("Admin user already exists with the email:", adminEmail);

            await prisma.user.update({ where: { email: adminEmail }, data: { emailVerified: true } });
            console.log('Admin already exists:', adminEmail);
            return;
        }

        const newAdmin = await auth.api.signUpEmail({
            body: {
                email: adminEmail,
                password: adminPassword,
                name: "SnackSnap Admin",
                role: UserRole.ADMIN,
            },
        } as any);

        if (newAdmin) {
            await prisma.user.update({
                where: { email: adminEmail },
                data: { emailVerified: true }
            });

            console.log('Admin created:', adminEmail);
            console.log('Password (local/dev only):', adminPassword);

        }
        else {
            console.warn('auth.api.signUpEmail returned falsy result for', adminEmail);
        }

    } catch (error) {

        console.error("Error seeding admin user:", error);

    } finally {

        try {
            await prisma.$disconnect();
            console.log('Prisma disconnected. Seed script finished.');
        } 
        
        catch (e) {
            console.error('Error disconnecting Prisma:', e);
        }
    }
}

seedAdmin();