//Prisma model
import { CategoryFormSchema } from '@/lib/schemas';
import { Category } from '@prisma/client';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface CategoryDetailsProps {
  data?: Category;
}

const CategoryDetails: FC<CategoryDetailsProps> = ({ data }) => {
  // Form hook form managing form state and validation
  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver,
  });
  return <div></div>;
};

export default CategoryDetails;
