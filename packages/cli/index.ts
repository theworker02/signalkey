import { SignalKey } from "../sdk";
import { states, type State } from "../protocol";
try {
  const client = await SignalKey.local();
  const [command, arg] = process.argv.slice(2);
  let result: unknown;
  if (command === "devices") result = await client.devices();
  else if (command === "status") result = await client.status();
  else if (command === "run" && arg) result = await client.run(arg);
  else if (command === "light" && states.includes(arg as State))
    result = await client.light(arg as State);
  else
    throw new Error(
      "Usage: npm run cli -- devices | status | run PROFILE_ID | light STATE",
    );
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(String(e));
  process.exitCode = 1;
}
