import Image from "next/image";
import Link from "next/link";
import shilederLogo from "public/brand/shielder-logo.png";
import { FC } from "react";
import "twin.macro";

export const HomePageTitle: FC = () => {
  const title = "shielderJS";
  const desc = "Zero Knowledge proof in browser. Keep your private data localy";
  const githubHref = "https://github.com/Degen-Alliance/shielder.js";

  return (
    <>
      <div tw="flex flex-col items-center text-center font-mono">
        {/* Logo & Title */}
        <Link
          href={githubHref}
          target="_blank"
          className="group"
          tw="flex cursor-pointer flex-col items-center gap-4 rounded-3xl py-1.5 px-3.5 transition-all hover:bg-gray-900"
        >
          <Image src={shilederLogo} priority width={60} alt="shielderJS Logo" />
          <h1 tw="font-black text-[2.5rem]">{title}</h1>
        </Link>

        {/* Tagline & Links */}
        <p tw="mt-2 text-gray-600 text-sm">
          By{" "}
          <a
            href="https://github.com/Degen-Alliance"
            target="_blank"
            tw="font-semibold text-gray-500 hover:text-gray-100"
          >
            Degen Alliance
          </a>
        </p>
        <p tw="mt-4 mb-6 text-gray-400">{desc}</p>

        <div tw="my-14 w-14 bg-gray-800 h-[2px]" />
      </div>
    </>
  );
};
