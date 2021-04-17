using System.Collections;
using System;
using System.Collections.Generic;
using UnityEngine;

public static class CardParser
{
    /// <summary>
    /// Returns card struct from string value
    /// </summary>
    public static Card parseCard(string cardName)
    {
        string[] values = cardName.Split('_');

        Suit newSuit;
        Enum.TryParse(values[0], out newSuit);
        int newNumber;
        int.TryParse(values[1], out newNumber);

        Card newCard = new Card();
        newCard.suit = newSuit;
        newCard.number = newNumber;

        return newCard;
    }

    /// <summary>
    /// Returns card struct to its string value
    /// </summary>
    public static string deparseCard(Card card)
    {
        return card.suit.ToString() + "_" + card.number;
    }

    /// <summary>
    /// Convert numerical value to char
    /// </summary>
    public static char valueToChar(int num)
    {
        switch (num)
        {
            case 0: return 'J';
            case 1: return 'A';
            case 2: return '2';
            case 3: return '3';
            case 4: return '4';
            case 5: return '5';
            case 6: return '6';
            case 7: return '7';
            case 8: return '8';
            case 9: return '9';
            case 10: return '0';
            case 11: return 'J';
            case 12: return 'Q';
            case 13: return 'K';
            default: return '0';
        }
    }
}

[System.Serializable]
public struct Card
{
    public Suit suit;
    public int number;
    public bool usedAsWild;
    public Suit wildSuit;
    public int wildNumber;

    public new string ToString()
    {
        if (suit == Suit.Joker) return suit.ToString();
        else if (number == 10) return "10 of " + suit.ToString();
        return CardParser.valueToChar(number) + " of " + suit.ToString();
    }
}

public enum Suit
{
    Club,
    Spade,
    Diamond,
    Heart,
    Joker
}

public enum Out
{
    None,
    Run, 
    Set
}
