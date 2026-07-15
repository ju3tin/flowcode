import { NextRequest, NextResponse } from "next/server";
import type { DeployPreviewRequest, DeployPreviewResponse } from "@/types/flow";

const NETWORK_CONFIG = {
  fuji: {
    name: "Avalanche Fuji Testnet",
    chainId: 43113,
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    explorer: "https://testnet.snowtrace.io",
  },
  "avalanche-mainnet": {
    name: "Avalanche C-Chain",
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorer: "https://snowtrace.io",
  },
} as const;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DeployPreviewRequest;

    if (!body?.code || !body?.contractName) {
      return NextResponse.json(
        { error: "Missing required fields: code, contractName" },
        { status: 400 }
      );
    }

    const network = NETWORK_CONFIG[body.network] ?? NETWORK_CONFIG.fuji;
    const args = body.constructorArgs?.trim();

    const deployScript = `// deploy.ts — Hardhat deploy script (preview only, not executed)
import { ethers } from "hardhat";

async function main() {
  const ${body.contractName}Factory = await ethers.getContractFactory("${body.contractName}");

  const contract = await ${body.contractName}Factory.deploy(${args ? `\n    ${args}\n  ` : ""});
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("${body.contractName} deployed to:", address);
  console.log("Network: ${network.name} (chainId ${network.chainId})");
  console.log("Explorer:", \`${network.explorer}/address/\${address}\`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/*
hardhat.config.ts network entry needed:

networks: {
  ${body.network === "fuji" ? "fuji" : "avalanche"}: {
    url: "${network.rpcUrl}",
    chainId: ${network.chainId},
    accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
  },
}

Run with:
  npx hardhat run scripts/deploy.ts --network ${body.network === "fuji" ? "fuji" : "avalanche"}
*/
`;

    const abiPreview = `// Illustrative only — run \`npx hardhat compile\` to generate the real ABI/bytecode.
// artifacts/contracts/${body.contractName}.sol/${body.contractName}.json will contain:
{
  "contractName": "${body.contractName}",
  "abi": [ /* generated from your Solidity source at compile time */ ],
  "bytecode": "0x..."
}`;

    const response: DeployPreviewResponse = {
      deployScript,
      abiPreview,
      notes: [
        `Preview mode: no transaction is broadcast. Nothing touches ${network.name}.`,
        "Compile the contract locally (Hardhat/Foundry) to get the real ABI and bytecode before deploying.",
        "Set DEPLOYER_PRIVATE_KEY in your environment before running the script for real.",
        `RPC: ${network.rpcUrl}`,
      ],
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
