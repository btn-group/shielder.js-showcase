import { FC } from "react";
import { Toaster } from "react-hot-toast";

export const HotToastConfig: FC = () => {
  return (
    <Toaster
      containerStyle={{
        top: 60,
      }}
      toastOptions={{
        position: "top-center",
        style: {
          wordBreak: "break-all",
          maxWidth: "30rem",
          background: "#1a1b1f",
          color: "white",
          borderRadius: "12px",
        },
        success: {
          duration: 5000,
        },
      }}
    />
  );
};
