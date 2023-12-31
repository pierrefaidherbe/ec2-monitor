import { Button, Chip, Tabs, Tab } from "@nextui-org/react";
import Head from "next/head";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { api } from "~/utils/api";
import { Snippet } from "@nextui-org/react";
import { type GetServerSidePropsContext } from "next";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";

import { useEffect, useState } from "react";

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: context,
    transformer: superjson,
  });

  await helpers.ec2.getInstance.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

export default function Home() {
  const instance = api.ec2.getInstance.useQuery();

  const queryClient = api.useUtils();

  const [expectedState, setExpectedState] = useState<boolean>(
    !!instance.data?.awsServer && !!instance.data?.minecraftServer,
  );

  const isExpectedState = () => {
    return (
      (!!instance.data?.awsServer && !!instance.data?.minecraftServer) ===
      expectedState
    );
  };

  const stopMutation = api.ec2.stopInstance.useMutation({
    onSuccess: () => queryClient.invalidate(),
  });

  const startMutation = api.ec2.startInstance.useMutation({
    onSuccess: () => queryClient.invalidate(),
  });

  const handleStart = () => {
    startMutation.mutate();
    setExpectedState(true);
  };

  const handleStop = () => {
    stopMutation.mutate();
    setExpectedState(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidate().catch((err) => {
        console.error(err);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [queryClient]);

  const renderServerState = (state: boolean) => {
    switch (state) {
      case true:
        return (
          <Chip color="success" variant="dot">
            Running
          </Chip>
        );

      case false:
        return (
          <Chip color="danger" variant="dot">
            Stopped
          </Chip>
        );

      default:
        break;
    }
  };

  const renderMinecraftServerState = (state: boolean) => {
    switch (state) {
      case true:
        return (
          <Chip color="success" variant="dot">
            Online
          </Chip>
        );

      case false:
        return (
          <Chip color="danger" variant="dot">
            Offline
          </Chip>
        );

      default:
        break;
    }
  };

  const renderStartStopServerButton = (state: boolean) => {
    switch (state) {
      case true:
        return (
          <Button
            color="primary"
            onClick={handleStop}
            isLoading={!isExpectedState()}
          >
            Stop
          </Button>
        );

      case false:
        return (
          <Button
            color="primary"
            onClick={handleStart}
            isLoading={!isExpectedState()}
          >
            Start
          </Button>
        );

      default:
        break;
    }
  };

  return (
    <>
      <Head>
        <title>RPA Minecraft Server</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto pt-5">
        <Tabs className="mb-5">
          <Tab key="server" title="Server">
            {instance.data && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">Server is </span>
                  {renderServerState(instance.data.awsServer)}
                  <span className="text-lg"> Minecraft Server is </span>
                  {renderMinecraftServerState(instance.data.minecraftServer)}
                </div>
                {instance.data.awsServer && instance.data.minecraftServer && (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg">Minecraft Server IP:</span>
                      <Snippet symbol="">
                        {instance.data.minecraftServerIp + ":25565"}
                      </Snippet>
                    </div>
                  </>
                )}
                <div className="mt-3">
                  {renderStartStopServerButton(
                    instance.data.awsServer && instance.data.minecraftServer,
                  )}
                </div>
              </div>
            )}
          </Tab>
          <Tab key="Sounds" title="Sounds" isDisabled></Tab>
        </Tabs>
      </div>
    </>
  );
}
