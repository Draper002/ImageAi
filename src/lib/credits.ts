type RpcClient = {
  rpc: (
    name: string,
    args: Record<string, string>
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

export async function reserveGenerationCredit(client: RpcClient, userId: string, generationId: string): Promise<boolean> {
  const { data, error } = await client.rpc("reserve_generation_credit", {
    p_user_id: userId,
    p_generation_id: generationId
  });

  if (error) throw new Error(error.message);
  return data === true;
}

export async function refundGenerationCredit(client: RpcClient, userId: string, generationId: string): Promise<void> {
  const { error } = await client.rpc("refund_generation_credit", {
    p_user_id: userId,
    p_generation_id: generationId
  });

  if (error) throw new Error(error.message);
}
