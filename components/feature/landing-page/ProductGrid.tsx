'use client';

import React, { startTransition, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '@/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from './Search';
import { Sort } from './Sort';
import { Filter } from './Filter';
import { PriceRangeSlider } from './PriceRangeSlider';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { FilterBottomSheet } from './FilterBottomSheet';
import { Button } from '@/components/ui/button';
import { useProductPrices } from '@/hooks/use-product-prices';
import { useFilterStore } from '@/hooks/use-filter-store';
import { FilterBadges } from './FilterBadges';
import { useScroll } from '@/context/ScrollContext';
import { FloatingSearchIcon } from '../floating-search-icon';

interface ProductGridProps {
  title?: string
}
const ProductGrid: React.FC<ProductGridProps> = ({ title = "Collection" }) => {
  const { collectionsGridRef } = useScroll();
  const searchParams = useSearchParams();
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const order = searchParams.get('order') || '';
  const category = searchParams.get('category') || 'Sneakers';
  const sex = searchParams.get('sex') || '';
  const size = searchParams.get('size') || '';
  const color = searchParams.get('color') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    status,
  } = useProducts(limit, search, sort, order, category, size, sex, color, brand, minPrice, maxPrice);

  const { data: prices } = useProductPrices(search, category, size, color, brand);
  const { setPriceBounds, setOpen, toUrlParams, filters } = useFilterStore();
  useEffect(() => {
    if (prices) {
      setPriceBounds({ min: prices.minPrice, max: prices.maxPrice });
    }
  }, [prices, setPriceBounds]);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const getTitle = () => {
    if (pathname === '/') return "Collection"
    if (filters.sex.includes("Men") && filters.sex.includes("Women")) return "Collection"
    if (filters.sex.includes("Men")) {
      return "Shop Men"
    } else if (filters.sex.includes("Women")) {
      return "Shop Women"
    } else {
      return title
    }
  }

  const renderFilters = () => (
    <div className="space-y-8">
      <Search />
      <Filter />
      <PriceRangeSlider />
      <Button onClick={handleApplyFilters}>Apply</Button>
    </div>
  );

  const handleApplyFilters = () => {
    const params = toUrlParams();
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      setOpen(false);
    });
  };
  const handleClearFilter = () => {
    router.replace(pathname, { scroll: false });
  };
  const hasFilters = searchParams.size > 0;
  return (
    <section ref={collectionsGridRef as React.RefObject<HTMLElement>} className="py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">{getTitle()}</h2>
      <div className="grid grid-cols-12 gap-8">
        {!isMobile && (
          <div className="col-span-3 hidden md:block">
            {renderFilters()}
          </div>
        )}
        <div className="col-span-12 md:col-span-9">
          <div className="flex justify-between mb-4">
            {isMobile ? (
              <div className="flex items-center gap-2">
                <FilterBottomSheet />
                {hasFilters && <Button variant="ghost" size="sm" onClick={handleClearFilter}>Clear</Button>}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {hasFilters && <Button variant="ghost" size="sm" onClick={handleClearFilter}>Clear All Filters</Button>}
              </div>
            )}
            <Sort />
          </div>
          <div className="mb-4"><FilterBadges /></div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          ) : status === 'error' ? (
            <p>Error: {error.message}</p>
          ) : data ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {data.pages?.map((group, i) => (
                  <React.Fragment key={i}>
                    {group.data?.map((product) => (
                      <ProductCard key={product._id.toString()} product={product} />
                    ))}
                  </React.Fragment>
                ))}
                {
                  data.pages[0].data.length === 0 && (<p>No products found.</p>)
                }
              </div>
              <div>
                <button
                  ref={ref}
                  onClick={() => fetchNextPage()}
                  disabled={!hasNextPage || isFetchingNextPage}
                >
                  {isFetchingNextPage
                    ? 'Loading more...'
                    : ''}
                </button>
              </div>
              <div>{isFetching && !isFetchingNextPage ? 'Fetching...' : null}</div>
            </>
          ) : null}
        </div>
      </div>
      <FloatingSearchIcon />
    </section>
  );
};

export default ProductGrid;
