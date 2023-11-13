import { type AppType } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import { api } from "~/utils/api";
import { Montserrat } from "next/font/google";

import "~/styles/globals.scss";

const montserrat = Montserrat({
  subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <NextUIProvider>
      <main className={"h-screen bg-gray-800 text-gray-100 dark"}>
        <div className={montserrat.className}>
          <Component {...pageProps} />
        </div>
      </main>
    </NextUIProvider>
  );
};

export default api.withTRPC(MyApp);
