using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class OutHandler : MonoBehaviour
{
    public bool hasGoneOut = false;

    List<CardButton> handCopy;

    public DropHandler[] dropSpots;
    bool[] openDrop = {false, false, false, false};
    int nextToOpen = 1;

    public Button goOutBtn;

    private void OnEnable()
    {
        if (GameManager.instance.lastTurn && !hasGoneOut)
        {
            hasGoneOut = true;
            goOutBtn.gameObject.SetActive(false);
        }

        OpenOutMenu();
    }

    private void OnDisable()
    {
        CloseOutMenu();
    }

    public void OpenOutMenu()
    {
        if (!hasGoneOut)
        {
            for (int i = 0; i < 4; i++)
            {
                dropSpots[i].gameObject.SetActive(false);
                openDrop[i] = false;
            }

            dropSpots[0].gameObject.SetActive(true);
            openDrop[0] = true;
            nextToOpen = 1;

            handCopy = new List<CardButton>();
            foreach (CardButton c in GameManager.instance.myHand) handCopy.Add(c);
        }
        else
        {
            bool checkForNone = false;
            foreach (bool b in openDrop) if (b) checkForNone = true;
            if (!checkForNone)
            {
                //none are open, open first one
                dropSpots[0].gameObject.SetActive(true);
                openDrop[0] = true;
                nextToOpen = 1;
            }
        }
    }

    public void CloseOutMenu()
    {
        if (!hasGoneOut || !GameManager.instance.myTurn)
        {
            // reset everything
            foreach (DropHandler d in dropSpots) d.clearDropZone();
            handCopy.Clear();
            foreach (CardButton c in GameManager.instance.myHand) c.ReturnToHand();
            goOutBtn.interactable = false;
        }
        else
        {
            foreach (DropHandler d in dropSpots)
            {
                if (!d.checkValid())
                {
                    //remove all cards
                    foreach (CardButton c in d.cards) c.ReturnToHand();
                    d.clearDropZone();
                    RemoveEmptyDrop();
                }
                else if (d.cards.Count > 0)
                {
                    foreach (CardButton c in d.cards)
                        GameManager.instance.outDeckHandler.RemoveFromHand(c);
                }
                else RemoveEmptyDrop();
            }
        }
    }

    public void OpenNewDrop()
    {
        if (nextToOpen != -1)
        {
            dropSpots[nextToOpen].gameObject.SetActive(true);
            openDrop[nextToOpen] = true;
        }
        GetNextOpen();
    }

    void GetNextOpen()
    {
        for (int i = 0; i < 4; i++)
        {
            if (!openDrop[i])
            {
                nextToOpen = i;
                return;
            }
        }
        nextToOpen = -1;
    }

    public void RemoveEmptyDrop()
    {
        int indexToRemove = -1;
        for(int i = 0; i < 4; i++)
        {
            if (dropSpots[i].checkEmpty())
            {
                if (indexToRemove == -1) indexToRemove = i;
                else
                {
                    //remove at i because i is larger
                    foreach (CardButton c in dropSpots[i].cards) c.ReturnToHand();
                    dropSpots[i].clearDropZone();

                    dropSpots[i].gameObject.SetActive(false);
                    openDrop[i] = false;
                    GetNextOpen();
                }
            }
        }
    }

    public void ReturnToHand(CardButton cardAdded)
    {
        if (!hasGoneOut)
        {
            if (!handCopy.Contains(cardAdded))
            {
                print($"Returning card to hand {cardAdded.myCard.suit} - {cardAdded.myCard.number}");
                handCopy.Add(cardAdded);
            }
            else Debug.LogWarning("Card already exists in hand", cardAdded.gameObject);

            CheckForOut();
        }
    }

    public void RemoveFromHand(CardButton cardRemoved)
    {
        if (!hasGoneOut)
        {
            if (handCopy.Contains(cardRemoved)) handCopy.Remove(cardRemoved);
            else Debug.LogWarning("Card not found in hand", cardRemoved.gameObject);

            CheckForOut();
        }
    }

    void CheckForOut()
    {
        if (GameManager.instance.myTurn && !GameManager.instance.myDraw)
        {
            if (CanGoOut())
            {
                // enable a button
                goOutBtn.interactable = true;
            }
            else
            {
                goOutBtn.interactable = false;
            }
        }
    }

    bool CanGoOut()
    {
        // check for valid dropHandlers
        for (int i = 0; i < 4; i++)
        {
            if (openDrop[i])
            {
                if (!dropSpots[i].checkValid())
                {
                    return false;
                }
            }
        }

        // check hand #
        if (handCopy.Count == 1) return true;
        else return false;
    }

    public void SendFirstOut()
    {
        if (!GameManager.instance.myTurn)
        {
            Debug.LogWarning("It is not your turn, you cannot go out!");
            return;
        }

        JSONObject OutDeck = new JSONObject();

        for (int i = 0; i < 4; i++)
        {
            JSONObject cardArr = JSONObject.Create(JSONObject.Type.ARRAY);
            //print("type? " + cardArr.type);

            cardArr.Add(dropSpots[i].outState.ToString());

            if (dropSpots[i].outState != Out.None)
            {
                foreach (CardButton c in dropSpots[i].cards)
                {
                    cardArr.Add(CardParser.deparseCard(c.myCard));
                }
            }

            //cardArr.Add(Out.Run.ToString());
            //cardArr.Add("joker_2");
            //cardArr.Add("Club_3");
            //cardArr.Add("Club_4");
            //print("contents? - " + cardArr);

            OutDeck.AddField("out" + i, cardArr);
        }

        //OutDeck.AddField("out1", cardArr);
        //OutDeck.AddField("out2", cardArr);
        print("test? - " + OutDeck);
        nh_network.server.SendFirstOut(OutDeck);

        hasGoneOut = true;
        GameManager.instance.outButton.SetActive(false);
        goOutBtn.interactable = false;

        GameManager.instance.openOutPanel(false);
    }

    public void resetOut()
    {
        hasGoneOut = false;
        goOutBtn.gameObject.SetActive(true);

        for(int i = 0; i < 4; i++)
        {
            openDrop[i] = false;
            dropSpots[i].gameObject.SetActive(false);
        }
        gameObject.SetActive(false);
    }
}
