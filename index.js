const axios = require("axios");

const esploraUrl = "https://blockstream.info/liquid/api/";

const getVOuts = async (blockHash) => {
  return axios.get(`${esploraUrl + "block/"}` + blockHash + "/txs/0").then((response) => {
    const allTx = response.data;

    const opReturnTxs = [];

    allTx.forEach((tx) => {
      if (tx.vout[0].scriptpubkey_type === "op_return")
        opReturnTxs.push(
          tx.vout.map((vo) => {
            return {
              scriptpubkey: vo.scriptpubkey,
              value: vo.value,
              asset: vo.asset,
            };
          })
        );
    });

    return opReturnTxs;
  });
};

const getLastBlockHeight = async () => {
  return axios.get(`${esploraUrl + "blocks/tip/height"}`).then((response) => {
    console.log(response.data);
    return response.data;
  });
};

const getBlocks = async () => {
  return axios.get(`${esploraUrl + "blocks"}`).then((response) => {
    return response.data;
  });
};

const app = async () => {
  const blocks = await getBlocks();
  const txpromises = blocks.map(async (bl) => {
    return getVOuts(bl.id);
  });
  const vouts = await Promise.all(txpromises);
  const finalData = blocks.map((bl, index) => {
    return { blockHeight: bl.height, txout: vouts[index] };
  });
  return finalData;
  // const lastBlockHeight = await getLastBlockHeight();
  // console.log(lastBlockHeight);
};

app();
getLastBlockHeight();
