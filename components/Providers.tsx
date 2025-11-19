import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export default function  Providers({children}:{children:ReactNode}) {
  return (
    <div>
            <Toaster
  position="top-center"
  reverseOrder={false}
/>
        {children}
    </div>
  );
}




