'use client';

// Prisma model
import { CategoryFormSchema } from '@/lib/schemas';
import { Category } from '@prisma/client';

import { FC, useEffect, useMemo } from 'react';
import { useForm } from "react-hook-form";
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import ImageUpload from '../shared/image-upload';
import { upsertCategory } from '@/queries/category';
import { v4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface CategoryDetailsProps {
  data?: Category;
}

const CategoryDetails: FC<CategoryDetailsProps> = ({ data }) => {
  // Use useMemo to prevent reinitialization of default values on each render
  const defaultValues = useMemo(() => ({
    name: data?.name || '',
    image: data?.image ? [{ url: data.image }] : [],
    url: data?.url || '',
    featured: data?.featured || false,
  }), [data]);

  // Initializing necessary hooks
  const { toast } = useToast(); // Hook for displaying toast messages
  const router = useRouter(); // Hook for routing

  // Form hook for managing state and validation
  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CategoryFormSchema),
    defaultValues,
  });

  // Loding status based on form submission
  const isLoading = form.formState.isSubmitting;

  // Reset form when data changes
  useEffect(() => {
    if (data) {
      form.reset(defaultValues);
    }
  }, [data, form, defaultValues]);

  const handleSubmit = async (values: z.infer<typeof CategoryFormSchema>) => {
    try {
      const response = await upsertCategory({
        id: data?.id ? data.id : v4(),
        name: values.name,
        image: values.image[0].url,
        url: values.url,
        featured: values.featured,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Displaying success message when form is submitted
      toast({
        title: data?.id ? 'Category has been updated' : `Congratulations! ${response?.name} has been created.`,
      });

      // Redirect or Refresh data
      if (data?.id) {
        router.refresh();
      }
      else {
        router.push('/dashboard/admin/categories/');
      }
    } catch (error: unknown) {
      // Handling form submission errors
      console.log(error);
      toast({
        variant: "destructive",
        title: "Oops!",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
          <CardDescription>
            {data?.id
              ? `Update ${data.name} category information.`
              : "Let's create a category. You can edit category later from the categories table or the category page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form key={data?.id || 'new-category'} {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        type='profile'
                        value={field.value.map((image) => image.url)}
                        onChange={(url) => field.onChange([...field.value, { url }])}
                        onRemove={(url) =>
                          field.onChange([
                            ...field.value.filter(
                              (current) => current.url !== url
                            ),
                          ])
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="/category-url"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        This Category will appear on the home page.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Loading..."
                  : data?.id
                    ? "Save Category Information"
                    : "Create Category"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default CategoryDetails;

