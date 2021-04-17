using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class OutDeckHandler : MonoBehaviour
{
    public bool filled = false;
    public int outCardCount = 0;

    public List<CardButton> myCurrentHand;

    public OutDropHandler[] firstOutDrops;
    public TextMeshProUGUI[] firstTitleTexts;
    //public UnityEngine.UI.Text[] firstTitleTexts;

    public void setOutDeck(List<string>[] cards, Out[] outTypes)
    {
        if (filled) resetOutPanel();

        for (int i = 0; i < 4; i++)
        {
            Debug.Log("loading index " + i);

            //default state is off
            if (outTypes[i] != Out.None)
            {
                firstOutDrops[i].gameObject.SetActive(true);
                firstTitleTexts[i].text = outTypes[i].ToString();
                firstOutDrops[i].setOutState(outTypes[i]);

                Debug.Log("loading cards...");

                foreach (string card in cards[i])
                {
                    GameObject newCard = CardPooler.instance.PopCard(card, firstOutDrops[i].transform);
                    newCard.GetComponent<CardButton>().interactable = false;
                    firstOutDrops[i].addOutDeckCard(newCard.GetComponent<CardButton>());
                    outCardCount++;
                }
                firstOutDrops[i].completeOutDeck();
            }
        }

        filled = true;
        Debug.Log("First out panel loaded.");
    }

    public void resetOutPanel()
    {
        outCardCount = 0;
        myCurrentHand.Clear();

        foreach(OutDropHandler d in firstOutDrops)
        {
            d.clearDropZone();
            d.gameObject.SetActive(false);
        }
        Debug.Log("Cleared current out deck.");
        filled = false;
    }

    public void FillHandCopy(List<CardButton> hand)
    {
        Debug.Log("Created final copy of hand");
        myCurrentHand = new List<CardButton>();
        foreach (CardButton a in hand) myCurrentHand.Add(a);
    }

    public void ReturnToHand(CardButton cardAdded)
    {
        if (!myCurrentHand.Contains(cardAdded))
        {
            print($"Returning card to hand {cardAdded.myCard.suit} - {cardAdded.myCard.number}");
            myCurrentHand.Add(cardAdded);
        }
        else Debug.LogWarning("Card already exists in hand", cardAdded.gameObject);
    }

    public bool RemoveFromHand(CardButton card)
    {
        if (myCurrentHand.Contains(card))
        {
            myCurrentHand.Remove(card);
            return true;
        }
        else
        {
                // they were first out
            if (myCurrentHand.Count == 0) return false;

            Debug.LogWarning("Card " + card.name + " not found in hand copy.", card.gameObject);
            return false;
        }
    }

    public void CheckForUpdatedOut()
    {
        int cardCount = 0;
        foreach(OutDropHandler d in firstOutDrops) cardCount += d.cards.Count;

        if(cardCount != outCardCount)
        {
            Debug.Log("Out deck has been updated, sending it now...");
            SendUpdatedOutDeck();
        }
    }

    public void SendUpdatedOutDeck()
    {
        JSONObject OutDeck = new JSONObject();

        for (int i = 0; i < 4; i++)
        {
            JSONObject cardArr = JSONObject.Create(JSONObject.Type.ARRAY);
            cardArr.Add(firstOutDrops[i].outState.ToString());

            if (firstOutDrops[i].outState != Out.None)
            {
                foreach (CardButton c in firstOutDrops[i].cards)
                {
                    cardArr.Add(CardParser.deparseCard(c.myCard));
                }
            }

            OutDeck.AddField("out" + i, cardArr);
        }

        nh_network.server.UpdateFirstOut(OutDeck);
    }

    public int CalculateScore()
    {
        int score = 0;
        foreach(CardButton c in myCurrentHand)
        {
            if (c.myCard.suit == Suit.Joker) score += 15;
            else if (c.myCard.number > 9) score += 10;
            else score += c.myCard.number;
        }

        return score;
    }
}
