export type CreateProductDto = {
    category_id: string;
    title: string;
    description: string;
    price: number;
    currency?: string;
    city?: string;
    area?: string;
    location_text?: string;
    is_published?: boolean;
};
export type UpdateProductDto = {
    category_id?: string;
    title?: string;
    description?: string;
    price?: number;
    currency?: string;
    city?: string | null;
    area?: string | null;
    location_text?: string;
    is_published?: boolean;
    is_sold?: boolean;
};
export type AddProductImageDto = {
    url: string;
    sort_order?: number;
};
