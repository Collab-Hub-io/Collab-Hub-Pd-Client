using System.Collections;
using System.Collections.Generic;
using UnityEngine;


/// <summary>
/// Reducing instantiating and destroying
/// </summary>
public class CardPooler : MonoBehaviour
{
    public static CardPooler instance;

    List<GameObject> cardPool;
    public GameObject cardPrefab;

    public Sprite[] suitIcons;

    private void Awake()
    {
        if (instance) Destroy(gameObject);
        else instance = this;

        cardPool = new List<GameObject>();
    }

    /// <summary>
    /// Takes a card from the pool to add to play, if no cards available it will create one
    /// </summary>
    /// <returns>Card GameObject</returns>
    public GameObject PopCard(string cardData, Transform parent)
    {
        GameObject card;

        if(cardPool.Count > 0)
        {
            card = cardPool[0];
            cardPool.RemoveAt(0);
            card.transform.SetParent(parent);
            card.transform.SetSiblingIndex(card.transform.parent.childCount - 1);
            card.transform.position = parent.transform.position;
        }
        else
        {
            card = Instantiate(cardPrefab, parent);
        }
        card.SetActive(true);

        //set card values
        card.GetComponent<CardButton>().MyCard(cardData);

        return card;
    }

    /// <summary>
    /// Returns card to the pool (card is no longer in use)
    /// </summary>
    public void PushCard(GameObject card)
    {
        if (cardPool.Contains(card)) return;

        card.GetComponent<CardButton>().interactable = true;
        card.SetActive(false);
        cardPool.Add(card);
    }


    /// <summary>
    /// Returns Sprite for corresponding suit
    /// </summary>
    public Sprite GetSuitImage(Suit suit)
    {
        switch (suit)
        {
            default:
                return null;
            case Suit.Club:
                return suitIcons[0];
            case Suit.Diamond:
                return suitIcons[1];
            case Suit.Heart:
                return suitIcons[2];
            case Suit.Spade:
                return suitIcons[3];
            case Suit.Joker:
                return suitIcons[4];
        }
    }
}
