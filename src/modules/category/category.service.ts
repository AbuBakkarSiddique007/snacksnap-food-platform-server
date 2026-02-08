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


const getAllCategories = async () => {
    const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
    return categories;
};

const getCategoryById = async (id: string) => {
    if (!id) throw new Error('Category id is required');
    const category = await prisma.category.findUnique({ where: { id } });
    return category;
};

export const categoryService = {
    createCategory,
    getAllCategories,
    getCategoryById,
};