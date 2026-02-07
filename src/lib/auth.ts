import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    trustedOrigins: [process.env.APP_URL!],

    user: {
        additionalFields: {
            role: {
                type: "string",
                label: "Role",
                required: true,
                options: [
                    { value: "CUSTOMER", label: "Customer" },
                    { value: "PROVIDER", label: "Provider" }
                ],
                default: "CUSTOMER"
            },
            phone: {
                type: "string",
                required: false
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false
            }
        }
    },

    emailAndPassword: {
        enabled: true,
    },
});
