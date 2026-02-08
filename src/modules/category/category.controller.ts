import { Request, Response } from 'express';
import { categoryService } from './category.service';

const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body as { name?: string; description?: string };

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const category = await categoryService.createCategory({ name, ...(description && { description }) });

        return res.status(201).json(category);
    } catch (err: any) {
        if (err.message === 'Category name is required') {
            return res.status(400).json({ message: err.message });
        }
        console.error('createCategory error', err);
        return res.status(500).json({ message: 'Failed to create category' });
    }
};

const getCategories = async (req: Request, res: Response) => {
    try {

        const categories = await categoryService.getAllCategories();

        return res.status(200).json(categories);

    } catch (err) {

        console.error('getCategories error', err);
        
        return res.status(500).json({ message: 'Failed to fetch categories' });
    }
};

export const categoryController = {
    createCategory,
    getCategories,
};