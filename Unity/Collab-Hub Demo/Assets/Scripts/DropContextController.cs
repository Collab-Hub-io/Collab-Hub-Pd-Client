using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class DropContextController : MonoBehaviour
{
    public TextMeshProUGUI header, symbol;

    public void setHeader(string text)
    {
        header.text = text;
    }
    
    public void setSymbol(string text)
    {
        symbol.text = text;
    }
}
