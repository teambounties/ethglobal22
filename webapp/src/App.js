import { useEffect, useState } from 'react';
//const awaitTransactionMined = require ('await-transaction-mined');
import {ethers } from 'ethers';
import {Team} from './TeamAbi';
import {Factory} from './FactoryAbi';
// initialize notify
const CHILD_ABI = Team.abi;
const CONTRACT_ABI = Factory.abi;
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0x60dd05235a9a889009d1623c796077230b2e36d2';//Factory.networks["5777"].address;
const {ethereum } = window;

function useInput({ type,label}) {
	const [value, setValue] = useState("");
	const input = <div><input class=".input.is-warning" placeholder={label} value={value} onChange={e => setValue(e.target.value)} type={type} /></div>;
	return [value, input];
};

function App() {

	const [add1, add1Input] = useInput({ label:"0xBosky", type: "text" });
	const [add2, add2Input] = useInput({ label:"0xelonmusk", type: "text" });
	const [add3, add3Input] = useInput({ label:"0xukraine", type: "text" }); 

	// const [av1, av1Input] = useDropdown({ type: "text" }); 
	// const [av1, av1Input] = useDropdown({ type: "text" }); 
	// const [av1, av1Input] = useDropdown({ type: "text" }); 

	const [modal, setModal] = useState();
	const [contractWalletAddress, setContractWalletAddress] = useState(CONTRACT_ADDRESS);
	const [contractOwner, setContractOwner] = useState();
	const [account, setAccount] = useState();
	const [testAccounts, setTestAccounts] = useState([]);
	const [amount, amountInput] = useInput({ type: "text" });	
	const [walletBalance, setWalletBalance] = useState(0);
	const [count, setCount] = useState(0);
	const [balance, setBalance] = useState();
	const [contract, setContract] = useState();
	const [provider, setProvider] = useState();
	const [child, setChild] = useState({address:false,balance:0});
	const [childCount, setChildCount] = useState();
	const [signer, setSigner] = useState();
	const [time, setTime] = useState(new Date().toString());
	const [ctr, setCtr] = useState(0);

	const updateBalanceClicked = async (evt) => {
		evt.preventDefault();
		updateBalances();
	};

	const pay = async function(){
		const tx = {
			from: account,
			to: child.address,
			value: ethers.utils.parseEther(amount)
		  };
		  signer.sendTransaction(tx).then((transaction) => {
			console.dir('sent:', transaction);
			alert("Send finished!");
			updateBalances();
		  });
	};
	const updateBalances = async function(){
		if(child.address){
			var _childBalance = await provider.getBalance(child.address);
			// we use the code below to convert the balance from wei to eth
			setChild({address:child.address, balance:ethers.utils.formatEther(_childBalance)});
		}
	};
	
	const distribute = async function(){
		if(child.address){
			const _childContract = new ethers.Contract(child.address, CHILD_ABI, signer);
			var _childOwner = await _childContract.getOwner();
			console.log('child owner is ', _childOwner);			
			_childContract.on("DebugFromToValue", async (_childAddr, _owner, amount, event) => {
				if(_owner == account){
					console.log('createChild from:', _childAddr, ' _owner:', _owner,'amount:', amount, ' ev:',event, '\n args:',arguments);
					setCtr(ctr+1);
				}else{
					console.log('got another DebugFromToValue', event);
				}
				updateBalances();
			});
			var sent = await _childContract.distribute();
			console.log('child dsitributed:', sent);
		}

	};

	const deploy = async (evt) => {
		evt.preventDefault();
		
		var _nicks = ['@0xBosky','@elonmusk','@michaelbolton'],
		_avatars = ["🐑","💕",":)"],
		_shares = [33,33,33],
		_addresses = [add1,add2,add3];
		//_addresses = [testAccounts[1], testAccounts[2], testAccounts[3]];
		// _addresses = [
		// 	"0x52864857823A65973F6d31E61d1A442d31c75a70",
		// 	"0x7aC0E8905Ba31F67C4084af7842104ECc86a6286",
		// 	"0x777f9977a2dDa3E87354d309a4CDA2633ddfA087"
		// ];
		
		const child = await contract.createTeam("Team Mars", _nicks, _avatars, _addresses, _shares)
		.catch ( er => {console.log('child er:',er); return er; });
      	console.log('child is ', child);

		var filter = {
			address: contractWalletAddress
		}
		provider.on(filter, (x) => {
			console.log('event:',x);
			// do whatever you want here
			// I'm pretty sure this returns a promise, so don't forget to resolve it
		});

		contract.on("TeamCreated", async (_child, _owner, event) => {
			if(_owner == account){
				console.log('createChild from:', _child, ' _owner:', _owner,' ev:',event, '\n args:',arguments);
				var _childBalance = await provider.getBalance(_child);
				setChild({address:_child, balance: ethers.utils.formatEther(_childBalance)});
				setCtr(ctr+1);

				const _childContract = new ethers.Contract(_child, CHILD_ABI, signer);
				//var _childOwner = await _childContract.getOwner();
				//console.log('child owner is ', _childOwner);
			}else{
				console.log('got another TeamCreated', _child, _owner, event);
			}
		});

		var receipts = await provider.getTransactionReceipt(child.hash);  
		console.log('child receipts: ', receipts);

		var _contractCount = await contract.getCount();
		setChildCount(_contractCount.toNumber());
		//console.log(await contract.getTeams());
		
	};

	/* useEffect(async () => {
		if(contract){
			console.log('contract: ', contract);
			var _childCount = await contract.getCount();
			setChildCount(_childCount.toNumber());
		}
		if(account){
			var _walletBalance = await provider.getBalance(account);
			// we use the code below to convert the balance from wei to eth
			setWalletBalance(ethers.utils.formatEther(_walletBalance));
		}
		if(child.address){
			updateBalances();
		}
		setTime(new Date().toString());
	},[ctr]); */

	useEffect(() => {

		if(typeof ethereum == "undefined"){
			console.log('please install a crypto wallet');
			return;
		}
		
		async function load() {
			console.log('into load');

			//todo create new provider to hit rpc server for demo.
			//const ganache = new ethers.providers.Web3Provider('http://localhost:7545');
			/*const ganache = new ethers.providers.JsonRpcProvider("http://localhost:7545");
			console.log('ethers.networks:', ethers.networks);

			// Getting the accounts
			const signer0 = ganache.getSigner(0);
			console.log('ganache accounts:', signer0[0]);

			//const accs = await ganache.getAccounts();
			const _testAccounts = [];
			for(var i=0;i<10;i++){
				var accountExists = ganache.getSigner(i);
				if(accountExists.address)
				_testAccounts.push(accountExists.address);
			}
			//setTestAccounts(_testAccounts);
			const accounts = [
				ganache.getSigner(0).address,
				'0xF2eFBce89828d1D573A5697a6f7DBb1FF2f54C7D',
				'0xB12CA3d34854b5C7D1e3583c291ec08eF7bB5f61',
				'0xd18A5a1Afe9203F5Bd83b418c4040B5E9A40913b',
				'0x6d475687E4e80A55F78259BE5cca68acB32817e1',
				'0xd57f8f278b0DFed17670dE3dFd34A30f54665B09',
				'0x0e104854745B09c12307193aba6A2e585486E6cC',
				'0x6f4EE8BE7d684235175E38c8de351ab09F0c6544',
				'0x72333CFEA680b5bD14d98Df11EEF3Bbad63E3EE9',
				'0xD71c7Ec577f825Cc7e3d8ea57c5AB16adA3442d5'
			];*/
			const _provider = new ethers.providers.Web3Provider(ethereum);
			setProvider(_provider);
			var _setModal = setModal;
			const ethAccounts = await ethereum.request({method:'eth_requestAccounts'})
			.catch(er => {
				console.log('no metamask?', er);	
				return {message: 'Please open metamask', error: er};
			});
			console.log('got ethAccounts', ethAccounts);
			if(typeof ethAccounts.error != "undefined"){
				setModal(ethAccounts.message);
				return;
			}
			const _signer = _provider.getSigner();
			await setSigner(_signer);
			var userAddress = await _signer.getAddress();
			setAccount(userAddress);

			const _contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _signer);
			setContract(_contract);
	
			setCtr(ctr+1);
		}
		load();
		console.log('load called');
	}, []);

  return (
    <div style={{margin:'100px'}}>
		{modal && <div><progress class="nes-progress is-error" value="10" max="100"></progress><input type="button" class="nes-btn is-error" value={modal} /></div> }
		{!CONTRACT_ADDRESS && <div><progress class="nes-progress is-error" value="10" max="100"></progress>Local Demo mode</div> }		
		<div>
			<div style={{fontSize:'0.5em'}}><br></br>{time}</div>
			<br></br>

			<section class="message-list">
				<section class="message -left">
					<div class="nes-balloon from-left">
						<p>One address to split bounties and ETH within a team</p>
					</div>
				</section>
			</section>
			<br></br>
			<h2>  <i class="nes-icon trophy is-large"></i> <span class="logo">TeamBounties </span><i class="nes-icon coin is-large"></i></h2> 
			<code>Do you work with teams? Do you need to share bounties or revenue?<br></br>
			<div class="lists"><br></br>
				<ul class="nes-list is-disc">
					<li>Create a team address with the TeamBounties Protocol<a href="#" class="nes-badge"><span class="is-warning">GAS</span></a></li>
					<li>Receive as many ETH as you want from any wallet or get your own link</li>
					<li>1-Click withdraw to all team members! (can be initiated by anyone)<a href="#" class="nes-badge"><span class="is-warning">GAS</span></a></li>
					<li>Composable (recursively split). Permissionless.</li>
					<li><b>SOON</b> Multi-chain. with Token rewards, DAO to manage split</li>
				</ul>
			</div>
			</code>

			{modal && <div><progress class="nes-progress is-error" value="10" max="100"></progress><input type="button" class="nes-btn is-error" value={modal} /></div> }


			{!modal && <div>
				{/*<p>
					Your account is <code>{account}</code> with Balance {walletBalance}
				</p>
				<p>
					Contract address 
					<br></br><code>{contractWalletAddress}</code> with children {childCount} and balance {balance}
					<br></br>
					Contract owner
					<br></br><code>{contractOwner}</code>
				</p>*/}
				{add1Input}
				{add2Input}
				{add3Input}

				{!child.address && <div>
					<input type="button" class="nes-btn is-warning" onClick={deploy} value="Create TeamBounties Smart Contract"/>
				</div>}
					{child.address && <p>
						<br></br>
						<input type="button" class="nes-btn is-primary" onClick={updateBalanceClicked} value="Refresh Balance" />
						<br></br><br></br>
						<div class="nes-container with-title is-centered">
							<p class="title">Your contract has balance {child.balance} </p>
							<code style={{fontSize:"0.5em;"}}>	{child.address}</code>
						</div> 
						
						<br></br>Amount {amountInput}  {amount}
						<div class="actions">
							<button type="button" class="nes-btn" onClick={pay}>Pay</button>
							<button type="button" class="nes-btn is-success" onClick={distribute}>Withdraw</button>
							
						</div>
					</p>}
			</div>}
    	</div>
	</div>
  );
}

export default App;
