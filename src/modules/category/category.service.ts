import { prisma } from '../../lib/prisma';

const createCategory = async (payload: { name: string; description?: string }) => {
    
    const { name, description } = payload;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new Error('Category name is required');
    }

    const category = await prisma.category.create({
        data: {
            name: name.trim(),
            description: description?.trim() || null,
        },
    });

    return category;
}

export const categoryService = {
    createCategory
};