import {
  CreateStateMachineCommand,
  DeleteStateMachineCommand,
  DescribeExecutionCommand,
  SFNClient,
  StartExecutionCommand,
} from '@aws-sdk/client-sfn';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

let stateMachineArn: string;

const sfnClient = new SFNClient({
  endpoint: 'http://localhost:8083',
  region: 'us-west-2',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy',
  },
});

beforeAll(async () => {
  const createStateMachineCommand = new CreateStateMachineCommand({
    name: 'SimpleStateMachine',
    definition: JSON.stringify({
      Comment: 'A simple state machine for local testing',
      StartAt: 'PassState',
      States: {
        PassState: {
          Type: 'Pass',
          Result: 'Success',
          End: true,
        },
      },
    }),
    roleArn: 'arn:aws:iam::012345678901:role/DummyRole',
  });

  const { stateMachineArn: createdStateMachineArn } = await sfnClient.send(
    createStateMachineCommand
  );
  stateMachineArn = createdStateMachineArn!;
});

afterAll(async () => {
  await sfnClient.send(new DeleteStateMachineCommand({ stateMachineArn }));
});

describe('Simple Step Function', () => {
  it('should execute the state machine successfully', async () => {
    const startExecutionCommand = new StartExecutionCommand({
      stateMachineArn,
      input: JSON.stringify({}),
    });

    const { executionArn } = await sfnClient.send(startExecutionCommand);

    const pollExecutionStatus = async (maxAttempts: number, delay: number) => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const result = await sfnClient.send(
          new DescribeExecutionCommand({ executionArn })
        );

        if (result.status === 'SUCCEEDED') {
          return result;
        } else if (result.status === 'FAILED') {
          throw new Error('Step function execution failed');
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      throw new Error('Timed out waiting for step function to succeed');
    };

    const result = await pollExecutionStatus(20, 1000);

    expect(result.status).toBe('SUCCEEDED');
    expect(result.output).toBe(JSON.stringify('Success'));
  });
});
