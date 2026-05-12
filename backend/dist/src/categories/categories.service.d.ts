import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listActive(): Promise<{
        id: string;
        name: string;
        slug: string;
    }[]>;
}
