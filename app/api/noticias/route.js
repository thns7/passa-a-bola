import noticiasData from "../../../public/data/MOCK_DATA.json";

export async function GET(req) {
  return new Response(JSON.stringify(noticiasData), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
;
