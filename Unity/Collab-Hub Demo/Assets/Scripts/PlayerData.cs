using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class PlayerData
{
    public string username;
    public string lastID;
    public float R, G, B;
    public int cardback;

    public bool newUser;

    public PlayerData()
    {
        username = lastID = "";
        R = 0;
        G = 0;
        B = 255;
        cardback = 0;
        newUser = true;
    }

    // these are necessary as Color and Vector are not structures that can be serialized, so we are unpacking and packing upon request
    public Color getColor()
    {
        return new Color(R, G, B, 255);
    }

    public void setColor(Color newColor)
    {
        R = newColor.r;
        G = newColor.g; 
        B = newColor.b;
    }

    public void setNewUser(bool state)
    {
        newUser = state;
    }
}
