//Prisma model
import { Category } from '@prisma/client'
import { FC } from 'react'

interface CategoryDetailsProps {
  data?: Category
}

const CategoryDetails: FC<CategoryDetailsProps> = ({ data }) => {
  return <div></div>
}

export default CategoryDetails