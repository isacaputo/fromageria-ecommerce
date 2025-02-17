'use client';

//Prisma model
import { CategoryFormSchema } from '@/lib/schemas';
import { Category } from '@prisma/client';
import { FC, useEffect } from 'react';
import { useForm } from "react-hook-form";
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface CategoryDetailsProps {
  data?: Category;
}

const CategoryDetails: FC<CategoryDetailsProps> = ({ data }) => {
  // Form hook form managing form state and validation
  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: data?.name || '',  // Make sure the name is controlled
      image: data?.image ? [{ url: data?.image }] : [],  // Default empty array for images
      url: data?.url || '',  // Ensure url is controlled
      featured: data?.featured || false,  // Default to false for featured
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name,
        image: [{ url: data.image }],
        url: data.url,
        featured: data.featured
      });
    }
  }, [data, form]);

  const handleSubmit = async (values: z.infer<typeof CategoryFormSchema>) => {
    console.log(values);
  };

  return <AlertDialog>
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Category Information</CardTitle>
        <CardDescription>{data?.id ? `Update ${data?.name} category information.` : 'Lets create a category'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              disabled={isLoading}
              // control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Category name</FormLabel>
                  <FormControl>
                    <Input {...field}
                      placeholder="Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              // control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Category url</FormLabel>
                  <FormControl>
                    <Input placeholder="/category-url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              // control={form.control}
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
                      This Category will appear on the home page
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  </AlertDialog>;
};

export default CategoryDetails;

