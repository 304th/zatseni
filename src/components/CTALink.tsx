"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

interface CTALinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export default function CTALink({ href, className, children }: CTALinkProps) {
  const { data: session, status } = useSession();

  const targetHref = status === "authenticated" ? "/dashboard" : href;

  return (
    <Link href={targetHref} className={className}>
      {children}
    </Link>
  );
}
