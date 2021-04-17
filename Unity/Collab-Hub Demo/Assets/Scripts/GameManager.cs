using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager instance;
    nh_network server;

    [Header("Round Info")] public int round;

    [Header("Turn Bools")]
    public bool myTurn = false; // might not need this one
    public bool myDraw = false;
    public bool myDiscard = false;

    public bool lastTurn = false;

    [Header("Hand")]
    public GameObject cardPrefab;
    public Transform handObject;
    public List<CardButton> myHand;

    [Header("Discard Objects")]
    public Transform discardTransform;
    public GameObject cardInDiscard;
    public string previousCard;

    [Header("Panels")]
    public GameObject outPanel;
    public GameObject firstOutPanel;

    [Header("Out Objects")]
    public GameObject firstOutButton;
    public GameObject outButton;
    public OutDeckHandler outDeckHandler;
    public GameObject endRoundScreen;

    private void Awake()
    {
        instance = this;

        server = nh_network.server;
        endRoundScreen.SetActive(true);
    }

    void Start()
    {
        server?.setReady();
    }

    public void drawCard(bool fromDeck)
    {
        if (myDraw)
        {
            server.drawCard(fromDeck);
            myDraw = false;
            myDiscard = true;
        }
    }

    public void setMyTurn(bool state)
    {
        myTurn = state;
        print("your turn");
        // NotificationManager.instance.myTurn();
    }
    
    public bool discardCard(string cardName)
    {
        if (myDiscard)
        {
            server.discardCard(cardName);
            myDiscard = myTurn = false;

            return true;
        }
        else return false;
    }

    public void addCardToHand(string cardName)
    {
        GameObject newCard = CardPooler.instance.PopCard(cardName, handObject);
        myHand.Add(newCard.GetComponent<CardButton>());
        
        // notification
        var notification = new Notification($"Drew {newCard.GetComponent<CardButton>().myCard.ToString()}", 3, true, Color.black);
        NotificationManager.instance.addNotification(notification);

        if (lastTurn) outDeckHandler.FillHandCopy(myHand);
    }
    public void addCardToHand(string cardName, bool notifications)
    {
        GameObject newCard = CardPooler.instance.PopCard(cardName, handObject);
        myHand.Add(newCard.GetComponent<CardButton>());

        // notification
        if (notifications)
        {
            var notification = new Notification($"Drew {newCard.GetComponent<CardButton>().myCard.ToString()}", 3, true, Color.black);
            NotificationManager.instance.addNotification(notification);
        }
    }

    public void addCardToDiscard(string cardName)
    {
        GameObject newCard = CardPooler.instance.PopCard(cardName, discardTransform);
        newCard.GetComponent<CardButton>().enabled = false;

        if (cardInDiscard)
        {
            previousCard = CardParser.deparseCard(cardInDiscard.GetComponent<CardButton>().myCard);
            cardInDiscard.GetComponent<CardButton>().enabled = true;
            CardPooler.instance.PushCard(cardInDiscard);
            cardInDiscard = null;
        }
        else previousCard = "";

        // notification
        var notification = new Notification($"Discarded {newCard.GetComponent<CardButton>().myCard.ToString()}", 3, true, Color.black);
        NotificationManager.instance.addNotification(notification);

        cardInDiscard = newCard;
    }

    public void updateDiscardPile()
    {
        // change discard card to previous card
        cardInDiscard.GetComponent<CardButton>().enabled = true;
        CardPooler.instance.PushCard(cardInDiscard);

        if (previousCard != "")
        {
            GameObject newCard = CardPooler.instance.PopCard(previousCard, discardTransform);
            newCard.GetComponent<CardButton>().enabled = false;

            cardInDiscard = newCard;
        }
        else cardInDiscard = null;
    }

    public void openOutPanel(bool open)
    {
        outPanel.SetActive(open);
    }

    public void openFirstOutPanel(bool open)
    {
        firstOutPanel.SetActive(open);
    }

    public void recieveOutDeck(List<string>[] cards, Out[] outTypes)
    {
        firstOutButton.SetActive(true);

        openFirstOutPanel(true);
        Debug.Log("sending first out to outDeckHandler...");
        outDeckHandler.setOutDeck(cards, outTypes);
        openFirstOutPanel(false);

        lastTurn = true;
        Debug.Log("finished");
    }

    public void finishFinalTurn(CardButton discarded)
    {
        if (lastTurn)
        {
            outDeckHandler.CheckForUpdatedOut();
            endRoundScreen.SetActive(true);
            int score = 0;

            // scoring
            if (outDeckHandler.RemoveFromHand(discarded))
            {
                //calulate score
                Debug.Log("I should calculate the score here, card count: " + outDeckHandler.myCurrentHand.Count);
                score = outDeckHandler.CalculateScore();
                nh_network.server.sendMyScore(score);
            }
            else
            {
                //score = 0
                Debug.Log("Your score is 0");
                nh_network.server.sendMyScore(0);
            }

            ScorecardLoader.inst.EnableWait(score);
        }
    }

    public void resetAll()
    {
        //if (lastTurn)   // reset if needed
        //{
            myTurn = myDraw = myDiscard = lastTurn = false;
            NotificationManager.instance.myTurn(false);

            cardInDiscard.GetComponent<CardButton>().enabled = true;
            CardPooler.instance.PushCard(cardInDiscard);
            previousCard = "";
            cardInDiscard = null;

            foreach(CardButton c in myHand)
            {
                CardPooler.instance.PushCard(c.gameObject);
            }
            myHand.Clear();

            outDeckHandler.resetOutPanel();
            firstOutButton.SetActive(false);
            outButton.SetActive(true);

            openOutPanel(true);
            outPanel.GetComponent<OutHandler>().resetOut();
            ScorecardLoader.inst.reset();
            NotificationManager.instance.clearNotifications();
        //}
    }

    public void disableHandCards()
    {
        foreach (CardButton c in myHand) c.interactable = false;
    }
}
