export type SubscriptionCallback = () => { abort: boolean } | void;

export interface WebRequest {
  bodyDetails?: chrome.webRequest.WebRequestBodyDetails;
  headersDetails?: chrome.webRequest.WebRequestHeadersDetails;
}

export namespace WebRequestCache {
  export const RequestIdToRequestMap = new Map<string, WebRequest>();
  export const SubscriptionSet = new Set<SubscriptionCallback>();
  export const TabIdToRequestMap = new Map<number, WebRequest>();
  export function AddBody(details: chrome.webRequest.WebRequestBodyDetails) {
    const webRequest = WebRequestCache.RequestIdToRequestMap.get(details.requestId);
    if (webRequest) {
      webRequest.bodyDetails = details;
    } else {
      const webRequest: WebRequest = { bodyDetails: details };
      WebRequestCache.RequestIdToRequestMap.set(details.requestId, webRequest);
      WebRequestCache.TabIdToRequestMap.set(details.tabId, webRequest);
    }
  }
  export function AddHeaders(details: chrome.webRequest.WebRequestHeadersDetails) {
    const webRequest = WebRequestCache.RequestIdToRequestMap.get(details.requestId);
    if (webRequest) {
      webRequest.headersDetails = details;
    } else {
      const webRequest: WebRequest = { headersDetails: details };
      WebRequestCache.RequestIdToRequestMap.set(details.requestId, webRequest);
      WebRequestCache.TabIdToRequestMap.set(details.tabId, webRequest);
    }
    WebRequestCache.Notify();
  }
  export function Notify() {
    for (const callback of WebRequestCache.SubscriptionSet) {
      if (callback()?.abort === true) {
        WebRequestCache.SubscriptionSet.delete(callback);
      }
    }
  }
  export function Subscribe(callback: SubscriptionCallback): () => void {
    WebRequestCache.SubscriptionSet.add(callback);
    if (callback()?.abort === true) {
      WebRequestCache.SubscriptionSet.delete(callback);
      return () => {};
    }
    return () => {
      WebRequestCache.SubscriptionSet.delete(callback);
    };
  }
}

export function RebuildAndSendRequest(webRequest: WebRequest): Promise<Response> | undefined {
  const { bodyDetails, headersDetails } = webRequest;
  const requestUrl = bodyDetails?.url ?? headersDetails?.url;
  if (requestUrl) {
    const requestInit: { body?: BodyInit; headers?: HeadersInit } & unknown = {};
    if (bodyDetails?.requestBody?.formData) {
      const formData = new FormData();
      for (const [name, values] of Object.entries(bodyDetails.requestBody.formData)) {
        for (const value of values) {
          formData.append(name, value);
        }
      }
      requestInit.body = formData;
    } else if (bodyDetails?.requestBody?.raw) {
      // TODO: add handling for `bodyDetails.requestBody.raw.file`
      requestInit.body = new Blob(bodyDetails.requestBody.raw.map((_) => _.bytes).filter((_) => _ !== undefined));
    }
    if (headersDetails?.requestHeaders) {
      const headers = new Headers();
      for (const { name, value } of headersDetails.requestHeaders) {
        if (value) {
          headers.append(name, value);
        }
      }
      requestInit.headers = headers;
    }
    return fetch(requestUrl, requestInit);
  }
}

export async function AnalyzeBody(req: Request | Response) {
  const data: {
    blob?: true;
    form?: true;
    json?: true;
    text?: true;
  } = {};
  try {
    await req.clone().blob();
    data.blob = true;
  } catch (_) {}
  try {
    await req.clone().formData();
    data.form = true;
  } catch (_) {}
  try {
    await req.clone().json();
    data.json = true;
  } catch (_) {}
  try {
    await req.clone().text();
    data.text = true;
  } catch (_) {}
  return data;
}
