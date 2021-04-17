using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

public class DeckPreferences : MonoBehaviour
{
    public GameObject deckPanel;
    public Color[] colors;
    public Sprite[] backs;

    public GameObject colorPrefab;
    public GameObject cardbackPrefab;

    public Transform colorContainer;
    public Transform cardbackContainer;

    public GameObject demoCard;

    public GameObject inGameCard;

    // [HideInInspector]
    public PlayerData data;

    public Animator saveMessage;
    
    // Start is called before the first frame update
    void Start()
    {
        data = SaveLoad.Load();

        // display the color and backing options, add buttons, and link button presses to update the card data
        foreach (var color in colors)
        {
            var newColorOption = Instantiate(colorPrefab, colorContainer);
            newColorOption.GetComponent<Image>().color = color;
            newColorOption.AddComponent<Button>();
            newColorOption.GetComponent<Button>().onClick.AddListener(()=> setColor(color));
        }
        
        foreach (var back in backs)
        {
            var newCardback = Instantiate(cardbackPrefab, cardbackContainer);
            newCardback.transform.GetChild(0).GetComponent<Image>().sprite = back;
            newCardback.AddComponent<Button>();
            newCardback.GetComponent<Button>().onClick.AddListener(
                ()=> setCardback(back));
        }
        
        demoCard.transform.GetChild(0).GetComponent<Image>().color = data.getColor();
        demoCard.transform.GetChild(1).GetComponent<Image>().sprite = backs[data.cardback];

        updateInGameDeck();
    }

    void updateInGameDeck()
    {
        if (inGameCard != null)
        {
            print("Updating in game deck card");
            inGameCard.transform.GetChild(0).GetComponent<Image>().color = data.getColor();
            inGameCard.transform.GetChild(0).GetChild(0).GetComponent<Image>().sprite = backs[data.cardback];
        }
    }

    public void openDeckPrefPanel()
    {
        data = SaveLoad.Load();
        deckPanel.SetActive(true);
        demoCard.transform.GetChild(0).GetComponent<Image>().color = data.getColor();
        demoCard.transform.GetChild(1).GetComponent<Image>().sprite = backs[data.cardback];
    }
    
    public void closeDeckPrefPanel()
    {
        SaveLoad.Save(data);
        //deckPanel.SetActive(false);
        saveMessage.SetTrigger("flash");

        updateInGameDeck();
    }

    public void setColor(Color color)
    {
        print($"set color pressed {color}");
        // demoCard.GetComponent()
        demoCard.transform.GetChild(0).GetComponent<Image>().color = color;
        data.setColor(color);
        // print("color: " + data.R + " - " + data.G  + " - "+ data.B  + " - ");
    }
    
    public void setCardback(Sprite back)
    {
        demoCard.transform.GetChild(1).GetComponent<Image>().sprite = back;
        data.cardback = Array.IndexOf(backs, back);
        print("back: " + data.cardback);
    }
}
