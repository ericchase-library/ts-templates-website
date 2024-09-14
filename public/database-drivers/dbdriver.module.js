// src/database-drivers/dbdriver.module.ts
async function localhost_query(address, text, params) {
  const response = await fetch(`${address}/database/query`, {
    method: 'POST',
    body: JSON.stringify({ text, params }),
  });
  if (response.status < 200 || response.status > 299) {
    throw await response.json();
  }
  return await response.json();
}
var DatabaseDriver = {
  getLocalhost(address) {
    return localhost_query.bind(localhost_query, address);
  },
};
export { DatabaseDriver };

//# debugId=959E8DF08929C2D464756E2164756E21
//# sourceMappingURL=dbdriver.module.js.map
