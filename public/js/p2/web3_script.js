import ABI from "./abi.js";
const contractAddress = "0x9e7BB20cd3C4FEFde4C9d35ed9b29b4D68EDC847";
const mainChainId = "97";

const connectBtn = document.querySelector("#connectBtn");
const showWallet = document.querySelector("#showWallet");
const createBtn = document.querySelector("#createBtn");
const createSharesBtn = document.querySelector("#createSharesBtn");
const walletEl = document.querySelector("#wallet");
const txModal = document.querySelector("#txModal");
const jsonModal = document.querySelector("#jsonModal");

const ethereum = window.ethereum;

let wallet;
let contractInstance;
let connected = false;
let signer;
let currentNetwork;
let provider;

//FUNCTIONS

async function connect() {
    if (connected === false) {
        await doConnect();
        connected = true;
        console.log(contractInstance);
    }
    toggleView();
}

async function doConnect() {
    try {
        if (ethereum) {
            currentNetwork = ethereum.networkVersion;
            if (currentNetwork !== mainChainId) {
                await switchBscNetwork();
            }
            // connecting to Metamask
            const res = await ethereum.request({ method: "eth_requestAccounts" });
            wallet = res[0];

            // getting procider and signer
            provider = new ethers.providers.Web3Provider(ethereum);
            signer = provider.getSigner();

            // getting instance of contract
            contractInstance = new ethers.Contract(contractAddress, ABI, signer);
        } else alert("Connect Metamask!");
    } catch (err) {
        console.error(err);
    }
}

async function validateNetwork() {
    if (currentNetwork !== ethereum.networkVersion) {
        try {
            await switchBscNetwork();
        } catch (err) {
            return false;
        }
    }
    return true;
}

async function switchBscNetwork() {
    try {
        await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x61" }],
        });
    } catch (err) {
        signer = undefined;
        console.error(err);
    }
}

// HANDLERS

async function create() {
    await validateNetwork();
    const generateJson = async (params) => {
        try {
            const URL = "http://05.0644.ru/json";
            // const URL = "https://cubebot.fun/json";
            const response = await fetch(URL, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            });

            // ====DEBUG====
            // if (response.ok) {
            //     alert(json);
            // }
            // =============
        } catch (err) {
            console.error(err);
        }
    };
    const handleCreate = async (e) => {
        try {
            const target = e.target;
            switch (target.id) {
                case "closeModal":
                    toggleModal(jsonModal, false, handleCreate);
                    break;
                case "submit": {
                    await validateNetwork();
                    const mp3Url = document.forms.jsonForm.mp3Url.value;
                    const name = document.forms.jsonForm.name.value;
                    const author = document.forms.jsonForm.author.value;
                    const pressRelease = document.forms.jsonForm.pressRelease.value;
                    const cover = document.forms.jsonForm.cover.value;
                    const songText = document.forms.jsonForm.text.value;
                    if (
                        mp3Url !== "" &&
                        name !== "" &&
                        author !== "" &&
                        pressRelease !== "" &&
                        cover !== "" &&
                        songText !== ""
                    ) {
                        //========handlers==========
                        contractInstance.create();
                        generateJson({ mp3Url, name, author, pressRelease, cover, songText });
                        //==========================
                        toggleModal(jsonModal, false, handleCreate);
                    } else {
                        alert("Fill in all the fields!");
                    }

                    break;
                }

                default:
                    break;
            }
        } catch (err) {
            toggleModal(jsonModal, false, handleCreate);
            console.error(err);
        }
    };
    toggleModal(jsonModal, true, handleCreate);
}

function createSharesHandler() {
    const handleTransaction = async (e) => {
        const target = e.target;

        switch (target.id) {
            case "closeModal":
                toggleModal(txModal, false, handleTransaction);
                break;
            case "submit": {
                const tokenId = document.forms.txForm.tokenId.value;
                const amount = document.forms.txForm.amount.value;
                const price = document.forms.txForm.price.value;
                if (tokenId > 0 && amount > 0 && price > 0) {
                    //========HANDLERS==========
                    createShares(tokenId, amount, price);
                    //==========================
                    toggleModal(txModal, false, handleTransaction);
                } else {
                    alert("Fill in all the fields!");
                }

                break;
            }

            default:
                break;
        }
    };

    toggleModal(txModal, true, handleTransaction);
}

async function createShares(tokenId, amount, price) {
    try {
        const weiPrice = ethers.utils.hexlify(ethers.utils.parseEther(price.toString()));
        const trustedInstance = contractInstance.connect(signer);
        const res = await trustedInstance.createShares(tokenId, amount, weiPrice);
        console.log(res);
    } catch (err) {
        console.error(err);
    }
}

const toggleModal = (modal, state, eventHandler) => {
    if (state) {
        modal.addEventListener("click", eventHandler);
        modal.style.display = "block";
    } else {
        modal.removeEventListener("click", eventHandler);
        modal.style.display = "none";
    }
};

function toggleView() {
    if (connected) {
        connectBtn.disabled = true;
        connectBtn.textContent = "connected";
        walletEl.textContent = wallet.toString();
        showWallet.style.display = "block";
        createBtn.style.display = "block";
        createSharesBtn.style.display = "block";
    }
}

// EVENT LISTENERS

connectBtn.addEventListener("click", () => connect());
createBtn.addEventListener("click", () => create());
createSharesBtn.addEventListener("click", () => createSharesHandler());
