import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    list(): Promise<{
        id: string;
        name: string;
        slug: string;
    }[]>;
}
