import TopBar from "@components/tobBar/TopBar";
import { FC, PropsWithChildren } from "react";
import "twin.macro";

export const BaseLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <div tw="relative flex min-h-full flex-col">
        <TopBar />
        <main tw="relative flex grow flex-col">{children}</main>
      </div>
    </>
  );
};
