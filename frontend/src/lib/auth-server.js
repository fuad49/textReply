import jwt from 'jsonwebtoken';
import { User, ensureDbSync } from './models';

/**
 * Verify JWT token and return the user, or null if invalid.
 */
export async function authenticateRequest(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await ensureDbSync();
        const user = await User.findByPk(decoded.userId);
        return user;
    } catch {
        return null;
    }
}
