import type { NextFunction, Request, Response } from 'express';
import { auth as betterAuth } from '../lib/auth'

export enum UserRole {
    ADMIN = "ADMIN",
    PROVIDER = "PROVIDER",
    CUSTOMER = "CUSTOMER",
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: UserRole;
                emailVerified: boolean;
            }
        }
    }
}


const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log("middleware calling........");
        console.log(roles);

        // get user session
        const session = await betterAuth.api.getSession({ headers: req.headers as any });

        if (!session || !session.user) {
            return res.status(401).send({ message: 'Unauthorized' });
        }

        if (!session.user.emailVerified) {
            return res.status(403).send({ message: 'Please verify your email to access this resource' });
        }

        const role = session.user.role as UserRole | undefined;
        if (!role || !(role === UserRole.ADMIN || role === UserRole.PROVIDER || role === UserRole.CUSTOMER)) {
            return res.status(403).send({ message: 'Account role is invalid. Please contact support or set a valid role.' });
        }

        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: role,
            emailVerified: !!session.user.emailVerified,
        };

        if (roles.length > 0 && !roles.includes(req.user.role as UserRole)) {
            return res.status(403).send({ message: `Your current role is ${req.user.role} and you don't have permission to access this resource` });
        }
        next();
    }
}

export { auth };
