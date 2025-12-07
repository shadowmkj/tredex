'use client';

import ProductCard from '@/components/feature/landing-page/ProductCard';
import { Card, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRelatedProducts } from '@/hooks/use-related-products';

interface RelatedProductsProps {
  currentProductId: string;
}

export function RelatedProducts({ currentProductId }: RelatedProductsProps) {
  const { relatedProducts, isLoading, isError } = useRelatedProducts(currentProductId);
  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Related Products</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="shrink-0 w-[30vh] md:w-[40vh]  overflow-hidden p-0 relative">
              <div className="relative bg-background h-[20vh] sm:h-[20rem]">
                <Skeleton className="w-full h-full rounded-t-lg" />
              </div>
              <CardFooter className="flex flex-col items-start p-4 py-0">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex flex-col justify-between items-center w-full mt-2">
                  <Skeleton className="h-4 w-1/3 self-start" />
                  <div className='flex justify-between items-center mb-2 sm:mb-4 self-end gap-x-2'>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !relatedProducts || relatedProducts.length === 0) {
    return null; // Hide the section if API fails or no related products
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Related Products</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {relatedProducts.map((product) => (
          <div key={product._id.toString()} className="shrink-0 w-[30vh] md:w-[40vh]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
