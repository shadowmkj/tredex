'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { useBrands } from "@/hooks/use-brands";
import { useCategories } from "@/hooks/use-categories";
import { useFilterStore } from '@/hooks/use-filter-store';
import { useSearchParams } from "next/navigation";
import { useEffect } from 'react';

const sizes = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
const sex = ["Men", "Women", "Unisex"];

export function Filter() {
    const searchParams = useSearchParams();
    const { filters, setFilter, initializeWithUrlParams } = useFilterStore();
    const { data: categories } = useCategories()
    const { data: brands } = useBrands()

    useEffect(() => {
        initializeWithUrlParams(searchParams);
    }, [searchParams, initializeWithUrlParams]);

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="font-semibold mb-2">Category</h3>
                    {categories?.data?.map((category) => (
                        <div key={category._id.toString()} className="flex items-center space-x-2">
                            <Checkbox
                                id={`category-${category._id.toString()}`}
                                checked={filters.category.includes(category.name)}
                                onCheckedChange={() => setFilter('category', category.name)}
                                className="h-5 w-5"
                            />
                            <label htmlFor={`category-${category._id.toString()}`}>{category.name}</label>
                        </div>
                    ))}
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Size</h3>
                    <div className="grid grid-cols-2 ">
                        {sizes.map((size) => (
                            <div key={size} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`size-${size}`}
                                    checked={filters.size.includes(size)}
                                    onCheckedChange={() => setFilter('size', size)}
                                    className="h-5 w-5"
                                />
                                <label htmlFor={`size-${size}`}>{size}</label>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Gender</h3>
                    {sex.map((s) => (
                        <div key={s} className="flex items-center space-x-2">
                            <Checkbox
                                id={`sex-${s}`}
                                checked={filters.sex.includes(s)}
                                onCheckedChange={() => setFilter('sex', s)}
                                className="h-5 w-5"
                            />
                            <label htmlFor={`sex-${s}`}>{s}</label>
                        </div>
                    ))}
                </div>
                {/* <div> */}
                {/*   <h3 className="font-semibold mb-2">Color</h3> */}
                {/*   {colors.map((color) => ( */}
                {/*     <div key={color} className="flex items-center space-x-2"> */}
                {/*       <Checkbox */}
                {/*         id={`color-${color}`} */}
                {/*         checked={filters.color.includes(color)} */}
                {/*         onCheckedChange={() => setFilter('color', color)} */}
                {/*         className="h-5 w-5" */}
                {/*       /> */}
                {/*       <label htmlFor={`color-${color}`}>{color}</label> */}
                {/*     </div> */}
                {/*   ))} */}
                {/* </div> */}
                <div>
                    <h3 className="font-semibold mb-2">Brand</h3>
                    {brands?.data?.map((brand) => (
                        <div key={brand._id.toString()} className="flex items-center space-x-2">
                            <Checkbox
                                id={`brand-${brand._id.toString()}`}
                                checked={filters.brand.includes(brand.name)}
                                onCheckedChange={() => setFilter('brand', brand.name)}
                                className="h-5 w-5"
                            />
                            <label htmlFor={`brand-${brand._id.toString()}`}>{brand.name}</label>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
