async function localhost_query(text: string, params: any[]): Promise<any> {
  const local_address = 'http://127.0.0.1:8000';
  const response = await fetch(local_address + '/database/query', {
    method: 'POST',
    body: JSON.stringify({ text, params }),
  });
  if (response.status < 200 || response.status > 299) {
    throw await response.json();
  }
  return await response.json();
}

export const DatabaseDriver = {
  getLocalhost() {
    return localhost_query;
  },
};
