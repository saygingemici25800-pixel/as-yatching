import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Yerelleştirilmiş gezinme: sayfalar `next/link` yerine buradaki `Link`'i
 * kullanır; href iç yol (örn. "/turlar") olarak yazılır, aktif dile göre
 * doğru adres üretilir.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
