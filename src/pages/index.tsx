import { type InstanceStateName } from "@aws-sdk/client-ec2";
import { Button, Chip, Tabs, Tab } from "@nextui-org/react";
import Head from "next/head";

import { api } from "~/utils/api";
import { Snippet } from "@nextui-org/react";

export default function Home() {
  const instance = api.ec2.getInstance.useQuery();
  const queryClient = api.useUtils();

  const stopMutation = api.ec2.stopInstance.useMutation({
    onSuccess: () => queryClient.invalidate(),
  });

  const startMutation = api.ec2.startInstance.useMutation({
    onSuccess: () => queryClient.invalidate(),
  });

  const handleStart = () => {
    startMutation.mutate();
  };

  const handleStop = () => {
    stopMutation.mutate();
  };

  const renderServerState = (state?: InstanceStateName) => {
    switch (state) {
      case "running":
        return (
          <Chip color="success" variant="dot">
            Running
          </Chip>
        );

      case "stopped":
        return (
          <Chip color="danger" variant="dot">
            Stopped
          </Chip>
        );

      default:
        break;
    }
  };

  const renderStartStopServerButton = (state?: InstanceStateName) => {
    switch (state) {
      case "running":
        return (
          <Button
            color="primary"
            onClick={handleStop}
            isLoading={stopMutation.isLoading}
          >
            Stop
          </Button>
        );

      case "stopped":
        return (
          <Button
            color="primary"
            onClick={handleStart}
            isLoading={startMutation.isLoading}
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
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto pt-5">
        <Tabs className="mb-5">
          <Tab key="server" title="Server">
            {instance.data && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">Server is </span>
                  {renderServerState(instance.data.State?.Name)}
                </div>
                {instance.data.State?.Name === "running" && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg">Minecraft Server IP:</span>
                    <Snippet symbol="">
                      {instance.data.PublicIpAddress + ":25565"}
                    </Snippet>
                  </div>
                )}
                <div className="mt-3">
                  {renderStartStopServerButton(instance.data.State?.Name)}
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
