async function localhost_query(address: string, text: string, params: any[]): Promise<any> {
  const response = await fetch(address + '/database/query', {
    method: 'POST',
    body: JSON.stringify({ text, params }),
  });
  if (response.status < 200 || response.status > 299) {
    throw await response.json();
  }
  return await response.json();
}

export const DatabaseDriver = {
  getLocalhost(address: string) {
    return localhost_query.bind(localhost_query, address);
  },
};
