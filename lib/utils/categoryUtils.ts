import Category from '@/lib/models/Category';

// Helper function to get all subcategories recursively
export async function getAllSubcategories(categoryId: string): Promise<string[]> {
  const subcategories = await Category.find({ 
    parent: categoryId, 
    isActive: true 
  }).select('_id').lean();
  
  let allSubcategoryIds: string[] = [];
  
  for (const subcategory of subcategories) {
    const subcategoryId = (subcategory._id as any).toString();
    allSubcategoryIds.push(subcategoryId);
    // Recursively get subcategories of subcategories
    const nestedSubcategories = await getAllSubcategories(subcategoryId);
    allSubcategoryIds = allSubcategoryIds.concat(nestedSubcategories);
  }
  
  return allSubcategoryIds;
}
