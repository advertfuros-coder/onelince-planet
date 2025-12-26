// Helper function to create URL-friendly slugs from product names
export function createSlug(text) {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

// Create a product URL with both ID and slug
export function createProductUrl(product) {
  if (!product) return "/products";

  const id = product._id || product.id;
  const slug = createSlug(product.name);

  // Format: /products/product-name-id
  return `/products/${slug}-${id}`;
}

// Extract ID from a slug-based URL
export function extractIdFromSlug(slugWithId) {
  if (!slugWithId) return null;

  // Extract the last part after the final hyphen (the ID)
  const parts = slugWithId.split("-");
  return parts[parts.length - 1];
}
