using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;

public class nh_network : MonoBehaviour
{
    public static nh_network server;

    [TextArea(3, 10)]
    public string serverQuickRef;

    SocketIOComponent socket;

    LobbyFunctions lf;
    UsernameActions ua;
    char quote = '"';

    //public playerManager playerManager;

    private void Awake()
    {
        if (server) Destroy(gameObject);
        else server = this;

        DontDestroyOnLoad(gameObject);
    }

    void Start()
    {
        findLobbyScripts();
        socket = GetComponent<SocketIOComponent>();

        //playerManager = GameObject.Find("Player Manager").GetComponent<playerManager>();
     
        // The lines below setup 'listener' functions
        socket.On("connectionmessage", onConnectionEstabilished);
        socket.On("users", loadUsers);
        socket.On("roomUsers", loadRoomUsers);
        socket.On("removeUser", removeUser);
        socket.On("createdRoom", createdRoom);
        socket.On("roomError", roomError);
        socket.On("roomCount", updatePlayButton);
        socket.On("loadGame", loadGame);
        socket.On("connection", connection);

        socket.On("currentRound", roundInfo);
        socket.On("currentTurn", turnInfo);
        socket.On("playerHand", handInfo);
        socket.On("addToDiscard", discardInfo);
        socket.On("newCard", newCardInfo);
        socket.On("yourTurn", myTurn);
        socket.On("drewFromDeck", drewFromDeck);
        socket.On("drewFromDiscard", drewFromDiscard);
        socket.On("disableDraw", disableDraw);

        socket.On("updateOutDeck", updateOutDeck);
        socket.On("firstOutPlayer", firstOutPlayer);
        socket.On("playernamesInRoom", scorecardNames);
        socket.On("updateScoreCard", scorecardValues);
        socket.On("updateEntireScoreCard", loadEntireScorecard);
        socket.On("gameover", gameOver);
        
        socket.On("ping", ping);

    }

    void connection(SocketIOEvent evt)
    {
        Debug.Log("=================================    connected=====================");
    }

    #region Connection/Room Functions

    // This is the listener function definition
    void onConnectionEstabilished(SocketIOEvent evt)
    {
        Debug.Log("Player is connected: " + evt.data.GetField("id"));
        if (ua) ua.sendOldID(evt.data.GetField("id").ToString().Trim('"'));

        updateLastID(evt.data.GetField("id").ToString().Trim('"'));

        StartCoroutine(DelayScreenRemove());
    }

    public void connectToServer(string oldID)
    {
        socket.Emit("connectID", new JSONObject(quote + oldID + quote));
    }

    public void findLobbyScripts()
    {
        if (!ua)
        {
            ua = FindObjectOfType<UsernameActions>();
            lf = FindObjectOfType<LobbyFunctions>();
        }
    }

    IEnumerator DelayScreenRemove()
    {
        yield return new WaitUntil(() => { return ConnectionLoader.inst != null; });
        ConnectionLoader.inst?.DisableScreen();
    }

    public void createNewLobby()
    {
        //socket.Emit("createNewLobby");
        socket.Emit("createRoom");
    }

    public void joinRoom(string roomName)
    {
        //socket.Emit("joinLobby");
        socket.Emit("joinRoom", new JSONObject(quote + roomName + quote));
    }

    public void leaveRoom()
    {
        socket.Emit("leaveRoom");
    }

    void createdRoom(SocketIOEvent evt)
    {
        Debug.Log("Created new room: " + evt.data.GetField("name"));
        LobbyFunctions.inst.enterRoom(evt.data.GetField("name").ToString().Trim('"'));
    }

    void roomError(SocketIOEvent evt)
    {
        string errormessage = evt.data.GetField("message").ToString().Trim('"');
        Debug.LogWarning(errormessage);
        LobbyFunctions.inst.showRoomError(errormessage);
    }

    void updatePlayButton(SocketIOEvent evt)
    {
        int roomCount;
        int.TryParse(evt.data.GetField("roomCount").ToString(), out roomCount);
        Debug.Log("Current room player count: " + roomCount);
        LobbyFunctions.inst.playBtnInteraction(roomCount > 1 && roomCount < 7);
    }
    #endregion
    #region Username Functions

    public void newUsername(string name)
    {
        name = quote + name + quote;

        JSONObject test = new JSONObject(name);
        socket.Emit("updateUsername", test);
    }

    public void getAllUsernames()
    {
        socket.Emit("loadAllUsernames");
    }

    void loadUsers(SocketIOEvent evt)
    {
        if (!lf.inRoom) {
            Debug.Log("loading usernames...");
            findLobbyScripts();

            for (int i = 0; i < evt.data.Count; i++)
            {
                JSONObject jsonData = evt.data.GetField(i.ToString());

                Debug.Log(jsonData.GetField("username"));
                ua.addUsername(jsonData.GetField("id").ToString().Trim('"'), jsonData.GetField("username").ToString().Trim('"'));
            } 
        }
    }

    void loadRoomUsers(SocketIOEvent evt)
    {
        Debug.Log("loading room usernames...");
        findLobbyScripts();
        ua.removeAllUsernames();

        for (int i = 0; i < evt.data.Count; i++)
        {
            JSONObject jsonData = evt.data.GetField(i.ToString());

            Debug.Log(jsonData.GetField("username"));
            ua.addUsername(jsonData.GetField("id").ToString().Trim('"'), jsonData.GetField("username").ToString().Trim('"'));
        }

        Debug.Log("player room count: " + evt.data.Count);
        LobbyFunctions.inst.playBtnInteraction(evt.data.Count > 1 && evt.data.Count < 7);
    }


    void removeUser(SocketIOEvent evt)
    {
        ua?.removeUsername(evt.data.GetField("id").ToString().Trim('"'));
    }
    #endregion
    #region Game Functions
    public void startGame()
    {
        // tells server to start game
        socket.Emit("startGame");
    }

    public void setReady()
    {
        socket.Emit("setReady");
    }

    void loadGame(SocketIOEvent evt)
    {
        Debug.Log("The game has been started!");

        ua = null;
        lf = null;

        UnityEngine.SceneManagement.SceneManager.LoadScene(1);
    }

    void updateLastID(string id)
    {
        PlayerData data = SaveLoad.Load();
        data.lastID = id;
        Debug.Log("updating id: " + id);
        SaveLoad.Save(data);
    }

    void roundInfo(SocketIOEvent evt)
    {
        ConnectionLoader.inst?.DisableScreen();

        int round;
        int.TryParse(evt.data.GetField("round").ToString().Trim('"'), out round);
        GameManager.instance.round = round;
        GameManager.instance.resetAll();
        Debug.Log("The current round is: " + round);
    }

    void turnInfo(SocketIOEvent evt)
    {
        string player = evt.data.GetField("player").ToString().Trim('"');
        Debug.Log("It is " + player + "'s turn.");
        var notification = new Notification("It is " + player + "'s turn.", 3, true, Color.black);
        NotificationManager.instance.addNotification(notification);
    }

    void myTurn(SocketIOEvent evt)
    {
        Debug.Log("Its my turn!");
        GameManager.instance.setMyTurn(true);
        GameManager.instance.myDraw = true;
        var notification = new Notification("It is your turn", 3, true, Color.black, true);
        NotificationManager.instance.addNotification(notification);
    }

    #region Card Functions
    void handInfo(SocketIOEvent evt)
    {
        //List<string> newHand = new List<string>();
        Debug.Log("My hand:");

        for (int i = 0; i < evt.data.Count; i++)
        {
            string card = evt.data.GetField(i.ToString()).ToString().Trim('"');
            //newHand.Add(card);
            Debug.Log(card);
            GameManager.instance.addCardToHand(card, false);
        }
    }

    void discardInfo(SocketIOEvent evt)
    {
        string discard = evt.data.GetField("card").ToString().Trim('"');
        Debug.Log("Discarded " + discard);
        GameManager.instance.addCardToDiscard(discard);
        
        // NOTIFICATION HAPPENS IN GAMEMANAGER
    }

    public void drawCard(bool fromDeck)
    {
        JSONObject jsonObject = new JSONObject(fromDeck);
        socket.Emit("drawCard", jsonObject);
        
        // NOTIFICATION HAPPENS IN GAMEMANAGER
    }

    void newCardInfo(SocketIOEvent evt)
    {
        string card = evt.data.GetField("card").ToString().Trim('"');
        Debug.Log("Card selected: " + card);
        GameManager.instance.addCardToHand(card);
        //var notification = new Notification($"Drew {card}", 3, true, Color.black );
        //NotificationManager.instance.addNotification(notification);
    }

    void drewFromDeck(SocketIOEvent evt)
    {
        string playername = evt.data.GetField("player").ToString().Trim('"');
        Debug.Log(playername + " has drawn a card from the deck!");
        var notification = new Notification(playername + " has drawn a card from the deck!", 3, true, Color.black );
        NotificationManager.instance.addNotification(notification);
    }

    void drewFromDiscard(SocketIOEvent evt)
    {
        string playername = evt.data.GetField("player").ToString().Trim('"');
        Debug.Log(playername + " has drawn from the discard pile!");
        // update visuals of discard pile here
        var notification = new Notification(playername + " has drawn from the discard pile!", 3, true, Color.black );
        NotificationManager.instance.addNotification(notification);

        GameManager.instance.updateDiscardPile();
    }

    void disableDraw(SocketIOEvent evt)
    {
        GameManager.instance.myDraw = false;
        GameManager.instance.myDiscard = true;
    }

    public void discardCard(string cardname)
    {
        JSONObject jsonObject = new JSONObject(quote + cardname + quote);
        socket.Emit("discardCard", jsonObject);
    }

    public void ping(SocketIOEvent socketIOEvent)
    {
        Debug.Log("Ping");
        ConnectionIndicator.instance?.Ping();
    }

    public void SendFirstOut(JSONObject outDeck)
    {
        /*JSONObject cardArr = JSONObject.Create(JSONObject.Type.ARRAY);
        print("type? " + cardArr.type);
        cardArr.Add(Out.Run.ToString());
        cardArr.Add("joker_2");
        cardArr.Add("Club_3");
        cardArr.Add("Club_4");
        print("contents? - " + cardArr);

        JSONObject OutDeck = new JSONObject();
        OutDeck.AddField("out1", cardArr);
        OutDeck.AddField("out2", cardArr);
        print("test? - " + OutDeck);*/

        socket.Emit("firstOut");
        socket.Emit("updateOutDeck", outDeck);
    }

    public void UpdateFirstOut(JSONObject outDeck)
    {
        socket.Emit("updateOutDeck", outDeck);
    }

    void updateOutDeck(SocketIOEvent evt)
    {
        Out[] outTypes = new Out[4];
        List<string>[] outCards = new List<string>[4];

        //takes in outDeck object
        for (int i = 0; i < evt.data.Count; i++)
        {
            JSONObject array = JSONObject.Create(JSONObject.Type.ARRAY);
            array = evt.data.GetField("out" + i.ToString());
            //var outList = evt.data.GetField("out" + i.ToString());

            Out outtype;
            List<string> cardList = new List<string>();
            if (Enum.TryParse(array[0].ToString().Trim('"'), out outtype))
            {
                if (outtype != Out.None)
                {
                    for (int j = 1; j < array.Count; j++)
                    {
                        cardList.Add(array[j].ToString().Trim('"'));
                    }
                }

                outTypes[i] = outtype;
                outCards[i] = cardList;
            }
            else Debug.LogWarning("invalid enum parse: " + array[0].ToString());
        }
        Debug.Log("sending first out deck to gm...");
        GameManager.instance.recieveOutDeck(outCards, outTypes);

        if (!GameManager.instance.lastTurn) GameManager.instance.lastTurn = true;

        Debug.Log("finished adding first out deck");
    }

    void firstOutPlayer(SocketIOEvent evt)
    {
        string playerName = evt.data.GetField("player").ToString().Trim('"');

        var notification = new Notification(playerName + " has gone out!", 3, true, Color.green);
        NotificationManager.instance.addNotification(notification);

        int playerindex;
        int.TryParse(evt.data.GetField("playerIndex").ToString().Trim('"'), out playerindex);
        ScorecardLoader.inst.firstoutplayer = playerindex;
    }

    #endregion
    #region Scoring
    public void sendMyScore(int score)
    {
        //send score to server
        JSONObject scoreObj = new JSONObject(quote + score.ToString() + quote);
        socket.Emit("receiveScore", scoreObj);
    }

    void scorecardNames(SocketIOEvent evt)
    {
        var nameObject = evt.data.GetField("players");
        string[] names = new string[nameObject.Count];
        for(int i = 0; i < nameObject.Count; i++)
        {
            names[i] = nameObject[i].ToString().Trim('"');
        }

        ScorecardLoader.inst.DisableWait();
        ScorecardLoader.inst.LoadNames(names);
    }

    void scorecardValues(SocketIOEvent evt)
    {
        Debug.Log("loading scores...");

        var scorecard = evt.data.GetField("scorecard");
        /*int[][] allValues = new int[scorecard.Count][];

        for(int i = 0; i < scorecard.Count; i++)
        {
            if (!scorecard[i].IsArray) break;

            allValues[i] = new int[scorecard[i].Count];
            for(int j = 0; j < scorecard[i].Count; j++)
            {
                int parsedNum;
                if (int.TryParse(scorecard[i][j].ToString().Trim('"'), out parsedNum))
                    allValues[i][j] = parsedNum;
                else allValues[i][j] = -2;
            }
        }

        ScorecardLoader.inst.LoadScores(allValues);*/
        ScorecardLoader.inst.LoadScores(getScoreValues(scorecard));
    }

    void loadEntireScorecard(SocketIOEvent evt)
    {
        Debug.Log("loading all scores...");
        var scorecard = evt.data.GetField("scorecard");
        ScorecardLoader.inst.LoadAllScores(getScoreValues(scorecard));
    }

    int[][] getScoreValues(JSONObject json)
    {
        int[][] allValues = new int[json.Count][];

        for (int i = 0; i < json.Count; i++)
        {
            if (!json[i].IsArray) break;

            allValues[i] = new int[json[i].Count];
            for (int j = 0; j < json[i].Count; j++)
            {
                int parsedNum;
                if (int.TryParse(json[i][j].ToString().Trim('"'), out parsedNum))
                    allValues[i][j] = parsedNum;
                else allValues[i][j] = -2;
            }
        }

        return allValues;
    }
    #endregion

    void gameOver(SocketIOEvent evt)
    {
        Debug.Log("The game has ended.");
        ScorecardLoader.inst.gameover = true;
    }

    public void destroyGameData()
    {
        socket.Emit("deleteGame");
    }

    public void quitGame()
    {
        
    }

    #endregion
}