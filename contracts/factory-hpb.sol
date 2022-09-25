// last-known copy of contract 15.06.21


pragma solidity ^0.5.6;

///////////////////////////////////////////////////////////////////////////////
// SafeMath Library 
///////////////////////////////////////////////////////////////////////////////
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (a == 0) {
      return 0;
    }

    c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return a / b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = a + b;
    assert(c >= a);
    return c;
  }
}




// ----------------------------------------------------------------------------
// Imported Token Contract functions
// ----------------------------------------------------------------------------



contract ESRToken {
    function balanceOf(address) public pure returns (uint256) {}
    function transfer(address, uint) public {}
    function transferFrom(address, address, uint) public {}
    function allowance(address, address) public pure returns (uint256) {}
}

    

////////////////////////////////////////////////////////////////////////////////
// Master Contract That holds the addresses of the factory contract 
////////////////////////////////////////////////////////////////////////////////
//
    contract Master {
        using SafeMath for uint256;
        
        address payable public admin;
        
        address payable public  factoryContractAddress;

        uint256 public totalDevReward;
        uint256 public devRewardPerWallet;
        address payable[] public devWallets;
        
        address payable public thisContractAddress; 
        
    ///////////////////////////////////////////////////////////////////////////////////
    // ESR token contract (http://hpbscan.org/HRC20/0xa7be5e053cb523585a63f8f78b7dbca68647442f)
        address public tokenContractAddress = 0xa7Be5e053cb523585A63F8F78b7DbcA68647442F;
    ///////////////////////////////////////////////////////////////////////////////////
        
       ESRToken token;
        
        constructor() public payable {
            admin = msg.sender;
            token = ESRToken(tokenContractAddress);
            thisContractAddress = address(uint160(address(this)));
            devWallets.push(0xF8aDC8f416C456AEb38917DFCe870fB7C38cF37C);
        }
        
        function () external payable{}
        
        // function to set the factory address to compete for HPB
        function setFactoryContractAddressHPB(address payable _address) public{
            require(msg.sender == factoryContractAddress || msg.sender == admin);
            factoryContractAddress = _address;
        }
        

        //Replace admin address with new one
        function changeAdmin(address payable _admin) public{
            require(msg.sender == admin);
            admin = _admin;
        }
        
        // Check the HPB contract balance of this contract
        function thisContractBalance() public view returns(uint256) {
            return address(this).balance;
        }
        
        // check the ESR token balance of This contract  
        function getESRBalance() public view returns(uint) {
            return token.balanceOf(address(this));
        }
        

 

        //check the number of dev wallets associated with the contract
        function getDevWalletCount() public view returns(uint256){
            return devWallets.length;
        }
        
       
        //add a dev wallet
        function addDevWallet(address payable _address) public {
            require(msg.sender == admin);
            devWallets.push(_address);
        }
    
        //remove a dev wallet
        function removeDevWallet(address payable _address) public {
            require(msg.sender == admin);
            require(devWallets.length >= 2); //need at least 2 to remove 1
            for(uint i = 0; i != devWallets.length; i++){
                if(devWallets[i] == _address){
                devWallets[i] = devWallets[devWallets.length - 1];
                devWallets.length = devWallets.length - 1;
                }
            }
        }
        
        
        // withdraw HPB from this account
        function devWithdraw() public payable {
                require (address(this).balance > 50 ether);
                totalDevReward = (address(this).balance) - 50 ether;
                devRewardPerWallet = totalDevReward.div(getDevWalletCount());
                //distribute to all dev wallets
                    for(uint256 i = 0; i != getDevWalletCount(); i++){
                        address(devWallets[i]).transfer(devRewardPerWallet);
                    }
        }
        


        // Testing Functions //

        function destroy() payable public{
            require(msg.sender == admin);
            selfdestruct(admin);
        }
        
        
        
    }




////////////////////////////////////////////////////////////////////////////////
// Factory Contract 
////////////////////////////////////////////////////////////////////////////////

contract Factory {
    using SafeMath for uint256;
    
    address payable[] public devWallets;

    address payable public admin;
    address payable public thisContractAddress;
    address payable[] public contracts;
    address payable public masterAddress;

    // Percentage of earnings from completed games
    uint256 public winnerPercentage = 95;
    uint256 public refereePercentage = 3;
    uint256 public adminPercentage = 2;


    // time in seconds before winnings can be claimed after Ref selects a winner
    uint256 public decisionHoldTime = 600;
    
    // time in seconds before moderator decision can be overridden
    uint256 public escalationHoldTime = 86400;


    // set modifier to admin
    modifier onlyAdmin {
        require(msg.sender == admin);
        _;
    }


    // ENUM
    Master master;
    Factory factory;
    ESRToken token;
    
    ///////////////////////////////////////////////////////////////////////////////////
    address public tokenContractAddress = 0xa7Be5e053cb523585A63F8F78b7DbcA68647442F;
    ///////////////////////////////////////////////////////////////////////////////////

    constructor() public payable {
        admin = msg.sender;
        thisContractAddress = address(this);
        
        ///////////// set before deploying /////////////////////////
        masterAddress = 0x3489878cB03888b3E91d63faF7C43e0938a08368;
        ////////////////////////////////////////////////////////////
        
        master = Master(masterAddress);
        
        token = ESRToken(tokenContractAddress);
        thisContractAddress = address(this);
        

    }
    
    
    /////////////////////////////////////////////////////////////////////////////////////////
    //////////    This is the main function to generate a contract from the factory 
    ////////////////////////////////////////////////////////////////////////////////////////
    
    
    event newContractAddress(address);
    event newContractRequestor(address);
    
    function spawnNewGameContract() public {
        require(token.balanceOf(address(msg.sender))>0);
        Esportsref esportsref = new Esportsref();
        contracts.push(address(esportsref));
        emit newContractAddress(address(contracts[contracts.length - 1]));
        emit newContractRequestor(address(msg.sender));
        
   
    }
    
    

 
    
    ///////////////////////////////////////////////////////////////////////////////
    
    // admin can set percentages for new smart contracts generated by factory    
    function setWinnerPercentage(uint256 _percentage) public onlyAdmin {
        winnerPercentage = _percentage;
    }
    function setRefereeePercentage(uint256 _percentage) public onlyAdmin {
        refereePercentage = _percentage;
    }
    function setAdminPercentage(uint256 _percentage) public onlyAdmin {
        adminPercentage = _percentage;
    }
    
   /////////////////////////////////////////////////////////////////////////////////
    
    
    ///////////////////////////////////////////////////////////////////////////////
    
    // admin can set times to wait before payouts can be made    
    function setDecisionHoldtime(uint256 _seconds) public onlyAdmin {
        decisionHoldTime = _seconds;
    }
    function setDisputeHoldTime(uint256 _seconds) public onlyAdmin {
        escalationHoldTime = _seconds;
    }
    
    ///////////////////////////////////////////////////////////////////////////////
    


    function setAdmin(address payable _admin) public onlyAdmin {
        admin = _admin;
    }

    function thisContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // FALLBACK
    function() external payable {}
    
    // check to see how many contracts the factory has spawned
    function getContractCount() public view returns (uint256 contractCount) {
        return contracts.length;
    }
    


    // get the address of the latest spawned game contract
    function getLatestSpawnedContract() public view returns (address) {
        return address(contracts[contracts.length - 1]);
    }
    

    // check the ESR token balance of ANY wallet  
    function getYourESRBalance() public view returns(uint) {
        return token.balanceOf(msg.sender);
    }


  // TESTING

    function destroy() public payable {
        require(msg.sender == admin);
        selfdestruct(admin);
    }
}



/////////////////////////////////////////////////////////////////////////////////////
//  ESportsRef "Generated" Contract - Generated for each new game (competing for HPB)
/////////////////////////////////////////////////////////////////////////////////////

contract Esportsref {
    using SafeMath for uint256;
    
    ESRToken token;

    address public thisContractAddress;
    address payable public admin;
    address payable public masterAddress;
    address public factoryAddress;


    //////////////////////////////////////////////////////////////////
    
    // All the relevant party members
    address payable public partyA;
    address payable public partyB;
    address payable public referee;
    address payable public mediator;
    
    // Game details
    string public gameName;
    uint256 public stakeAmount;
    
    // Game deposit details
    uint256 public firstDepositAmount;
    uint256 public secondDepositAmount;
    uint256 public firstDepositTimeStamp;
    uint256 public secondDepositTimeStamp;
    uint256 public totalStaked;
    bool public partyA_deposited;
    bool public partyB_deposited;
    
    // obtaining a referee via a random number from the HPB HRNG
    uint256 public randomNumber;
    bool public randomNumberRetrieved;
    
   
    uint256 public winnerPercentage;
    uint256 public refereePercentage;
    uint256 public adminPercentage;

    
    // Process to begin game - both parties must confirm
    bool public partyA_happyToBegin;
    bool public partyB_happyToBegin;
    bool public refNowHasControl;
    bool public gameCancelled;
    
    // A player gives up before the game finishes
    bool public partyA_forfeits;
    bool public partyB_forfeits;

    // Game winner details
    bool public winnerDeclared;
    bool public partyA_isWinner;
    bool public partyB_isWinner;
    bool public drawDeclared;
    uint256 public decisionTimeStamp;
    bool public payoutComplete;
    
    // Game requires additional mediation - decision will be escalated
    bool public partyA_challengesDecision;
    bool public partyB_challengesDecision;
    bool public awaitingEscalatedDecision;
    bool public EscalatedDecisionMade;
    uint256 public decisionHoldTime;
    uint256 public escalationHoldTime;
    
//    event ESRTokenTransfer(uint256 amount);
    

    
    // MODIFIERS
    modifier onlyAdmin {
        require(msg.sender == admin);
        _;
    }

    modifier onlyContract {
        require(msg.sender == thisContractAddress);
        _;
    }

    // ENUM
    Master master;
    Factory factory;
    
    ////////////////////////////////////////////////////////////////////////////////////
    // address of the ESR token original smart contract
    address public tokenContractAddress = 0xa7Be5e053cb523585A63F8F78b7DbcA68647442F;
    //
    ////////////////////////////////////////////////////////////////////////////////////


    constructor() public payable {
        
        thisContractAddress = address(uint160(address(this)));
        
        ///////////// set before deploying /////////////////////////
        masterAddress = 0x3489878cB03888b3E91d63faF7C43e0938a08368;
        ////////////////////////////////////////////////////////////
        
        master = Master(masterAddress);
        factory = Factory(master.factoryContractAddress());
        factoryAddress = factory.thisContractAddress();
        
        admin = factory.admin();
        
        decisionHoldTime = factory.decisionHoldTime();
        escalationHoldTime = factory.escalationHoldTime();
        
        winnerPercentage = factory.winnerPercentage();
        refereePercentage = factory.refereePercentage();
        adminPercentage = factory.adminPercentage();
        
        token = ESRToken(tokenContractAddress);

    }
    
    

    
    event FirstDeposit(uint256);
    event GameName(string);
    
    /////////////////////////////////////////////////////////////////
    /// First player to deposit and also writes the name of the game
    /////////////////////////////////////////////////////////////////
    
    function firstDeposit(string memory _gameName) public payable {
        require(token.balanceOf(address(msg.sender))>0);
        require (partyA_deposited == false && partyB_deposited == false);
        address(this).transfer(msg.value);
        gameName = _gameName;
        stakeAmount = msg.value;
        firstDepositAmount = stakeAmount;
        partyA = msg.sender;
        partyA_deposited = true;
        firstDepositTimeStamp = now;
        emit FirstDeposit(uint256(firstDepositAmount));
        emit GameName(string (gameName));
    }

    ////////////////////////////////////////////////////////////////


    event SecondDeposit();

    /////////////////////////////////////////////////////////////////
    /// Second player deposit
    /////////////////////////////////////////////////////////////////


    function secondDeposit() public payable {
        require(token.balanceOf(address(msg.sender))>0);
        require(msg.sender != partyA);
        require(msg.value == stakeAmount);
        require(partyA_deposited == true);
        require(partyB_deposited == false);
        address(this).transfer(firstDepositAmount);
        partyB = msg.sender;
        secondDepositAmount = msg.value;
        secondDepositTimeStamp = now;
        partyB_deposited = true;
        totalStaked = firstDepositAmount.add(secondDepositAmount);
        // both parties have deposited so a referee can now be called
        getRandomNumber();
        emit SecondDeposit();
    }
    
    
    /////////////////////////////////////////////////////////////////
    
    /////////////////////////////////////////////////////////////////////
    // HPB HRNG - Used to generate a random number to assign a referee //
    /////////////////////////////////////////////////////////////////////

    //return a random value between minVal and maxVal
        function getRandomNumber() public payable {
            uint256 maxRange = 1000000; 
            randomNumber = (uint256(block.random) % maxRange);
            emit newRandomNumber_bytes(block.random);
            randomNumberRetrieved = true;
        }

    // Events confirm that a random number has been retrieved 
    // and therefore a referee can be notified
    event newRandomNumber_bytes(bytes32);
    event newRandomNumber_uint256(uint256);
    
    
    ///////////////////////////////////////////////////////////////////
    // Referee && Admins to take control of game outcome funds being released
    //////////////////////////////////////////////////////////////////
    
    // set modifier to admin or ref
    modifier onlyAdminOrRef {
        require(msg.sender == admin);
        _;
    }

    
    event partyAHappy(bool);
    event partyBHappy(bool);
    event refInControl(bool);
    
    ///////////////////////////////////////////////////////////////////
    // Both parties ready to begin
    //////////////////////////////////////////////////////////////////
    
    // referee joins chatbot and his/her wallet address is displayed
    // ref adds himself to the smart contract
    
    event refAdded(address);
    
    function refAddedToContract() public payable {
        require(token.balanceOf(address(msg.sender))>0);
        require(partyA != msg.sender);
        require(partyB != msg.sender);
        referee = msg.sender;
        emit refAdded(address(referee));
    }
    
    // both players can see that the address added 
    // to the smart contract matches the referees address
    
    // before proceeding, players have a final chance to back-out
    
    event gameHasBeenCancelled(bool);
    
    function cancelGame() public payable {
        require(gameCancelled == false);
        require(partyA == msg.sender || partyB == msg.sender);
        require(partyA_happyToBegin == false || partyB_happyToBegin == false);
        partyA.transfer(firstDepositAmount);  
        partyB.transfer(firstDepositAmount); 
        gameCancelled = true;
        emit gameHasBeenCancelled(bool(gameCancelled));
    }


 
     function readyToCompete() public payable {
        require(partyA == msg.sender || partyB == msg.sender);
            if (msg.sender == partyA){
                partyA_happyToBegin = true;
                emit partyAHappy(bool(partyA_happyToBegin)); 
            }
            
            else {
                partyB_happyToBegin = true;
                emit partyBHappy(bool(partyB_happyToBegin));
            }

    }
 

    // both players have confimred they are happy to proceed
    
    function refTakescontrol() public payable {
        require(msg.sender == referee);
        require(partyA_happyToBegin == true);
        require(partyB_happyToBegin == true);
        refNowHasControl = true;
        emit refInControl(bool(refNowHasControl));
    }
    
    
    
    
    event partyAConcedes(bool);
    event partyBConcedes(bool);
    event partyAWinningAmount(uint256);
    event partyBWinningAmount(uint256);


    ///////////////////////////////////////////////////////////////////
    // A player wishes to give up and forfeit game
    ///////////////////////////////////////////////////////////////////
    
    function player_forfeit() public payable {
        require(partyA == msg.sender || partyB == msg.sender);
        require(winnerDeclared == false);
        require(payoutComplete == false);
        require(refNowHasControl == true);
        
        // If Player A gives up //////////////////////////////////////
        if (msg.sender == partyA) {
            partyA_forfeits = true;
            partyB_isWinner = true;
            

                // winner should receive HPB
            
            uint256 winnerAmount = ((totalStaked.div(100)).mul(winnerPercentage));
            partyB.transfer((totalStaked.div(100)).mul(winnerPercentage));
            referee.transfer((totalStaked.div(100)).mul(refereePercentage));
            admin.transfer((totalStaked.div(100)).mul(adminPercentage)); 
            winnerDeclared = true;
            payoutComplete = true;
            emit partyAConcedes(bool(partyA_forfeits));
            emit partyBWinningAmount(uint256(winnerAmount));

        }
        
        // If Player B gives up //////////////////////////////////////
        else if (msg.sender == partyB) {
            partyB_forfeits = true;
            partyA_isWinner = true;
            
            
                // winner should receive HPB
            
            uint256 winnerAmount = ((totalStaked.div(100)).mul(winnerPercentage));    
            partyA.transfer((totalStaked.div(100)).mul(winnerPercentage));
            referee.transfer((totalStaked.div(100)).mul(refereePercentage));
            admin.transfer((totalStaked.div(100)).mul(adminPercentage)); 
            winnerDeclared = true;
            payoutComplete = true;
            emit partyBConcedes(bool(partyA_forfeits));
            emit partyAWinningAmount(uint256(winnerAmount));
            }
            
        
        else {
            revert();
        }
    } 
   
   
   //////////////////////////////////////////////////////////////////////////////////////////////////
   
   
   event timeDecisionWasDeclared(uint256);
   event partyADeclaredWinner(bool);
   event partyBDeclaredWinner(bool);
   event drawDeclaredWinner(bool);
   
    
    /////////////////////////////////////////////////////////////////////////////////////////////////
    // referee declares a winner and a dispute timer begins
    /////////////////////////////////////////////////////////////////////////////////////////////////
    
    function setWinnerPlayerA() public payable {
        require(referee == msg.sender);
        require(winnerDeclared == false);
        decisionTimeStamp = now;
        winnerDeclared = true;
        partyA_isWinner = true;
        emit partyADeclaredWinner(bool(partyA_isWinner));
        emit timeDecisionWasDeclared(uint256(decisionTimeStamp));
    }
    
    function setWinnerPlayerB() public payable {
        require(referee == msg.sender);
        require(winnerDeclared == false);
        decisionTimeStamp = now;
        winnerDeclared = true;
        partyB_isWinner = true;
        emit partyBDeclaredWinner(bool(partyB_isWinner));
        emit timeDecisionWasDeclared(uint256(decisionTimeStamp));
    }
    
    function setResultDraw() public payable {
        require(referee == msg.sender);
        require(winnerDeclared == false);
        decisionTimeStamp = now;
        winnerDeclared = true;
        drawDeclared = true;
        emit drawDeclaredWinner(bool(drawDeclared));
        emit timeDecisionWasDeclared(uint256(decisionTimeStamp));
    }
   
  
    // time until winnings can be claimed
    function timeRemainingForWinnings() public view returns(uint256) {
        return (decisionTimeStamp + decisionHoldTime) - now;
    }
  
   

    //////////////////////////////////////////////////////////////////////////////////////////////////
    // player opportunity to dispute result after result is declared 
    // (may need to provide additional evidence to support dispute)
    //////////////////////////////////////////////////////////////////////////////////////////////////

    event playerHasEscalated(address this);
    event playerToEscalate(address);
    event escalationTimeStamp (uint);

    function disputeResult() public payable {
        require(decisionTimeStamp > now);
        require(now < decisionTimeStamp.add(decisionHoldTime));
        require(winnerDeclared == true);
        require(partyA == msg.sender || partyB == msg.sender);
        
        if (msg.sender == partyA) {
            partyA_challengesDecision = true;
            emit playerHasEscalated(address(this));
            emit escalationTimeStamp(uint256(now));
            emit playerToEscalate(address(msg.sender));
        }
        
        else {
            partyB_challengesDecision = true;
            emit playerHasEscalated(address(this));
            emit escalationTimeStamp(uint256(now));
            emit playerToEscalate(address(msg.sender));
        }
    }
   
   
   
    //////////////////////////////////////////////////////////////////////////////////////////////////
    // If a player doesn't dispute the result within 10 minutes (600 seconds)
    // then the payout winner function can be called by anyone, providing the timer has expired
    //////////////////////////////////////////////////////////////////////////////////////////////////
   
    function payoutWinner() public payable {
        require (partyA_happyToBegin == true && partyB_happyToBegin == true);
        require(partyA_isWinner == true || partyB_isWinner == true);
        require(now > (decisionTimeStamp.add(decisionHoldTime)));
        require(partyA_challengesDecision == false && partyB_challengesDecision == false);
        require(payoutComplete == false);
        
        if (partyA_isWinner == true) {

                // winner should receive HPB
            
            uint256 winnerAmount = ((totalStaked.div(100)).mul(winnerPercentage));  
            partyA.transfer((totalStaked.div(100)).mul(winnerPercentage));
            referee.transfer((totalStaked.div(100)).mul(refereePercentage));
            admin.transfer((totalStaked.div(100)).mul(adminPercentage)); 
            winnerDeclared = true;
            payoutComplete = true;
            emit partyAWinningAmount(uint256(winnerAmount));
        }
            
       
        else if (partyB_isWinner == true) {


                // winner should receive HPB
                
            uint256 winnerAmount = ((totalStaked.div(100)).mul(winnerPercentage));  
            partyB.transfer((totalStaked.div(100)).mul(winnerPercentage));
            referee.transfer((totalStaked.div(100)).mul(refereePercentage));
            admin.transfer((totalStaked.div(100)).mul(adminPercentage)); 
            winnerDeclared = true;
            payoutComplete = true;
            emit partyBWinningAmount(uint256(winnerAmount));
        }
            
        
        else if (drawDeclared == true) {
            

                // winner should receive HPB
                
            uint256 winnerAmount = ((totalStaked.div(100)).mul(winnerPercentage.div(2)));
            partyA.transfer((totalStaked.div(100)).mul(winnerPercentage.div(2)));
            partyB.transfer((totalStaked.div(100)).mul(winnerPercentage.div(2)));
            referee.transfer((totalStaked.div(100)).mul(refereePercentage));
            admin.transfer((totalStaked.div(100)).mul(adminPercentage)); 
            winnerDeclared = true;
            emit partyAWinningAmount(uint256(winnerAmount));
            emit partyBWinningAmount(uint256(winnerAmount));
            
            }
            
       
        else {
            revert();
        }
    }
   
   
    //////////////////////////////////////////////////////////////////////////////////////////////////////
   
   
   event mediatorHasAwardedResultToA(bool);
   event mediatorHasAwardedResultToB(bool);
   event mediatorHasAwardedResultToDraw(bool);

   
    //////////////////////////////////////////////////////////////////////////////////////////////////
    // if the dispute has been made, the mediators (admins) will now take control of the payout
    //////////////////////////////////////////////////////////////////////////////////////////////////
    
    // admins to award to player A
    function setWinnerPlayerAEscalated() public payable {
        require(mediator == msg.sender);
        require(winnerDeclared == true);
        decisionTimeStamp = now;
        winnerDeclared = true;
        partyA_isWinner = true;
        
            uint256 winnerAmount = ((totalStaked.div(100)).mul(winnerPercentage));  
            partyA.transfer((totalStaked.div(100)).mul(winnerPercentage));
            referee.transfer((totalStaked.div(100)).mul(refereePercentage));
            admin.transfer((totalStaked.div(100)).mul(adminPercentage)); 
        emit mediatorHasAwardedResultToA(bool(partyA_isWinner));
        emit partyAWinningAmount(uint256(winnerAmount));
        
    }
    
    // admins to award to player B
    function setWinnerPlayerBEscalated() public payable {
        require(mediator == msg.sender);
        require(winnerDeclared == true);
        decisionTimeStamp = now;
        winnerDeclared = true;
        partyB_isWinner = true;
        
            uint256 winnerAmount = ((totalStaked.div(100)).mul(winnerPercentage));  
            partyB.transfer((totalStaked.div(100)).mul(winnerPercentage));
            referee.transfer((totalStaked.div(100)).mul(refereePercentage));
            admin.transfer((totalStaked.div(100)).mul(adminPercentage)); 
        emit mediatorHasAwardedResultToB(bool(partyB_isWinner));
        emit partyBWinningAmount(uint256(winnerAmount));
    }
    
    // admins to award a draw
    function setResultDrawEscalated() public payable {
        require(mediator == msg.sender);
        require(winnerDeclared == true);
        decisionTimeStamp = now;
        winnerDeclared = true;
        drawDeclared = true;
            uint256 winnerAmount = ((totalStaked.div(100)).mul(winnerPercentage.div(2)));
            partyA.transfer((totalStaked.div(100)).mul(winnerPercentage.div(2)));
            partyB.transfer((totalStaked.div(100)).mul(winnerPercentage.div(2)));
            referee.transfer((totalStaked.div(100)).mul(refereePercentage));
            admin.transfer((totalStaked.div(100)).mul(adminPercentage)); 
        emit mediatorHasAwardedResultToDraw(bool(drawDeclared));
        emit partyAWinningAmount(uint256(winnerAmount));
        emit partyBWinningAmount(uint256(winnerAmount));
    }
   
   
   

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // if a result is disputed, the admins must decide within 24 hours (86400s)
    // or else both players can reclaim their winnings
    // This function be called by anyone providing the timer has expired
    // Both players will receive their original HPB back to their wallets
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    
    function escalationNotResolved() public payable {
        require(partyA_isWinner == true || partyB_isWinner == true  || drawDeclared == true);
        require(now > (decisionTimeStamp + escalationHoldTime));
        require(payoutComplete == false);
        
            partyA.transfer((totalStaked.div(2)));
            partyB.transfer((totalStaked.div(2)));

        payoutComplete = true;
    }
    
    
    function timeRemainingForEscalation() public view returns(uint256) {
        return (decisionTimeStamp + escalationHoldTime) - now;
    }
   
   
   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   
 
   // OTHER CONTRACT FUNCTIONS
   

    

    //Replace admin address with new one
    function changeAdmin(address payable _admin) public{
        require(msg.sender == admin);
        admin = _admin;
    }

    //Replace admin address with new one
    function setMediator(address payable _mediator) public{
        require(msg.sender == admin);
        mediator = _mediator;
    }


    function thisContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // FALLBACK
    function() external payable {}

    function destroy() public payable {
        require(msg.sender == admin);
        selfdestruct(admin);
    }
}    
    
