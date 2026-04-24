import fs from "fs";
import path from "path";

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

export interface LocalImage {
  id: number;
  src: string;
  name: string;
  ext: string;
}

export function getLocalImages(subdir = ""): LocalImage[] {
  const dir = path.join(process.cwd(), "public", "images", subdir);

  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => SUPPORTED_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort()
    .map((file, i) => {
      const ext = path.extname(file).toLowerCase();
      const prefix = subdir ? `${subdir}/` : "";
      return {
        id: i + 1,
        src: `/images/${prefix}${file}`,
        name: path.basename(file, ext).replace(/[-_]/g, " "),
        ext,
      };
    });
}

export function getBannerImages(): LocalImage[] {
  return getLocalImages("banners");
}

export function getProductImages(): LocalImage[] {
  return getLocalImages("products");
}
