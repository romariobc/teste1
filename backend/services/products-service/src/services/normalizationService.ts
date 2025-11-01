import { createProduct, findProductByNormalizedName, Product } from '../models/Product';

/**
 * Normalize product name
 * - Convert to lowercase
 * - Remove accents
 * - Remove extra spaces
 * - Standardize common abbreviations
 */
export const normalizeProductName = (name: string): string => {
  let normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // Standardize common abbreviations
  const abbreviations: Record<string, string> = {
    'kg': 'kg',
    'kilo': 'kg',
    'quilo': 'kg',
    'l': 'l',
    'lt': 'l',
    'litro': 'l',
    'ml': 'ml',
    'g': 'g',
    'gr': 'g',
    'grama': 'g',
    'gramas': 'g',
    'un': 'un',
    'unidade': 'un',
    'pc': 'un',
    'pct': 'pct',
    'pacote': 'pct',
  };

  // Replace abbreviations
  Object.entries(abbreviations).forEach(([key, value]) => {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    normalized = normalized.replace(regex, value);
  });

  return normalized;
};

/**
 * Categorize product based on name
 * Simple rule-based categorization
 * In production, could use ML or more sophisticated rules
 */
export const categorizeProduct = (name: string): string | null => {
  const nameLower = name.toLowerCase();

  // Grains and cereals
  if (
    nameLower.includes('arroz') ||
    nameLower.includes('feijao') ||
    nameLower.includes('macarrao') ||
    nameLower.includes('massa')
  ) {
    return 'Grãos e Cereais';
  }

  // Dairy
  if (
    nameLower.includes('leite') ||
    nameLower.includes('queijo') ||
    nameLower.includes('iogurte') ||
    nameLower.includes('manteiga')
  ) {
    return 'Laticínios';
  }

  // Meat and fish
  if (
    nameLower.includes('carne') ||
    nameLower.includes('frango') ||
    nameLower.includes('peixe') ||
    nameLower.includes('linguica')
  ) {
    return 'Carnes e Peixes';
  }

  // Fruits and vegetables
  if (
    nameLower.includes('banana') ||
    nameLower.includes('maca') ||
    nameLower.includes('laranja') ||
    nameLower.includes('tomate') ||
    nameLower.includes('alface') ||
    nameLower.includes('batata')
  ) {
    return 'Frutas e Verduras';
  }

  // Beverages
  if (
    nameLower.includes('refrigerante') ||
    nameLower.includes('suco') ||
    nameLower.includes('agua') ||
    nameLower.includes('cerveja') ||
    nameLower.includes('vinho')
  ) {
    return 'Bebidas';
  }

  // Bakery
  if (
    nameLower.includes('pao') ||
    nameLower.includes('bolo') ||
    nameLower.includes('biscoito') ||
    nameLower.includes('torrada')
  ) {
    return 'Padaria';
  }

  // Cleaning products
  if (
    nameLower.includes('sabao') ||
    nameLower.includes('detergente') ||
    nameLower.includes('amaciante') ||
    nameLower.includes('desinfetante')
  ) {
    return 'Limpeza';
  }

  // Personal care
  if (
    nameLower.includes('shampoo') ||
    nameLower.includes('condicionador') ||
    nameLower.includes('sabonete') ||
    nameLower.includes('creme dental')
  ) {
    return 'Higiene Pessoal';
  }

  // Default
  return 'Outros';
};

/**
 * Find or create product with normalization
 * Used by Receipt Service to process products
 */
export const findOrCreateProduct = async (
  name: string,
  unit: string = 'UN'
): Promise<Product> => {
  const normalizedName = normalizeProductName(name);

  // Try to find existing product
  const existingProduct = await findProductByNormalizedName(normalizedName);

  if (existingProduct) {
    console.log(`Found existing product: ${name} -> ${existingProduct.id}`);
    return existingProduct;
  }

  // Create new product with auto-categorization
  const category = categorizeProduct(name);

  console.log(`Creating new product: ${name} (category: ${category})`);

  const product = await createProduct({
    name,
    normalizedName,
    category,
    unit,
  });

  return product;
};

/**
 * Extract unit from product name
 * Examples: "ARROZ 5KG" -> "5kg", "LEITE 1L" -> "1l"
 */
export const extractUnitFromName = (name: string): string | null => {
  // Match patterns like: 5kg, 1l, 500ml, 2un, etc
  const match = name.match(/(\d+(?:\.\d+)?)\s*(kg|l|ml|g|un|pc|pct)/i);

  if (match) {
    const quantity = match[1];
    const unit = match[2].toLowerCase();
    return `${quantity}${unit}`;
  }

  return null;
};

/**
 * Suggest category based on similar products
 * Finds products with similar normalized names and returns most common category
 */
export const suggestCategory = async (name: string): Promise<string | null> => {
  const normalizedName = normalizeProductName(name);

  // Get first 3 words for similarity search
  const words = normalizedName.split(' ').slice(0, 3).join(' ');

  // This is a simplified version
  // In production, you'd want more sophisticated similarity matching
  return categorizeProduct(name);
};
