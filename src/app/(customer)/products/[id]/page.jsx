import ProductDetailPage from "@/components/product/ProductDetailPage";

 
export default function ProductPage({ params }) {
  return <ProductDetailPage productId={params.id} />;
}

export async function generateMetadata({ params }) {
  try {
    const response = await fetch(`/api/products/${params.id}`);
    const data = await response.json();
    
    if (data.success) {
      return {
        title: `${data.product.name} - Your Store`,
        description: data.product.shortDescription || data.product.description,
      };
    }
  } catch (error) {
    console.error('Error generating meta', error);
  }

  return {
    title: 'Product Details',
  };
}
