import type { ImageRole, ProductImageView } from "@lumen/shared";

export function imageByRole(images: ProductImageView[], role: ImageRole): ProductImageView | undefined {
  return images.find((image) => image.role === role) ?? images[0];
}
