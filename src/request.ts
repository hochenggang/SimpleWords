import { REQUESTING_COUNT } from "./shared";

const HOST = "https://words.imhcg.cn";

function Get(
  url: string,
  dataHandler: Function,
  dataHandlerCallback: Function,
  params: Record<string, string | number> = {},
  headers: HeadersInit = {}
) {
  REQUESTING_COUNT.value += 1;
  const urlWithQuery = new URL(url);
  for (let k in params) {
    urlWithQuery.searchParams.append(k, String(params[k]));
  }
  fetch(urlWithQuery.toString(), {
    method: "GET",
    mode: "cors",
  })
    .then((resp) => dataHandler(resp, dataHandlerCallback))
    .catch((reson) => {
      console.log("request error -> ", reson);
      REQUESTING_COUNT.value = -1;
    });
}

const parseJson = (resp: Response, callback: Function) => {
  if (REQUESTING_COUNT.value > 0) {
    REQUESTING_COUNT.value -= 1;
  }
  switch (resp.status) {
    case 200:
      resp.json().then((data) => {
        callback(data);
      });
      break;
    case 404:
      alert("该内容正在准备，请稍后再试。 \n错误代码：" + resp.status);
      location.assign("/#/");
      break;
    case 400:
      location.assign("/#/");
      break;
    case 429:
      alert("抱歉，您请求的频率过快，请稍后再试。 \n错误代码：" + resp.status);
      location.assign("/#/");
      break;
    default:
      alert("抱歉，服务器遇到了错误，请稍后再试。 \n错误代码：" + resp.status);
      location.assign("/#/");
      break;
  }
};

function getFile(
  path: string,
  dataHandler: Function,
  dataHandlerCallback: Function
) {
  Get(HOST + "/collins/" + path, dataHandler, dataHandlerCallback);
}

export { parseJson, getFile, REQUESTING_COUNT, HOST };
