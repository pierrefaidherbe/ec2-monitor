import {
  EC2Client,
  DescribeInstancesCommand,
  StopInstancesCommand,
  StartInstancesCommand,
  waitUntilInstanceStopped,
  waitUntilInstanceRunning,
} from "@aws-sdk/client-ec2"; // ES Modules import
import { createTRPCRouter, publicProcedure } from "../trpc";

export const ec2Router = createTRPCRouter({
  getInstance: publicProcedure.query(async () => {
    const client = new EC2Client();
    const instance = await client.send(
      new DescribeInstancesCommand({
        Filters: [
          // { Name: "instance-state-name", Values: ["running", "stopped"] },
          { Name: "tag:Name", Values: ["MinecraftServer"] },
        ],
      }),
    );

    return instance.Reservations?.[0]?.Instances?.[0] ?? null;
  }),

  stopInstance: publicProcedure.mutation(async () => {
    const client = new EC2Client();
    const instance = await client.send(
      new DescribeInstancesCommand({
        Filters: [
          // { Name: "instance-state-name", Values: ["running", "stopped"] },
          { Name: "tag:Name", Values: ["MinecraftServer"] },
        ],
      }),
    );

    if (!instance.Reservations?.[0]?.Instances?.[0]) {
      return false;
    }

    await client.send(
      new StopInstancesCommand({
        InstanceIds: [instance.Reservations[0].Instances[0].InstanceId!],
      }),
    );

    const e = await waitUntilInstanceStopped(
      { client, maxWaitTime: 300, minDelay: 1, maxDelay: 5 },
      { InstanceIds: [instance.Reservations[0].Instances[0].InstanceId!] },
    );

    console.log(e);

    return true;
  }),

  startInstance: publicProcedure.mutation(async () => {
    const client = new EC2Client();
    const instance = await client.send(
      new DescribeInstancesCommand({
        Filters: [
          // { Name: "instance-state-name", Values: ["running", "stopped"] },
          { Name: "tag:Name", Values: ["MinecraftServer"] },
        ],
      }),
    );

    if (!instance.Reservations?.[0]?.Instances?.[0]) {
      return false;
    }

    await client.send(
      new StartInstancesCommand({
        InstanceIds: [instance.Reservations[0].Instances[0].InstanceId!],
      }),
    );

    const e = await waitUntilInstanceRunning(
      { client, maxWaitTime: 300, minDelay: 1, maxDelay: 5 },
      { InstanceIds: [instance.Reservations[0].Instances[0].InstanceId!] },
    );

    console.log(e);

    return true;
  }),
});
