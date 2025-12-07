'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createBrandAction, updateBrandAction } from '@/actions/brand-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { useRouter } from 'next/navigation';
import { IBrand } from '@/model/brandSchema';
import { brandSchema } from '@/zod/brand-schema';
import { useQueryClient } from '@tanstack/react-query';

export type BrandFormValues = z.infer<typeof brandSchema>;

interface BrandFormProps {
  brand?: IBrand;
  onClose: () => void;
}

export function BrandForm({ brand, onClose }: BrandFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient()
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: brand?.name || "",
    },
  });

  const onSubmit = (data: BrandFormValues) => {
    startTransition(async () => {
      const action = brand ? updateBrandAction(brand._id.toString(), data) : createBrandAction(data);
      const result = await action;
      if (result.success) {
        toast.success(brand ? "Brand updated successfully" : "Brand created successfully");
        queryClient.invalidateQueries({ queryKey: ["brands"] })
        onClose();
        router.refresh();
      } else {
        toast.error("Something went wrong");
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
        <Button type="submit" disabled={isPending}>
          {isPending ? (brand ? 'Updating...' : 'Creating...') : (brand ? 'Update Brand' : 'Create Brand')}
        </Button>
      </form>
    </Form>
  );
}
