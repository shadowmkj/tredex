'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productSchema } from '@/zod/product-schema';
import { createProduct, updateProduct } from '@/actions/product-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { ICategory } from '@/model/categorySchema';
import { IProduct } from '@/model/productSchema';
import { IBrand } from '@/model/brandSchema';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: IProduct;
}

export function ProductForm({ product }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreviews, setImagePreviews] = useState<{ url: string, file?: File, existing?: string }[]>([]);

  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setImagePreviews(product.images.map(url => ({ url, existing: url })));
    }

    return () => {
      imagePreviews.forEach(preview => {
        if (preview.file) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.images]);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      category: (product?.category as ICategory)?._id.toString() || "",
      brand: (product?.brand as IBrand)?._id.toString() || "",
      price: product?.price || 0,
      discountPrice: product?.discountPrice || undefined,
      description: product?.description || "",
      available: product?.available ?? true,
      is_new: product?.is_new ?? false,
      showInSlider: product?.showInSlider ?? false,
      sex: product?.sex || 'Men',
      sizes: product?.sizes.join(',') || "",
      images: product?.images || []
    },
  });

  const handleRemoveImage = (index: number) => {
    const imageToRemove = imagePreviews[index];

    // Revoke object URL if it's a newly added file
    if (imageToRemove.file) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    // Update image previews state
    const newImagePreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newImagePreviews);

    // Update form images array
    const currentFormImages = form.getValues('images');
    const newFormImages = currentFormImages?.filter((_, i) => i !== index);
    form.setValue('images', newFormImages);

    // If the removed image was the last one, clear the file input
    if (newImagePreviews.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;

    setImagePreviews(previews => {
      const newPreviews = [...previews];
      const [item] = newPreviews.splice(index, 1);
      newPreviews.unshift(item);
      return newPreviews;
    });

    const currentImages = form.getValues('images') || [];
    const newImages = [...currentImages];
    const [imageFile] = newImages.splice(index, 1);
    newImages.unshift(imageFile);
    form.setValue('images', newImages, { shouldDirty: true });
    toast.success("Primary image set");
  }

  const onSubmit = (data: ProductFormValues) => {
    startTransition(async () => {
      const existingImageUrls = data.images?.filter((image): image is string => typeof image === 'string');
      const imageFiles = data.images?.filter((image): image is File => image instanceof File);

      let newImageUrls: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      if (imageFiles?.length! > 0) {
        const formData = new FormData();
        imageFiles?.forEach(file => formData.append('images', file));

        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Image upload failed.');
          }

          const result = await response.json();
          newImageUrls = result.urls;
        } catch (error) {
          toast.error('Failed to upload images.');
          console.error('Image upload error:', error);
          return; // Stop submission if upload fails
        }
      }

      const finalImageUrls = [...existingImageUrls!, ...newImageUrls];

      const productData = {
        ...data,
        images: finalImageUrls,
      };

      if (product) {
        const result = await updateProduct(product._id.toString(), productData);
        if (result.message.includes('successfully')) {
          toast.success(result.message);
          router.push("/dashboard/products")
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await createProduct(productData);
        if (result.message.includes('successfully')) {
          toast.success(result.message);
          router.push("/dashboard/products")
        } else {
          toast.error(result.message);
        }
      }
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <FormField name="name" render={({ field }) => <FormItem>
            <Label htmlFor="name">Name</Label>
            <FormControl>
              <Input id="name" {...field} />
            </FormControl>
          </FormItem>} />
        </div>
        <div>
          <FormField name="description" render={({ field }) => <FormItem>
            <Label htmlFor="description">Description</Label>
            <FormControl>
              <Textarea id="description" {...field} />
            </FormControl>
          </FormItem>} />
        </div>
        <div>
          <FormField name="price" render={({ field }) => <FormItem>
            <Label htmlFor="price">Price</Label>
            <FormControl>
              <Input id="price" {...field} value={field.value ?? ''} />
            </FormControl>
          </FormItem>} />
        </div>
        <div>
          <FormField name="discountPrice" render={({ field }) => <FormItem>
            <Label htmlFor="discountPrice">Pre-Discount</Label>
            <FormControl>
              <Input id="discountPrice" {...field} value={field.value ?? ''} />
            </FormControl>
          </FormItem>} />
        </div>
        <div>
          <FormField name="sizes" render={({ field }) => <FormItem>
            <Label htmlFor="sizes">Sizes (comma-separated)</Label>
            <FormControl>
              <Input id="sizes" {...field} />
            </FormControl>
          </FormItem>} />
        </div>

        <div className='flex justify-between md:justify-start space-x-4'>
          <FormField name="category" render={({ field }) => <FormItem>
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories?.data?.map((category) => <SelectItem value={category._id.toString()} key={category._id.toString()}>{category.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormItem>} />
          <FormField name="brand" render={({ field }) => <FormItem>
            <Label htmlFor="brand">Brand</Label>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {brands?.data?.map((brand) => <SelectItem value={brand._id.toString()} key={brand._id.toString()}>{brand.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormItem>} />
          <FormField name="sex" render={({ field }) => <FormItem>
            <Label htmlFor="sex">Sex</Label>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Men">Men</SelectItem>
                <SelectItem value="Women">Women</SelectItem>
                <SelectItem value="Unisex">Unisex</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>} />
        </div>

        <div className="flex items-center space-x-2">
          <FormField name="available" render={({ field }) => <FormItem>
            <div className='flex items-center gap-x-2'>
              <FormControl>
                <Checkbox id="available" {...field} checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <Label htmlFor="available">Available for sale</Label>
            </div>
          </FormItem>} />
        </div>

        <div className="flex items-center space-x-2">
          <FormField name="showInSlider" render={({ field }) => <FormItem>
            <div className='flex items-center gap-x-2'>
              <FormControl>
                <Checkbox id="showInSlider" {...field} checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <Label htmlFor="showInSlider">Show in Slider</Label>
            </div>
          </FormItem>} />
        </div>

        <div className="flex items-center space-x-2">
          <FormField name="is_new" render={({ field }) => <FormItem>
            <div className='flex items-center gap-x-2'>
              <FormControl>
                <Checkbox id="is_new" {...field} checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <Label htmlFor="is_new">New arrival</Label>
            </div>
          </FormItem>} />
        </div>

        <div>
          <FormField name="images" render={({ field }) => <FormItem>
            <Label htmlFor="images">Images</Label>
            <FormControl>
              <Input
                id="images"
                type="file"
                multiple
                ref={fileInputRef}
                onChange={(e) => {
                  const files = Array.from(e.target.files!);
                  const newImagePreviews = files.map(file => ({
                    url: URL.createObjectURL(file),
                    file,
                  }));
                  setImagePreviews(prev => [...prev, ...newImagePreviews]);
                  field.onChange([...field.value, ...files]);
                }}
              />
            </FormControl>
            <p className="text-sm text-muted-foreground">
              For demonstration, image compression is done in the browser. In a real app, you would upload to a storage service.
            </p>
            {imagePreviews.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setImagePreviews([]);
                  form.setValue('images', []);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Clear All Images
              </Button>
            )}
          </FormItem>} />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4'>
          {imagePreviews.map((preview, index) => (
            <div
              key={preview.url}
              className='relative w-[25vh] h-[25vh] group border rounded-md mx-auto'
            >
              <Image src={preview.url} fill alt={`image-preview-${index}`} className='object-cover rounded-md' />
              <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center'>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleSetPrimaryImage(index)}
                  >
                    Set as Primary
                  </Button>
                )}
              </div>
              {index === 0 && (
                <div className='absolute top-1 left-1 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded'>
                  Primary
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className='absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={() => handleRemoveImage(index)}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? (product ? 'Updating...' : 'Creating...') : (product ? 'Update Product' : 'Create Product')}
        </Button>
      </form>
    </Form>
  );
}
