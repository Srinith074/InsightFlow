import { api } from "@/utils/api";

export async function askAI(
  datasetId: string,
  sheetName: string,
  message: string
) {
  const response = await api.post(
    "/api/chat",
    {
      datasetId,
      sheetName,
      message,
    }
  );

  return response.data.answer;
}