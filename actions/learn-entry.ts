"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserSystemStep } from "@/db/queries";

/** Resolves the step to preselect: DB for signed-in users, else cookie, else calendar default. */
export async function resolveLearnEntryStep(): Promise<1 | 2 | 3> {
  const { userId } = await auth();
  const step = await getUserSystemStep(userId);
  if ([1, 2, 3].includes(step)) return step as 1 | 2 | 3;
  return 1;
}
