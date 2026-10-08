import Link from "next/link";
import { ChevronLeft } from "./icons";

export function GoBack({ href, light = false }: { href: string; light?: boolean }) {
  return (
    <Link className={"go-back" + (light ? " light" : "")} href={href}>
      <ChevronLeft />
      <span>Go Back</span>
    </Link>
  );
}
