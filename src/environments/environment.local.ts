// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  configInUse: "environment.local",
  WebsocketProvider: "ws://52.51.85.249:8546",
  cookiesDomain: "localhost",
  webSocketStatServer: "ws://localhost:3000/primus",
  externalBlockExplorer: "http://explore.aerum.net/#/",
  contracts: {
    swap: {
      address: {
        AeroToErc20: "0xb5b8a711e5abae1940e1b92ad45d4ec86215ce82",
        Erc20ToAero: "0x52ac5cf9c2823ea9891d347f94f74dfa8258db1c",
        Erc20ToErc20: "0xf0b36c5e2ab2e66e2c0baeaf5f2cfdfedbaf757a"
      },
      crossChain: {
        address: {
          aerum: {
            AeroSwap: "0x15519c7bb96921edfd21cd74b76376b6f5c9874e",
            Erc20Swap: "0x91a8c0607d2e3a197596292134e78b91006563bb",
            TemplatesRegistry: "0x0969799b00c06ddb82a47130ba90f13c76bd917e"
          },
          ethereum: {
            EtherSwap: "0x29027c7d509a2deafd554f79d753a85c54e8a366",
            Erc20Swap: "0x31b52a036be277689a40571df2d481ff317cb184"
          }
        }
      }
    },
    aens: {
      address: {
        ENSRegistry: "0x49dc6ee5540eb3e0d8015ec2381ed4146315b6b6",
        FixedPriceRegistrar: "0xa942a9d2793cc12b35b7801cc0b60b72095f8553",
        PublicResolver: "0x125a0dd27bb49b38b1f023263ccfbf1757e603b7"
      }
    }
  },
  gasPrice: "1",
  maxBlockGas: "1",
  chainId: 418313827693
};
