'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createCategoryAction, updateCategory } from '@/actions/category-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { useRouter } from 'next/navigation';
import { ICategory } from '@/model/categorySchema';
import { Textarea } from '../ui/textarea';

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required.").max(250),
  description: z.string().max(500).optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: ICategory;
  onClose?: () => void;
}

export function CategoryForm({ initialData, onClose }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const onSubmit = (data: CategoryFormValues) => {
    startTransition(async () => {
      const action = initialData ? updateCategory(initialData._id.toString(), data) : createCategoryAction(data);
      const result = await action;
      if (result.success) {
        toast.success(initialData ? "Category updated successfully" : "Category created successfully");
        onClose?.();
        router.push("/dashboard/categories");
      } else {
        toast.error("Something went wrong");
      }
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField name="name" render={({ field }) => <FormItem>
          <Label htmlFor="name">Name</Label>
          <FormControl>
            <Input id="name" {...field} />
          </FormControl>
        </FormItem>} />

        <FormField name="description" render={({ field }) => <FormItem>
          <Label htmlFor="description">Description</Label>
          <FormControl>
            <Textarea id="description" {...field} />
          </FormControl>
        </FormItem>} />

        <Button type="submit" disabled={isPending}>
          {isPending ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Category' : 'Create Category')}
        </Button>
      </form>
    </Form>
  );
}
