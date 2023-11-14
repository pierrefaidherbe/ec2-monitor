import {
  EC2Client,
  DescribeInstancesCommand,
  StopInstancesCommand,
  StartInstancesCommand,
  waitUntilInstanceStopped,
  waitUntilInstanceRunning,
} from "@aws-sdk/client-ec2";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { probe } from "@network-utils/tcp-ping";
import { z } from "zod";

export const ec2Router = createTRPCRouter({
  getInstance: publicProcedure
    .output(
      z.object({
        awsServer: z.boolean(),
        minecraftServer: z.boolean(),
        minecraftServerIp: z.string().nullish(),
      }),
    )
    .query(async () => {
      const client = new EC2Client();
      const instance = await client.send(
        new DescribeInstancesCommand({
          Filters: [
            {
              Name: "instance-state-name",
              Values: ["running", "stopped", "pending", "stopping"],
            },
            { Name: "tag:Name", Values: ["MinecraftServer"] },
          ],
        }),
      );

      const ip = instance.Reservations?.[0]?.Instances?.[0]?.PublicIpAddress;
      let minecraftServer = false;

      if (ip) {
        minecraftServer = await probe(25565, ip);
      }

      const awsServer =
        instance.Reservations?.[0]?.Instances?.[0]?.State?.Name === "running";

      return {
        awsServer: awsServer ?? false,
        minecraftServer: awsServer && minecraftServer,
        minecraftServerIp: ip,
      };
    }),

  stopInstance: publicProcedure.mutation(async () => {
    const client = new EC2Client();
    const instance = await client.send(
      new DescribeInstancesCommand({
        Filters: [
          {
            Name: "instance-state-name",
            Values: ["running", "stopped", "pending", "stopping"],
          },
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

    // const e = await waitUntilInstanceStopped(
    //   { client, maxWaitTime: 300, minDelay: 1, maxDelay: 5 },
    //   { InstanceIds: [instance.Reservations[0].Instances[0].InstanceId!] },
    // );

    // return true;
  }),

  startInstance: publicProcedure.mutation(async () => {
    const client = new EC2Client();
    const instance = await client.send(
      new DescribeInstancesCommand({
        Filters: [
          {
            Name: "instance-state-name",
            Values: ["running", "stopped", "pending", "stopping"],
          },
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

    // const e = await waitUntilInstanceRunning(
    //   { client, maxWaitTime: 300, minDelay: 1, maxDelay: 5 },
    //   { InstanceIds: [instance.Reservations[0].Instances[0].InstanceId!] },
    // );

    // return true;
  }),
});
