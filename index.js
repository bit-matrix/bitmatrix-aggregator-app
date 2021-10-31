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
    return response.data;
  });
};

const getBlocks = async () => {
  return axios.get(`${esploraUrl + "blocks"}`).then((response) => {
    return response.data;
  });
};

const getBlocksWithIndex = async (startHeight) => {
  return axios
    .get(`${esploraUrl}` + "blocks/" + startHeight)
    .then((response) => {
      return response.data;
    })
    .catch((err) => console.log(err));
};

const app = async () => {
  let dummyInput = 1553646;
  let blockPromises = [];

  const lastBlockHeight = await getLastBlockHeight();

  console.log(lastBlockHeight - dummyInput);

  while (dummyInput <= lastBlockHeight) {
    if (lastBlockHeight - dummyInput < 10) {
      console.log("1");
      blockPromises.push(getBlocks());
      break;
    } else {
      console.log("2");
      dummyInput += 9;
      blockPromises.push(getBlocksWithIndex(dummyInput));
    }
  }

  const unsortedBlocks = await Promise.all(blockPromises);

  const mergedBlocks = [].concat.apply([], unsortedBlocks);

  const blocks = mergedBlocks.sort((a, b) => a.height - b.height);

  const txpromises = blocks.map(async (bl) => {
    return getVOuts(bl.id);
  });

  const vouts = await Promise.all(txpromises);

  const finalData = blocks.map((bl, index) => {
    return { blockHeight: bl.height, txout: vouts[index] };
  });

  console.log(finalData);
  return finalData;
};

app();
