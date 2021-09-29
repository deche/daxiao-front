import React, { useState, useEffect } from 'react';
import Daxiao from './contracts/Daxiao';
import {ethers} from 'ethers';
import './App.css';

const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
const daxiaoAddr = "0xc2227b8190BdE872EaE47fb3dEc6b4793ca1b2cb";
const daxiao = new ethers.Contract(daxiaoAddr, Daxiao.abi, provider);

const typeValues = [[0, 0], [0,1], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [3, 0], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8], [4, 9], [4, 10], [4, 11], [4, 12], [4, 13], [4, 14], [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5] ];


const App = () =>  {
  const [account, setAccount] = useState("");
  const [value, setValue] = useState(0);
  const [betType, setBetType] = useState(0);
  const [betValue, setBetValue] = useState(0);
  const [amount, setAmount] = useState("0.01");

  const [dice1, setDice1] = useState("");
  const [dice2, setDice2] = useState("");
  const [dice3, setDice3] = useState("");
  const [winAmount, setWinAmount] = useState(0);
  const [gameStatus, setGameStatus] = useState("stop");

  requestAccount();

  useEffect(() => {
    
    async function fetchData() {
      try {
        daxiao.on("Received", async(sender, amount, event) => {
          event.removeListener();

          console.log("sender", sender);
          console.log("amount", amount);
        });

        daxiao.on("Result", async (id, betType, betValue, requestId, amount, player, winAmount, randomResult, result1, result2, result3, time, event) => {
          event.removeListener();

          console.log("id", id);
          console.log("amount", amount);
          console.log("winAMount", winAmount);
          console.log("randomResult", randomResult);
          console.log("result1", result1);
          console.log("result2", result2);
          console.log("result3", result3);
      
          setDice1(result1.toString());
          setDice2(result2.toString());
          setDice3(result3.toString());
          setWinAmount(parseInt(Number(winAmount.toString()), 10) / (10**18));
          setGameStatus("result");
        })        
      } catch (error) {
        console.log("error");
        console.error(error);
      }
    }
    fetchData();

  }, []);

  async function startGame() {
    if(value==0) {
      alert("Put down a bet");
      return;
    }
    try {
      setGameStatus("started");
      const signer = provider.getSigner();
      //console.log(signer);
      //daxiao = daxiao.connect(signer);
      //console.log(daxiao);
      console.log("betType", betType);
      console.log("betValue", betValue);
      const contract = new ethers.Contract(daxiaoAddr, Daxiao.abi, signer);
      const result = await contract.startGame(betType, betValue, {from: account, value: ethers.utils.parseEther(amount) });
      console.log(result);
    } catch (error) {
      console.log("error");
      console.error(error);
    }
  }

  function optionClicked(valueClick) {
    console.log("clicked: ", valueClick);
    setValue(valueClick);

    setBetType(typeValues[valueClick-1][0]);
    setBetValue(typeValues[valueClick-1][1]);

    console.log(typeValues[valueClick-1][0]);
    console.log(typeValues[valueClick-1][1]);
  }

  const DaxiaoTable = () => {
    let ethClass = "eth" + value;
    let optionItems = [];
    for (var i = 1; i <= 50; i++) {
      let theClassName = "option" + i;
      let j = i;
      optionItems.push(<div key={j} className={theClassName} onClick={() => optionClicked(j)}></div>);
    }    
    return (
      <div className="daxiao-table">

        {optionItems}

        <div className={ethClass}><img className="eth-image" alt="eth" src="/eth-logo.png" /></div>
      </div>
    );
  }

  const Result = () => {
    let diceImage1 = "/dice/dice-" + dice1 + ".png";
    let diceImage2 = "/dice/dice-" + dice2 + ".png";
    let diceImage3 = "/dice/dice-" + dice3 + ".png";

    if(gameStatus=='stop') {
      return (
        <div className="result">
          Game not started
        </div>
      );
    } else if(gameStatus=='started') {
      return (
        <div className="result">
          Game started... Please wait 2-3 minutes to get dice results...
        </div>
      );
    } else if(gameStatus=="result") {
      return (
        <div className="result">
          <div className="die" key="1"><img className="dices" src={diceImage1} /></div>
          <div className="die" key="2"><img className="dices" src={diceImage2} /></div>
          <div className="die" key="3"><img className="dices" src={diceImage3} /></div>
          <div className="win-amount">Win amount: {winAmount} ether</div>
      </div>
      );
    }
  }

  const AccountText = () => {
    if (account === '') {
      console.log(account);
      return (
        <div>
          <button className="btn" onClick={requestAccount}>Login</button>
        </div>
      );
    } else {
      return (
        <div className="account">
          <strong>Account:</strong>
          {account}
          <div className="txt-info"><strong>Bet amount:</strong> (maximum payout amount: 2 ether)</div>
        <input className="input amount" type="text" value={amount} onChange={e => setAmount(e.target.value)}  /> ether
          <button className="btn start" onClick={startGame}>Start Game</button>
        </div>
      );
    }
  }

  async function requestAccount() {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      check();
    } catch (error) {
      console.log("error");
      console.error(error);
      //alert("Login to Metamask first");
    }
  }

  async function check() {
    const signer = provider.getSigner();
    console.log(signer);
    const account = await signer.getAddress();
    console.log("Account:", account);
    setAccount(account);
  }  

  window.ethereum.on('accountsChanged', function (accounts) {
    console.log('account changed triggered!');
    check();
  })  

  return (
    <div className="container App">

      <div className="head">
        
      <div className="bet-input">
      <AccountText />
        

        </div>

        <div className="info">
          <div><strong>Result:</strong>

          </div>
          <Result />
        </div>      
      </div>


        <DaxiaoTable />
    </div>
  );
}

export default App;
